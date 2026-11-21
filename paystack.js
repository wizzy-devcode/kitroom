// Paystack payments: hosted checkout (card, bank transfer, USSD...), server-side verification, signed webhook.
// The secret key only ever lives in the PAYSTACK_SECRET_KEY environment variable on the server.
const crypto = require('crypto');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = ({ app, db, A, limit, str, applyStatus }) => {
  db.exec("CREATE TABLE IF NOT EXISTS payments(reference TEXT PRIMARY KEY, order_id INTEGER NOT NULL, amount INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL)");
  const key = () => process.env.PAYSTACK_SECRET_KEY || '';
  const enabled = () => /^sk_(test|live)_\w+/.test(key());
  const mode = () => key().startsWith('sk_live_') ? 'live' : key().startsWith('sk_test_') ? 'test' : '';
  const base = req => (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  const getOrder = id => db.prepare('SELECT * FROM orders WHERE id=?').get(id);

  async function api(path, opts = {}) {
    const r = await fetch('https://api.paystack.co' + path, { ...opts, headers: { Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.status === false) throw new Error(j.message || 'Paystack error ' + r.status);
    return j;
  }

  // records the payment and confirms the order (which also takes the items out of stock). Safe to call twice.
  function markPaid(order, channel, kobo) {
    const o = getOrder(order.id); if (!o || o.payment_status === 'paid') return o;
    db.prepare("UPDATE orders SET payment_status='paid', paid_at=?, paid_amount=?, pay_channel=? WHERE id=?").run(Date.now(), Math.round(kobo / 100), channel || '', o.id);
    if (o.status === 'New') applyStatus(o, 'Confirmed');
    return getOrder(o.id);
  }

  // asks Paystack for a one-time checkout page for this order
  async function initialize(order, req) {
    const kobo = order.total * 100, reference = order.ref + '-' + crypto.randomBytes(5).toString('hex');
    const j = await api('/transaction/initialize', { method: 'POST', body: JSON.stringify({ email: order.email, amount: kobo, currency: 'NGN', reference, callback_url: base(req) + '/pay/return', metadata: { order_ref: order.ref, order_id: order.id, customer: order.name } }) });
    db.prepare('INSERT INTO payments(reference,order_id,amount,status,created_at) VALUES(?,?,?,?,?)').run(reference, order.id, kobo, 'pending', Date.now());
    return { url: j.data.authorization_url, reference };
  }

  // the only place an order becomes "paid": we ask Paystack directly and check status, currency and amount ourselves
  async function settle(reference) {
    const p = db.prepare('SELECT * FROM payments WHERE reference=?').get(String(reference || ''));
    if (!p) return { ok: false, reason: 'unknown' };
    const order = getOrder(p.order_id);
    if (order.payment_status === 'paid') return { ok: true, order };
    const v = (await api('/transaction/verify/' + encodeURIComponent(p.reference))).data || {};
    if (v.status !== 'success') {
      if (v.status === 'failed' || v.status === 'abandoned') db.prepare('UPDATE payments SET status=? WHERE reference=?').run(v.status, p.reference);
      return { ok: false, reason: v.status || 'failed', order };
    }
    if (v.reference !== p.reference || v.currency !== 'NGN' || v.amount !== p.amount || v.amount !== order.total * 100) {
      db.prepare("UPDATE payments SET status='review' WHERE reference=?").run(p.reference);
      db.prepare("UPDATE orders SET payment_status='review' WHERE id=?").run(order.id);
      return { ok: false, reason: 'mismatch', order };
    }
    db.prepare("UPDATE payments SET status='success' WHERE reference=?").run(p.reference);
    return { ok: true, order: markPaid(order, v.channel, v.amount) };
  }

  /* ---- customer ---- */
  app.post('/api/orders/:ref/pay', limit(10, 36e5, 'pay'), async (req, res) => {
    const bad = (c, m) => res.status(c).json({ error: m });
    if (!enabled()) return bad(503, 'Online payment is not set up yet. Please confirm your order on WhatsApp.');
    const o = db.prepare('SELECT * FROM orders WHERE ref=?').get(String(req.params.ref));
    if (!o) return bad(404, 'Order not found');
    if (o.payment_status === 'paid') return bad(400, 'This order is already paid');
    if (o.status === 'Cancelled') return bad(400, 'This order was cancelled');
    if (o.delivery_tbc && !o.delivery_sep) return bad(400, 'We will confirm your delivery fee first, then send you a payment link');
    if (!o.email || !(o.total > 0)) return bad(400, 'This order cannot be paid online. Please message us on WhatsApp.');
    try { res.json({ url: (await initialize(o, req)).url }); }
    catch (e) { console.error('Paystack initialize failed:', e.message); bad(502, 'Could not start the payment. Please try again or confirm on WhatsApp.'); }
  });

  // Paystack sends the customer back here after paying (or cancelling)
  app.get('/pay/return', async (req, res) => {
    let status = 'failed', order;
    try {
      if (enabled()) { const out = await settle(String(req.query.reference || req.query.trxref || '')); order = out.order; status = out.ok ? 'success' : out.reason === 'mismatch' ? 'review' : 'failed'; }
    } catch (e) { console.error('Paystack verify failed:', e.message); status = 'pending'; }
    res.redirect(`/?pay=${status}${order ? '&ref=' + encodeURIComponent(order.ref) : ''}#/home`);
  });

  // Paystack tells us about every payment, even if the customer closes the page before coming back
  app.post('/api/paystack/webhook', (req, res) => {
    if (!enabled() || !req.rawBody) return res.sendStatus(400);
    const want = Buffer.from(crypto.createHmac('sha512', key()).update(req.rawBody).digest('hex')), got = Buffer.from(String(req.get('x-paystack-signature') || '').toLowerCase());
    if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return res.sendStatus(401);
    res.sendStatus(200);
    const ev = req.body || {};
    if (ev.event === 'charge.success' && ev.data && ev.data.reference) settle(ev.data.reference).catch(e => console.error('Paystack webhook failed:', e.message));
  });

  /* ---- admin ---- */
  A.get('/payments/status', (req, res) => res.json({ enabled: enabled(), mode: mode(), webhookUrl: base(req) + '/api/paystack/webhook', callbackUrl: base(req) + '/pay/return' }));
  A.post('/orders/:id/paylink', async (req, res) => {
    const bad = (c, m) => res.status(c).json({ error: m });
    if (!enabled()) return bad(503, 'Paystack is not connected yet. See the Payments tab.');
    let o = getOrder(+req.params.id); if (!o) return bad(404, 'Order not found');
    if (o.payment_status === 'paid') return bad(400, 'This order is already paid');
    if (o.delivery_tbc && !o.delivery_sep) return bad(400, 'Set the delivery fee first');
    if (!o.email) { const em = str(req.body.email, 120); if (!EMAIL.test(em)) return bad(400, 'Add the customer’s email to create a payment link'); db.prepare('UPDATE orders SET email=? WHERE id=?').run(em, o.id); o = getOrder(o.id); }
    try { const r = await initialize(o, req); res.json({ url: r.url, amount: o.total }); }
    catch (e) { console.error('Paystack initialize failed:', e.message); bad(502, 'Paystack could not create the link: ' + e.message); }
  });
  A.patch('/orders/:id/paid', (req, res) => {
    const o = getOrder(+req.params.id); if (!o) return res.status(404).json({ error: 'Order not found' });
    const m = ['cash', 'transfer', 'pos', 'other'].includes(req.body.method) ? req.body.method : 'other';
    markPaid(o, 'manual:' + m, o.total * 100); res.json({ ok: true });
  });

  return { enabled };
};

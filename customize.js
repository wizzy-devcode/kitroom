// Customization requests: the customer sends the printing details, the shop approves or declines,
// and only an approved request lets the customer place an order that includes customized items.
const crypto = require('crypto');

module.exports = ({ app, db, A, limit, str, EX }) => {
  db.exec("CREATE TABLE IF NOT EXISTS customizations(id INTEGER PRIMARY KEY, ref TEXT UNIQUE NOT NULL, token TEXT NOT NULL, name TEXT, phone TEXT, message TEXT, lines TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT DEFAULT '', created_at INTEGER NOT NULL, decided_at INTEGER, used INTEGER NOT NULL DEFAULT 0, order_ref TEXT DEFAULT '')");
  const feeOf = p => p.custom_fee != null ? p.custom_fee : (parseInt((db.prepare("SELECT value FROM settings WHERE key='cfee'").get() || {}).value) || 0);
  const same = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b || '')); return a.length === b.length && crypto.timingSafeEqual(a, b); };

  /* ---- customer ---- */
  app.post('/api/customizations', limit(10, 36e5, 'czreq'), (req, res) => {
    const b = req.body || {}, name = str(b.name, 80), phone = str(b.phone, 30), pd = phone.replace(/\D/g, '').length, bad = m => res.status(400).json({ error: m });
    if (!name || pd < 7 || pd > 15) return bad('Please add your name and a valid call or WhatsApp number');
    if (!Array.isArray(b.lines) || !b.lines.length || b.lines.length > 20) return bad('Add the items you want customized');
    const cfg = EX.czMap(), lines = [];
    for (const l of b.lines) {
      const p = db.prepare('SELECT * FROM products WHERE id=?').get(+l.id), q = parseInt(l.qty);
      if (!p || !(q > 0) || q > 50) return bad('One of the items is no longer available');
      if (q > p.stock) return bad(`Only ${p.stock} of ${p.name} left in stock`);
      const c = cfg[p.category] || { fields: ['name'], rule: 'all', noun: p.category.toLowerCase() };
      const d = { n: str(l.name, 30), x: str(l.number, 5), p: str(l.patches, 60) };
      if (!c.fields.includes('name')) d.n = ''; if (!c.fields.includes('number')) d.x = ''; if (!c.fields.includes('patches')) d.p = '';
      if (d.x !== '' && !/^\d{1,2}$/.test(d.x)) return bad(`The number for ${p.name} must be from 0 to 99`);
      const got = { name: !!d.n, number: d.x !== '', patches: !!d.p };
      if (!(c.rule === 'any' ? c.fields.some(f => got[f]) : c.fields.every(f => got[f]))) return bad(`Please fill in the printing details for ${p.name}`);
      lines.push({ id: p.id, name: p.name, size: str(l.size, 20) || '-', qty: q, price: p.price, fee: feeOf(p), noun: c.noun, d });
    }
    let ref; do { ref = 'CR' + (10000 + crypto.randomInt(90000)); } while (db.prepare('SELECT 1 FROM customizations WHERE ref=?').get(ref));
    const token = crypto.randomBytes(12).toString('hex');
    db.prepare('INSERT INTO customizations(ref,token,name,phone,message,lines,created_at) VALUES(?,?,?,?,?,?,?)').run(ref, token, name, phone, str(b.message, 1500), JSON.stringify(lines), Date.now());
    res.json({ ref, token, status: 'pending' });
  });
  // the customer's browser asks for the answer; the secret token proves the request is theirs
  app.get('/api/customizations/:ref', (req, res) => {
    const r = db.prepare('SELECT * FROM customizations WHERE ref=?').get(String(req.params.ref));
    if (!r || !same(r.token, req.query.t)) return res.status(404).json({ error: 'Request not found' });
    res.json({ ref: r.ref, status: r.status, note: r.admin_note || '', used: !!r.used });
  });

  /* ---- admin ---- */
  A.get('/customizations', (req, res) => res.json(db.prepare('SELECT id,ref,name,phone,message,lines,status,admin_note,created_at,decided_at,used,order_ref FROM customizations ORDER BY id DESC LIMIT 300').all().map(r => ({ ...r, lines: JSON.parse(r.lines) }))));
  A.patch('/customizations/:id', (req, res) => {
    const r = db.prepare('SELECT * FROM customizations WHERE id=?').get(+req.params.id); if (!r) return res.status(404).json({ error: 'Request not found' });
    if (r.used) return res.status(400).json({ error: 'This request was already used for order ' + r.order_ref });
    const s = req.body.status; if (!['approved', 'declined', 'pending'].includes(s)) return res.status(400).json({ error: 'Choose Approve or Decline' });
    db.prepare('UPDATE customizations SET status=?, admin_note=?, decided_at=? WHERE id=?').run(s, str(req.body.note, 300), s === 'pending' ? null : Date.now(), r.id);
    res.json({ ok: true });
  });
  A.delete('/customizations/:id', (req, res) => { db.prepare('DELETE FROM customizations WHERE id=?').run(+req.params.id); res.json({ ok: true }); });

  return {
    // called when an order contains customized items: they must match an approved, unused request
    forOrder(c, lines) {
      const r = c && db.prepare('SELECT * FROM customizations WHERE ref=?').get(String(c.ref || ''));
      if (!r || !same(r.token, c.token)) return { error: 'Customized items need approval first. Please send a customization request.' };
      if (r.status === 'declined') return { error: 'Your customization request was declined.' };
      if (r.status !== 'approved') return { error: 'Your customization request is still waiting for approval.' };
      if (r.used) return { error: 'This approval was already used for an order. Please send a new request.' };
      const approved = JSON.parse(r.lines), taken = new Set(), details = [], fees = [];
      for (const l of lines) {
        const i = approved.findIndex((a, k) => !taken.has(k) && a.id === l.id && a.size === l.size && l.qty <= a.qty);
        if (i < 0) return { error: `The customization for ${l.name} (${l.size}) was not approved. Please send a new request.` };
        taken.add(i); details.push(approved[i].d); fees.push(approved[i].fee);
      }
      return { details, fees };
    },
    markUsed(ref, orderRef) { db.prepare('UPDATE customizations SET used=1, order_ref=? WHERE ref=?').run(orderRef, String(ref)); }
  };
};

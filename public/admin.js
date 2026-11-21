const $ = i => document.getElementById(i), E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const money = n => '₦' + (+n || 0).toLocaleString('en-NG');
const EM = { Jerseys: '👕', Tracksuits: '🧥', Combos: '🎁', Boots: '👟', 'Grip socks': '🧦', Hose: '🧦', Socks: '🧦', 'Shin guards': '🛡️', 'Goalkeeper gloves': '🧤', Footballs: '⚽', Accessories: '🎒' };
const cats = () => (cat.categories || []).map(c => c.name);
const SLV = ['Short sleeve', 'Long sleeve'], KITS = ['Home', 'Away', 'Third', 'Goalkeeper'], STS = ['New', 'Confirmed', 'Delivered', 'Cancelled'];
/* ---- sizes: range dropdowns or manual ---- */
const LET = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], NUMS = Array.from({ length: 60 }, (_, i) => String(i + 1)), SK = { size_mode: 'sizeMode', s_from: 'sFrom', s_to: 'sTo' };
const SZD = { Jerseys: ['letters', 'S', 'XXXL'], Tracksuits: ['letters', 'S', 'XXXL'], 'Shin guards': ['letters', 'S', 'L'], 'Goalkeeper gloves': ['numbers', '6', '11'], Boots: ['numbers', '39', '45'], Footballs: ['numbers', '3', '5'], 'Grip socks': ['manual'], Hose: ['manual'], Combos: ['manual'] };
const range = (a, b) => { if (a > b) [a, b] = [b, a]; return Array.from({ length: Math.min(b - a + 1, 60) }, (_, i) => String(a + i)); };
const calcSizes = x => {
  if (x.sizeMode === 'letters') { let i = Math.max(0, LET.indexOf(x.sFrom)), j = Math.max(0, LET.indexOf(x.sTo)); if (i > j) [i, j] = [j, i]; return LET.slice(i, j + 1).join(','); }
  if (x.sizeMode === 'numbers') return range(+x.sFrom || 1, +x.sTo || 1).join(',');
  return x.sizes || '';
};
const setSizeDefaults = (x, c) => { const d = SZD[c] || ['manual']; x.sizeMode = d[0]; if (d[1]) { x.sFrom = d[1]; x.sTo = d[2]; x.sizes = calcSizes(x); } else if (!x.sizes) x.sizes = c === 'Accessories' ? 'One size' : ''; };
const ensureRange = x => { if (x.sizeMode === 'letters' && !LET.includes(x.sFrom)) { x.sFrom = 'S'; x.sTo = 'XXXL'; } if (x.sizeMode === 'numbers' && !/^\d+$/.test(x.sFrom || '')) { x.sFrom = '39'; x.sTo = '45'; } };
const inferSizes = x => {
  const l = String(x.sizes || '').split(',').map(v => v.trim()).filter(Boolean), li = l.map(v => LET.indexOf(v));
  if (l.length && li.every(i => i >= 0) && li.every((v, k) => k === 0 || v === li[k - 1] + 1)) { x.sizeMode = 'letters'; x.sFrom = l[0]; x.sTo = l[l.length - 1]; }
  else if (l.length && l.every(v => /^\d+$/.test(v)) && l.every((v, k) => k === 0 || +v === +l[k - 1] + 1)) { x.sizeMode = 'numbers'; x.sFrom = l[0]; x.sTo = l[l.length - 1]; }
  else x.sizeMode = 'manual';
};
const sizesBox = x => {
  const m = x.sizeMode || 'manual', o = (v, t) => `<option value="${v}"${m === v ? ' selected' : ''}>${t}</option>`;
  const pick = `<label class="fl">Size type<select name="size_mode">${o('letters', 'Letter sizes (S to XXXL)')}${o('numbers', 'Number sizes (39 to 45, ball sizes...)')}${o('manual', 'Type the sizes myself')}</select></label>`;
  if (m === 'manual') return `<fieldset class="sl" style="margin-top:12px"><legend>Available sizes</legend>${pick}${F('Sizes (separate with commas)', 'sizes', x.sizes, 'placeholder="e.g. 39,40,41,42"')}</fieldset>`;
  const opts = m === 'letters' ? LET : NUMS;
  return `<fieldset class="sl" style="margin-top:12px"><legend>Available sizes</legend>${pick}<div class="two">${SEL('From size', 's_from', opts, x.sFrom)}${SEL('To size', 's_to', opts, x.sTo)}</div><input type="hidden" name="sizes" value="${E(x.sizes)}"><div class="mu">Customers will see: ${E(x.sizes)}</div></fieldset>`;
};
/* ---- combo contents ---- */
const BOOT_TYPES = ['Trainers', 'Iron stud', 'Plastic studs'];
const bootBox = x => { const b = cat.brands.find(v => v.name === x.brand), models = b ? cat.models.filter(m => m.brand_id === b.id).map(m => m.name) : []; return `${SEL('Brand', 'brand', cat.brands.map(v => v.name), x.brand, 'Select a brand')}${SEL('Model', 'model', models, x.model, b ? 'Select a model' : 'Choose a brand first')}${F('Brand not in the list? Type it here', 'brand_new', x.brand_new ?? '', 'placeholder="It is added to the list for next time"')}${F('Model not in the list? Type it here', 'model_new', x.model_new ?? '', 'placeholder="It is added under the brand for next time"')}${SEL('Boot type', 'boot_type', BOOT_TYPES, x.boot_type, 'Select a type')}`; };
const COMBO = ['Football boots', 'Grip socks', 'Hose (football socks)', 'Shin guards', 'Football', 'Goalkeeper gloves', 'Jersey', 'Shorts', 'Tracksuit', 'Sports bag'];
const splitCombo = x => { const l = String(x.combo || '').split(',').map(v => v.trim()).filter(Boolean); x.comboChecked = l.filter(v => COMBO.includes(v)); x.combo_other = l.filter(v => !COMBO.includes(v)).join(', '); };
const comboBox = x => `<fieldset class="sl" style="margin-top:12px"><legend>What’s in this combo (tick all that apply)</legend><input type="hidden" name="combo_set" value="1">${COMBO.map(v => `<label><input type="checkbox" name="combo" value="${E(v)}"${(x.comboChecked || []).includes(v) ? ' checked' : ''}> ${E(v)}</label>`).join('')}</fieldset>${F('Other items in the combo (separate with commas)', 'combo_other', x.combo_other || '')}`;
let payLinks = {}, payInfo = null, czs = [];
let dlv = { missing: true, states: [], fees: {}, default: 0, free_state: 'Kaduna' };
let me = null, tab = 'overview', prods = [], orders = [], site = {}, users = [], msgs = [], revs = [], cat = { leagues: [], clubs: [], seasons: [], categories: [], brands: [], models: [] };
let edit = null, sure = null, ofl = 'All', clg = '', cbrand = '', picked = null, pickedUrl = '';
const root = $('root');
const clearPick = () => { if (pickedUrl) URL.revokeObjectURL(pickedUrl); picked = null; pickedUrl = ''; };
const J = (m, b) => ({ method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
async function api(u, o) {
  const r = await fetch(u, o), j = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 401 && !u.endsWith('/login')) { me = null; login(); } throw new Error(j.error || 'Something went wrong'); }
  return j;
}
function toast(m) { const t = $('tg'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); }
const stat = s => s <= 0 ? 'Sold out' : s <= 5 ? `Only ${s} left` : 'In stock';
const badge = s => `<span class="st ${s <= 0 ? 'ou' : s <= 5 ? 'lo' : 'ok'}"><i aria-hidden="true"></i>${stat(s)}</span>`;
const jersey = (a, b) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M33 8 12 20 4 42l16 6 6-10v54h48V38l6 10 16-6-8-22L67 8c-3 7-9 11-17 11S36 15 33 8z" fill="${E(a)}" stroke="rgba(0,0,0,.3)" stroke-width="2" stroke-linejoin="round"/><path d="M33 8c3 7 9 11 17 11s14-4 17-11" fill="none" stroke="${E(b)}" stroke-width="4"/></svg>`;
const G = d => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${d}</svg>`;
const GL = { ball: G('<circle cx="24" cy="24" r="19"/><path d="m24 15 8 6-3 9h-10l-3-9z"/><path d="M24 15V6M32 21l8-4M29 30l5 8M19 30l-5 8M16 21l-8-4"/>'), boot: G('<path d="M5 33V14h15l3 8 14 4c5 1 7 3 7 6v1z"/><path d="M5 33h39"/><path d="M10 33v4M18 33v4M30 33v4M39 33v4"/>'), sock: G('<path d="M16 4h14v21l7 7a5.5 5.5 0 0 1-7.8 7.8L17 28a4 4 0 0 1-1-2.8z"/><path d="M16 11h14"/>'), glove: G('<path d="M13 44V27l-3.5-7a3 3 0 0 1 5.3-2.8L17 21V9a3 3 0 0 1 6 0v10V7a3 3 0 0 1 6 0v12V10a3 3 0 0 1 6 0v17c0 9-4 17-11 17z"/>'), shield: G('<path d="M24 4c6 3 11 4 16 4v15c0 10-7 18-16 21C15 41 8 33 8 23V8c5 0 10-1 16-4z"/>'), bag: G('<path d="M8 16h32l-3 26H11z"/><path d="M17 16v-3a7 7 0 0 1 14 0v3"/>') };
const glyph = c => /ball/i.test(c) ? GL.ball : /boot/i.test(c) ? GL.boot : /sock|hose/i.test(c) ? GL.sock : /glove/i.test(c) ? GL.glove : /shin/i.test(c) ? GL.shield : GL.bag;
const pic = x => x.image ? `<img src="${E(x.image)}" alt="">` : ['Jerseys', 'Tracksuits', 'Combos'].includes(x.category) ? jersey(x.a || '#0F1B2D', x.b || '#fff') : glyph(x.category || '');
const waNum = p => { p = String(p || '').replace(/\D/g, ''); return p[0] === '0' ? '234' + p.slice(1) : p; };
const when = t => new Date(t).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
const F = (l, n, v, x = '') => `<label class="fl">${l}<input name="${n}" value="${E(v)}" ${x}></label>`;
const SEL = (l, n, list, v, ph) => `<label class="fl">${l}<select name="${n}">${ph ? `<option value="">${ph}</option>` : ''}${list.map(o => `<option${o === v ? ' selected' : ''}>${E(o)}</option>`).join('')}</select></label>`;

function login(err = '') {
  root.innerHTML = `<div class="lwrap"><div class="lside" aria-hidden="true"><span class="lmark">KIT<br>ROOM</span><span class="lnum">10</span></div><form class="login panel" id="lf"><h2 class="disp">Staff sign in</h2><p class="mu">Manage products, orders and customizations.</p><label class="fl">Username<input name="username" autocomplete="username" required></label><label class="fl">Password<input name="password" type="password" autocomplete="current-password" required></label><div class="err" id="le">${E(err)}</div><button class="b" style="width:100%;margin-top:6px">Sign in</button><a class="lk" href="/" style="justify-self:center">Back to the shop</a></form></div>`;
}
async function load() {
  const g = u => api('/api/admin/' + u);
  let d;
  [prods, orders, site, cat, msgs, revs, d, payInfo, czs] = await Promise.all([g('products'), g('orders'), g('site'), g('catalog'), g('messages'), g('reviews'), g('delivery').catch(() => null), g('payments/status').catch(() => null), g('customizations').catch(() => [])]);
  if (!Array.isArray(czs)) czs = [];
  cat.patches = cat.patches || [];
  cat.brands = cat.brands || []; cat.models = cat.models || []; cat.categories = cat.categories || [];
  dlv = d || { missing: true, states: [], fees: {}, default: 0, free_state: 'Kaduna' };
  if (!clg && cat.leagues[0]) clg = String(cat.leagues[0].id);
  if (!cbrand && cat.brands[0]) cbrand = String(cat.brands[0].id);
  if (me.role === 'owner') users = await g('users');
}

/* ---------- products ---------- */
const autoName = x => x.category === 'Jerseys' && x.club ? [x.club, x.kit || 'Home', 'Jersey', x.season, x.sleeve].filter(Boolean).join(' ') : x.category === 'Boots' && (x.brand_new || x.brand) ? [x.brand_new || x.brand, x.model_new || x.model].filter(Boolean).join(' ') + (x.boot_type ? ` (${x.boot_type})` : '') : null;
function sync() { if (edit.nameAuto || !edit.name) { const n = autoName(edit); if (n) { edit.name = n; edit.nameAuto = true; } } }
function pBody() {
  if (edit) {
    const x = edit, j = x.category === 'Jerseys', lg = cat.leagues.find(l => l.name === x.league), clubs = lg ? cat.clubs.filter(c => c.league_id === lg.id).map(c => c.name) : [];
    return `<form class="panel" id="pf"><h2 class="disp">${x.id ? 'Edit product' : 'Add a product'}</h2><div class="up"><div class="at" id="prev">${picked ? `<img src="${pickedUrl}" alt="">` : pic(x)}</div><div><button type="button" class="b g" data-act="pick">${x.image || picked ? 'Change photo' : 'Upload photo'}</button><div class="mu" id="pm">${picked ? E(picked.name) + ' selected. It stays selected if you change other boxes.' : 'JPG, PNG or WebP, up to 5 MB'}</div>${x.image && !picked ? `<label class="mu"><input type="checkbox" name="removeImage" value="1"${x.removeImage ? ' checked' : ''}> Remove current photo</label>` : ''}</div></div><input type="file" name="image" id="file" accept="image/jpeg,image/png,image/webp" hidden>
${SEL('Category', 'category', cats(), x.category)}${x.category === 'Combos' ? comboBox(x) : '<input type="hidden" name="combo_set" value="1">'}
${j ? `${SEL('League', 'league', cat.leagues.map(l => l.name), x.league, 'Select a league')}${SEL('Club or team', 'club', clubs, x.club, lg ? 'Select a club' : 'Choose a league first')}<div class="two">${SEL('Season', 'season', cat.seasons.map(s => s.label), x.season, 'Select a season')}${SEL('Kit', 'kit', KITS, x.kit || 'Home')}</div>${SEL('Sleeve type', 'sleeve', SLV, x.sleeve, 'Not specified')}` : x.category === 'Boots' ? bootBox(x) + '<input type="hidden" name="sleeve" value="">' : F('Brand', 'league', x.league) + '<input type="hidden" name="sleeve" value="">'}
${F('Name', 'name', x.name, 'required')}<div class="mu">${j ? 'The name fills in from the club, kit and season. You can still edit it.' : ''}</div>
<div class="two">${F('Price (₦)', 'price', x.price, 'inputmode="numeric"')}${F('Quantity in stock', 'stock', x.stock, 'inputmode="numeric"')}</div>${sizesBox(x)}${F('Customization fee (₦)', 'custom_fee', x.custom_fee ?? '', `inputmode="numeric" placeholder="Blank = shop default (${money(site.cfee)})"`)}<label class="fl">Description<textarea name="description" rows="3">${E(x.description)}</textarea></label><div class="two" style="margin-top:16px"><button class="b">Save product</button><button type="button" class="b g" data-act="pcancel">Cancel</button></div></form>`;
  }
  const inS = prods.filter(x => x.stock > 0).length;
  return `<div class="ptools"><label class="srch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input id="pq" type="search" placeholder="Search products" aria-label="Search products"></label><span class="mu">${prods.length} products, ${inS} in stock, ${prods.length - inS} sold out</span><button class="b" data-act="padd">Add a product</button></div>
<div class="panel plist"><div class="prow phead" aria-hidden="true"><span></span><span>Product</span><span>Price</span><span>Stock</span><span>Status</span><span></span></div>${prods.length ? prods.map(x => `<div class="prow" data-n="${E((x.name + ' ' + x.category + ' ' + (x.league || '') + ' ' + (x.brand || '')).toLowerCase())}"><div class="at">${pic(x)}</div><div class="pn"><b>${E(x.name)}</b><small>${[x.category, x.league, x.boot_type, x.season, x.sleeve].filter(Boolean).map(E).join(', ')}${x.combo ? ', ' + x.combo.split(',').length + ' items' : ''}</small></div><div class="pp">${money(x.price)}</div><input class="pstock" data-stock="${x.id}" value="${x.stock}" inputmode="numeric" aria-label="Stock for ${E(x.name)}"><div class="ps">${badge(x.stock)}</div><div class="pa"><button class="lk" data-edit="${x.id}">Edit</button><button class="lk rd" data-rm="p${x.id}">${sure === 'p' + x.id ? 'Sure?' : 'Delete'}</button></div></div>`).join('') : '<p class="mu empty">No products yet. Add your first one.</p>'}</div>`;
}

/* ---------- orders, messages, reviews ---------- */
const sel = (name, id, list, v) => `<select data-${name}="${id}" aria-label="Status">${list.map(s => `<option${s === v ? ' selected' : ''}>${s}</option>`).join('')}</select>`;
const payBlock = o => {
  const st = o.payment_status || 'unpaid';
  if (st === 'paid') return `<div class="mu"><b style="color:var(--ok)">Paid ${money(o.paid_amount)}</b> · ${E(String(o.pay_channel || 'Paystack').replace('manual:', 'recorded by you: '))}${o.email ? ' · ' + E(o.email) : ''}</div>`;
  const link = payLinks[o.id];
  let h = `<div class="mu">${st === 'review' ? '<b style="color:var(--ou)">A payment came in but the amount needs checking in your Paystack dashboard</b>' : 'Not paid yet'}${o.email ? ' · ' + E(o.email) : ''}</div>`;
  if (o.delivery_tbc) return h + '<div class="mu">Set the delivery fee first, then you can get a payment link.</div>';
  if (link) h += `<div style="display:grid;gap:6px"><input readonly value="${E(link)}" aria-label="Payment link"><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="lk" data-copy="${E(link)}">Copy link</button><a class="lk" target="_blank" rel="noopener" href="https://wa.me/${waNum(o.phone)}?text=${encodeURIComponent('Hello ' + o.name + ', here is your payment link for order ' + o.ref + ' (' + money(o.total) + '): ' + link)}">Send on WhatsApp</a></div></div>`;
  return h + `<form data-paylink="${o.id}" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">${o.email ? '' : '<input name="email" type="email" placeholder="Customer email" aria-label="Customer email" required style="flex:1 1 200px">'}<button class="b g">${link ? 'New payment link' : 'Get payment link'}</button></form><form data-markpaid="${o.id}" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select name="method" aria-label="How they paid" style="width:auto"><option value="transfer">Bank transfer</option><option value="cash">Cash</option><option value="pos">POS</option><option value="other">Other</option></select><button class="lk">Mark as paid</button></form>`;
};
function payBody() {
  const p = payInfo;
  if (!p) return '<div class="panel"><h2 class="disp">Payments</h2><p>The server needs the new files before online payments can be set up. Replace the project files, stop the server with Ctrl+C, then run npm start again.</p></div>';
  return `<div class="panel"><h2 class="disp">Paystack payments</h2>${p.enabled ? `<p><b style="color:var(--ok)">Connected in ${p.mode} mode.</b> ${p.mode === 'test' ? 'No real money moves while you use test keys. Switch to your live key when you are ready to sell.' : 'Customers are paying real money.'}</p>` : '<p><b style="color:var(--ou)">Not connected yet.</b> Customers can still order and confirm on WhatsApp.</p>'}<ol style="font-size:16px;padding-left:20px"><li>Create an account at paystack.com, then open Settings and API Keys and Webhooks.</li><li>In Railway, open your service, then Variables, and add <b>PAYSTACK_SECRET_KEY</b> with your secret key (it starts with sk_test_ or sk_live_). Never share this key with anyone.</li><li>On Paystack, set the <b>Webhook URL</b> to the address below. You can set the callback URL too.</li><li>Redeploy, place a small test order, and pay with a Paystack test card.</li></ol>${F('Webhook URL (paste into Paystack)', 'x1', p.webhookUrl, 'readonly')}${F('Callback URL (optional on Paystack)', 'x2', p.callbackUrl, 'readonly')}</div>`;
}
const czTxt = d => { const p = []; if (d && d.n) p.push(`Name “${E(d.n)}”`); if (d && d.x !== '' && d.x != null) p.push(`Number ${E(d.x)}`); if (d && d.p) p.push(`Patches: ${E(d.p)}`); return p.join(' · ') || 'no printing details'; };
function czBody() {
  const rank = { pending: 0, approved: 1, declined: 2 }, list = [...czs].sort((a, b) => (rank[a.status] - rank[b.status]) || b.id - a.id);
  const badge = r => r.status === 'approved' ? '<b style="color:var(--ok)">Approved</b>' : r.status === 'declined' ? '<b style="color:var(--ou)">Declined</b>' : '<b style="color:var(--lo)">Waiting for your decision</b>';
  const wa = r => 'https://wa.me/' + waNum(r.phone) + '?text=' + encodeURIComponent(r.status === 'approved' ? `Hello ${r.name}, your customization request ${r.ref} has been approved. Please open the shop and place your order: ${location.origin}` : r.status === 'declined' ? `Hello ${r.name}, we could not approve your customization request ${r.ref}.${r.admin_note ? ' ' + r.admin_note : ''}` : `Hello ${r.name}, about your customization request ${r.ref}:`);
  return `<div class="panel"><h2 class="disp">Customization requests</h2><p class="mu">Check the printing details, then approve or decline. Once you approve, the customer can go ahead and place the order. They see your answer in their cart, and you can also message them on WhatsApp.</p>${list.length ? list.map(r => `<div class="or"><div><b>${E(r.name)}</b> <span class="mu">· ${E(r.ref)} · ${when(r.created_at)}</span> · ${badge(r)}</div>${r.lines.map(l => `<div>${l.qty} × ${E(l.name)} (${E(l.size)}) – ${E(l.noun)}: ${czTxt(l.d)}${l.fee ? ` <span class="mu">· customization fee ${money(l.fee)} each</span>` : ''}</div>`).join('')}${r.message ? `<div class="mu" style="white-space:pre-wrap">${E(r.message)}</div>` : ''}${r.used ? `<div class="mu">Used in order ${E(r.order_ref)}</div>` : `<form data-czdecide="${r.id}" style="display:grid;gap:8px"><input name="note" value="${E(r.admin_note || '')}" placeholder="Note to the customer (optional)" aria-label="Note to the customer" maxlength="300"><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="b" name="act" value="approved"${r.status === 'approved' ? ' disabled' : ''}>Approve</button><button class="b g" name="act" value="declined"${r.status === 'declined' ? ' disabled' : ''}>Decline</button></div></form>`}<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><a class="lk" href="tel:${E(r.phone)}">Call ${E(r.phone)}</a><a class="lk" target="_blank" rel="noopener" href="${wa(r)}">WhatsApp</a><button type="button" class="lk rd" data-rm="z${r.id}">${sure === 'z' + r.id ? 'Sure?' : 'Delete'}</button></div></div>`).join('') : '<p class="mu">No requests yet. They appear here when a customer asks to customize an item.</p>'}</div>`;
}
function oBody() {
  const l = orders.filter(o => ofl === 'All' || o.status === ofl);
  return `<div class="chips" style="margin-bottom:14px">${['All', ...STS].map(s => `<button class="chip" data-of="${s}" aria-pressed="${ofl === s}">${s}</button>`).join('')}</div><div class="panel">${l.length ? l.map(o => `<div class="or"><div class="oh"><div><b>${E(o.name)}</b> <span class="mu">${E(o.ref)}, ${when(o.created_at)}</span></div><div class="ot"><span class="pill s-${E(String(o.status).toLowerCase())}">${E(o.status)}</span><b class="om">${money(o.total)}</b></div></div><div class="mu">${o.items.map(i => `${i.qty} × ${E(i.name)} (${E(i.size)}${i.sleeve ? ', ' + E(i.sleeve) : ''})${i.custom ? ' – customized: ' + czTxt(i.custom) : ''}`).join('; ')}</div>${o.state ? `<div class="mu">${[o.country, o.state].filter(Boolean).map(E).join(', ')} · delivery ${o.delivery_tbc ? 'fee to be confirmed' : o.delivery ? money(o.delivery) : 'free'}</div>` : ''}${o.delivery_tbc ? `<form class="two" data-ofee="${o.id}" style="grid-template-columns:1fr auto;align-items:end"><label class="fl">Delivery fee for this order (₦)<input name="fee" inputmode="numeric" required></label><button class="b">Set fee</button></form>` : ''}${o.landmark ? `<div class="mu">Landmark: ${E(o.landmark)}</div>` : ''}${o.carpark ? `<div class="mu">Nearest car park: ${E(o.carpark)}</div>` : ''}${o.address ? `<div class="mu">${E(o.address)}</div>` : ''}${payBlock(o)}<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${sel('os', o.id, STS, o.status)}<a class="lk" href="tel:${E(o.phone)}">Call ${E(o.phone)}</a><a class="lk" target="_blank" rel="noopener" href="https://wa.me/${waNum(o.phone)}">WhatsApp</a></div></div>`).join('') : '<p class="mu">No orders here yet.</p>'}</div>`;
}
function mBody() {
  return `<div class="panel"><h2 class="disp">Customer messages</h2>${msgs.length ? msgs.map(m => `<div class="or"><div><b>${E(m.name)}</b> <span class="mu">· ${when(m.created_at)}</span></div>${m.product ? `<div class="mu">About: ${E(m.product)}</div>` : ''}<div style="white-space:pre-wrap">${E(m.body)}</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${sel('ms', m.id, ['New', 'Done'], m.status)}<a class="lk" href="tel:${E(m.phone)}">Call ${E(m.phone)}</a><a class="lk" target="_blank" rel="noopener" href="https://wa.me/${waNum(m.phone)}">Reply on WhatsApp</a><button class="lk rd" data-rm="m${m.id}">${sure === 'm' + m.id ? 'Sure?' : 'Delete'}</button></div></div>`).join('') : '<p class="mu">No messages yet. Chats from the website chat box land here.</p>'}</div>`;
}
function rBody() {
  return `<div class="panel"><h2 class="disp">Customer reviews</h2><p class="mu">Only reviews marked Approved show on the website. Customers see the first three letters of the name and the state.</p>${revs.length ? revs.map(r => `<div class="or"><div><b>${E(r.name)}</b> · ${E(r.state)} <span class="mu">· ${when(r.created_at)}</span></div><div>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} <span class="mu">${r.rating} of 5</span></div><div>${E(r.body)}</div><div style="display:flex;gap:10px;align-items:center">${sel('rs', r.id, ['pending', 'approved', 'hidden'], r.status)}<button class="lk rd" data-rm="r${r.id}">${sure === 'r' + r.id ? 'Sure?' : 'Delete'}</button></div></div>`).join('') : '<p class="mu">No reviews yet.</p>'}</div>`;
}

/* ---------- clubs, leagues, seasons ---------- */
function cBody() {
  const rm = (k, label) => `<button type="button" class="lk rd" data-rm="${k}">${sure === k ? 'Sure?' : label}</button>`, cl = cat.clubs.filter(c => String(c.league_id) === clg);
  return `<div class="panel"><h2 class="disp">Leagues</h2><p class="mu">These appear in the League list when you add a jersey.</p>${cat.leagues.map(l => `<div class="ar" style="grid-template-columns:1fr auto"><b>${E(l.name)}</b>${rm('l' + l.id, 'Remove')}</div>`).join('')}<form id="lgf" style="margin-top:10px">${F('New league', 'name', '', 'placeholder="e.g. Saudi Pro League" required')}<button class="b" style="margin-top:12px">Add league</button></form></div>
<div class="panel"><h2 class="disp">Clubs in a league</h2><label class="fl">League<select id="clg">${cat.leagues.map(l => `<option value="${l.id}"${String(l.id) === clg ? ' selected' : ''}>${E(l.name)}</option>`).join('')}</select></label><div class="mu" style="margin:10px 0">${cl.length} clubs</div><div style="display:flex;flex-wrap:wrap;gap:6px">${cl.map(c => `<span class="chip" style="display:inline-flex;align-items:center;gap:6px">${E(c.name)} ${sure === 'c' + c.id ? '<button class="lk rd" data-rm="c' + c.id + '" aria-label="Confirm remove">Sure?</button>' : '<button class="lk rd" data-rm="c' + c.id + '" aria-label="Remove ' + E(c.name) + '">×</button>'}</span>`).join('')}</div>
<form id="clf" style="margin-top:12px"><label class="fl">Add clubs (one per line)<textarea name="names" rows="3" placeholder="Club name" required></textarea></label><button class="b" style="margin-top:12px">Add to this league</button></form></div>
<div class="panel"><h2 class="disp">Boot brands and models</h2><p class="mu">Brands and models added here become dropdowns when you add a boot.</p>${cat.brands.map(b => `<div class="ar" style="grid-template-columns:1fr auto"><b>${E(b.name)}</b>${rm('b' + b.id, 'Remove')}</div>`).join('')}<form id="brf" style="margin:10px 0">${F('New brand', 'name', '', 'placeholder="e.g. Puma" required')}<button class="b" style="margin-top:12px">Add brand</button></form><label class="fl">Models for<select id="cbr">${cat.brands.map(b => `<option value="${b.id}"${String(b.id) === cbrand ? ' selected' : ''}>${E(b.name)}</option>`).join('')}</select></label><div style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0">${cat.models.filter(m => String(m.brand_id) === cbrand).map(m => `<span class="chip" style="display:inline-flex;align-items:center;gap:6px">${E(m.name)} <button type="button" class="lk rd" data-rm="o${m.id}" aria-label="Remove ${E(m.name)}">${sure === 'o' + m.id ? 'Sure?' : '×'}</button></span>`).join('')}</div><form id="mdf"><label class="fl">Add models (one per line)<textarea name="names" rows="3" placeholder="e.g. Mercurial Superfly" required></textarea></label><button class="b" style="margin-top:12px">Add to this brand</button></form></div>
<div class="panel"><h2 class="disp">Patch options</h2><p class="mu">These fill the Patches dropdown in the customize form. Customers can also choose None, or type their own.</p><div style="display:flex;flex-wrap:wrap;gap:6px;margin:10px 0">${(cat.patches || []).map(p => `<span class="chip" style="display:inline-flex;align-items:center;gap:6px">${E(p.name)} <button type="button" class="lk rd" data-rm="a${p.id}" aria-label="Remove ${E(p.name)}">${sure === 'a' + p.id ? 'Sure?' : '×'}</button></span>`).join('')}</div><form id="ptf"><label class="fl">Add patches (one per line)<textarea name="names" rows="3" placeholder="e.g. Club World Cup" required></textarea></label><button class="b" style="margin-top:12px">Add patches</button></form></div>
<div class="panel"><h2 class="disp">Product types</h2><p class="mu">These are the sections of the shop. Add a new one here for any future product, then pick it when you add a product.</p>${cat.categories.map(c => { const f = String(c.custom_fields || 'name').split(','); return `<form class="czrow" data-czid="${c.id}"><div style="display:flex;justify-content:space-between;align-items:center"><b>${E(c.name)}</b>${rm('t' + c.id, 'Remove')}</div><label class="fl">Called (used in “Name to print on the …”)<input name="noun" value="${E(c.noun || c.name.toLowerCase())}" maxlength="30"></label><div class="mu" style="margin-top:8px">Customers can customize:</div><div style="display:flex;gap:6px 16px;flex-wrap:wrap">${[['name', 'Name'], ['number', 'Number'], ['patches', 'Patches']].map(([k, l]) => `<label class="cz"><input type="checkbox" name="cf" value="${k}"${f.includes(k) ? ' checked' : ''}> ${l}</label>`).join('')}</div><label class="cz"><input type="checkbox" name="rule" value="any"${c.custom_rule === 'any' ? ' checked' : ''}> One is enough (for example a name or a number)</label><button class="b" style="margin-top:8px">Save</button></form>`; }).join('')}<form id="ctf" style="margin-top:10px">${F('New product type', 'name', '', 'placeholder="e.g. Caps" required')}<button class="b" style="margin-top:12px">Add product type</button></form></div>
<div class="panel"><h2 class="disp">Seasons</h2>${cat.seasons.map(s => `<div class="ar" style="grid-template-columns:1fr auto"><b>${E(s.label)}</b>${rm('s' + s.id, 'Remove')}</div>`).join('')}<form id="sef" style="margin-top:10px">${F('New season', 'label', '', 'placeholder="e.g. 2027/28" required')}<button class="b" style="margin-top:12px">Add season</button></form></div>`;
}

/* ---------- site text, account ---------- */
function dBody() {
  const d = dlv;
  if (d.missing) return '<div class="panel"><h2 class="disp">Delivery fee</h2><p>The server needs the new files before delivery fees can be set. Replace the project files, stop the server with Ctrl+C, then run npm start again.</p></div>';
  const std = d.default == null ? 'No fee set yet' : 'Standard fee ' + money(d.default);
  return `<form class="panel" id="df"><h2 class="disp">Delivery fee</h2><p class="mu">Delivery is free in one Nigerian state. Everywhere else a delivery fee is attached. The fee boxes are empty for now: customers are told a fee applies, and you confirm the amount with them on WhatsApp or by call. Fill them in whenever you are ready.</p>${SEL('Free delivery state', 'free_state', d.states, d.free_state)}${F('Fee for other Nigerian states (₦)', 'default', d.default ?? '', 'inputmode="numeric" placeholder="Not set yet"')}${F('Fee for other countries (₦)', 'intl_default', d.intl_default ?? '', 'inputmode="numeric" placeholder="Not set yet"')}<button class="b" style="margin-top:16px">Save</button></form>
<div class="panel"><h2 class="disp">Fee for a specific state</h2><p class="mu">Leave blank to use the fee above (or none yet). Type an amount to set a fee for that state.</p>${d.states.map(s => `<div class="ar" style="grid-template-columns:1fr 120px"><div><b>${E(s)}</b><small>${s === d.free_state ? 'Free delivery' : d.fees[s] != null ? 'Custom fee' : std}</small></div>${s === d.free_state ? '<span class="mu">Free</span>' : `<input data-dfee="${E(s)}" value="${d.fees[s] ?? ''}" inputmode="numeric" placeholder="Not set" aria-label="Delivery fee for ${E(s)}">`}</div>`).join('')}</div>
<div class="panel"><h2 class="disp">Fee for a specific country</h2><p class="mu">Other countries use the fee above unless you set one here.</p>${Object.entries(d.country_fees).map(([c, v]) => `<div class="ar" style="grid-template-columns:1fr auto auto"><b>${E(c)}</b><span>${money(v)}</span><button class="lk rd" data-cfee-del="${E(c)}">Remove</button></div>`).join('')}<form id="cff" style="margin-top:10px"><div class="two">${SEL('Country', 'country', d.countries.filter(c => c !== 'Nigeria'), '', 'Select a country')}${F('Fee (₦)', 'fee', '', 'inputmode="numeric" required')}</div><button class="b" style="margin-top:12px">Add country fee</button></form></div>`;
}
function sBody() {
  return `<form class="panel" id="sf"><h2 class="disp">Site text</h2>${F('Shop name', 'name', site.name)}${F('Homepage headline', 'h', site.h)}<label class="fl">Homepage short text<textarea name="t" rows="3">${E(site.t)}</textarea></label>${F('Button label', 'b', site.b)}${F('Announcement message', 'bn', site.bn)}${F('Default customization fee (₦)', 'cfee', site.cfee, 'inputmode="numeric"')}<label class="fl"><input type="checkbox" name="bo"${site.bo === '1' ? ' checked' : ''}> Show the announcement bar</label>
${F('Featured products: seconds before the next one shows', 'spd', site.spd || '60', 'inputmode="numeric" placeholder="60"')}<div class="mu" style="margin-top:6px">The big panel at the top of the shop rotates through your in-stock items. 3 to 600 seconds; 60 is one minute.</div>
<h2 class="disp" style="margin-top:20px">Store design</h2><p class="mu">Choose how your shop looks. Everything works the same in each design. Preview first, then Save changes.</p><label class="fl">Design<select name="theme">${[['matchday', 'Matchday (navy, stadium type, referee-card stock labels)'], ['gallery', 'Gallery (quiet and premium, big product photos)'], ['terrace', 'Terrace (bold streetwear, green and yellow)']].map(([k, n]) => `<option value="${k}"${(['gallery', 'terrace'].includes(site.theme) ? site.theme : 'matchday') === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label><p>${[['matchday', 'Matchday'], ['gallery', 'Gallery'], ['terrace', 'Terrace']].map(([k, n]) => `<a class="lk" target="_blank" href="/?look=${k}">Preview ${n}</a>`).join(' ')}</p>
<h2 class="disp" style="margin-top:20px">About, contact and social</h2><label class="fl">About us text<textarea name="about" rows="6">${E(site.about)}</textarea></label>${F('Location', 'location', site.location)}${F('Phone number', 'phone', site.phone, 'inputmode="tel"')}${F('Email', 'email', site.email, 'type="email"')}${F('WhatsApp number (country code, digits only)', 'wa', site.wa, 'inputmode="numeric"')}${F('Chat button greeting', 'wm', site.wm)}${F('X link', 'x', site.x, 'placeholder="https://x.com/yourname"')}${F('Instagram link', 'ig', site.ig, 'placeholder="https://instagram.com/yourname"')}${F('TikTok link', 'tt', site.tt, 'placeholder="https://tiktok.com/@yourname"')}<button class="b" style="margin-top:16px">Save changes</button></form>`;
}
function aBody() {
  let h = `<form class="panel" id="wf"><h2 class="disp">Change my password</h2><label class="fl">Current password<input type="password" name="current" autocomplete="current-password" required></label><label class="fl">New password (8+ characters)<input type="password" name="new" autocomplete="new-password" required></label><button class="b" style="margin-top:16px">Change password</button></form>`;
  if (me.role === 'owner') h += `<div class="panel"><h2 class="disp">Staff accounts</h2>${users.map(u => `<div class="ar" style="grid-template-columns:1fr auto"><div><b>${E(u.username)}</b><small>${u.role}</small></div>${u.role === 'owner' ? '' : `<button class="lk rd" data-rm="u${u.id}">${sure === 'u' + u.id ? 'Sure?' : 'Remove'}</button>`}</div>`).join('')}<form id="uf"><div class="two">${F('Username', 'username', '', 'required autocomplete="off"')}<label class="fl">Password (8+ characters)<input name="password" type="text" autocomplete="off" required></label></div><button class="b" style="margin-top:14px">Add staff member</button></form></div>`;
  return h;
}

function ovBody() {
  const nZ = czs.filter(r => r.status === 'pending'), nO = orders.filter(o => o.status === 'New'), nM = msgs.filter(m => m.status === 'New'), nR = revs.filter(r => r.status === 'pending');
  const low = prods.filter(x => x.stock <= 5).sort((a, b) => a.stock - b.stock), paid = orders.filter(o => o.payment_status === 'paid').reduce((a, o) => a + (+o.paid_amount || 0), 0);
  const tile = (k, n, label, note, hot) => `<button class="kpi${hot && n ? ' hot' : ''}" data-tab="${k}"><span class="kn">${n}</span><span class="kl">${label}</span><span class="kx">${note}</span></button>`;
  return `<div class="kpis">${tile('orders', nO.length, 'New orders', nO.length ? 'Confirm them on WhatsApp' : 'Nothing waiting', 1)}${tile('customizations', nZ.length, 'Prints to approve', nZ.length ? 'Customers are waiting' : 'All decided', 1)}${tile('messages', nM.length, 'New messages', nM.length ? 'Reply by call or WhatsApp' : 'Inbox clear', 1)}${tile('products', low.length, 'Low or sold out', low.length ? 'Restock soon' : 'Stock looks good', 1)}</div>
<div class="ovg"><section class="panel"><div class="ph"><h2 class="disp">Latest orders</h2><button class="lk" data-tab="orders">All orders</button></div>${orders.length ? orders.slice(0, 6).map(o => `<button class="ol" data-tab="orders"><span><b>${E(o.name)}</b><small>${E(o.ref)}, ${when(o.created_at)}</small></span><span class="pill s-${E(String(o.status).toLowerCase())}">${E(o.status)}</span><b>${money(o.total)}</b></button>`).join('') : '<p class="mu">No orders yet. They show here as soon as a customer orders.</p>'}<p class="mu" style="margin:14px 0 0">Paid online so far: <b>${money(paid)}</b>, ${orders.length} order${orders.length === 1 ? '' : 's'} in total.</p></section>
<section class="panel"><div class="ph"><h2 class="disp">Restock soon</h2><button class="lk" data-tab="products">All products</button></div>${low.length ? low.slice(0, 8).map(x => `<div class="ll"><div class="at">${pic(x)}</div><div><b>${E(x.name)}</b>${badge(x.stock)}</div><input class="pstock" data-stock="${x.id}" value="${x.stock}" inputmode="numeric" aria-label="Stock for ${E(x.name)}"></div>`).join('') : '<p class="mu">Every product has more than 5 in stock.</p>'}${nR.length ? `<p class="mu" style="margin:14px 0 0">${nR.length} review${nR.length === 1 ? '' : 's'} waiting. <button class="lk" data-tab="reviews">Check reviews</button></p>` : ''}</section></div>`;
}
const NAV = [['overview', 'Overview', '<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>'], ['products', 'Products', '<path d="M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3c-1 2-2.5 3-4 3S9 5 8 3z"/>'], ['orders', 'Orders', '<path d="M5 7h14l-1 13H6zM9 7V5a3 3 0 0 1 6 0v2"/>'], ['customizations', 'Customizations', '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>'], ['messages', 'Messages', '<path d="M4 5h16v11H9l-5 4z"/>'], ['reviews', 'Reviews', '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'], ['catalog', 'Clubs, seasons, types', '<path d="M4 6h16M4 12h16M4 18h10"/>'], ['delivery', 'Delivery fees', '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'], ['payments', 'Payments', '<rect x="3" y="5" width="18" height="14"/><path d="M3 10h18"/>'], ['site', 'Site text and design', '<path d="M4 5h16v14H4zM8 9h8M8 13h5"/>'], ['account', 'Account', '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>']];
const SUB = { overview: 'What needs your attention today.', products: 'Add items, update stock and prices.', orders: 'Confirm, get paid and deliver.', customizations: 'Approve or decline name and number printing.', messages: 'Questions from the website chat box.', reviews: 'Approve reviews before they show on the shop.', catalog: 'Lists used when you add products.', delivery: 'Free delivery state and fees elsewhere.', payments: 'Paystack setup and status.', site: 'Words on your shop, and how it looks.', account: 'Your password and staff logins.' };
function app() {
  const nZ = czs.filter(r => r.status === 'pending').length, nO = orders.filter(o => o.status === 'New').length, nM = msgs.filter(m => m.status === 'New').length, nR = revs.filter(r => r.status === 'pending').length, c = n => n ? ` (${n})` : '';
  const body = { overview: ovBody, products: pBody, orders: oBody, customizations: czBody, messages: mBody, reviews: rBody, catalog: cBody, delivery: dBody, payments: payBody, site: sBody, account: aBody }[tab]();
  const cnt = { orders: nO, customizations: nZ, messages: nM, reviews: nR }, title = (NAV.find(n => n[0] === tab) || NAV[0])[1];
  const nav = NAV.map(([k, l, ic]) => `<button class="nv" data-tab="${k}"${tab === k ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${ic}</svg><span>${k === 'account' && me.role === 'owner' ? 'Staff and account' : l}</span>${cnt[k] ? `<b>${cnt[k]}</b>` : ''}</button>`).join('');
  root.innerHTML = `<div class="adm"><aside class="side"><div class="brand"><span class="logo">${E(String(site.name || 'Kit Room').toUpperCase())}</span><span class="role">Admin</span></div><nav class="nav" aria-label="Admin sections">${nav}</nav><div class="me"><a class="nv" href="/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg><span>View store</span></a><div class="who"><span class="av">${E(String(me.username || '?')[0].toUpperCase())}</span><span><b>${E(me.username)}</b><small>${me.role === 'owner' ? 'Owner' : 'Staff'}</small></span><button class="lk" data-act="mode" aria-label="Switch light or dark">${document.documentElement.dataset.mode === 'dark' ? 'Light' : 'Dark'}</button><button class="lk" data-act="out">Sign out</button></div></div></aside>
<main class="main"><header class="mh"><div><h1>${E(tab === 'products' && edit ? (edit.id ? 'Edit product' : 'Add a product') : title)}</h1><p class="mu">${SUB[tab] || ''}</p></div></header>${body}</main></div><div class="tg" id="tg" role="status"></div>`;
}
const run = async (fn, ok) => { try { await fn(); if (ok) toast(ok); } catch (e) { toast(e.message); } };
const reload = async () => { await load(); app(); };
const DEL = { p: ['products', 'Product deleted'], m: ['messages', 'Message deleted'], r: ['reviews', 'Review deleted'], u: ['users', 'Staff member removed'], z: ['customizations', 'Request deleted'], a: ['patches', 'Patch removed'], l: ['leagues', 'League and its clubs removed'], c: ['clubs', 'Club removed'], t: ['categories', 'Product type removed'], b: ['brands', 'Brand and its models removed'], o: ['models', 'Model removed'], s: ['seasons', 'Season removed'] };

root.addEventListener('click', async e => {
  const b = k => e.target.closest(`[${k}]`); let x;
  if (x = b('data-act')) {
    const a = x.dataset.act;
    if (a === 'out') { await api('/api/logout', { method: 'POST' }); me = null; login(); }
    else if (a === 'padd') { clearPick(); edit = { name: '', category: 'Jerseys', league: '', club: '', season: cat.seasons[0]?.label || '', kit: 'Home', sleeve: '', price: '', stock: '', sizes: '', custom_fee: '', description: '', image: '', nameAuto: true, combo: '', brand: '', model: '', boot_type: '' }; setSizeDefaults(edit, 'Jerseys'); splitCombo(edit); app(); }
    else if (a === 'pcancel') { clearPick(); edit = null; app(); }
    else if (a === 'pick') $('file').click();
    else if (a === 'mode') { const n = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.mode = n; try { localStorage.setItem('krAdminMode', n); } catch { } app(); }
  }
  else if (x = b('data-tab')) { tab = x.dataset.tab; clearPick(); edit = null; sure = null; app(); window.scrollTo(0, 0); }
  else if (x = b('data-of')) { ofl = x.dataset.of; app(); }
  else if (x = b('data-edit')) { clearPick(); edit = { ...prods.find(p => p.id === +x.dataset.edit), nameAuto: false }; inferSizes(edit); splitCombo(edit); tab = 'products'; app(); }
  else if (x = b('data-copy')) { (navigator.clipboard ? navigator.clipboard.writeText(x.dataset.copy) : Promise.reject()).then(() => toast('Link copied'), () => toast('Select the link and copy it')); }
  else if (x = b('data-cfee-del')) run(async () => { await api('/api/admin/delivery-country/' + encodeURIComponent(x.dataset.cfeeDel), J('PUT', { fee: '' })); dlv = await api('/api/admin/delivery'); app(); }, 'Country charge removed');
  else if (x = b('data-rm')) {
    const k = x.dataset.rm, [path, ok] = DEL[k[0]];
    if (sure === k) run(async () => { await api(`/api/admin/${path}/${k.slice(1)}`, { method: 'DELETE' }); sure = null; await reload(); }, ok); else { sure = k; app(); }
  }
});
root.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'pq') { const q = t.value.trim().toLowerCase(); document.querySelectorAll('.prow[data-n]').forEach(r => { r.hidden = !!q && !r.dataset.n.includes(q); }); return; }
  if (t.form && t.form.id === 'pf' && t.name && t.type !== 'file' && t.type !== 'checkbox' && t.tagName !== 'SELECT') { edit[t.name] = t.value; if (t.name === 'name') edit.nameAuto = false; if (t.name === 'brand_new' || t.name === 'model_new') { sync(); const nm = t.form.querySelector('[name=name]'); if (nm) nm.value = edit.name; } }
});
root.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'file') {
    const f = t.files[0]; if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { t.value = ''; return toast('Use a JPG, PNG or WebP photo'); }
    if (f.size > 5 * 1024 * 1024) { t.value = ''; return toast('That photo is over 5 MB. Choose a smaller one'); }
    if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    picked = f; pickedUrl = URL.createObjectURL(f);
    $('prev').innerHTML = `<img src="${pickedUrl}" alt="">`; $('pm').textContent = f.name + ' selected. It stays selected if you change other boxes.';
  }
  else if (t.name === 'removeImage' && edit) edit.removeImage = t.checked;
  else if (t.form && t.form.id === 'pf' && t.name === 'combo') edit.comboChecked = [...t.form.querySelectorAll('input[name=combo]:checked')].map(i => i.value);
  else if (t.form && t.form.id === 'pf' && t.tagName === 'SELECT') {
    edit[SK[t.name] || t.name] = t.value;
    if (SK[t.name]) { if (t.name === 'size_mode') ensureRange(edit); edit.sizes = calcSizes(edit); }
    if (t.name === 'league') edit.club = '';
    if (t.name === 'brand') { edit.model = ''; edit.brand_new = ''; edit.model_new = ''; }
    if (t.name === 'category') { const was = edit.sizeMode; setSizeDefaults(edit, edit.category); if (edit.sizeMode === 'manual' && was !== 'manual') edit.sizes = ''; if (edit.category !== 'Jerseys') { edit.club = ''; edit.season = ''; edit.kit = ''; edit.sleeve = ''; } else { edit.kit = edit.kit || 'Home'; edit.season = edit.season || cat.seasons[0]?.label || ''; } if (edit.category !== 'Boots') { edit.brand = ''; edit.model = ''; edit.boot_type = ''; edit.brand_new = ''; edit.model_new = ''; } if (edit.category !== 'Combos') { edit.comboChecked = []; edit.combo_other = ''; } }
    sync(); app();
  }
  else if (t.id === 'cbr') { cbrand = t.value; app(); }
  else if (t.id === 'clg') { clg = t.value; app(); }
  else if (t.dataset.stock) run(async () => { await api(`/api/admin/products/${t.dataset.stock}/stock`, J('PATCH', { stock: t.value })); await reload(); }, 'Stock updated');
  else if (t.dataset.dfee !== undefined) run(async () => { await api('/api/admin/delivery/' + encodeURIComponent(t.dataset.dfee), J('PUT', { fee: t.value })); dlv = await api('/api/admin/delivery'); app(); }, 'Charge saved');
  else if (t.dataset.os) run(async () => { await api('/api/admin/orders/' + t.dataset.os, J('PATCH', { status: t.value })); await reload(); }, 'Order updated');
  else if (t.dataset.ms) run(async () => { await api('/api/admin/messages/' + t.dataset.ms, J('PATCH', { status: t.value })); await reload(); }, 'Message updated');
  else if (t.dataset.rs) run(async () => { await api('/api/admin/reviews/' + t.dataset.rs, J('PATCH', { status: t.value })); await reload(); }, t.value === 'approved' ? 'Review is now showing on the site' : 'Review updated');
});
root.addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, d = () => Object.fromEntries(new FormData(f));
  if (f.id === 'lf') { try { me = await api('/api/login', J('POST', d())); await load(); app(); } catch (er) { $('le').textContent = er.message; } }
  else if (f.id === 'pf') run(async () => {
    const fd = new FormData(f); fd.delete('image'); if (picked) fd.append('image', picked, picked.name); else if (edit.removeImage) fd.set('removeImage', '1');
    const out = await api(edit.id ? '/api/admin/products/' + edit.id : '/api/admin/products', { method: edit.id ? 'PUT' : 'POST', body: fd });
    const sent = String(fd.get('custom_fee') ?? '').replace(/\D/g, '');
    if (sent !== '' && String(out.custom_fee) !== String(parseInt(sent))) throw new Error('The server did not keep the customization fee. Replace server.js and extras.js with the new files, then restart the server.');
    if (edit.category === 'Jerseys' && fd.get('sleeve') && out.sleeve !== fd.get('sleeve')) throw new Error('The server did not keep the sleeve type. Stop it with Ctrl+C, run npm start again, then try once more.');
    if (edit.category === 'Combos' && fd.getAll('combo').length && out.combo === undefined) throw new Error('The server did not keep the combo items. Stop it with Ctrl+C, run npm start again, then try once more.');
    clearPick(); edit = null; await reload();
  }, 'Product saved');
  else if (f.id === 'sf') run(async () => { const v = d(); v.bo = f.bo.checked; site = await api('/api/admin/site', J('PUT', v)); app(); if (String(site.cfee) !== String(parseInt(String(v.cfee).replace(/\D/g, '')) || 0)) throw new Error('The server did not keep the customization fee. Replace server.js and extras.js with the new files, then restart the server.'); }, 'Site text saved');
  else if (f.id === 'wf') run(async () => { await api('/api/admin/password', J('POST', d())); f.reset(); }, 'Password changed');
  else if (f.id === 'uf') run(async () => { await api('/api/admin/users', J('POST', d())); await reload(); }, 'Staff member added');
  else if (f.id === 'ptf') run(async () => { await api('/api/admin/patches', J('POST', d())); await reload(); }, 'Patches added');
  else if (f.id === 'brf') run(async () => { await api('/api/admin/brands', J('POST', d())); await reload(); }, 'Brand added');
  else if (f.id === 'mdf') run(async () => { await api('/api/admin/models', J('POST', { brand_id: cbrand, names: d().names })); await reload(); }, 'Models added');
  else if (f.dataset.czdecide) run(async () => { const act = e.submitter && e.submitter.value; if (!act) throw new Error('Choose Approve or Decline'); await api('/api/admin/customizations/' + f.dataset.czdecide, J('PATCH', { status: act, note: f.note.value })); await reload(); }, 'Saved. The customer will see it in their cart')
  else if (f.dataset.paylink) run(async () => { const r = await api('/api/admin/orders/' + f.dataset.paylink + '/paylink', J('POST', { email: f.email ? f.email.value : '' })); payLinks[f.dataset.paylink] = r.url; await reload(); }, 'Payment link ready');
  else if (f.dataset.markpaid) run(async () => { await api('/api/admin/orders/' + f.dataset.markpaid + '/paid', J('PATCH', { method: f.method.value })); await reload(); }, 'Marked as paid');
  else if (f.dataset.ofee) run(async () => { await api('/api/admin/orders/' + f.dataset.ofee + '/delivery', J('PATCH', { fee: f.fee.value })); await reload(); }, 'Delivery fee saved to the order');
  else if (f.dataset.czid) run(async () => { const fields = [...f.querySelectorAll('input[name=cf]:checked')].map(i => i.value); if (!fields.length) throw new Error('Tick at least one thing customers can customize'); await api('/api/admin/categories/' + f.dataset.czid + '/custom', J('PUT', { noun: f.noun.value, fields, rule: f.querySelector('input[name=rule]:checked') ? 'any' : 'all' })); await reload(); }, 'Customization options saved');
  else if (f.id === 'ctf') run(async () => { await api('/api/admin/categories', J('POST', d())); await reload(); }, 'Product type added');
  else if (f.id === 'cff') run(async () => { const v = d(); if (!v.country) throw new Error('Select a country'); await api('/api/admin/delivery-country/' + encodeURIComponent(v.country), J('PUT', { fee: v.fee })); dlv = await api('/api/admin/delivery'); app(); }, 'Country charge saved');
  else if (f.id === 'df') run(async () => { const v = d(); dlv = await api('/api/admin/delivery', J('PUT', { free_state: v.free_state, default: v.default, intl_default: v.intl_default })); app(); }, 'Delivery charges saved');
  else if (f.id === 'lgf') run(async () => { await api('/api/admin/leagues', J('POST', d())); await reload(); }, 'League added');
  else if (f.id === 'clf') run(async () => { await api('/api/admin/clubs', J('POST', { league_id: clg, names: d().names })); await reload(); }, 'Clubs added');
  else if (f.id === 'sef') run(async () => { await api('/api/admin/seasons', J('POST', d())); await reload(); }, 'Season added');
});
function fail(msg) { root.innerHTML = `<div class="login panel"><h2 class="disp">Admin couldn’t load</h2><p>${E(msg)}</p><button class="b" onclick="location.reload()">Try again</button></div>`; }
window.addEventListener('error', e => { if (root.textContent.includes('Loading the admin')) fail('A script error stopped the page: ' + e.message); });
setInterval(() => { if (me && ['orders', 'customizations', 'messages', 'reviews'].includes(tab) && !['SELECT', 'TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) run(async () => { await load(); app(); }); }, 30000);
(async () => {
  try { me = await api('/api/me'); await load(); app(); }
  catch (e) {
    if (e instanceof TypeError) fail('The page loaded but the store server isn’t answering. Check that the service is running, then try again.');
    else if (!me) login();
    else fail(e.message);
  }
})();

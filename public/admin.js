const $ = i => document.getElementById(i), E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const money = n => '₦' + (+n || 0).toLocaleString('en-NG');
const CATS = ['Jerseys', 'Boots', 'Socks', 'Shin guards', 'Footballs', 'Accessories'], EM = { Jerseys: '👕', Boots: '👟', Socks: '🧦', 'Shin guards': '🛡️', Footballs: '⚽', Accessories: '🎒' };
const KITS = ['Home', 'Away', 'Third', 'Goalkeeper'], STS = ['New', 'Confirmed', 'Delivered', 'Cancelled'];
const DS = { Jerseys: 'S,M,L,XL,XXL', Boots: '40,41,42,43,44,45', Socks: 'Black,White', 'Shin guards': 'S,M,L', Footballs: 'Size 5', Accessories: 'One size' };
let me = null, tab = 'products', prods = [], orders = [], site = {}, users = [], msgs = [], revs = [], cat = { leagues: [], clubs: [], seasons: [] };
let edit = null, sure = null, ofl = 'All', clg = '';
const root = $('root');
const J = (m, b) => ({ method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
async function api(u, o) {
  const r = await fetch(u, o), j = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 401 && !u.endsWith('/login')) { me = null; login(); } throw new Error(j.error || 'Something went wrong'); }
  return j;
}
function toast(m) { const t = $('tg'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); }
const stat = s => s <= 0 ? 'Sold out' : s <= 5 ? `Only ${s} left` : 'In stock';
const pic = x => x.image ? `<img src="${E(x.image)}" alt="">` : `<span class="em">${EM[x.category] || '🏅'}</span>`;
const waNum = p => { p = String(p || '').replace(/\D/g, ''); return p[0] === '0' ? '234' + p.slice(1) : p; };
const when = t => new Date(t).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
const F = (l, n, v, x = '') => `<label class="fl">${l}<input name="${n}" value="${E(v)}" ${x}></label>`;
const SEL = (l, n, list, v, ph) => `<label class="fl">${l}<select name="${n}">${ph ? `<option value="">${ph}</option>` : ''}${list.map(o => `<option${o === v ? ' selected' : ''}>${E(o)}</option>`).join('')}</select></label>`;

function login(err = '') {
  root.innerHTML = `<form class="login panel" id="lf"><h2 class="disp">Staff sign in</h2><label class="fl">Username<input name="username" autocomplete="username" required></label><label class="fl">Password<input name="password" type="password" autocomplete="current-password" required></label><div class="err" id="le">${E(err)}</div><button class="b" style="width:100%">Sign in</button></form>`;
}
async function load() {
  const g = u => api('/api/admin/' + u);
  [prods, orders, site, cat, msgs, revs] = await Promise.all([g('products'), g('orders'), g('site'), g('catalog'), g('messages'), g('reviews')]);
  if (!clg && cat.leagues[0]) clg = String(cat.leagues[0].id);
  if (me.role === 'owner') users = await g('users');
}

/* ---------- products ---------- */
const autoName = x => x.category === 'Jerseys' && x.club ? [x.club, x.kit || 'Home', 'Jersey', x.season].filter(Boolean).join(' ') : null;
function sync() { if (edit.nameAuto || !edit.name) { const n = autoName(edit); if (n) { edit.name = n; edit.nameAuto = true; } } }
function pBody() {
  if (edit) {
    const x = edit, j = x.category === 'Jerseys', lg = cat.leagues.find(l => l.name === x.league), clubs = lg ? cat.clubs.filter(c => c.league_id === lg.id).map(c => c.name) : [];
    return `<form class="panel" id="pf"><h2 class="disp">${x.id ? 'Edit product' : 'Add a product'}</h2><div class="up"><div class="at" id="prev">${pic(x)}</div><div><button type="button" class="b g" data-act="pick">${x.image ? 'Change photo' : 'Upload photo'}</button><div class="mu" id="pm">JPG, PNG or WebP, up to 5 MB</div>${x.image ? '<label class="mu"><input type="checkbox" name="removeImage" value="1"> Remove current photo</label>' : ''}</div></div><input type="file" name="image" id="file" accept="image/jpeg,image/png,image/webp" hidden>
${SEL('Category', 'category', CATS, x.category)}
${j ? `${SEL('League', 'league', cat.leagues.map(l => l.name), x.league, 'Select a league')}${SEL('Club or team', 'club', clubs, x.club, lg ? 'Select a club' : 'Choose a league first')}<div class="two">${SEL('Season', 'season', cat.seasons.map(s => s.label), x.season, 'Select a season')}${SEL('Kit', 'kit', KITS, x.kit || 'Home')}</div>` : F('Brand', 'league', x.league)}
${F('Name', 'name', x.name, 'required')}<div class="mu">${j ? 'The name fills in from the club, kit and season. You can still edit it.' : ''}</div>
<div class="two">${F('Price (₦)', 'price', x.price, 'inputmode="numeric"')}${F('Quantity in stock', 'stock', x.stock, 'inputmode="numeric"')}</div>${F('Sizes (separate with commas)', 'sizes', x.sizes)}<label class="fl">Description<textarea name="description" rows="3">${E(x.description)}</textarea></label><div class="two" style="margin-top:16px"><button class="b">Save product</button><button type="button" class="b g" data-act="pcancel">Cancel</button></div></form>`;
  }
  return `<div class="panel"><button class="b" data-act="padd">Add a product</button>${prods.map(x => `<div class="ar"><div class="at">${pic(x)}</div><div><b>${E(x.name)}</b><small>${[x.category, x.league, x.season].filter(Boolean).map(E).join(' · ')} · ${money(x.price)} · ${stat(x.stock)}</small></div><input data-stock="${x.id}" value="${x.stock}" inputmode="numeric" aria-label="Stock for ${E(x.name)}"><button class="lk" data-edit="${x.id}">Edit</button><button class="lk rd" data-rm="p${x.id}">${sure === 'p' + x.id ? 'Sure?' : 'Delete'}</button></div>`).join('')}</div>`;
}

/* ---------- orders, messages, reviews ---------- */
const sel = (name, id, list, v) => `<select data-${name}="${id}" aria-label="Status">${list.map(s => `<option${s === v ? ' selected' : ''}>${s}</option>`).join('')}</select>`;
function oBody() {
  const l = orders.filter(o => ofl === 'All' || o.status === ofl);
  return `<div class="chips" style="margin-bottom:12px">${['All', ...STS].map(s => `<button class="chip" data-of="${s}" aria-pressed="${ofl === s}">${s}</button>`).join('')}</div><div class="panel">${l.length ? l.map(o => `<div class="or"><div><b>${E(o.name)}</b> · ${money(o.total)} <span class="mu">· ${E(o.ref)} · ${when(o.created_at)}</span></div><div class="mu">${o.items.map(i => `${i.qty} × ${E(i.name)} (${E(i.size)}${i.sleeve ? ', ' + E(i.sleeve) : ''})`).join('; ')}</div>${o.address ? `<div class="mu">${E(o.address)}</div>` : ''}<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${sel('os', o.id, STS, o.status)}<a class="lk" href="tel:${E(o.phone)}">Call ${E(o.phone)}</a><a class="lk" target="_blank" rel="noopener" href="https://wa.me/${waNum(o.phone)}">WhatsApp</a></div></div>`).join('') : '<p class="mu">No orders here yet.</p>'}</div>`;
}
function mBody() {
  return `<div class="panel"><h2 class="disp">Customer messages</h2>${msgs.length ? msgs.map(m => `<div class="or"><div><b>${E(m.name)}</b> <span class="mu">· ${when(m.created_at)}</span></div>${m.product ? `<div class="mu">About: ${E(m.product)}</div>` : ''}<div style="white-space:pre-wrap">${E(m.body)}</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${sel('ms', m.id, ['New', 'Done'], m.status)}<a class="lk" href="tel:${E(m.phone)}">Call ${E(m.phone)}</a><a class="lk" target="_blank" rel="noopener" href="https://wa.me/${waNum(m.phone)}">Reply on WhatsApp</a><button class="lk rd" data-rm="m${m.id}">${sure === 'm' + m.id ? 'Sure?' : 'Delete'}</button></div></div>`).join('') : '<p class="mu">No messages yet. Chats from the website chat box land here.</p>'}</div>`;
}
function rBody() {
  return `<div class="panel"><h2 class="disp">Customer reviews</h2><p class="mu">Only reviews marked Approved show on the website. Customers see the first three letters of the name and the state.</p>${revs.length ? revs.map(r => `<div class="or"><div><b>${E(r.name)}</b> · ${E(r.state)} <span class="mu">· ${when(r.created_at)}</span></div><div>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} <span class="mu">${r.rating} of 5</span></div><div>${E(r.body)}</div><div style="display:flex;gap:10px;align-items:center">${sel('rs', r.id, ['pending', 'approved', 'hidden'], r.status)}<button class="lk rd" data-rm="r${r.id}">${sure === 'r' + r.id ? 'Sure?' : 'Delete'}</button></div></div>`).join('') : '<p class="mu">No reviews yet.</p>'}</div>`;
}

/* ---------- clubs, leagues, seasons ---------- */
function cBody() {
  const rm = (k, label) => `<button class="lk rd" data-rm="${k}">${sure === k ? 'Sure?' : label}</button>`, cl = cat.clubs.filter(c => String(c.league_id) === clg);
  return `<div class="panel"><h2 class="disp">Leagues</h2><p class="mu">These appear in the League list when you add a jersey.</p>${cat.leagues.map(l => `<div class="ar" style="grid-template-columns:1fr auto"><b>${E(l.name)}</b>${rm('l' + l.id, 'Remove')}</div>`).join('')}<form id="lgf" style="margin-top:10px">${F('New league', 'name', '', 'placeholder="e.g. Saudi Pro League" required')}<button class="b" style="margin-top:12px">Add league</button></form></div>
<div class="panel"><h2 class="disp">Clubs in a league</h2><label class="fl">League<select id="clg">${cat.leagues.map(l => `<option value="${l.id}"${String(l.id) === clg ? ' selected' : ''}>${E(l.name)}</option>`).join('')}</select></label><div class="mu" style="margin:10px 0">${cl.length} clubs</div><div style="display:flex;flex-wrap:wrap;gap:6px">${cl.map(c => `<span class="chip" style="display:inline-flex;align-items:center;gap:6px">${E(c.name)} ${sure === 'c' + c.id ? '<button class="lk rd" data-rm="c' + c.id + '" aria-label="Confirm remove">Sure?</button>' : '<button class="lk rd" data-rm="c' + c.id + '" aria-label="Remove ' + E(c.name) + '">×</button>'}</span>`).join('')}</div>
<form id="clf" style="margin-top:12px"><label class="fl">Add clubs (one per line)<textarea name="names" rows="3" placeholder="Club name" required></textarea></label><button class="b" style="margin-top:12px">Add to this league</button></form></div>
<div class="panel"><h2 class="disp">Seasons</h2>${cat.seasons.map(s => `<div class="ar" style="grid-template-columns:1fr auto"><b>${E(s.label)}</b>${rm('s' + s.id, 'Remove')}</div>`).join('')}<form id="sef" style="margin-top:10px">${F('New season', 'label', '', 'placeholder="e.g. 2027/28" required')}<button class="b" style="margin-top:12px">Add season</button></form></div>`;
}

/* ---------- site text, account ---------- */
function sBody() {
  return `<form class="panel" id="sf"><h2 class="disp">Site text</h2>${F('Shop name', 'name', site.name)}${F('Homepage headline', 'h', site.h)}<label class="fl">Homepage short text<textarea name="t" rows="3">${E(site.t)}</textarea></label>${F('Button label', 'b', site.b)}${F('Announcement message', 'bn', site.bn)}<label class="fl"><input type="checkbox" name="bo"${site.bo === '1' ? ' checked' : ''}> Show the announcement bar</label>
<h2 class="disp" style="margin-top:20px">About, contact and social</h2><label class="fl">About us text<textarea name="about" rows="6">${E(site.about)}</textarea></label>${F('Location', 'location', site.location)}${F('Phone number', 'phone', site.phone, 'inputmode="tel"')}${F('Email', 'email', site.email, 'type="email"')}${F('WhatsApp number (country code, digits only)', 'wa', site.wa, 'inputmode="numeric"')}${F('Chat button greeting', 'wm', site.wm)}${F('X link', 'x', site.x, 'placeholder="https://x.com/yourname"')}${F('Instagram link', 'ig', site.ig, 'placeholder="https://instagram.com/yourname"')}${F('TikTok link', 'tt', site.tt, 'placeholder="https://tiktok.com/@yourname"')}<button class="b" style="margin-top:16px">Save changes</button></form>`;
}
function aBody() {
  let h = `<form class="panel" id="wf"><h2 class="disp">Change my password</h2><label class="fl">Current password<input type="password" name="current" autocomplete="current-password" required></label><label class="fl">New password (8+ characters)<input type="password" name="new" autocomplete="new-password" required></label><button class="b" style="margin-top:16px">Change password</button></form>`;
  if (me.role === 'owner') h += `<div class="panel"><h2 class="disp">Staff accounts</h2>${users.map(u => `<div class="ar" style="grid-template-columns:1fr auto"><div><b>${E(u.username)}</b><small>${u.role}</small></div>${u.role === 'owner' ? '' : `<button class="lk rd" data-rm="u${u.id}">${sure === 'u' + u.id ? 'Sure?' : 'Remove'}</button>`}</div>`).join('')}<form id="uf"><div class="two">${F('Username', 'username', '', 'required autocomplete="off"')}<label class="fl">Password (8+ characters)<input name="password" type="text" autocomplete="off" required></label></div><button class="b" style="margin-top:14px">Add staff member</button></form></div>`;
  return h;
}

function app() {
  const nO = orders.filter(o => o.status === 'New').length, nM = msgs.filter(m => m.status === 'New').length, nR = revs.filter(r => r.status === 'pending').length, c = n => n ? ` (${n})` : '';
  const body = { products: pBody, orders: oBody, messages: mBody, reviews: rBody, catalog: cBody, site: sBody, account: aBody }[tab]();
  root.innerHTML = `<header class="top"><div class="wrap bar"><span class="logo disp">KIT <span>ROOM</span> admin</span><span class="mu">${E(me.username)}</span><button class="b g" data-act="out">Sign out</button></div></header><div class="wrap"><div class="tabs">${[['products', 'Products'], ['orders', 'Orders' + c(nO)], ['messages', 'Messages' + c(nM)], ['reviews', 'Reviews' + c(nR)], ['catalog', 'Clubs and seasons'], ['site', 'Site text'], ['account', me.role === 'owner' ? 'Staff and account' : 'Account']].map(([k, l]) => `<button class="chip" data-tab="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}<a class="chip" href="/" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">View store</a></div>${body}</div><div class="tg" id="tg" role="status"></div>`;
}
const run = async (fn, ok) => { try { await fn(); if (ok) toast(ok); } catch (e) { toast(e.message); } };
const reload = async () => { await load(); app(); };
const DEL = { p: ['products', 'Product deleted'], m: ['messages', 'Message deleted'], r: ['reviews', 'Review deleted'], u: ['users', 'Staff member removed'], l: ['leagues', 'League and its clubs removed'], c: ['clubs', 'Club removed'], s: ['seasons', 'Season removed'] };

root.addEventListener('click', async e => {
  const b = k => e.target.closest(`[${k}]`); let x;
  if (x = b('data-act')) {
    const a = x.dataset.act;
    if (a === 'out') { await api('/api/logout', { method: 'POST' }); me = null; login(); }
    else if (a === 'padd') { edit = { name: '', category: 'Jerseys', league: '', club: '', season: cat.seasons[0]?.label || '', kit: 'Home', price: '', stock: '', sizes: DS.Jerseys, description: '', image: '', nameAuto: true }; app(); }
    else if (a === 'pcancel') { edit = null; app(); }
    else if (a === 'pick') $('file').click();
  }
  else if (x = b('data-tab')) { tab = x.dataset.tab; edit = null; sure = null; app(); }
  else if (x = b('data-of')) { ofl = x.dataset.of; app(); }
  else if (x = b('data-edit')) { edit = { ...prods.find(p => p.id === +x.dataset.edit), nameAuto: false }; tab = 'products'; app(); }
  else if (x = b('data-rm')) {
    const k = x.dataset.rm, [path, ok] = DEL[k[0]];
    if (sure === k) run(async () => { await api(`/api/admin/${path}/${k.slice(1)}`, { method: 'DELETE' }); sure = null; await reload(); }, ok); else { sure = k; app(); }
  }
});
root.addEventListener('input', e => {
  const t = e.target;
  if (t.form && t.form.id === 'pf' && t.name && t.type !== 'file' && t.type !== 'checkbox' && t.tagName !== 'SELECT') { edit[t.name] = t.value; if (t.name === 'name') edit.nameAuto = false; }
});
root.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'file' && t.files[0]) { $('prev').innerHTML = `<img src="${URL.createObjectURL(t.files[0])}" alt="">`; $('pm').textContent = t.files[0].name; }
  else if (t.form && t.form.id === 'pf' && t.tagName === 'SELECT') {
    edit[t.name] = t.value;
    if (t.name === 'league') edit.club = '';
    if (t.name === 'category') { if (!edit.sizes || Object.values(DS).includes(edit.sizes)) edit.sizes = DS[edit.category] || ''; if (edit.category !== 'Jerseys') { edit.club = ''; edit.season = ''; edit.kit = ''; } else { edit.kit = edit.kit || 'Home'; edit.season = edit.season || cat.seasons[0]?.label || ''; } }
    sync(); app();
  }
  else if (t.id === 'clg') { clg = t.value; app(); }
  else if (t.dataset.stock) run(async () => { await api(`/api/admin/products/${t.dataset.stock}/stock`, J('PATCH', { stock: t.value })); await reload(); }, 'Stock updated');
  else if (t.dataset.os) run(async () => { await api('/api/admin/orders/' + t.dataset.os, J('PATCH', { status: t.value })); await reload(); }, 'Order updated');
  else if (t.dataset.ms) run(async () => { await api('/api/admin/messages/' + t.dataset.ms, J('PATCH', { status: t.value })); await reload(); }, 'Message updated');
  else if (t.dataset.rs) run(async () => { await api('/api/admin/reviews/' + t.dataset.rs, J('PATCH', { status: t.value })); await reload(); }, t.value === 'approved' ? 'Review is now showing on the site' : 'Review updated');
});
root.addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, d = () => Object.fromEntries(new FormData(f));
  if (f.id === 'lf') { try { me = await api('/api/login', J('POST', d())); await load(); app(); } catch (er) { $('le').textContent = er.message; } }
  else if (f.id === 'pf') run(async () => {
    const fd = new FormData(f); if (!f.image.files[0]) fd.delete('image');
    await api(edit.id ? '/api/admin/products/' + edit.id : '/api/admin/products', { method: edit.id ? 'PUT' : 'POST', body: fd });
    edit = null; await reload();
  }, 'Product saved');
  else if (f.id === 'sf') run(async () => { const v = d(); v.bo = f.bo.checked; site = await api('/api/admin/site', J('PUT', v)); app(); }, 'Site text saved');
  else if (f.id === 'wf') run(async () => { await api('/api/admin/password', J('POST', d())); f.reset(); }, 'Password changed');
  else if (f.id === 'uf') run(async () => { await api('/api/admin/users', J('POST', d())); await reload(); }, 'Staff member added');
  else if (f.id === 'lgf') run(async () => { await api('/api/admin/leagues', J('POST', d())); await reload(); }, 'League added');
  else if (f.id === 'clf') run(async () => { await api('/api/admin/clubs', J('POST', { league_id: clg, names: d().names })); await reload(); }, 'Clubs added');
  else if (f.id === 'sef') run(async () => { await api('/api/admin/seasons', J('POST', d())); await reload(); }, 'Season added');
});
function fail(msg) { root.innerHTML = `<div class="login panel"><h2 class="disp">Admin couldn’t load</h2><p>${E(msg)}</p><button class="b" onclick="location.reload()">Try again</button></div>`; }
window.addEventListener('error', e => { if (root.textContent.includes('Loading the admin')) fail('A script error stopped the page: ' + e.message); });
setInterval(() => { if (me && ['orders', 'messages', 'reviews'].includes(tab) && !['SELECT', 'TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) run(async () => { await load(); app(); }); }, 30000);
(async () => {
  try { me = await api('/api/me'); await load(); app(); }
  catch (e) {
    if (e instanceof TypeError) fail('The page loaded but the store server isn’t answering. Check that the service is running, then try again.');
    else if (!me) login();
    else fail(e.message);
  }
})();

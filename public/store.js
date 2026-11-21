const $ = i => document.getElementById(i), E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const money = n => '₦' + (+n || 0).toLocaleString('en-NG');
const EM = { Jerseys: '👕', Tracksuits: '🧥', Combos: '🎁', Boots: '👟', 'Grip socks': '🧦', Hose: '🧦', Socks: '🧦', 'Shin guards': '🛡️', 'Goalkeeper gloves': '🧤', Footballs: '⚽', Accessories: '🎒' };
const ALL = 'All leagues';
const ICONS = {
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  tt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>'
};
const LABEL = { x: 'X (Twitter)', ig: 'Instagram', tt: 'TikTok' };
let D = null, cart = [], st = { cat: 'All', lg: ALL, stock: 'all', q: '', bt: '', brand: '', model: '' };
const wa = t => `https://wa.me/${String(D.site.wa).replace(/\D/g, '')}?text=${encodeURIComponent(t)}`;
const P = id => D.products.find(x => x.id === id);
const isJ = x => x.category === 'Jerseys';
const delivery = (c, s) => { const d = D.delivery || { free_state: 'Kaduna', fees: {}, country_fees: {} }; let v; if (c === 'Nigeria') { if (!s) return null; if (s === d.free_state) return 0; v = s in d.fees ? d.fees[s] : d.default; } else v = c in d.country_fees ? d.country_fees[c] : d.intl_default; return v == null ? 'tbc' : v; };
const CZ0 = { Jerseys: { fields: ['name', 'number', 'patches'], rule: 'all', noun: 'jersey' }, Tracksuits: { fields: ['name', 'number'], rule: 'all', noun: 'tracksuit' }, Combos: { fields: ['name', 'number'], rule: 'all', noun: 'combo' }, Boots: { fields: ['name', 'number'], rule: 'any', noun: 'boot' }, Footballs: { fields: ['name'], rule: 'all', noun: 'ball' }, 'Goalkeeper gloves': { fields: ['name'], rule: 'all', noun: 'gloves' } };
const PATCHES0 = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'UEFA Champions League', 'UEFA Europa League', 'AFCON', 'FIFA World Cup'];
const brandOf = x => x.brand || (x.category === 'Boots' ? x.league : '');
const cfgP = x => (D.cz && D.cz[x.category]) || CZ0[x.category] || { fields: ['name'], rule: 'all', noun: x.category.toLowerCase() };
const cfgOf = l => cfgP(P(l.id));
const fieldList = c => c.rule === 'any' ? c.fields.join(' or ') : c.fields.join(', ').replace(/, ([^,]*)$/, ' and $1');
const fee = x => x.custom_fee != null ? +x.custom_fee : (+D.site.cfee || 0);
const unit = l => P(l.id).price + (l.cz ? fee(P(l.id)) : 0);
const toast = m => { const t = $('tg'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); };
const jersey = (a, b) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M33 8 12 20 4 42l16 6 6-10v54h48V38l6 10 16-6-8-22L67 8c-3 7-9 11-17 11S36 15 33 8z" fill="${E(a)}" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/><path d="M33 8c3 7 9 11 17 11s14-4 17-11" fill="none" stroke="${E(b)}" stroke-width="4"/></svg>`;
const G = d => `<svg class="gl" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${d}</svg>`;
const GL = {
  ball: G('<circle cx="24" cy="24" r="19"/><path d="m24 15 8 6-3 9h-10l-3-9z"/><path d="M24 15V6M32 21l8-4M29 30l5 8M19 30l-5 8M16 21l-8-4"/>'),
  boot: G('<path d="M5 33V14h15l3 8 14 4c5 1 7 3 7 6v1z"/><path d="M5 33h39"/><path d="M10 33v4M18 33v4M30 33v4M39 33v4"/><path d="M12 14v8M20 18l-5 3"/>'),
  sock: G('<path d="M16 4h14v21l7 7a5.5 5.5 0 0 1-7.8 7.8L17 28a4 4 0 0 1-1-2.8z"/><path d="M16 11h14"/>'),
  glove: G('<path d="M13 44V27l-3.5-7a3 3 0 0 1 5.3-2.8L17 21V9a3 3 0 0 1 6 0v10V7a3 3 0 0 1 6 0v12V10a3 3 0 0 1 6 0v17c0 9-4 17-11 17z"/><path d="M13 37h22"/>'),
  shield: G('<path d="M24 4c6 3 11 4 16 4v15c0 10-7 18-16 21C15 41 8 33 8 23V8c5 0 10-1 16-4z"/><path d="M24 12v24"/>'),
  bag: G('<path d="M8 16h32l-3 26H11z"/><path d="M17 16v-3a7 7 0 0 1 14 0v3"/>')
};
const KIT = ['Jerseys', 'Tracksuits', 'Combos'];
const glyph = c => /ball/i.test(c) ? GL.ball : /boot/i.test(c) ? GL.boot : /sock|hose/i.test(c) ? GL.sock : /glove/i.test(c) ? GL.glove : /shin/i.test(c) ? GL.shield : GL.bag;
const pic = x => x.image ? `<img src="${E(x.image)}" alt="${E(x.name)}" loading="lazy">` : KIT.includes(x.category) ? jersey(x.a || '#0F1B2D', x.b || '#fff') : glyph(x.category);
const stat = s => s <= 0 ? ['ou', 'Sold out'] : s <= 5 ? ['lo', `Only ${s} left`] : ['ok', 'In stock'];
const badge = s => `<span class="st ${s[0]}"><i aria-hidden="true"></i>${s[1]}</span>`;
const save = () => { try { localStorage.setItem('cart2', JSON.stringify(cart)); } catch { } };
const opts = (l, ph) => (ph ? `<option value="">${ph}</option>` : '') + l.map(v => `<option>${E(v)}</option>`).join('');

/* ---------- pages ---------- */
function route() {
  const h = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0], pg = ['home', 'about', 'contact'].includes(h) ? h : 'home';
  ['home', 'about', 'contact'].forEach(p => { $('pg-' + p).hidden = p !== pg; });
  document.querySelectorAll('[data-nav]').forEach(a => a.dataset.nav === pg ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
document.querySelectorAll('[data-nav],#logo').forEach(a => a.addEventListener('click', () => setTimeout(route, 0)));

function mode() {
  let m = ''; try { m = localStorage.getItem('krMode') || ''; } catch { }
  if (!m) m = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-mode', m);
  let b = $('mode'); if (!b) { b = document.createElement('button'); b.id = 'mode'; b.type = 'button'; $('openCart').before(b); b.onclick = () => { const n = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('krMode', n); } catch { } mode(); }; }
  b.innerHTML = m === 'dark' ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'; b.setAttribute('aria-label', m === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
const LOOKS = [['matchday', 'Matchday'], ['gallery', 'Gallery'], ['terrace', 'Terrace']];
function look() {
  const k = LOOKS.map(x => x[0]), saved = k.includes(D.site.theme) ? D.site.theme : 'matchday';
  try { localStorage.setItem('krLook', saved); } catch { }
  const cur = window.KR_LOOKP || saved; document.documentElement.setAttribute('data-look', cur);
  if (window.KR_LOOKP && !$('lpick')) { const d = document.createElement('nav'); d.id = 'lpick'; d.setAttribute('aria-label', 'Preview designs'); d.innerHTML = LOOKS.map(([v, n]) => `<a href="/?look=${v}"${v === cur ? ' aria-current="page"' : ''}>${n}</a>`).join('') + '<a href="/" id="lexit">Exit</a>'; document.body.appendChild(d); $('lexit').onclick = () => { try { sessionStorage.removeItem('krLookP'); } catch { } }; }
}
function head() {
  const s = D.site; document.title = s.name; look(); mode();
  $('ban').hidden = !(s.bo === '1' && s.bn); $('ban').textContent = s.bn;
  $('logo').textContent = String(s.name || 'Kit Room').toUpperCase();
  { const d = D.delivery || { free_state: 'Kaduna' }, nm = d.free_state === 'FCT Abuja' ? d.free_state : d.free_state + ' State'; $('dnote').textContent = `Free delivery in ${nm}. Every other state and country has a delivery fee attached, which we confirm with you before dispatch.`; $('czmsg').textContent = `Your cart has customized items. We’ll agree the details and delivery with you in chat before you pay. Delivery is free in ${nm}.`; }
  $('hh').textContent = s.h; $('ht').textContent = s.t; $('hb').textContent = s.b;
  $('abt').innerHTML = String(s.about || '').split(/\n+/).filter(Boolean).map(p => `<p>${E(p)}</p>`).join('');
  $('abtLoc').textContent = $('cLoc').textContent = s.location || '';
  $('cPhone').textContent = s.phone; $('cPhone').href = 'tel:' + String(s.phone).replace(/[^\d+]/g, '');
  $('cMail').textContent = s.email; $('cMail').href = 'mailto:' + s.email;
  $('cWa').href = $('hwa').href = wa(s.wm);
  { const d = D.delivery || { free_state: 'Kaduna' }, nm = d.free_state === 'FCT Abuja' ? d.free_state : d.free_state + ' State', f = +s.cfee || 0;
    $('pfee').textContent = f ? `Printing from ${money(f)} per item.` : 'Ask us for the printing price.';
    const I = { truck: '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="6" cy="17.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="17.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/>', globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.8"/>', card: '<rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M7 15h4" stroke="currentColor" stroke-width="1.8"/>', chat: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' };
    $('trust').innerHTML = [['truck', `Free delivery in ${nm}`, 'Every other state on request'], ['globe', 'We deliver worldwide', 'Fee confirmed before dispatch'], ['card', 'Pay securely', 'Card, transfer or USSD by Paystack'], ['chat', 'Real people on WhatsApp', 'Ask about any item or size']].map(([i, t, d]) => `<li><svg viewBox="0 0 24 24" aria-hidden="true">${I[i]}</svg><span><b>${t}</b>${d}</span></li>`).join(''); }
  $('soc').innerHTML = ['x', 'ig', 'tt'].filter(k => s[k]).map(k => `<a href="${E(s[k])}" target="_blank" rel="noopener" aria-label="${LABEL[k]}">${ICONS[k]}</a>`).join('');
}
const smooth = () => matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth';
$('hb').onclick = () => $('shop').scrollIntoView({ behavior: smooth() });
$('czb').onclick = () => openChat(null, 'Hi, I would like a name and number printed. Item: ');
/* hero slideshow: rotates through the products that are in stock */
let spI = 0, spT = null;
const spSpeed = () => Math.min(600, Math.max(3, parseInt(D.site.spd, 10) || 60));
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
function spotlight() {
  const kit = p => KIT.includes(p.category), ins = D.products.filter(x => x.stock > 0);
  const list = [...ins.filter(p => p.image && kit(p)), ...ins.filter(p => p.image && !kit(p)), ...ins.filter(p => !p.image && kit(p)), ...ins.filter(p => !p.image && !kit(p))].slice(0, 12);
  if (!list.length) { $('spot').hidden = true; return; }
  $('spot').hidden = false; spI = 0;
  const slide = (x, i) => `<div class="sp-slide${i === 0 ? ' on' : ''}" aria-hidden="${i !== 0}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${list.length}"><div class="sp-pic"><span class="sp-num" aria-hidden="true">${x.stock <= 5 ? x.stock : 10}</span><span class="sp-tag">${x.stock <= 5 ? `Only ${x.stock} left` : 'In stock now'}</span>${x.image ? `<img src="${E(x.image)}" alt="${E(x.name)}"${i ? ' loading="lazy"' : ''}>` : kit(x) ? jersey(x.a || '#F1F2EE', x.b || '#0F1B2D') : glyph(x.category)}</div><div class="sp-foot"><div><h2>${E(x.name)}</h2><p>${money(x.price)}</p></div><button class="btn" data-go="${x.id}"${i ? ' tabindex="-1"' : ''}>View</button></div></div>`;
  const many = list.length > 1;
  $('spot').innerHTML = `<div class="sp-slides" aria-live="off">${list.map(slide).join('')}</div>${many ? `<div class="sp-ctl"><button class="sp-arw" data-sp="-1" aria-label="Previous product"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="sp-count"><b id="spN">1</b> / ${list.length}</span><button class="sp-arw" data-sp="1" aria-label="Next product"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="sp-bar" aria-hidden="true"><i id="spBar" style="animation-duration:${spSpeed()}s"></i></div>` : ''}`;
  if (many) spRun();
}
function spGo(n) {
  const sl = [...document.querySelectorAll('#spot .sp-slide')]; if (sl.length < 2) return;
  spI = (n + sl.length) % sl.length;
  sl.forEach((s, i) => { const on = i === spI; s.classList.toggle('on', on); s.setAttribute('aria-hidden', String(!on)); const b = s.querySelector('[data-go]'); if (b) b.tabIndex = on ? 0 : -1; });
  $('spN').textContent = spI + 1; spRun();
}
function spRun() {
  clearTimeout(spT); const bar = $('spBar'); if (!bar) return;
  bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; bar.style.animationDuration = spSpeed() + 's';
  if (reduced()) spT = setTimeout(() => spGo(spI + 1), spSpeed() * 1000);   // no progress animation: use a timer
}
$('spot').addEventListener('animationend', e => { if (e.target.id === 'spBar') spGo(spI + 1); });
$('spot').onclick = e => { const a = e.target.closest('[data-sp]'); if (a) return spGo(spI + +a.dataset.sp); const b = e.target.closest('[data-go]'); if (!b) return; st.cat = 'All'; st.q = ''; st.lg = ALL; st.stock = 'all'; $('q').value = ''; [...$('seg').children].forEach(c => c.setAttribute('aria-pressed', c.dataset.s === 'all')); filters(); grid(); const c = $('p' + b.dataset.go); if (c) { c.scrollIntoView({ behavior: smooth(), block: 'center' }); const z = $('z' + b.dataset.go); setTimeout(() => (z || c.querySelector('[data-add]') || c).focus({ preventScroll: true }), 400); } };

/* ---------- shop ---------- */
function filters() {
  const have = new Set(D.products.map(x => x.category)), order = D.categories || [], c = ['All', ...order.filter(n => have.has(n)), ...[...have].filter(n => !order.includes(n))];
  const cnt = k => k === 'All' ? D.products.length : D.products.filter(x => x.category === k).length;
  $('cats').innerHTML = c.map(k => `<button class="cat" data-cat="${E(k)}" aria-pressed="${k === st.cat}"><span class="cn">${k === 'All' ? 'Everything' : E(k)}</span><span class="cc">${cnt(k)} item${cnt(k) === 1 ? '' : 's'}</span></button>`).join('');
  const lgs = [...new Set(D.products.map(x => x.league).filter(Boolean))];
  $('lg').innerHTML = opts([ALL, ...lgs]); $('lg').value = st.lg;
  $('cstate').innerHTML = '<option value="">Select your state</option>' + D.states.map(s => `<option>${E(s)}</option>`).join('');
  $('ccountry').innerHTML = (D.countries || ['Nigeria']).map(c => `<option${c === 'Nigeria' ? ' selected' : ''}>${E(c)}</option>`).join('');
  bootsRow();
  $('cprod').innerHTML = '<option value="">General question or several items</option>' + D.products.map(x => `<option value="${x.id}">${E(x.name)}</option>`).join('');
}
function bootsRow() {
  const on = st.cat === 'Boots', bs = D.products.filter(x => x.category === 'Boots'); $('boots').hidden = !on; if (!on) return;
  const types = ['Trainers', 'Iron stud', 'Plastic studs'].filter(t => bs.some(x => x.boot_type === t));
  $('bt').innerHTML = [['', 'All types'], ...types.map(t => [t, t])].map(([v, l]) => `<button class="chip" data-bt="${E(v)}" aria-pressed="${st.bt === v}">${E(l)}</button>`).join('');
  const brands = [...new Set(bs.map(brandOf).filter(Boolean))];
  $('bf').innerHTML = '<option value="">All brands</option>' + brands.map(b => `<option${b === st.brand ? ' selected' : ''}>${E(b)}</option>`).join('');
  const models = [...new Set(bs.filter(x => !st.brand || brandOf(x) === st.brand).map(x => x.model).filter(Boolean))];
  $('mf').innerHTML = '<option value="">All models</option>' + models.map(m => `<option${m === st.model ? ' selected' : ''}>${E(m)}</option>`).join('');
}
function grid() {
  const q = st.q.toLowerCase(), i = D.products.filter(x => x.stock > 0).length;
  $('tIn').textContent = i; $('tOut').textContent = D.products.length - i;
  const l = D.products.filter(x => (st.cat === 'All' || x.category === st.cat) && (st.lg === ALL || x.league === st.lg) && (st.cat !== 'Boots' || ((!st.bt || x.boot_type === st.bt) && (!st.brand || brandOf(x) === st.brand) && (!st.model || x.model === st.model))) && (st.stock === 'all' || (st.stock === 'in') === (x.stock > 0)) && (!q || `${x.name} ${x.league} ${x.club} ${x.season} ${x.sleeve || ''} ${x.brand || ''} ${x.model || ''} ${x.category}`.toLowerCase().includes(q)));
  $('count').textContent = `${l.length} item${l.length === 1 ? '' : 's'}`;
  $('grid').innerHTML = l.length ? l.map(x => {
    const s = stat(x.stock), out = x.stock <= 0, z = x.sizes.split(',').map(v => v.trim()).filter(Boolean);
    const meta = [x.boot_type || x.category, x.category === 'Boots' ? '' : x.league, x.season, x.sleeve].filter(Boolean).map(E).join(', ');
    const controls = out ? `<a class="b g" target="_blank" rel="noopener" href="${wa(`Hi, please tell me when the ${x.name} is back in stock.`)}">Notify me on WhatsApp</a>` :
      `<div class="ctl">${z.length ? `<select id="z${x.id}" aria-label="Size for ${E(x.name)}">${opts(z)}</select>` : ''}<label class="cz"><input type="checkbox" id="cz${x.id}"><span><b>Customize</b> with ${fieldList(cfgP(x))}${fee(x) ? ' (+' + money(fee(x)) + ')' : ''}</span></label><button class="btn" data-add="${x.id}">Add to cart</button></div>`;
    return `<article class="card${out ? ' sold' : ''}" id="p${x.id}"><div class="pic">${pic(x)}${badge(s)}</div><div class="info">${brandOf(x) ? `<div class="brand">${E(brandOf(x))}</div>` : ''}<h3>${E(x.name)}</h3><div class="meta">${meta}</div>${x.description ? `<div class="desc">${E(x.description)}</div>` : ''}${x.combo ? `<div class="inc"><b>This combo includes:</b><ul>${x.combo.split(',').filter(Boolean).map(i => `<li>${E(i)}</li>`).join('')}</ul></div>` : ''}<div class="pr" id="pr${x.id}">${money(x.price)}</div>${controls}<button class="lk2" data-ask="${x.id}">Ask about this item</button></div></article>`;
  }).join('') : '<div class="empty">Nothing matches those filters. Pick another category or clear the search.</div>';
}

/* ---------- cart ---------- */
const inCart = id => cart.filter(c => c.id === id).reduce((a, c) => a + c.q, 0);
const hasCz = () => cart.some(l => l.cz);
let czReq = null; try { czReq = JSON.parse(localStorage.getItem('czreq') || 'null'); } catch { }
const saveReq = () => { try { czReq ? localStorage.setItem('czreq', JSON.stringify(czReq)) : localStorage.removeItem('czreq'); } catch { } };
const czSigNow = () => JSON.stringify(cart.filter(l => l.cz).map(l => [l.id, l.z, l.q]).sort());
// none = no request for the customized items in the cart yet; otherwise pending / approved / declined
const czState = () => !hasCz() ? 'none' : czReq && czReq.sig === czSigNow() ? czReq.status : 'none';
const czDesc = l => { if (!l.cz || !czReq || !czReq.details) return ''; const d = czReq.details[l.id + '|' + l.z]; if (!d) return ''; const p = []; if (d.n) p.push(`Name "${d.n}"`); if (d.x !== '') p.push(`Number ${d.x}`); if (d.p) p.push(`Patches: ${d.p}`); return p.length ? ' [' + p.join(', ') + ']' : ''; };
async function refreshReq(quiet) {
  if (!czReq) return;
  try {
    const r = await fetch('/api/customizations/' + encodeURIComponent(czReq.ref) + '?t=' + encodeURIComponent(czReq.token));
    if (r.status === 404) { czReq = null; saveReq(); cartUI(); return; }
    const j = await r.json(); if (!r.ok) return;
    if (j.status !== czReq.status || (j.note || '') !== (czReq.note || '')) {
      const was = czReq.status; czReq.status = j.status; czReq.note = j.note || ''; saveReq(); cartUI();
      if (!quiet && was !== j.status) toast(j.status === 'approved' ? 'Your customization was approved. You can place your order now' : j.status === 'declined' ? 'Your customization request was declined' : 'Request status updated');
    }
  } catch { }
}
function cartUI() {
  let n = 0, t = 0;
  $('items').innerHTML = cart.length ? cart.map((l, i) => { const x = P(l.id); n += l.q; t += l.q * unit(l); return `<div class="li"><div><strong>${E(x.name)}</strong><div class="mu">Size: ${E(l.z)}${x.sleeve ? ' · ' + E(x.sleeve) : ''}</div>${l.cz ? `<span class="tagz">Customized${fee(x) ? ' +' + money(fee(x)) + ' each' : ''}</span>` : ''}</div><div>${money(unit(l) * l.q)}</div><div class="q"><button data-dec="${i}" aria-label="Decrease">−</button><span>${l.q}</span><button data-inc="${i}" aria-label="Increase">+</button><button class="rm" data-rm="${i}">Remove</button></div></div>`; }).join('') : '<p class="mu" style="padding:20px 0">Your cart is empty. Add an item to start an order.</p>';
  const cz = hasCz(), zs = czState(), gate = cz && zs !== 'approved', note = czReq && czReq.note ? ' Note from us: ' + czReq.note : '';
  const msg = { none: 'Your cart has customized items. Send a customization request: we review it and approve or decline it before you can place the order.', pending: `Request ${czReq && czReq.ref} is waiting for approval. We will contact you on WhatsApp or by call, and this page updates when it is decided.`, approved: 'Approved! You can place your order now.' + note, declined: 'Your customization request was declined.' + note + ' Remove the customized items, or send a new request with different details.' }[zs];
  $('czmsg').hidden = !cz; $('czmsg').textContent = msg || ''; $('czmsg').className = 'note' + (cz && zs === 'approved' ? ' good' : cz && zs === 'declined' ? ' bad' : '');
  $('chk').hidden = gate;
  $('order').textContent = !cz || zs === 'approved' ? 'Place order' : zs === 'pending' ? 'Waiting for approval' : zs === 'declined' ? 'Send a new request' : 'Send customization request';
  const dl = delivery($('ccountry').value, $('cstate').value);
  $('sub').textContent = money(t); $('dlv').textContent = gate ? 'After approval' : dl === null ? 'Select your state' : dl === 0 ? 'Free' : dl === 'tbc' ? 'Fee applies (confirmed by us)' : money(dl); $('total').textContent = money(t + (gate || typeof dl !== 'number' ? 0 : dl));
  $('cartN').textContent = n; $('order').disabled = !cart.length || (cz && zs === 'pending'); save();
}
const drawer = o => { $('cd').classList.toggle('open', o); $('sc').classList.toggle('open', o); };
const lineText = l => `• ${l.q} × ${P(l.id).name} (${l.z}${P(l.id).sleeve ? ', ' + P(l.id).sleeve : ''})${l.cz ? ' – CUSTOMIZE' + (fee(P(l.id)) ? ' (+' + money(fee(P(l.id))) + ' each)' : '') : ''}${czDesc(l)} – ${money(unit(l) * l.q)}`;

$('openCart').onclick = () => { $('cartview').hidden = false; $('done').hidden = true; drawer(true); refreshReq(true); };
$('cview').onclick = () => { $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); $('cartview').hidden = false; $('done').hidden = true; drawer(true); refreshReq(true); };
$('closeCart').onclick = $('sc').onclick = $('doneClose').onclick = () => drawer(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('dm').hidden && $('dmno').onclick) return $('dmno').onclick(); if (e.key === 'Escape') { drawer(false); $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); } });
async function payNow(ref, btn) {
  const b = btn || $('donePay'), label = b.textContent; b.disabled = true; b.textContent = 'Opening Paystack…';
  try {
    const r = await fetch('/api/orders/' + encodeURIComponent(ref) + '/pay', { method: 'POST' }), j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Could not start the payment'); location.href = j.url;
  } catch (e) { toast(e.message); b.disabled = false; b.textContent = label; }
}
function payBanner() {
  const q = new URLSearchParams(location.search || ''), st = q.get('pay'), ref = q.get('ref') || ''; if (!st) return;
  const msg = { success: `Payment received for order ${ref}. Thank you! We will message you on WhatsApp about delivery.`, review: `We received a payment for order ${ref} but need to check the amount. We will contact you shortly.`, pending: 'We could not confirm your payment yet. If you were charged, your order will update shortly. Message us on WhatsApp if it does not.', failed: 'Your payment was not completed.' }[st];
  if (!msg) return;
  const retry = (st === 'failed' || st === 'pending') && ref; $('payb').hidden = false;
  $('payb').innerHTML = E(msg) + (retry ? ' <button class="lk2" id="payAgain">Try paying again</button>' : '');
  if (retry) $('payAgain').onclick = () => payNow(ref, $('payAgain'));
  try { history.replaceState(null, '', location.pathname + location.hash); } catch { }
}
function confirmBox(title, text, note) {
  return new Promise(res => {
    $('dmt').textContent = title; $('dmp').textContent = text; $('dmn').textContent = note; $('dm').hidden = false; $('dmgo').focus();
    const done = v => { $('dm').hidden = true; $('dmgo').onclick = $('dmno').onclick = null; res(v); };
    $('dmgo').onclick = () => done(true); $('dmno').onclick = () => done(false);
  });
}
function place() {
  const c = $('ccountry').value, ng = c === 'Nigeria', st = $('cstate').value, home = ng && st === (D.delivery || {}).free_state;
  $('cstate').hidden = !ng; $('cregion').hidden = ng; $('clm').hidden = !home; $('ccp').hidden = !(ng && st && !home);
  $('caddr').placeholder = home ? 'House address (street and house number)' : ng ? 'Address or note (optional)' : 'Full delivery address (street, city, postal code)';
  cartUI();
}
$('cstate').onchange = $('ccountry').onchange = place;
$('q').oninput = e => { st.q = e.target.value; grid(); };
$('lg').onchange = e => { st.lg = e.target.value; grid(); };
$('seg').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; st.stock = b.dataset.s; [...$('seg').children].forEach(c => c.setAttribute('aria-pressed', c === b)); grid(); };
$('cats').onclick = e => { const b = e.target.closest('[data-cat]'); if (!b) return; st.cat = b.dataset.cat; st.bt = st.brand = st.model = ''; filters(); grid(); };
$('bt').onclick = e => { const b = e.target.closest('[data-bt]'); if (!b) return; st.bt = b.dataset.bt; bootsRow(); grid(); };
$('bf').onchange = e => { st.brand = e.target.value; st.model = ''; bootsRow(); grid(); };
$('mf').onchange = e => { st.model = e.target.value; grid(); };
$('grid').onclick = e => {
  const k = e.target.closest('[data-ask]'); if (k) return openChat(+k.dataset.ask);
  const b = e.target.closest('[data-add]'); if (!b) return;
  const id = +b.dataset.add, x = P(id), z = $('z' + id), zz = z ? z.value : 'One size', cz = $('cz' + id).checked;
  if (inCart(id) >= x.stock) return toast('That’s all we have in stock');
  const l = cart.find(c => c.id === id && c.z === zz && c.cz === cz); l ? l.q++ : cart.push({ id, z: zz, cz, q: 1 }); cartUI(); toast(cz ? 'Added. We’ll confirm the print with you' : 'Added to cart'); const bg = $('openCart'); bg.classList.remove('bump'); void bg.offsetWidth; bg.classList.add('bump');
};
$('grid').onchange = e => {
  if (e.target.id && e.target.id.startsWith('cz')) { const id = +e.target.id.slice(2), x = P(id); if (x && $('pr' + id)) $('pr' + id).textContent = e.target.checked && fee(x) ? money(x.price + fee(x)) : money(x.price); }
};
$('items').onclick = e => {
  const t = e.target, g = k => t.dataset[k] != null ? +t.dataset[k] : null;
  if (g('inc') != null) { const c = cart[g('inc')]; inCart(c.id) < P(c.id).stock ? c.q++ : toast('No more in stock'); }
  else if (g('dec') != null) { if (--cart[g('dec')].q < 1) cart.splice(g('dec'), 1); }
  else if (g('rm') != null) cart.splice(g('rm'), 1);
  cartUI();
};
$('order').onclick = async () => {
  const zs = czState();
  if (hasCz() && zs !== 'approved') {
    if (zs === 'pending') return toast('Your request is waiting for approval');
    drawer(false); return openChat(null, `Hi, I’d like to customize these items:\n${cart.filter(l => l.cz).map(lineText).join('\n')}`, true);
  }
  const name = $('cname').value.trim(), phone = $('cphone').value.trim();
  const pd = phone.replace(/\D/g, '').length;
  if (!name || pd < 7 || pd > 15) return toast('Enter your name and a valid call or WhatsApp number');
  const email = $('cemail').value.trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return toast('Enter a valid email address for your receipt');
  const country = $('ccountry').value, ng = country === 'Nigeria', state = ng ? $('cstate').value : $('cregion').value.trim();
  if (!state) return toast(ng ? 'Select your state for delivery' : 'Enter your state or region');
  const home = ng && state === D.delivery.free_state, address = $('caddr').value.trim(), landmark = home ? $('clm').value.trim() : '', carpark = ng && !home ? $('ccp').value.trim() : '';
  if (home && (!address || !landmark)) return toast('Enter your house address and closest landmark');
  if (ng && !home && !carpark) return toast('Enter the nearest car park');
  if (!ng && !address) return toast('Enter your full delivery address');
  const where = ng ? (state === 'FCT Abuja' ? state : state + ' State') : state + ', ' + country;
  if (!home) {
    const fee = delivery(country, state);
    const go = await confirmBox('Delivery fee applies', `Delivery to ${where} has a delivery fee attached${typeof fee === 'number' && fee > 0 ? ' (' + money(fee) + ')' : '. We will confirm the amount with you'}. Would you like to proceed or cancel?`, `Please make sure ${phone} is a valid call or WhatsApp number. After you proceed, send us a message on WhatsApp or wait for delivery instructions on WhatsApp or by call.`);
    if (!go) return;
  }
  const b = $('order'); b.disabled = true; b.textContent = 'Saving…';
  const lines = cart.map(lineText);
  try {
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, email, country, state, address, landmark, carpark, items: cart.map(l => ({ id: l.id, size: l.z, qty: l.q, cz: !!l.cz })), customization: hasCz() && czReq ? { ref: czReq.ref, token: czReq.token } : undefined }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not place the order');
    $('doneRef').textContent = j.ref;
    $('doneMsg').textContent = home ? 'Tap below to confirm it with us on WhatsApp.' : `A delivery fee applies to ${where}${j.tbc ? ' and we will confirm the amount' : ' (' + money(j.delivery) + ')'}. Send us a message on WhatsApp now, or wait for delivery instructions on WhatsApp or by call on ${phone}.`;
    $('doneWa').textContent = home ? 'Confirm on WhatsApp' : 'Send message on WhatsApp';
    $('donePay').hidden = !j.payable; $('donePay').disabled = false; $('donePay').textContent = 'Pay now with Paystack'; $('donePay').onclick = () => payNow(j.ref);
    if (j.payable) $('doneMsg').textContent += ' You can pay now by card, bank transfer or USSD, or confirm on WhatsApp and pay later.';
    else if (j.tbc) $('doneMsg').textContent += ' Once we confirm your delivery fee we will send you a payment link.';
    $('doneWa').href = wa(`Hello, I’m ${name}. I just placed order ${j.ref} on your website:\n${lines.join('\n')}\nDelivery to ${ng ? state : state + ', ' + country}: ${j.tbc ? 'delivery fee to be confirmed' : j.delivery ? money(j.delivery) : 'Free'}\nAddress: ${address}${landmark ? ' (near ' + landmark + ')' : ''}${carpark ? '\nNearest car park: ' + carpark : ''}\nTotal: ${money(j.total)}${j.tbc ? ' (excluding delivery fee)' : ''}\nPlease confirm it’s available.`);
    if (hasCz()) { czReq = null; saveReq(); }
    cart = []; cartUI(); $('cartview').hidden = true; $('done').hidden = false;
  } catch (e) { toast(e.message); }
  cartUI();
};

/* ---------- chat box ---------- */
function czData() { const d = czLines.map(() => ({ n: '', x: '', p: '', po: '' })); document.querySelectorAll('#czf [data-cz]').forEach(i => { if (d[+i.dataset.cz]) d[+i.dataset.cz][i.dataset.k] = i.value.trim(); }); d.forEach(v => { if (v.p === '__other') v.p = v.po; }); return d; }
const patchSelect = (i, label, nm, req) => `<select data-cz="${i}" data-k="p" aria-label="${label} for ${nm}"${req ? ' required' : ''}><option value="">${label} (choose one)</option><option>None</option>${(D.patches || PATCHES0).map(p => `<option>${E(p)}</option>`).join('')}<option value="__other">Other (type it)</option></select><input data-cz="${i}" data-k="po" placeholder="Type the patch you want" aria-label="Other patch for ${nm}" maxlength="60" hidden>`;
const czText = () => chatCart && czLines.length ? '\nCustomization:\n' + czData().map((d, i) => { const x = P(czLines[i].id), p = []; if (d.n) p.push(`Name "${d.n}"`); if (d.x !== '') p.push(`Number ${d.x}`); if (d.p) p.push(`Patches: ${d.p}`); return `${i + 1}) ${x.name} (${cfgP(x).noun}): ${p.join(', ')}`; }).join('\n') : '';
function czError() {
  if (!chatCart) return '';
  const d = czData();
  for (let i = 0; i < czLines.length; i++) {
    const c = cfgOf(czLines[i]), v = d[i], got = { name: !!v.n, number: v.x !== '', patches: !!v.p }, nm = P(czLines[i].id).name;
    if (v.x !== '' && !/^\d{1,2}$/.test(v.x)) return `The number for ${nm} must be from 0 to 99`;
    if (!(c.rule === 'any' ? c.fields.some(f => got[f]) : c.fields.every(f => got[f]))) return `For ${nm}, fill in the ${fieldList(c)}${c.rule === 'any' ? ' (one is enough)' : ''}`;
  }
  return '';
}
function czFields() {
  if (!chatCart) { czLines = []; czSig = ''; $('czf').innerHTML = ''; $('czf').hidden = true; return; }
  const now = cart.filter(l => l.cz), sig = JSON.stringify(now.map(l => [l.id, l.z, l.q]));
  if (sig !== czSig) {
    czLines = now; czSig = sig;
    $('czf').innerHTML = czLines.map((l, i) => {
      const x = P(l.id), c = cfgOf(l), nm = E(x.name), nn = E(c.noun);
      const lab = { name: `Name to print on the ${nn}`, number: `Number to print on the ${nn} (0 to 99)`, patches: `Patches on the ${nn}` }, key = { name: 'n', number: 'x', patches: 'p' };
      return `<fieldset class="czs"><legend>${nm} (${E(l.z)}${x.sleeve ? ', ' + E(x.sleeve) : ''})${l.q > 1 ? ' × ' + l.q : ''}</legend>${c.fields.map(f => f === 'patches' ? patchSelect(i, lab[f], nm, c.rule === 'all') : `<input data-cz="${i}" data-k="${key[f]}" placeholder="${lab[f]}" aria-label="${lab[f]} for ${nm}"${f === 'number' ? ' inputmode="numeric" maxlength="2"' : f === 'name' ? ' maxlength="30"' : ' maxlength="60"'}${c.rule === 'all' ? ' required' : ''}>`).join('')}<span class="mu">Fill in the ${fieldList(c)}${c.rule === 'any' ? ' (one is enough)' : ''}.</span>${l.q > 1 ? '<span class="mu">Applies to all ' + l.q + ' of this item. Add it again for a different print.</span>' : ''}</fieldset>`;
    }).join('');
  }
  $('czf').hidden = false;
}
function chatLink() { const id = $('cprod').value, p = id ? P(+id) : null; $('cwa').href = wa(`Hello, I’m ${$('cn').value || 'a customer'}. ${p ? 'About: ' + p.name + '. ' : ''}${$('cmsg').value}${czText()}`); }
let chatCart = false, czLines = [], czSig = '';
function openChat(id, text, fromCart) {
  chatCart = !!fromCart; czFields();
  $('chat').hidden = false; $('fab').setAttribute('aria-expanded', 'true'); $('cf').hidden = false; $('cdone').hidden = true; $('cerr').textContent = '';
  $('cprod').value = id == null ? '' : String(id);
  if (text != null || id != null) $('cmsg').value = text != null ? text : `Hi, I have a question about the ${P(id).name}.`;
  try { const s = JSON.parse(localStorage.getItem('me') || '{}'); if (!$('cn').value) $('cn').value = s.n || ''; if (!$('cp').value) $('cp').value = s.p || ''; } catch { }
  chatLink(); $('cmsg').focus();
}
$('fab').onclick = () => { if ($('chat').hidden) openChat(null, $('cmsg').value || '', chatCart); else { $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); } };
$('chatX').onclick = () => { $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); };
['cn', 'cmsg'].forEach(i => $(i).addEventListener('input', chatLink)); $('czf').addEventListener('input', chatLink);
$('czf').addEventListener('change', e => { const t = e.target; if (t && t.dataset && t.dataset.k === 'p') document.querySelectorAll('#czf [data-cz]').forEach(o => { if (o.dataset.k === 'po' && o.dataset.cz === t.dataset.cz) o.hidden = t.value !== '__other'; }); chatLink(); }); $('cprod').addEventListener('change', chatLink);
$('cagain').onclick = () => { $('cf').hidden = false; $('cdone').hidden = true; $('cmsg').value = ''; chatLink(); };
$('cf').onsubmit = async e => {
  e.preventDefault(); $('cerr').textContent = '';
  const ce = czError(); if (ce) { $('cerr').textContent = ce; return; }
  const b = $('csend'); b.disabled = true; b.textContent = 'Sending…';
  const id = $('cprod').value, p = id ? P(+id) : null;
  try {
    const isReq = chatCart, hdr = { 'Content-Type': 'application/json' };
    if (isReq) {   // customization request: goes to the shop for approval, the cart is kept
      const d = czData(), ls = czLines.slice(), sig = czSigNow();
      const r = await fetch('/api/customizations', { method: 'POST', headers: hdr, body: JSON.stringify({ name: $('cn').value, phone: $('cp').value, message: $('cmsg').value, lines: ls.map((l, i) => ({ id: l.id, size: l.z, qty: l.q, name: d[i].n, number: d[i].x, patches: d[i].p })) }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not send your request');
      const det = {}; ls.forEach((l, i) => { det[l.id + '|' + l.z] = d[i]; });
      czReq = { ref: j.ref, token: j.token, status: 'pending', note: '', sig, details: det }; saveReq();
      $('cdoneTitle').textContent = 'Request sent'; $('cdoneMsg').textContent = `Request ${j.ref} is waiting for approval. We will approve or decline it, and you will see the answer in your cart. Then you can place your order. For a faster reply, continue on WhatsApp.`;
    } else {
      const id = $('cprod').value, p = id ? P(+id) : null;
      const r = await fetch('/api/messages', { method: 'POST', headers: hdr, body: JSON.stringify({ name: $('cn').value, phone: $('cp').value, product: p ? p.name : '', message: $('cmsg').value }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not send');
      $('cdoneTitle').textContent = 'Message sent'; $('cdoneMsg').textContent = 'We’ll get back to you soon. To chat right now, continue on WhatsApp.';
    }
    try { localStorage.setItem('me', JSON.stringify({ n: $('cn').value, p: $('cp').value })); } catch { }
    chatLink(); $('cwa2').href = $('cwa').href; $('cf').hidden = true; $('cdone').hidden = false; $('cview').hidden = !isReq;
    if (isReq) { chatCart = false; czFields(); cartUI(); toast('Customization request sent'); }
  } catch (er) { $('cerr').textContent = er.message; }
  b.disabled = false; b.textContent = 'Send message';
};

/* ---------- reviews ---------- */
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function reviews() {
  $('rv').innerHTML = D.reviews.length ? D.reviews.map(r => `<article class="rc"><div class="stars" role="img" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</div><p>${E(r.body)}</p><div class="mu"><b>${E(r.name)}</b>, ${E(r.state)}</div></article>`).join('') : '<p class="mu">No reviews yet. Bought from us? Be the first to leave one below.</p>';
  $('rstate').innerHTML = '<option value="">Select your state</option>' + D.states.map(s => `<option>${E(s)}</option>`).join('');
}
$('rf').onsubmit = async e => {
  e.preventDefault(); const m = $('rmsg'); m.className = 'msg'; m.textContent = '';
  try {
    const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData($('rf')))) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not send your review');
    $('rf').reset(); m.className = 'msg good'; m.textContent = 'Thank you! Your review will show once we approve it.';
  } catch (er) { m.className = 'msg bad'; m.textContent = er.message; }
};

fetch('/api/store').then(r => r.json()).then(d => {
  D = d;
  try { cart = (JSON.parse(localStorage.getItem('cart2')) || []).filter(l => P(l.id) && l.q > 0); } catch { cart = []; }
  head(); filters(); grid(); spotlight(); place(); reviews(); route(); payBanner(); refreshReq(true);
{ const iv = setInterval(() => { if (czReq && czReq.status === 'pending') refreshReq(); }, 20000); if (iv && iv.unref) iv.unref(); }
}).catch(() => { $('grid').innerHTML = '<div class="empty">Couldn’t load the store. Please refresh.</div>'; });

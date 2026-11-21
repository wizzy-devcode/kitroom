const $ = i => document.getElementById(i), E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const money = n => '₦' + (+n || 0).toLocaleString('en-NG');
const EM = { Boots: '👟', Socks: '🧦', 'Shin guards': '🛡️', Footballs: '⚽', Accessories: '🎒' };
const SLEEVES = ['Short sleeve', 'Long sleeve'], ALL = 'All leagues';
const ICONS = {
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  tt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>'
};
const LABEL = { x: 'X (Twitter)', ig: 'Instagram', tt: 'TikTok' };
let D = null, cart = [], st = { cat: 'All', lg: ALL, stock: 'all', q: '' };
const wa = t => `https://wa.me/${String(D.site.wa).replace(/\D/g, '')}?text=${encodeURIComponent(t)}`;
const P = id => D.products.find(x => x.id === id);
const isJ = x => x.category === 'Jerseys';
const toast = m => { const t = $('tg'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); };
const jersey = (a, b) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M33 8 12 20 4 42l16 6 6-10v54h48V38l6 10 16-6-8-22L67 8c-3 7-9 11-17 11S36 15 33 8z" fill="${E(a)}" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linejoin="round"/><path d="M33 8c3 7 9 11 17 11s14-4 17-11" fill="none" stroke="${E(b)}" stroke-width="4"/></svg>`;
const pic = x => x.image ? `<img src="${E(x.image)}" alt="${E(x.name)}" loading="lazy">` : isJ(x) ? jersey(x.a || '#16603f', x.b || '#fff') : `<span class="em">${EM[x.category] || '🏅'}</span>`;
const stat = s => s <= 0 ? ['ou', 'Sold out'] : s <= 5 ? ['lo', `Only ${s} left`] : ['ok', 'In stock'];
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

function head() {
  const s = D.site; document.title = s.name;
  $('ban').hidden = !(s.bo === '1' && s.bn); $('ban').textContent = s.bn;
  $('logo').innerHTML = E(s.name).toUpperCase().replace(/(ROOM)$/, '<span>$1</span>');
  $('hh').textContent = s.h; $('ht').textContent = s.t; $('hb').textContent = s.b;
  $('abt').innerHTML = String(s.about || '').split(/\n+/).filter(Boolean).map(p => `<p>${E(p)}</p>`).join('');
  $('abtLoc').textContent = $('cLoc').textContent = s.location || '';
  $('cPhone').textContent = s.phone; $('cPhone').href = 'tel:' + String(s.phone).replace(/[^\d+]/g, '');
  $('cMail').textContent = s.email; $('cMail').href = 'mailto:' + s.email;
  $('cWa').href = wa(s.wm);
  $('soc').innerHTML = ['x', 'ig', 'tt'].filter(k => s[k]).map(k => `<a href="${E(s[k])}" target="_blank" rel="noopener" aria-label="${LABEL[k]}">${ICONS[k]}</a>`).join('');
}
$('hb').onclick = () => $('shop').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });

/* ---------- shop ---------- */
function filters() {
  const c = ['All', ...new Set(D.products.map(x => x.category))];
  $('cats').innerHTML = c.map(k => `<button class="chip" data-cat="${E(k)}" aria-pressed="${k === st.cat}">${E(k)}</button>`).join('');
  const lgs = [...new Set(D.products.map(x => x.league).filter(Boolean))];
  $('lg').innerHTML = opts([ALL, ...lgs]); $('lg').value = st.lg;
  $('cprod').innerHTML = '<option value="">General question or several items</option>' + D.products.map(x => `<option value="${x.id}">${E(x.name)}</option>`).join('');
}
function grid() {
  const q = st.q.toLowerCase(), i = D.products.filter(x => x.stock > 0).length;
  $('tIn').textContent = i; $('tOut').textContent = D.products.length - i;
  const l = D.products.filter(x => (st.cat === 'All' || x.category === st.cat) && (st.lg === ALL || x.league === st.lg) && (st.stock === 'all' || (st.stock === 'in') === (x.stock > 0)) && (!q || `${x.name} ${x.league} ${x.club} ${x.season} ${x.category}`.toLowerCase().includes(q)));
  $('count').textContent = `${l.length} item${l.length === 1 ? '' : 's'}`;
  $('grid').innerHTML = l.length ? l.map(x => {
    const s = stat(x.stock), out = x.stock <= 0, z = x.sizes.split(',').map(v => v.trim()).filter(Boolean);
    const meta = [x.category, x.league, x.season].filter(Boolean).map(E).join(' · ');
    const controls = out ? `<a class="b g" target="_blank" rel="noopener" href="${wa(`Hi, please tell me when the ${x.name} is back in stock.`)}">Notify me on WhatsApp</a>` :
      `<div class="ctl">${z.length ? `<select id="z${x.id}" aria-label="Size">${opts(z)}</select>` : ''}${isJ(x) ? `<fieldset class="sl" id="sl${x.id}"><legend>Sleeve (required)</legend>${SLEEVES.map(v => `<label><input type="radio" name="sl${x.id}" value="${v}"> ${v}</label>`).join('')}</fieldset>` : ''}<label class="cz"><input type="checkbox" id="cz${x.id}"> Customize this item (optional)</label><button class="b" data-add="${x.id}">Add to cart</button></div>`;
    return `<article class="card${out ? ' sold' : ''}"><div class="pic">${pic(x)}<span class="bd ${s[0]}">${s[1]}</span></div><div class="info"><h3>${E(x.name)}</h3><div class="mu">${meta}</div>${x.description ? `<div class="mu">${E(x.description)}</div>` : ''}<div class="pr">${money(x.price)}</div>${controls}<button class="lk2" data-ask="${x.id}">Ask about this item</button></div></article>`;
  }).join('') : '<div class="empty">Nothing matches those filters. Try another category or clear the search.</div>';
}

/* ---------- cart ---------- */
const inCart = id => cart.filter(c => c.id === id).reduce((a, c) => a + c.q, 0);
const hasCz = () => cart.some(l => l.cz);
function cartUI() {
  let n = 0, t = 0;
  $('items').innerHTML = cart.length ? cart.map((l, i) => { const x = P(l.id); n += l.q; t += l.q * x.price; return `<div class="li"><div><strong>${E(x.name)}</strong><div class="mu">Size: ${E(l.z)}${l.sl ? ' · ' + E(l.sl) : ''}</div>${l.cz ? '<span class="tagz">Customized</span>' : ''}</div><div>${money(x.price * l.q)}</div><div class="q"><button data-dec="${i}" aria-label="Decrease">−</button><span>${l.q}</span><button data-inc="${i}" aria-label="Increase">+</button><button class="rm" data-rm="${i}">Remove</button></div></div>`; }).join('') : '<p class="mu" style="padding:20px 0">Your cart is empty. Add an item to start an order.</p>';
  const cz = hasCz(); $('czmsg').hidden = !cz; $('chk').hidden = cz;
  $('order').textContent = cz ? 'Chat to customize' : 'Place order';
  $('cartN').textContent = n; $('total').textContent = money(t); $('order').disabled = !cart.length; save();
}
const drawer = o => { $('cd').classList.toggle('open', o); $('sc').classList.toggle('open', o); };
const lineText = l => `• ${l.q} × ${P(l.id).name} (${l.z}${l.sl ? ', ' + l.sl : ''})${l.cz ? ' – CUSTOMIZE' : ''} – ${money(P(l.id).price * l.q)}`;

$('openCart').onclick = () => { $('cartview').hidden = false; $('done').hidden = true; drawer(true); };
$('closeCart').onclick = $('sc').onclick = $('doneClose').onclick = () => drawer(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { drawer(false); $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); } });
$('q').oninput = e => { st.q = e.target.value; grid(); };
$('lg').onchange = e => { st.lg = e.target.value; grid(); };
$('seg').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; st.stock = b.dataset.s; [...$('seg').children].forEach(c => c.setAttribute('aria-pressed', c === b)); grid(); };
$('cats').onclick = e => { const b = e.target.closest('[data-cat]'); if (!b) return; st.cat = b.dataset.cat; filters(); grid(); };
$('grid').onclick = e => {
  const k = e.target.closest('[data-ask]'); if (k) return openChat(+k.dataset.ask);
  const b = e.target.closest('[data-add]'); if (!b) return;
  const id = +b.dataset.add, x = P(id), z = $('z' + id), zz = z ? z.value : 'One size', cz = $('cz' + id).checked;
  let sl = '';
  if (isJ(x)) { const r = document.querySelector(`input[name="sl${id}"]:checked`); if (!r) { $('sl' + id).classList.add('err'); toast('Choose long or short sleeve first'); return; } sl = r.value; }
  if (inCart(id) >= x.stock) return toast('That’s all we have in stock');
  const l = cart.find(c => c.id === id && c.z === zz && c.sl === sl && c.cz === cz); l ? l.q++ : cart.push({ id, z: zz, sl, cz, q: 1 }); cartUI(); toast(cz ? 'Added. We’ll customize it in chat' : 'Added to cart');
};
$('grid').onchange = e => { if (e.target.name && e.target.name.startsWith('sl')) $('grid').querySelector('#' + e.target.name)?.classList.remove('err'); };
$('items').onclick = e => {
  const t = e.target, g = k => t.dataset[k] != null ? +t.dataset[k] : null;
  if (g('inc') != null) { const c = cart[g('inc')]; inCart(c.id) < P(c.id).stock ? c.q++ : toast('No more in stock'); }
  else if (g('dec') != null) { if (--cart[g('dec')].q < 1) cart.splice(g('dec'), 1); }
  else if (g('rm') != null) cart.splice(g('rm'), 1);
  cartUI();
};
$('order').onclick = async () => {
  if (hasCz()) { drawer(false); return openChat(null, `Hi, I’d like to customize these items:\n${cart.map(lineText).join('\n')}\nDetails (name, number, patches): `); }
  if (cart.some(l => isJ(P(l.id)) && !l.sl)) return toast('Choose long or short sleeve for every jersey');
  const name = $('cname').value.trim(), phone = $('cphone').value.trim();
  if (!name || phone.replace(/\D/g, '').length < 7) return toast('Add your name and phone number');
  const b = $('order'); b.disabled = true; b.textContent = 'Saving…';
  const lines = cart.map(lineText);
  try {
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, address: $('caddr').value, items: cart.map(l => ({ id: l.id, size: l.z, sleeve: l.sl, qty: l.q })) }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not place the order');
    $('doneRef').textContent = j.ref;
    $('doneWa').href = wa(`Hello, I’m ${name}. I just placed order ${j.ref} on your website:\n${lines.join('\n')}\nTotal: ${money(j.total)}\nPlease confirm it’s available.`);
    cart = []; cartUI(); $('cartview').hidden = true; $('done').hidden = false;
  } catch (e) { toast(e.message); }
  cartUI();
};

/* ---------- chat box ---------- */
function chatLink() { const id = $('cprod').value, p = id ? P(+id) : null; $('cwa').href = wa(`Hello, I’m ${$('cn').value || 'a customer'}. ${p ? 'About: ' + p.name + '. ' : ''}${$('cmsg').value}`); }
function openChat(id, text) {
  $('chat').hidden = false; $('fab').setAttribute('aria-expanded', 'true'); $('cf').hidden = false; $('cdone').hidden = true; $('cerr').textContent = '';
  $('cprod').value = id == null ? '' : String(id);
  if (text != null || id != null) $('cmsg').value = text != null ? text : `Hi, I have a question about the ${P(id).name}.`;
  try { const s = JSON.parse(localStorage.getItem('me') || '{}'); if (!$('cn').value) $('cn').value = s.n || ''; if (!$('cp').value) $('cp').value = s.p || ''; } catch { }
  chatLink(); $('cmsg').focus();
}
$('fab').onclick = () => { if ($('chat').hidden) openChat(null, $('cmsg').value || ''); else { $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); } };
$('chatX').onclick = () => { $('chat').hidden = true; $('fab').setAttribute('aria-expanded', 'false'); };
['cn', 'cmsg'].forEach(i => $(i).addEventListener('input', chatLink)); $('cprod').addEventListener('change', chatLink);
$('cagain').onclick = () => { $('cf').hidden = false; $('cdone').hidden = true; $('cmsg').value = ''; chatLink(); };
$('cf').onsubmit = async e => {
  e.preventDefault(); $('cerr').textContent = ''; const b = $('csend'); b.disabled = true; b.textContent = 'Sending…';
  const id = $('cprod').value, p = id ? P(+id) : null;
  try {
    const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: $('cn').value, phone: $('cp').value, product: p ? p.name : '', message: $('cmsg').value }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not send');
    try { localStorage.setItem('me', JSON.stringify({ n: $('cn').value, p: $('cp').value })); } catch { }
    chatLink(); $('cwa2').href = $('cwa').href; $('cf').hidden = true; $('cdone').hidden = false;
  } catch (er) { $('cerr').textContent = er.message; }
  b.disabled = false; b.textContent = 'Send message';
};

/* ---------- reviews ---------- */
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function reviews() {
  $('rv').innerHTML = D.reviews.length ? D.reviews.map(r => `<article class="rc"><div class="stars" role="img" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</div><p>${E(r.body)}</p><div class="mu"><b>${E(r.name)}</b> · ${E(r.state)}</div></article>`).join('') : '<p class="mu">No reviews yet. Bought from us? Be the first to leave one below.</p>';
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
  try { cart = (JSON.parse(localStorage.getItem('cart2')) || []).filter(l => P(l.id) && l.q > 0 && !(isJ(P(l.id)) && !l.sl)); } catch { cart = []; }
  head(); filters(); grid(); cartUI(); reviews(); route();
}).catch(() => { $('grid').innerHTML = '<div class="empty">Couldn’t load the store. Please refresh.</div>'; });

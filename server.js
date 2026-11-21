const express = require('express'), Database = require('better-sqlite3'), bcrypt = require('bcryptjs'),
  multer = require('multer'), crypto = require('crypto'), fs = require('fs'), path = require('path');

// Local testing: read settings from a .env file next to this one (Railway uses its Variables instead)
try { if (typeof process.loadEnvFile === 'function' && fs.existsSync(path.join(__dirname, '.env'))) process.loadEnvFile(path.join(__dirname, '.env')); } catch (e) { console.error('Could not read .env:', e.message); }
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), UP = path.join(DATA, 'uploads');
fs.mkdirSync(UP, { recursive: true });
const db = new Database(path.join(DATA, 'store.db'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff');
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, league TEXT DEFAULT '', price INTEGER NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0, sizes TEXT DEFAULT '', descr TEXT DEFAULT '', image TEXT DEFAULT '', color_a TEXT DEFAULT '', color_b TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, ref TEXT UNIQUE NOT NULL, name TEXT, phone TEXT, address TEXT, items TEXT NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'New', ded INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS leagues(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS clubs(id INTEGER PRIMARY KEY, league_id INTEGER NOT NULL, name TEXT NOT NULL, UNIQUE(league_id,name));
CREATE TABLE IF NOT EXISTS seasons(id INTEGER PRIMARY KEY, label TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, name TEXT, phone TEXT, product TEXT, body TEXT, status TEXT NOT NULL DEFAULT 'New', created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY, name TEXT, state TEXT, rating INTEGER NOT NULL, body TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL);`);
const have = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
['club', 'season', 'kit'].forEach(c => { if (!have.includes(c)) db.exec(`ALTER TABLE products ADD COLUMN ${c} TEXT DEFAULT ''`); });
if (!have.includes('custom_fee')) db.exec('ALTER TABLE products ADD COLUMN custom_fee INTEGER');
if (!have.includes('sleeve')) db.exec("ALTER TABLE products ADD COLUMN sleeve TEXT DEFAULT ''");
if (!have.includes('combo')) db.exec("ALTER TABLE products ADD COLUMN combo TEXT DEFAULT ''");
['brand', 'model', 'boot_type'].forEach(c => { if (!have.includes(c)) db.exec(`ALTER TABLE products ADD COLUMN ${c} TEXT DEFAULT ''`); });
const oc = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);
if (!oc.includes('state')) db.exec("ALTER TABLE orders ADD COLUMN state TEXT DEFAULT ''");
if (!oc.includes('delivery')) db.exec('ALTER TABLE orders ADD COLUMN delivery INTEGER DEFAULT 0');
if (!oc.includes('delivery_tbc')) db.exec('ALTER TABLE orders ADD COLUMN delivery_tbc INTEGER DEFAULT 0');
if (!oc.includes('delivery_sep')) db.exec('ALTER TABLE orders ADD COLUMN delivery_sep INTEGER DEFAULT 0');   // 1 = delivery fee is paid separately, never part of total
[['email', "TEXT DEFAULT ''"], ['payment_status', "TEXT DEFAULT 'unpaid'"], ['paid_at', 'INTEGER'], ['paid_amount', 'INTEGER'], ['pay_channel', "TEXT DEFAULT ''"]].forEach(([c, t]) => { if (!oc.includes(c)) db.exec(`ALTER TABLE orders ADD COLUMN ${c} ${t}`); });
['country', 'landmark', 'carpark'].forEach(c => { if (!oc.includes(c)) db.exec(`ALTER TABLE orders ADD COLUMN ${c} TEXT DEFAULT ''`); });

/* ---------- first-run seed ---------- */
const DEF = { name: 'Kit Room', h: 'Your match day kit, sorted.', t: 'Club jerseys from every major league, boots, socks, shin guards and footballs. See what’s in stock, then order and confirm on WhatsApp.', b: 'Browse the kit', bo: '1', bn: 'New season jerseys have landed.', wa: process.env.WHATSAPP_NUMBER || '2348169335893', wm: 'Hello, I have a question about your kit.', email: 'emmanueldanlami7b@gmail.com', phone: '08169335893', location: 'Kaduna State, Nigeria', about: 'Kit Room is a sports store based in Kaduna State, Nigeria. We sell club jerseys from all the major leagues (Premier League, La Liga, Serie A, Bundesliga and Ligue 1), national team shirts, football boots, socks, shin guards, footballs and other sports gear.\nAsk us to customize your jersey. Place your order on the website and we will confirm it with you on WhatsApp.', x: 'https://x.com', ig: 'https://instagram.com', tt: 'https://tiktok.com', cfee: '2000', theme: 'matchday', spd: '60' };
for (const [k, v] of Object.entries(DEF)) db.prepare('INSERT OR IGNORE INTO settings VALUES(?,?)').run(k, v);
if (!db.prepare('SELECT 1 FROM users').get()) {
  const user = process.env.ADMIN_USERNAME || 'owner';
  let pw = process.env.ADMIN_PASSWORD;
  if (!pw) { pw = crypto.randomBytes(9).toString('base64url'); console.log(`\n*** First start: owner login is "${user}" with password "${pw}". Change it in Admin > Staff. ***\n`); }
  db.prepare('INSERT INTO users(username,hash,role) VALUES(?,?,?)').run(user, bcrypt.hashSync(pw, 10), 'owner');
}
if (!db.prepare('SELECT 1 FROM products').get()) {
  const S5 = 'S,M,L,XL,XXL', B = '40,41,42,43,44,45', ins = db.prepare('INSERT INTO products(name,category,league,price,stock,sizes,color_a,color_b) VALUES(?,?,?,?,?,?,?,?)');
  [['Manchester United Home Jersey', 'Jerseys', 'Premier League', 25000, 12, S5, '#c8102e', '#ffffff'], ['Liverpool Home Jersey', 'Jerseys', 'Premier League', 25000, 4, S5, '#c8102e', '#f6eb61'], ['Manchester City Home Jersey', 'Jerseys', 'Premier League', 25000, 0, S5, '#6cabdd', '#ffffff'], ['Real Madrid Home Jersey', 'Jerseys', 'La Liga', 27000, 15, S5, '#f5f5f5', '#1c3f94'], ['Barcelona Home Jersey', 'Jerseys', 'La Liga', 27000, 2, S5, '#a50044', '#004d98'], ['Bayern Munich Home Jersey', 'Jerseys', 'Bundesliga', 26000, 8, S5, '#dc052d', '#ffffff'], ['Paris Saint-Germain Home Jersey', 'Jerseys', 'Ligue 1', 26000, 10, S5, '#004170', '#da291c'], ['Nigeria Super Eagles Jersey', 'Jerseys', 'National teams', 22000, 18, S5, '#0f8a3c', '#ffffff'], ['Mercurial Superfly Football Boots', 'Boots', 'Nike', 68000, 6, B, '', ''], ['Predator Elite Football Boots', 'Boots', 'Adidas', 72000, 0, B, '', ''], ['Match Football Socks', 'Socks', 'Multi-brand', 4500, 40, 'Black,White,Red,Blue', '', ''], ['Slip-in Shin Guards', 'Shin guards', 'Multi-brand', 7500, 22, 'S,M,L', '', ''], ['Match Football (Size 5)', 'Footballs', 'Multi-brand', 18000, 11, 'Size 5', '', '']].forEach(r => ins.run(...r));
}

/* ---------- auth (signed cookie, no extra deps) ---------- */
const SECRET = (() => { let r = db.prepare("SELECT value FROM settings WHERE key='_secret'").get(); if (!r) { r = { value: crypto.randomBytes(32).toString('hex') }; db.prepare("INSERT INTO settings VALUES('_secret',?)").run(r.value); } return r.value; })();
const sign = p => crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
const token = id => { const p = Buffer.from(JSON.stringify({ u: id, e: Date.now() + 7 * 864e5 })).toString('base64url'); return p + '.' + sign(p); };
function who(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)sid=([^;]+)/); if (!m) return null;
  const [p, s] = m[1].split('.'); if (!p || !s) return null;
  const a = Buffer.from(sign(p)), b = Buffer.from(s); if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url')); if (d.e < Date.now()) return null; return db.prepare('SELECT id,username,role FROM users WHERE id=?').get(d.u) || null; } catch { return null; }
}
const auth = (req, res, next) => { const u = who(req); if (!u) return res.status(401).json({ error: 'Please sign in' }); req.user = u; next(); };
const owner = (req, res, next) => req.user.role === 'owner' ? next() : res.status(403).json({ error: 'Owner only' });
const hits = new Map(); setInterval(() => hits.clear(), 36e5).unref();
const limit = (n, ms, tag) => (req, res, next) => { const k = tag + req.ip, now = Date.now(), a = (hits.get(k) || []).filter(t => now - t < ms); if (a.length >= n) return res.status(429).json({ error: 'Too many attempts. Try again later.' }); a.push(now); hits.set(k, a); next(); };

/* ---------- helpers ---------- */
const site = () => Object.fromEntries(db.prepare("SELECT key,value FROM settings WHERE key NOT LIKE '\\_%' ESCAPE '\\'").all().map(r => [r.key, r.value]));
const prod = r => ({ id: r.id, name: r.name, category: r.category, league: r.league, club: r.club, season: r.season, kit: r.kit, custom_fee: r.custom_fee, sleeve: r.sleeve, combo: r.combo, brand: r.brand, model: r.model, boot_type: r.boot_type, price: r.price, stock: r.stock, sizes: r.sizes, description: r.descr, image: r.image, a: r.color_a, b: r.color_b });
const str = (v, n = 200) => String(v ?? '').trim().slice(0, n), int = v => Math.max(0, parseInt(String(v).replace(/\D/g, '')) || 0);
const CATS = ['Jerseys', 'Boots', 'Socks', 'Shin guards', 'Footballs', 'Accessories'];
const upload = multer({
  storage: multer.diskStorage({ destination: UP, filename: (req, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') + ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' })[f.mimetype]) }),
  limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, f, cb) => { const okType = ['image/jpeg', 'image/png', 'image/webp'].includes(f.mimetype); if (!okType) req.badFile = true; cb(null, okType); }
});
const chkFile = (req, res, next) => req.badFile ? res.status(400).json({ error: 'The photo must be a JPG, PNG or WebP image' }) : next();
const rmImg = p => { if (p && p.startsWith('/uploads/')) fs.unlink(path.join(UP, path.basename(p)), () => { }); };

let EX, PS, CZR;
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => { res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' }); next(); });
app.use(express.json({ limit: '50kb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.get('/health', (req, res) => res.send('ok'));

/* ---------- public ---------- */
/* /api/store lives in extras.js */

app.post('/api/orders', limit(10, 36e5, 'order'), (req, res) => {
  const b = req.body || {}, name = str(b.name, 80), phone = str(b.phone, 30), address = str(b.address, 300), state = str(b.state, 60), country = str(b.country, 60), landmark = str(b.landmark, 120), carpark = str(b.carpark, 120), email = str(b.email, 120);
  const pd = phone.replace(/\D/g, '').length;
  if (!name || pd < 7 || pd > 15) return res.status(400).json({ error: 'Please add your name and a valid call or WhatsApp number' });
  const fail = m => res.status(400).json({ error: m });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Please enter a valid email address (it is used for your payment receipt)');
  if (!EX.COUNTRIES.includes(country)) return fail('Please select your country');
  const ng = country === 'Nigeria', home = ng && state === EX.info().free_state;
  if (ng && !EX.NG.includes(state)) return fail('Please select your state');
  if (!ng && !state) return fail('Please enter your state or region');
  if (home && (!address || !landmark)) return fail('Please enter your house address and closest landmark');
  if (ng && !home && !carpark) return fail('Please enter the nearest car park');
  if (!ng && !address) return fail('Please enter your full delivery address');
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 30) return res.status(400).json({ error: 'Your cart is empty' });
  const need = {}, lines = [];
  for (const it of b.items) {
    const p = db.prepare('SELECT * FROM products WHERE id=?').get(+it.id), q = parseInt(it.qty);
    if (!p || !(q > 0) || q > 50) return res.status(400).json({ error: 'An item in your cart is no longer available' });
    need[p.id] = (need[p.id] || 0) + q;
    if (need[p.id] > p.stock) return res.status(400).json({ error: `Only ${p.stock} of ${p.name} left in stock` });
    lines.push({ id: p.id, name: p.name, size: str(it.size, 20) || '-', sleeve: p.sleeve || '', qty: q, price: p.price, cz: !!it.cz });
  }
  const czl = lines.filter(l => l.cz);
  if (czl.length) {   // customized items are only allowed with an approved, unused customization request
    const chk = CZR.forOrder(b.customization, czl); if (chk.error) return fail(chk.error);
    czl.forEach((l, i) => { l.custom = chk.details[i]; l.fee = chk.fees[i]; l.price += l.fee; });
  }
  lines.forEach(l => { if (!l.cz) delete l.cz; });
  // The customer pays for the items only. Delivery (free in the free state) is arranged and charged separately after payment.
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0), dv = EX.deliveryFor(country, state), free = dv === 0, tbc = free ? 0 : 1, delivery = 0, total = subtotal;
  let ref; do { ref = 'KR' + (10000 + crypto.randomInt(90000)); } while (db.prepare('SELECT 1 FROM orders WHERE ref=?').get(ref));
  db.prepare('INSERT INTO orders(ref,name,phone,address,items,total,state,delivery,country,landmark,carpark,delivery_tbc,delivery_sep,email,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)').run(ref, name, phone, address, JSON.stringify(lines), total, state, delivery, country, landmark, carpark, tbc, email, Date.now());
  if (czl.length) CZR.markUsed(b.customization.ref, ref);
  res.json({ ref, total, subtotal, delivery, tbc: !!tbc, excluded: !free, payable: !!(PS && PS.enabled() && total > 0) });
});

/* ---------- auth routes ---------- */
app.post('/api/login', limit(10, 9e5, 'login'), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(str(req.body.username, 50));
  if (!u || !bcrypt.compareSync(String(req.body.password || ''), u.hash)) return res.status(401).json({ error: 'Wrong username or password' });
  res.set('Set-Cookie', `sid=${token(u.id)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 86400}${req.secure ? '; Secure' : ''}`);
  res.json({ username: u.username, role: u.role });
});
app.post('/api/logout', (req, res) => { res.set('Set-Cookie', 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); res.json({ ok: true }); });
app.get('/api/me', auth, (req, res) => res.json(req.user));

/* ---------- admin: products ---------- */
const A = express.Router(); A.use(auth);
A.get('/products', (req, res) => res.json(db.prepare('SELECT * FROM products ORDER BY id DESC').all().map(prod)));
const BOOT_TYPES = ['Trainers', 'Iron stud', 'Plastic studs'];
const comboOf = b => b.category !== 'Combos' ? '' : [...new Set([...[].concat(b.combo || []), ...String(b.combo_other || '').split(',')].map(v => str(v, 40)).filter(Boolean))].slice(0, 20).join(',');
function fields(b) {
  const name = str(b.name, 120); if (!name) return null;
  if (b.category === 'Boots') {   // a brand or model typed in the form is added to the dropdown lists for next time
    let bn = str(b.brand_new, 40), mn = str(b.model_new, 80);
    if (bn) { const ex = db.prepare('SELECT name FROM brands WHERE name=? COLLATE NOCASE').get(bn); if (ex) bn = ex.name; else db.prepare('INSERT INTO brands(name) VALUES(?)').run(bn); b = { ...b, brand: bn }; }
    if (mn && b.brand) { const br = db.prepare('SELECT id FROM brands WHERE name=?').get(str(b.brand, 40)); if (br) { const ex = db.prepare('SELECT name FROM models WHERE brand_id=? AND name=? COLLATE NOCASE').get(br.id, mn); if (ex) mn = ex.name; else db.prepare('INSERT INTO models(brand_id,name) VALUES(?,?)').run(br.id, mn); b = { ...b, model: mn }; } }
  }
  const f = { name, category: EX.catNames().includes(b.category) ? b.category : 'Accessories', league: str(b.league, 60), club: str(b.club, 60), season: str(b.season, 20), kit: str(b.kit, 20), brand: 'brand' in b ? str(b.brand, 60) : undefined, model: 'model' in b ? str(b.model, 80) : undefined, boot_type: 'boot_type' in b ? (BOOT_TYPES.includes(b.boot_type) ? b.boot_type : '') : undefined, combo: 'combo_set' in b ? comboOf(b) : undefined, sleeve: 'sleeve' in b ? (['Short sleeve', 'Long sleeve'].includes(b.sleeve) ? b.sleeve : '') : undefined, cfee: !('custom_fee' in b) ? undefined : String(b.custom_fee ?? '').trim() === '' ? null : int(b.custom_fee), price: int(b.price), stock: int(b.stock), sizes: str(b.sizes, 300), descr: str(b.description, 400), a: /^#[0-9a-f]{6}$/i.test(b.a) ? b.a : '', b: /^#[0-9a-f]{6}$/i.test(b.b) ? b.b : '' };
  if (f.category !== 'Boots') { f.brand = ''; f.model = ''; f.boot_type = ''; } else if (f.brand) f.league = f.brand;
  return f;
}
A.post('/products', upload.single('image'), chkFile, (req, res) => {
  const f = fields(req.body); if (!f) return res.status(400).json({ error: 'Add a product name' });
  const r = db.prepare('INSERT INTO products(name,category,league,club,season,kit,price,stock,sizes,descr,image,color_a,color_b,custom_fee,sleeve,combo,brand,model,boot_type) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(f.name, f.category, f.league, f.club, f.season, f.kit, f.price, f.stock, f.sizes, f.descr, req.file ? '/uploads/' + req.file.filename : '', f.a, f.b, f.cfee === undefined ? null : f.cfee, f.sleeve === undefined ? '' : f.sleeve, f.combo === undefined ? '' : f.combo, f.brand ?? '', f.model ?? '', f.boot_type ?? '');
  res.json(prod(db.prepare('SELECT * FROM products WHERE id=?').get(r.lastInsertRowid)));
});
A.put('/products/:id', upload.single('image'), chkFile, (req, res) => {
  const old = db.prepare('SELECT * FROM products WHERE id=?').get(+req.params.id), f = fields(req.body);
  if (!old) return res.status(404).json({ error: 'Not found' }); if (!f) return res.status(400).json({ error: 'Add a product name' });
  let img = old.image; if (req.file) { rmImg(old.image); img = '/uploads/' + req.file.filename; } else if (req.body.removeImage === '1') { rmImg(old.image); img = ''; }
  db.prepare('UPDATE products SET name=?,category=?,league=?,club=?,season=?,kit=?,price=?,stock=?,sizes=?,descr=?,image=?,color_a=?,color_b=?,custom_fee=?,sleeve=?,combo=?,brand=?,model=?,boot_type=? WHERE id=?').run(f.name, f.category, f.league, f.club, f.season, f.kit, f.price, f.stock, f.sizes, f.descr, img, f.a || old.color_a, f.b || old.color_b, f.cfee === undefined ? old.custom_fee : f.cfee, f.sleeve === undefined ? old.sleeve : f.sleeve, f.combo === undefined ? old.combo : f.combo, f.brand ?? old.brand, f.model ?? old.model, f.boot_type ?? old.boot_type, old.id);
  res.json(prod(db.prepare('SELECT * FROM products WHERE id=?').get(old.id)));
});
A.patch('/products/:id/stock', (req, res) => { db.prepare('UPDATE products SET stock=? WHERE id=?').run(int(req.body.stock), +req.params.id); res.json({ ok: true }); });
A.delete('/products/:id', (req, res) => { const p = db.prepare('SELECT image FROM products WHERE id=?').get(+req.params.id); if (p) rmImg(p.image); db.prepare('DELETE FROM products WHERE id=?').run(+req.params.id); res.json({ ok: true }); });

/* ---------- admin: orders ---------- */
const STS = ['New', 'Confirmed', 'Delivered', 'Cancelled'];
const applyStatus = (o, s) => db.transaction(() => {
  let ded = o.ded; const items = JSON.parse(o.items);
  if ((s === 'Confirmed' || s === 'Delivered') && !ded) { items.forEach(i => db.prepare('UPDATE products SET stock=MAX(0,stock-?) WHERE id=?').run(i.qty, i.id)); ded = 1; }
  else if (s === 'Cancelled' && ded) { items.forEach(i => db.prepare('UPDATE products SET stock=stock+? WHERE id=?').run(i.qty, i.id)); ded = 0; }
  db.prepare('UPDATE orders SET status=?,ded=? WHERE id=?').run(s, ded, o.id);
})();
A.get('/orders', (req, res) => res.json(db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 500').all().map(o => ({ ...o, items: JSON.parse(o.items) }))));
A.patch('/orders/:id/delivery', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id=?').get(+req.params.id); if (!o) return res.status(404).json({ error: 'Order not found' });
  if (String(req.body.fee ?? '').trim() === '') return res.status(400).json({ error: 'Enter the delivery fee (0 for free)' });
  const fee = int(req.body.fee), sub = JSON.parse(o.items).reduce((t, i) => t + i.qty * i.price, 0);
  if (o.delivery_sep) db.prepare('UPDATE orders SET delivery=?, delivery_tbc=0 WHERE id=?').run(fee, o.id);   // new orders: record the agreed fee, the paid total stays items only
  else if (o.payment_status === 'paid') return res.status(400).json({ error: 'This older order is already paid. Agree the delivery fee with the customer directly.' });
  else db.prepare('UPDATE orders SET delivery=?, delivery_tbc=0, total=? WHERE id=?').run(fee, sub + fee, o.id);
  res.json({ ok: true });
});
A.patch('/orders/:id', (req, res) => {
  const s = req.body.status, o = db.prepare('SELECT * FROM orders WHERE id=?').get(+req.params.id);
  if (!o || !STS.includes(s)) return res.status(400).json({ error: 'Bad request' });
  applyStatus(o, s);
  res.json({ ok: true });
});

/* ---------- admin: site text, staff ---------- */
A.get('/site', (req, res) => res.json(site()));
A.put('/site', (req, res) => {
  for (const k of Object.keys(DEF)) if (k in req.body) db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run(k, k === 'theme' ? (['matchday', 'gallery', 'terrace'].includes(req.body[k]) ? req.body[k] : 'matchday') : k === 'bo' ? (req.body[k] ? '1' : '0') : k === 'cfee' ? String(int(req.body[k])) : k === 'wa' ? str(req.body[k], 20).replace(/\D/g, '') : ['x', 'ig', 'tt'].includes(k) ? (/^https?:\/\//i.test(str(req.body[k], 200)) ? str(req.body[k], 200) : '') : str(req.body[k], k === 'about' ? 1500 : 400));
  res.json(site());
});
A.get('/users', owner, (req, res) => res.json(db.prepare('SELECT id,username,role FROM users ORDER BY id').all()));
A.post('/users', owner, (req, res) => {
  const u = str(req.body.username, 40), p = String(req.body.password || '');
  if (!/^[\w.-]{3,40}$/.test(u) || p.length < 8) return res.status(400).json({ error: 'Username needs 3+ letters or numbers and password 8+ characters' });
  try { db.prepare('INSERT INTO users(username,hash,role) VALUES(?,?,?)').run(u, bcrypt.hashSync(p, 10), 'staff'); res.json({ ok: true }); } catch { res.status(400).json({ error: 'That username is taken' }); }
});
A.delete('/users/:id', owner, (req, res) => { if (+req.params.id === req.user.id) return res.status(400).json({ error: 'You can’t delete yourself' }); db.prepare('DELETE FROM users WHERE id=?').run(+req.params.id); res.json({ ok: true }); });
A.post('/password', limit(10, 9e5, 'pw'), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id), n = String(req.body.new || '');
  if (!bcrypt.compareSync(String(req.body.current || ''), u.hash)) return res.status(400).json({ error: 'Current password is wrong' });
  if (n.length < 8) return res.status(400).json({ error: 'New password needs 8+ characters' });
  db.prepare('UPDATE users SET hash=? WHERE id=?').run(bcrypt.hashSync(n, 10), u.id); res.json({ ok: true });
});
EX = require('./extras')({ app, db, A, limit, str, int, site, prod });
CZR = require('./customize')({ app, db, A, limit, str, EX });
PS = require('./paystack')({ app, db, A, limit, str, applyStatus });
app.get('/api/paystatus', (req, res) => res.json({ on: !!(PS && PS.enabled()) }));   // lets the shop say "Proceed to payment"
app.use('/api/admin', A);

/* ---------- static ---------- */
app.use('/uploads', express.static(UP, { maxAge: '30d', fallthrough: false }));
app.get(['/admin', '/admin/'], (req, res) => { res.set('Cache-Control', 'no-store'); res.sendFile(path.join(__dirname, 'public', 'admin.html')); });
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => { if (req.path.startsWith('/api')) return res.status(err.code === 'LIMIT_FILE_SIZE' ? 400 : 500).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Photo is over 5 MB' : 'Server error' }); res.status(err.status || 500).send('Not found'); });
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Kit Room running'));

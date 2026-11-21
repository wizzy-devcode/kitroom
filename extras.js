// Clubs/seasons catalog, customer messages, reviews, and the public store feed.
const NG = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
const COUNTRIES = 'Afghanistan,Albania,Algeria,Andorra,Angola,Antigua and Barbuda,Argentina,Armenia,Australia,Austria,Azerbaijan,Bahamas,Bahrain,Bangladesh,Barbados,Belarus,Belgium,Belize,Benin,Bhutan,Bolivia,Bosnia and Herzegovina,Botswana,Brazil,Brunei,Bulgaria,Burkina Faso,Burundi,Cabo Verde,Cambodia,Cameroon,Canada,Central African Republic,Chad,Chile,China,Colombia,Comoros,Congo,Costa Rica,Côte d’Ivoire,Croatia,Cuba,Cyprus,Czechia,DR Congo,Denmark,Djibouti,Dominica,Dominican Republic,Ecuador,Egypt,El Salvador,Equatorial Guinea,Eritrea,Estonia,Eswatini,Ethiopia,Fiji,Finland,France,Gabon,Gambia,Georgia,Germany,Ghana,Greece,Grenada,Guatemala,Guinea,Guinea-Bissau,Guyana,Haiti,Honduras,Hungary,Iceland,India,Indonesia,Iran,Iraq,Ireland,Israel,Italy,Jamaica,Japan,Jordan,Kazakhstan,Kenya,Kiribati,Kosovo,Kuwait,Kyrgyzstan,Laos,Latvia,Lebanon,Lesotho,Liberia,Libya,Liechtenstein,Lithuania,Luxembourg,Madagascar,Malawi,Malaysia,Maldives,Mali,Malta,Marshall Islands,Mauritania,Mauritius,Mexico,Micronesia,Moldova,Monaco,Mongolia,Montenegro,Morocco,Mozambique,Myanmar,Namibia,Nauru,Nepal,Netherlands,New Zealand,Nicaragua,Niger,Nigeria,North Korea,North Macedonia,Norway,Oman,Pakistan,Palau,Palestine,Panama,Papua New Guinea,Paraguay,Peru,Philippines,Poland,Portugal,Qatar,Romania,Russia,Rwanda,Saint Kitts and Nevis,Saint Lucia,Saint Vincent and the Grenadines,Samoa,San Marino,São Tomé and Príncipe,Saudi Arabia,Senegal,Serbia,Seychelles,Sierra Leone,Singapore,Slovakia,Slovenia,Solomon Islands,Somalia,South Africa,South Korea,South Sudan,Spain,Sri Lanka,Sudan,Suriname,Sweden,Switzerland,Syria,Taiwan,Tajikistan,Tanzania,Thailand,Timor-Leste,Togo,Tonga,Trinidad and Tobago,Tunisia,Türkiye,Turkmenistan,Tuvalu,Uganda,Ukraine,United Arab Emirates,United Kingdom,United States,Uruguay,Uzbekistan,Vanuatu,Vatican City,Venezuela,Vietnam,Yemen,Zambia,Zimbabwe'.split(',');
// what customers can customize per product type: [fields, rule ('all' = every field, 'any' = one is enough), noun]
const CZ = {
  Jerseys: ['name,number,patches', 'all', 'jersey'], Tracksuits: ['name,number', 'all', 'tracksuit'], Combos: ['name,number', 'all', 'combo'],
  Boots: ['name,number', 'any', 'boot'], 'Grip socks': ['name', 'all', 'grip socks'], Hose: ['name', 'all', 'hose'], Socks: ['name', 'all', 'socks'],
  'Shin guards': ['name', 'all', 'shin guards'], 'Goalkeeper gloves': ['name', 'all', 'gloves'], Footballs: ['name', 'all', 'ball'], Accessories: ['name', 'all', 'item']
};
const BOOTS = {
  Nike: 'Mercurial Superfly,Mercurial Vapor,Mercurial Dream Speed,Phantom GX,Phantom GT,Phantom Luna,Phantom Venom,Tiempo Legend,Tiempo Emerging,Premier,Streetgato',
  Adidas: 'Predator Elite,Predator League,Predator Accuracy,Predator Freak,F50 Elite,F50 League,F50 Pro,Copa Pure,Copa Sense,X Crazyfast,X Speedportal,Nemeziz,Goletto,Deportivo',
  Puma: 'Future Ultimate,Future Pro,Future Match,Future Play,King Ultimate,King Pro,King Match,Ultra Ultimate,Ultra Pro,Ultra Match,Ultra Play,Attacanto',
  'New Balance': 'Tekela Magia,Tekela Pro,Tekela V4,Furon Pro,Furon Dispatch,Furon V7,442 Pro,442 Team',
  Mizuno: 'Morelia Neo,Morelia II,Morelia Sala,Alpha,Rebula Cup,Monarcida Neo',
  Umbro: 'Speciali,Velocita,Tocco,Medusae,Sala',
  Asics: 'DS Light,Ultrezza,Menace',
  'Under Armour': 'Magnetico,Clone Magnetico,Shadow,Spotlight',
  Joma: 'Aguila,Propulsion,Dribling,Maxima,Champion',
  Lotto: 'Solista,Stadio,Maestro,Fuerza',
  Diadora: 'Brasil,Pichichi',
  Kipsta: 'Agility,Viralto'
};
const PATCHES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'UEFA Champions League', 'UEFA Europa League', 'UEFA Conference League', 'FA Cup', 'AFCON', 'FIFA World Cup', 'Nigeria Premier Football League'];
const SEED = {
  'Premier League': 'Arsenal,Aston Villa,AFC Bournemouth,Brentford,Brighton & Hove Albion,Burnley,Chelsea,Crystal Palace,Everton,Fulham,Leeds United,Liverpool,Manchester City,Manchester United,Newcastle United,Nottingham Forest,Sunderland,Tottenham Hotspur,West Ham United,Wolverhampton Wanderers',
  'La Liga': 'Alavés,Athletic Club,Atlético Madrid,Barcelona,Celta Vigo,Elche,Espanyol,Getafe,Girona,Levante,Mallorca,Osasuna,Rayo Vallecano,Real Betis,Real Madrid,Real Oviedo,Real Sociedad,Sevilla,Valencia,Villarreal',
  'Serie A': 'Atalanta,Bologna,Cagliari,Como,Cremonese,Fiorentina,Genoa,Hellas Verona,Inter Milan,Juventus,Lazio,Lecce,AC Milan,Napoli,Parma,Pisa,Roma,Sassuolo,Torino,Udinese',
  'Bundesliga': 'FC Augsburg,Union Berlin,Bayer Leverkusen,Bayern Munich,Borussia Dortmund,Borussia Mönchengladbach,Eintracht Frankfurt,SC Freiburg,Hamburger SV,Heidenheim,Hoffenheim,FC Köln,Mainz 05,RB Leipzig,FC St. Pauli,VfB Stuttgart,Werder Bremen,VfL Wolfsburg',
  'Ligue 1': 'Angers,Auxerre,Brest,Le Havre,Lens,Lille,Lorient,Lyon,Marseille,Metz,Monaco,Nantes,Nice,Paris FC,Paris Saint-Germain,Rennes,Strasbourg,Toulouse',
  'National teams': 'Nigeria (Super Eagles),Argentina,Brazil,France,England,Germany,Spain,Portugal,Netherlands,Italy,Belgium,Morocco,Senegal,Ghana,Cameroon,Côte d’Ivoire,Egypt,Algeria,South Africa,USA,Mexico,Japan'
};
const mask = n => { const w = String(n).trim().split(/\s+/)[0] || ''; const k = Math.min(3, Math.max(1, w.length - 1)); return w.slice(0, k) + '*'.repeat(Math.max(1, w.length - k)); };

module.exports = ({ app, db, A, limit, str, int, site, prod }) => {
  if (!db.prepare('SELECT 1 FROM leagues').get()) db.transaction(() => {
    const il = db.prepare('INSERT INTO leagues(name) VALUES(?)'), ic = db.prepare('INSERT OR IGNORE INTO clubs(league_id,name) VALUES(?,?)');
    for (const [l, cs] of Object.entries(SEED)) { const id = il.run(l).lastInsertRowid; cs.split(',').forEach(c => ic.run(id, c.trim())); }
  })();
  if (!db.prepare('SELECT 1 FROM seasons').get()) ['2026/27', '2025/26', '2024/25'].forEach(s => db.prepare('INSERT INTO seasons(label) VALUES(?)').run(s));

  /* ---- delivery charges ---- */
  db.exec('CREATE TABLE IF NOT EXISTS delivery_fees(state TEXT PRIMARY KEY, fee INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS country_fees(country TEXT PRIMARY KEY, fee INTEGER NOT NULL);');
  const setting = (k, d) => { const r = db.prepare('SELECT value FROM settings WHERE key=?').get(k); return r ? r.value : d; };
  [['free_state', 'Kaduna'], ['delivery_default', ''], ['intl_default', '']].forEach(([k, v]) => db.prepare('INSERT OR IGNORE INTO settings VALUES(?,?)').run(k, v));
  // one-time: clear the placeholder charges so delivery fees start empty
  if (setting('delivery_reset_v2', '') === '') { ['delivery_default', 'intl_default'].forEach(k => db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run(k, '')); db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run('delivery_reset_v2', '1'); }
  const num = v => v === '' || v == null ? null : (+v || 0);
  const info = () => ({
    free_state: setting('free_state', 'Kaduna'), default: num(setting('delivery_default', '')), intl_default: num(setting('intl_default', '')),
    fees: Object.fromEntries(db.prepare('SELECT state,fee FROM delivery_fees').all().map(r => [r.state, r.fee])),
    country_fees: Object.fromEntries(db.prepare('SELECT country,fee FROM country_fees').all().map(r => [r.country, r.fee]))
  });
  const deliveryFor = (country, st) => { const d = info(); if (country === 'Nigeria') return st === d.free_state ? 0 : (st in d.fees ? d.fees[st] : d.default); return country in d.country_fees ? d.country_fees[country] : d.intl_default; };

  /* ---- product types (sections of the shop) ---- */
  db.exec('CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, sort INTEGER NOT NULL DEFAULT 0)');
  const cc = db.prepare('PRAGMA table_info(categories)').all().map(c => c.name);
  if (!cc.includes('custom_fields')) db.exec("ALTER TABLE categories ADD COLUMN custom_fields TEXT DEFAULT 'name'");
  if (!cc.includes('custom_rule')) db.exec("ALTER TABLE categories ADD COLUMN custom_rule TEXT DEFAULT 'all'");
  if (!cc.includes('noun')) db.exec("ALTER TABLE categories ADD COLUMN noun TEXT DEFAULT ''");
  if (!db.prepare('SELECT 1 FROM categories').get()) ['Jerseys', 'Tracksuits', 'Combos', 'Boots', 'Grip socks', 'Hose', 'Socks', 'Shin guards', 'Goalkeeper gloves', 'Footballs', 'Accessories'].forEach((n, i) => db.prepare('INSERT INTO categories(name,sort) VALUES(?,?)').run(n, i));
  db.prepare('SELECT DISTINCT category FROM products').all().forEach(r => db.prepare('INSERT OR IGNORE INTO categories(name,sort) VALUES(?,99)').run(r.category));
  // one-time: add the Goalkeeper gloves section to shops that were set up before it existed (sits after Shin guards)
  if (setting('cats_seed_v2', '') === '') { db.prepare('INSERT OR IGNORE INTO categories(name,sort) VALUES(?,?)').run('Goalkeeper gloves', 7.5); db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run('cats_seed_v2', '1'); }
  Object.entries(CZ).forEach(([n, [f, r, w]]) => db.prepare("UPDATE categories SET custom_fields=?, custom_rule=?, noun=? WHERE name=? AND noun=''").run(f, r, w, n));
  const czMap = () => Object.fromEntries(db.prepare('SELECT * FROM categories').all().map(c => [c.name, { fields: String(c.custom_fields || 'name').split(',').filter(Boolean), rule: c.custom_rule === 'any' ? 'any' : 'all', noun: c.noun || c.name.toLowerCase() }]));
  const catNames = () => db.prepare('SELECT name FROM categories ORDER BY sort,id').all().map(r => r.name);

  /* ---- boot brands and models ---- */
  db.exec('CREATE TABLE IF NOT EXISTS brands(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL); CREATE TABLE IF NOT EXISTS models(id INTEGER PRIMARY KEY, brand_id INTEGER NOT NULL, name TEXT NOT NULL, UNIQUE(brand_id,name));');
  // adds any missing seed brands/models once, without touching what you already added or removed afterwards
  if (setting('boots_seed_v2', '') === '') db.transaction(() => {
    const ib = db.prepare('INSERT OR IGNORE INTO brands(name) VALUES(?)'), gb = db.prepare('SELECT id FROM brands WHERE name=?'), im = db.prepare('INSERT OR IGNORE INTO models(brand_id,name) VALUES(?,?)');
    for (const [b, ms] of Object.entries(BOOTS)) { ib.run(b); const id = gb.get(b).id; ms.split(',').forEach(m => im.run(id, m.trim())); }
    db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run('boots_seed_v2', '1');
  })();

  /* ---- patch options (the dropdown in the customize form) ---- */
  db.exec('CREATE TABLE IF NOT EXISTS patches(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, sort INTEGER NOT NULL DEFAULT 0)');
  if (setting('patches_seed_v1', '') === '') db.transaction(() => { PATCHES.forEach((n, i) => db.prepare('INSERT OR IGNORE INTO patches(name,sort) VALUES(?,?)').run(n, i)); db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run('patches_seed_v1', '1'); })();
  const patchNames = () => db.prepare('SELECT name FROM patches ORDER BY sort,id').all().map(r => r.name);

  /* ---- public ---- */
  app.get('/api/store', (req, res) => res.json({
    site: site(), states: NG, countries: COUNTRIES, categories: catNames(), cz: czMap(), patches: patchNames(), delivery: info(),
    products: db.prepare('SELECT * FROM products ORDER BY id').all().map(prod),
    reviews: db.prepare("SELECT name,state,rating,body,created_at FROM reviews WHERE status='approved' ORDER BY id DESC LIMIT 12").all().map(r => ({ ...r, name: mask(r.name) }))
  }));
  app.post('/api/messages', limit(10, 36e5, 'msg'), (req, res) => {
    const b = req.body || {}, name = str(b.name, 80), phone = str(b.phone, 30), body = str(b.message, 1500);
    if (!name || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15 || !body) return res.status(400).json({ error: 'Please add your name, phone number and message' });
    db.prepare('INSERT INTO messages(name,phone,product,body,created_at) VALUES(?,?,?,?,?)').run(name, phone, str(b.product, 160), body, Date.now());
    res.json({ ok: true });
  });
  app.post('/api/reviews', limit(5, 36e5, 'rev'), (req, res) => {
    const b = req.body || {}, name = str(b.name, 40), rating = parseInt(b.rating), body = str(b.body, 400);
    if (name.length < 2 || !NG.includes(b.state) || !(rating >= 1 && rating <= 5) || body.length < 5) return res.status(400).json({ error: 'Please add your name, state, a star rating and a short review' });
    db.prepare('INSERT INTO reviews(name,state,rating,body,created_at) VALUES(?,?,?,?,?)').run(name, b.state, rating, body, Date.now());
    res.json({ ok: true });
  });

  /* ---- admin: clubs, leagues, seasons ---- */
  const bad = (res, m) => res.status(400).json({ error: m });
  A.get('/catalog', (req, res) => res.json({ leagues: db.prepare('SELECT * FROM leagues ORDER BY id').all(), clubs: db.prepare('SELECT * FROM clubs ORDER BY name').all(), seasons: db.prepare('SELECT * FROM seasons ORDER BY label DESC').all(), categories: db.prepare('SELECT * FROM categories ORDER BY sort,id').all(), brands: db.prepare('SELECT * FROM brands ORDER BY name').all(), patches: db.prepare('SELECT * FROM patches ORDER BY sort,id').all(), models: db.prepare('SELECT * FROM models ORDER BY name').all() }));
  A.post('/leagues', (req, res) => { const n = str(req.body.name, 60); if (!n) return bad(res, 'Add a league name'); try { db.prepare('INSERT INTO leagues(name) VALUES(?)').run(n); res.json({ ok: true }); } catch { bad(res, 'That league already exists'); } });
  A.delete('/leagues/:id', (req, res) => { db.transaction(() => { db.prepare('DELETE FROM clubs WHERE league_id=?').run(+req.params.id); db.prepare('DELETE FROM leagues WHERE id=?').run(+req.params.id); })(); res.json({ ok: true }); });
  A.post('/clubs', (req, res) => {
    const lg = db.prepare('SELECT id FROM leagues WHERE id=?').get(+req.body.league_id), names = String(req.body.names || '').split(/[\n;]/).map(s => str(s, 60)).filter(Boolean).slice(0, 80);
    if (!lg || !names.length) return bad(res, 'Choose a league and add at least one club');
    const ins = db.prepare('INSERT OR IGNORE INTO clubs(league_id,name) VALUES(?,?)'); db.transaction(() => names.forEach(n => ins.run(lg.id, n)))(); res.json({ ok: true });
  });
  A.delete('/clubs/:id', (req, res) => { db.prepare('DELETE FROM clubs WHERE id=?').run(+req.params.id); res.json({ ok: true }); });
  A.post('/seasons', (req, res) => { const l = str(req.body.label, 20); if (!l) return bad(res, 'Add a season like 2026/27'); try { db.prepare('INSERT INTO seasons(label) VALUES(?)').run(l); res.json({ ok: true }); } catch { bad(res, 'That season already exists'); } });
  A.delete('/seasons/:id', (req, res) => { db.prepare('DELETE FROM seasons WHERE id=?').run(+req.params.id); res.json({ ok: true }); });

  /* ---- admin: customer messages and reviews ---- */
  A.get('/messages', (req, res) => res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 300').all()));
  A.patch('/messages/:id', (req, res) => { if (!['New', 'Done'].includes(req.body.status)) return bad(res, 'Bad status'); db.prepare('UPDATE messages SET status=? WHERE id=?').run(req.body.status, +req.params.id); res.json({ ok: true }); });
  A.delete('/messages/:id', (req, res) => { db.prepare('DELETE FROM messages WHERE id=?').run(+req.params.id); res.json({ ok: true }); });
  A.get('/reviews', (req, res) => res.json(db.prepare('SELECT * FROM reviews ORDER BY id DESC LIMIT 300').all()));
  A.patch('/reviews/:id', (req, res) => { if (!['pending', 'approved', 'hidden'].includes(req.body.status)) return bad(res, 'Bad status'); db.prepare('UPDATE reviews SET status=? WHERE id=?').run(req.body.status, +req.params.id); res.json({ ok: true }); });
  A.delete('/reviews/:id', (req, res) => { db.prepare('DELETE FROM reviews WHERE id=?').run(+req.params.id); res.json({ ok: true }); });

  /* ---- admin: delivery and product types ---- */
  A.get('/delivery', (req, res) => res.json({ ...info(), states: NG, countries: COUNTRIES }));
  A.put('/delivery', (req, res) => {
    const f = str(req.body.free_state, 40); if (!NG.includes(f)) return bad(res, 'Choose a state');
    const put = (k, v) => db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run(k, v);
    const v = k => String(req.body[k] ?? '').trim() === '' ? '' : String(int(req.body[k]));
    put('free_state', f); put('delivery_default', v('default')); put('intl_default', v('intl_default'));
    res.json({ ...info(), states: NG, countries: COUNTRIES });
  });
  A.put('/delivery/:state', (req, res) => {
    const st = req.params.state; if (!NG.includes(st)) return bad(res, 'Unknown state');
    const raw = String(req.body.fee ?? '').trim();
    if (raw === '') db.prepare('DELETE FROM delivery_fees WHERE state=?').run(st); else db.prepare('INSERT OR REPLACE INTO delivery_fees(state,fee) VALUES(?,?)').run(st, int(raw));
    res.json({ ok: true });
  });
  A.put('/delivery-country/:name', (req, res) => {
    const c = req.params.name; if (!COUNTRIES.includes(c) || c === 'Nigeria') return bad(res, 'Choose a country outside Nigeria');
    const raw = String(req.body.fee ?? '').trim();
    if (raw === '') db.prepare('DELETE FROM country_fees WHERE country=?').run(c); else db.prepare('INSERT OR REPLACE INTO country_fees(country,fee) VALUES(?,?)').run(c, int(raw));
    res.json({ ok: true });
  });
  A.post('/categories', (req, res) => {
    const n = str(req.body.name, 40); if (!n) return bad(res, 'Add a name for the new product type');
    try { db.prepare('INSERT INTO categories(name,sort) VALUES(?,(SELECT COALESCE(MAX(sort),0)+1 FROM categories))').run(n); res.json({ ok: true }); } catch { bad(res, 'That product type already exists'); }
  });
  A.delete('/categories/:id', (req, res) => {
    const c = db.prepare('SELECT name FROM categories WHERE id=?').get(+req.params.id); if (!c) return res.json({ ok: true });
    const n = db.prepare('SELECT COUNT(*) n FROM products WHERE category=?').get(c.name).n;
    if (n) return bad(res, `${n} product${n === 1 ? ' uses' : 's use'} ${c.name}. Move or delete them first.`);
    db.prepare('DELETE FROM categories WHERE id=?').run(+req.params.id); res.json({ ok: true });
  });
  A.post('/brands', (req, res) => { const n = str(req.body.name, 40); if (!n) return bad(res, 'Add a brand name'); try { db.prepare('INSERT INTO brands(name) VALUES(?)').run(n); res.json({ ok: true }); } catch { bad(res, 'That brand already exists'); } });
  A.delete('/brands/:id', (req, res) => { db.transaction(() => { db.prepare('DELETE FROM models WHERE brand_id=?').run(+req.params.id); db.prepare('DELETE FROM brands WHERE id=?').run(+req.params.id); })(); res.json({ ok: true }); });
  A.post('/models', (req, res) => {
    const b = db.prepare('SELECT id FROM brands WHERE id=?').get(+req.body.brand_id), names = String(req.body.names || '').split(/[\n;]/).map(s => str(s, 80)).filter(Boolean).slice(0, 80);
    if (!b || !names.length) return bad(res, 'Choose a brand and add at least one model');
    const ins = db.prepare('INSERT OR IGNORE INTO models(brand_id,name) VALUES(?,?)'); db.transaction(() => names.forEach(n => ins.run(b.id, n)))(); res.json({ ok: true });
  });
  A.delete('/models/:id', (req, res) => { db.prepare('DELETE FROM models WHERE id=?').run(+req.params.id); res.json({ ok: true }); });
  A.post('/patches', (req, res) => {
    const names = String(req.body.names || '').split(/[\n;]/).map(x => str(x, 60)).filter(Boolean).filter(x => x.toLowerCase() !== 'none').slice(0, 60);
    if (!names.length) return bad(res, 'Add at least one patch name');
    const ins = db.prepare('INSERT OR IGNORE INTO patches(name,sort) VALUES(?,(SELECT COALESCE(MAX(sort),0)+1 FROM patches))'); db.transaction(() => names.forEach(n => ins.run(n)))(); res.json({ ok: true });
  });
  A.delete('/patches/:id', (req, res) => { db.prepare('DELETE FROM patches WHERE id=?').run(+req.params.id); res.json({ ok: true }); });
  A.put('/categories/:id/custom', (req, res) => {
    const c = db.prepare('SELECT * FROM categories WHERE id=?').get(+req.params.id); if (!c) return bad(res, 'Product type not found');
    const fields = ['name', 'number', 'patches'].filter(f => [].concat(req.body.fields || []).includes(f));
    if (!fields.length) return bad(res, 'Choose at least one thing customers can customize');
    const noun = str(req.body.noun, 30) || (CZ[c.name] ? CZ[c.name][2] : c.name.toLowerCase());
    db.prepare('UPDATE categories SET custom_fields=?, custom_rule=?, noun=? WHERE id=?').run(fields.join(','), req.body.rule === 'any' ? 'any' : 'all', noun, c.id);
    res.json({ ok: true });
  });
  return { NG, COUNTRIES, deliveryFor, info, catNames, czMap };
};

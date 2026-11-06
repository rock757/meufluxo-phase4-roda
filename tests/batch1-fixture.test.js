// Batch 1 acceptance fixture. Runs the REAL api/track.js and api/stats.js against an EMPTY sandbox database.
// Usage: MF_FIXTURE_DATABASE_URL=<sandbox db url> node tests/batch1-fixture.test.js   (never point this at production)
const fs = require('fs'), path = require('path');
const URL_ = process.env.MF_FIXTURE_DATABASE_URL;
if (!URL_ || /\/meufluxo_fase4\?/.test(URL_)) { console.error('Refusing: set MF_FIXTURE_DATABASE_URL to a sandbox database (not meufluxo_fase4).'); process.exit(2); }
process.env.MF_DATABASE_URL = URL_; process.env.PAINEL_KEY = 'fixture-key';
const root = path.join(__dirname, '..');
const DB = require(root + '/api/_db.js'), track = require(root + '/api/track.js'), stats = require(root + '/api/stats.js'), payt = require(root + '/api/payt.js');
process.env.PAYT_WEBHOOK_TOKEN = 'fixture-payt-token';
async function hook(body, token, hdr) { const res = mkRes(); await payt({ method: 'POST', url: '/api/payt' + (token ? '?token=' + token : ''), body, headers: hdr || {} }, res); return res; }
const UA_HUMAN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const UA_PHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const UA_HEADLESS = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36';
let pass = 0, fail = 0; const log = [];
const ok = (name, cond, got) => { (cond ? pass++ : fail++); const line = `${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  → got ' + JSON.stringify(got)}`; log.push(line); console.log(line); };
const mkRes = () => ({ h: {}, statusCode: 200, body: '', setHeader(k, v) { this.h[k.toLowerCase()] = v; }, end(d) { this.body = d || ''; } });
async function post(body, ua) { const res = mkRes(); await track({ method: 'POST', body, headers: { 'user-agent': ua } }, res); return res; }
async function getStats(from, to) { const res = mkRes(); await stats({ method: 'GET', url: `/api/stats?k=fixture-key&from=${from}&to=${to}`, headers: {} }, res); return JSON.parse(res.body); }
async function pool(items, fn, k = 25) { for (let i = 0; i < items.length; i += k) await Promise.all(items.slice(i, i + k).map(fn)); }
const brt = d => new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 10);
(async () => {
  // 0 · schema: base tables + Batch 1 migration (the same file that would run in production)
  const stmts = f => fs.readFileSync(path.join(root, 'db', f), 'utf8').split('\n').filter(l => l.trim() && !l.trim().startsWith('--')).join('\n').split(';').map(s => s.trim()).filter(Boolean);
  for (const s of [...stmts('base-schema.sql'), ...stmts('2026-11-06-batch1-migration.sql'), ...stmts('2026-11-06-batch2-central-payt.sql')]) await DB.sql(s);
  const [{ n: existing }] = await DB.sql('SELECT count(*)::int AS n FROM eventos');
  if (existing) { console.error('Sandbox database is not empty; use a fresh one.'); process.exit(2); }
  const now = new Date(), TODAY = brt(now), TOMORROW = brt(new Date(now.getTime() + 86400e3));
  console.log(`fixture day (BRT) ${TODAY}, next day ${TOMORROW}`);
  // ---------- SCENARIO 1: 400 automated/test visits + 2 eligible visitors + 1 verified sale ----------
  const bots = []; for (let i = 0; i < 200; i++) bots.push({ vid: 'fx-bot-' + i, ua: UA_HEADLESS, test: null });
  for (let i = 0; i < 200; i++) bots.push({ vid: 'fx-qa-' + i, ua: UA_HUMAN, test: 'fixture-qa' });
  await pool(bots, async b => {
    const base = { vid: b.vid, sid: b.vid + '-s', page: 'index', lang: 'pt', path: '/index.html', ts: Date.now(), wd: b.ua === UA_HEADLESS ? 1 : 0 };
    if (b.test) base.test = b.test;
    await post(Object.assign({ ev: 'page_view' }, base), b.ua);
    await post(Object.assign({ ev: 'scroll', depth: 100, auto: 1 }, base, { ts: Date.now() }), b.ua); // automatic scroll is NOT human evidence
  });
  const journey = async (vid, ua, evs, src) => { for (const [ev, page, p] of evs) await post(Object.assign({ ev, vid, sid: vid + '-s', page, lang: 'pt', path: '/' + page + '.html', ts: Date.now(), wd: 0, utm_source: src || '' }, p || {}), ua); };
  const fullJourney = [['page_view', 'index'], ['interact', 'index', { type: 'pointerdown' }], ['quiz_start', 'index'], ...Array.from({ length: 8 }, (_, i) => ['answer', 'index', { q: i + 1, v: 4 }]),
    ['quiz_done', 'index'], ['priority_pick', 'index', { area: 'alimentacao' }], ['cta_letter', 'index'], ['page_view', 'carta'], ['letter_view', 'carta'], ['scroll', 'carta', { depth: 50, auto: 0 }], ['offer_view', 'carta'], ['checkout_click', 'carta']];
  await journey('fx-human-A', UA_HUMAN, fullJourney, 'email');
  await journey('fx-human-B', UA_PHONE, [['page_view', 'index'], ['interact', 'index', { type: 'touchstart' }], ['quiz_start', 'index']], 'whatsapp');
  await DB.sql(`INSERT INTO compras (pedido, status, valor, vid, source, currency, produto) VALUES ('FX-1','aprovado',997,'fx-human-A','fixture','BRL','ilimitado-5-anos')`);
  let s = await getStats(TODAY, TODAY);
  console.log('\nS1 · 400 automated/test + 2 eligible + 1 sale');
  ok('S1 eligible identities = 2', s.cohorts.eligible === 2, s.cohorts);
  ok('S1 bots = 200 (reason robô: ua:headless)', s.cohorts.bot === 200 && s.reasons.some(r => r.reason === 'robô: ua:headless' && r.n === 200), s.reasons);
  ok('S1 tests = 200 (reason teste: fixture-qa)', s.cohorts.test === 200 && s.reasons.some(r => r.reason === 'teste: fixture-qa' && r.n === 200), s.reasons);
  ok('S1 unknown = 0', s.cohorts.unknown === 0, s.cohorts);
  ok('S1 eligible conversion = 1/2 = 50%', s.conversion.eligible.num === 1 && s.conversion.eligible.den === 2 && s.conversion.eligible.rate === 0.5, s.conversion.eligible);
  ok('S1 raw view = 402 identities, raw rate 1/402 ≈ 0.25%', s.raw.pv_identities === 402 && Math.abs(s.conversion.raw.rate - 1 / 402) < 1e-9, { raw: s.raw, rate: s.conversion.raw });
  ok('S1 verified sales = 1, attributed to eligible', s.sales.verified === 1 && s.sales.by_attribution.eligible === 1, s.sales);
  ok('S1 sequential funnel: 2 → quiz 2 → done 1 → letter 1 → offer 1 → checkout 1 → bought 1', JSON.stringify(s.funnel.steps) === '[2,2,1,1,1,1,1]', s.funnel);
  ok('S1 flagged not-yet-reliable (fixture sales, small sample)', s.conversion.reliable === false && s.conversion.flags.includes('sales_are_fixture') && s.conversion.flags.includes('small_sample'), s.conversion.flags);
  // ---------- SCENARIO 2: unknown visitor, unmatched order, duplicate payment, next-day return, stale client clock ----------
  await journey('fx-human-C', UA_HUMAN, [['page_view', 'index'], ['leave', 'index', { secs: 2 }]]);               // visited, never interacted
  await DB.sql(`INSERT INTO compras (pedido, status, valor, vid, source, currency) VALUES ('FX-2','aprovado',997,NULL,'fixture','BRL')`); // paid, no visit linked
  await DB.sql(`INSERT INTO compras (pedido, status, valor, vid, source, currency) VALUES ('FX-1','aprovado',997,'fx-human-A','fixture','BRL')`); // duplicate delivery of FX-1
  const tom = `(($1::date)::timestamp + interval '10 hours') AT TIME ZONE 'America/Sao_Paulo'`;
  for (const ev of ['page_view', 'interact']) await DB.sql(`INSERT INTO eventos (ts, received_at, occurred_at, ev, vid, sid, page, lang, path, ingest_version) VALUES (${tom}, ${tom}, ${tom}, '${ev}', 'fx-human-B', 'fx-human-B-s2', 'index', 'pt', '/index.html', 'ingest-v1')`, [TOMORROW]);
  const stale = Date.now() - 3 * 86400e3;  // the old bug: event stamped with a 3-day-old first-touch time
  const rs = await post({ ev: 'page_view', vid: 'fx-ts-check', sid: 'x', page: 'index', lang: 'pt', path: '/index.html', ts: stale, test: 'ts-check', wd: 0 }, UA_HUMAN);
  ok('S2 ingest answered stored', rs.h['x-mf-stored'] === '1', rs.h);
  const [row] = await DB.sql(`SELECT ts, occurred_at, ts_flag, (now() - received_at) < interval '5 minutes' AS fresh FROM eventos WHERE vid = 'fx-ts-check'`);
  ok('S2 stale client time: raw ts kept, occurred_at NULL, flagged, received_at = server now', row && row.occurred_at === null && row.ts_flag === 'client_ts_out_of_range' && row.fresh === true && Math.abs(new Date(row.ts).getTime() - stale) < 1000, row);
  s = await getStats(TODAY, TODAY);
  console.log('\nS2 · same day');
  ok('S2 unknown = 1, disclosed next to the rate', s.cohorts.unknown === 1 && s.conversion.if_unknown_are_people.den === 3, s.conversion);
  ok('S2 eligible rate still 1/2 = 50%', s.conversion.eligible.rate === 0.5, s.conversion.eligible);
  ok('S2 if-unknown-are-people rate = 1/3', Math.abs(s.conversion.if_unknown_are_people.rate - 1 / 3) < 1e-9, s.conversion.if_unknown_are_people);
  ok('S2 verified sales = 2 (duplicate ignored), unmatched = 1 stays visible', s.sales.verified === 2 && s.sales.by_attribution.unmatched === 1 && s.sales.duplicates_ignored === 1, s.sales);
  ok('S2 test count includes the stale-clock check visitor (201)', s.cohorts.test === 201, s.cohorts);
  let t = await getStats(TOMORROW, TOMORROW);
  console.log('\nS2 · next day only');
  ok('S2 next day: only B (returned) is eligible; no sales that day', t.cohorts.eligible === 1 && t.sales.verified === 0 && t.conversion.eligible.rate === 0, { c: t.cohorts, s: t.sales.verified });
  let both = await getStats(TODAY, TOMORROW);
  ok('S2 two-day window counts B once (identity, not visits): eligible 2', both.cohorts.eligible === 2, both.cohorts);
  // ---------- SCENARIO 3: BRT midnight boundary, refund, test purchase ----------
  const late = `(($1::date)::timestamp + interval '23 hours 30 minutes') AT TIME ZONE 'America/Sao_Paulo'`;  // 23:30 BRT = 02:30 UTC next day
  for (const ev of ['page_view', 'interact']) await DB.sql(`INSERT INTO eventos (ts, received_at, occurred_at, ev, vid, sid, page, lang, path, ingest_version) VALUES (${late}, ${late}, ${late}, '${ev}', 'fx-human-D', 'fx-human-D-s', 'index', 'pt', '/index.html', 'ingest-v1')`, [TODAY]);
  await DB.sql(`INSERT INTO compras (pedido, status, valor, vid, source, currency) VALUES ('FX-2','reembolsado',997,NULL,'fixture','BRL')`);   // refund of FX-2
  await DB.sql(`INSERT INTO compras (pedido, status, valor, vid, source, currency) VALUES ('FX-3','aprovado',997,'fx-qa-7','fixture','BRL')`);  // Dani-style test purchase
  s = await getStats(TODAY, TODAY); t = await getStats(TOMORROW, TOMORROW);
  console.log('\nS3 · boundary, refund, test purchase');
  const [{ utc_day }] = await DB.sql(`SELECT to_char(received_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS utc_day FROM eventos WHERE vid = 'fx-human-D' LIMIT 1`);
  ok('S3 23:30 BRT visit (UTC already next day) counts on the BRT day', s.cohorts.eligible === 3 && t.cohorts.eligible === 1 && utc_day === TOMORROW, { today: s.cohorts.eligible, tomorrow: t.cohorts.eligible, utc_day });
  ok('S3 refund removes FX-2 from verified sales and shows as refunded', s.sales.verified === 2 && s.sales.refunded === 1 && !s.sales.by_attribution.unmatched, s.sales);
  ok('S3 test purchase counted as excluded, not in eligible rate', s.sales.by_attribution.excluded === 1 && s.conversion.eligible.num === 1 && s.conversion.eligible.den === 3, { by: s.sales.by_attribution, c: s.conversion.eligible });
  // ---------- SCENARIO 4 (Batch 2): central identity + Payt receiver ----------
  console.log('\nS4 · central id (trck) + Payt webhook receiver');
  const TR = 'a1b2c3d4-0000-4000-8000-00000000e001';
  await post({ ev: 'page_view', vid: 'fx-human-E', sid: 's-E', page: 'index', ts: Date.now(), trck: TR, utm_source: 'whatsapp' }, UA_HUMAN);
  await post({ ev: 'interact', vid: 'fx-human-E', sid: 's-E', page: 'index', ts: Date.now(), trck: TR }, UA_HUMAN);
  await post({ ev: 'checkout_click', vid: 'fx-human-E', sid: 's-E', page: 'carta', ts: Date.now(), trck: TR, 'trck': TR }, UA_HUMAN);
  const [{ n: trckRows }] = await DB.sql(`SELECT count(*)::int AS n FROM eventos WHERE vid = 'fx-human-E' AND trck = $1`, [TR]);
  ok('S4 trck stored on events (3/3)', trckRows === 3, trckRows);
  let r = await hook({ transaction: 'PT0001', status: 'approved', amount: '997,00', product: { name: 'Ilimitado BN' }, customer: { email: 'x@example.com' }, tracking: { sck: TR, xcod: TR, utm_source: 'whatsapp' } }, 'wrong-token');
  ok('S4 wrong token → 401, nothing stored', r.statusCode === 401 && (await DB.sql(`SELECT count(*)::int AS n FROM compras_raw`))[0].n === 0, r.statusCode);
  r = await hook({ transaction: 'PT0001', status: 'approved', amount: '997,00', product: { name: 'Ilimitado BN' }, customer: { email: 'x@example.com' }, tracking: { sck: TR, xcod: TR, utm_source: 'whatsapp' } }, 'fixture-payt-token');
  const r2 = await hook({ transaction: 'PT0001', status: 'approved', amount: '997,00', product: { name: 'Ilimitado BN' }, customer: { email: 'x@example.com' }, tracking: { sck: TR, xcod: TR } }, null, { 'x-webhook-token': 'fixture-payt-token' });
  ok('S4 approved → 200 new; retry → duplicate', r.statusCode === 200 && r.h['x-mf-order'] === 'new' && r2.statusCode === 200 && r2.h['x-mf-order'] === 'duplicate', [r.h, r2.h]);
  const [c1] = await DB.sql(`SELECT pedido, status, valor::float AS valor, trck, email_hash, vid, raw::text AS raw, mapping_version FROM compras WHERE pedido = 'PT0001'`);
  ok('S4 order stored once, no raw email, trck = sck/xcod, mapping flagged unverified', c1 && c1.valor === 997 && c1.trck === TR && c1.vid === null && c1.email_hash && c1.email_hash.length === 64 && !/example\.com/.test(c1.raw) && c1.mapping_version === 'payt-v0-unverified', c1);
  const [{ n: rawN }] = await DB.sql(`SELECT count(*)::int AS n FROM compras_raw WHERE event_key = 'PT0001'`);
  ok('S4 both deliveries kept in compras_raw', rawN === 2, rawN);
  r = await hook({ transaction: 'PT0001', status: 'waiting_payment', amount: '997,00' }, 'fixture-payt-token');
  r = await hook({ foo: 'bar', hello: 1 }, 'fixture-payt-token');
  ok('S4 unknown payload → 202 kept raw as unmapped', r.statusCode === 202 && (await DB.sql(`SELECT count(*)::int AS n FROM compras_raw WHERE note = 'unmapped'`))[0].n === 1, r.statusCode);
  s = await getStats(TODAY, TODAY);
  ok('S4 Payt order attributed to eligible E via trck (no vid in webhook); pending status not a sale', s.sales.verified === 3 && s.conversion.eligible.num === 2 && s.conversion.eligible.den === 4 && s.sales.by_attribution.eligible === 2 && s.sales.sources.payt === 2 && s.sales.sources.raw_unmapped === 1, { sales: s.sales, c: s.conversion.eligible });
  ok('S4 payt_not_connected flag cleared once a Payt row exists', !s.conversion.flags.includes('payt_not_connected') && !s.conversion.flags.includes('sales_are_fixture'), s.conversion.flags);
  r = await hook({ transaction: 'PT0001', status: 'refunded', amount: '997,00' }, 'fixture-payt-token'); s = await getStats(TODAY, TODAY);
  ok('S4 refund via webhook moves PT0001 to refunded', s.sales.verified === 2 && s.sales.refunded === 2, s.sales);
  fs.writeFileSync(path.join(__dirname, 'batch1-fixture-stats.json'), JSON.stringify(s, null, 1));
  const summary = `\n${pass} passed, ${fail} failed · ${new Date().toISOString()}`; console.log(summary);
  fs.writeFileSync(path.join(__dirname, 'batch1-fixture-results.txt'), log.join('\n') + summary + '\n');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });

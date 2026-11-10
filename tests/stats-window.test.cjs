// node tests/stats-window.test.cjs — mocks Neon/Sheets; no network, no secrets.
const path = require('path'); const assert = require('assert');
const api = p => path.join(__dirname, '..', 'api', p);
let calls = [], dbOn = true, sheetRows = [];
require.cache[api('_db.js')] = { exports: { configured: () => dbOn, sql: async (q, p) => { calls.push({ q, p }); if (/FROM eventos WHERE|FROM eventos$/.test(q) && /count\(distinct sid\)/.test(q)) return [{ rows: 3, visitors: 2, sessions: 2 }]; if (/FROM roda/.test(q)) return [{ n: 1 }]; if (/FROM compras/.test(q)) return [{ n: 4, total: 3988 }]; return []; } }, loaded: true, id: api('_db.js'), filename: api('_db.js') };
require.cache[api('_sheets.js')] = { exports: { configured: () => !dbOn, readTab: async () => sheetRows }, loaded: true, id: api('_sheets.js'), filename: api('_sheets.js') };
const stats = require(api('stats.js'));
function run(url) { return new Promise(r => { const res = { statusCode: 200, setHeader() {}, end(b) { r({ status: this.statusCode, body: JSON.parse(b) }) } }; stats({ url }, res); }); }
let n = 0; const t = async (name, f) => { calls = []; await f(); n++; console.log('PASS', name); };
(async () => {
  process.env.PAINEL_KEY = 'k1';
  await t('reportingWindow parses offset and labels in BRT', async () => { const w = stats.reportingWindow('2026-11-10T09:00:00-03:00'); assert.equal(w.start, '2026-11-10T12:00:00.000Z'); assert.match(w.label, /10\/11\/2026.*09:00.*BRT/); });
  await t('reportingWindow rejects missing offset / junk', async () => { assert.equal(stats.reportingWindow('2026-11-10 09:00').ok, false); assert.equal(stats.reportingWindow('amanhã').ok, false); assert.equal(stats.reportingWindow('').start, null); });
  await t('bad key still locked', async () => { const r = await run('/api/stats?k=x'); assert.equal(r.status, 403); });
  await t('default start is Rocky\'s campaign time (Nov 10 18:00 BRT); env overrides; all = history', async () => { assert.equal(stats.startSetting(undefined), '2026-11-10T18:00:00-03:00'); assert.equal(stats.startSetting(''), '2026-11-10T18:00:00-03:00'); assert.equal(stats.startSetting('all'), ''); assert.equal(stats.startSetting('2026-12-01T00:00:00-03:00'), '2026-12-01T00:00:00-03:00'); assert.equal(stats.reportingWindow(stats.CAMPAIGN_START).start, '2026-11-10T21:00:00.000Z'); });
  delete process.env.MF_REPORTING_START_AT;
  await t('unset = campaign window from Nov 10 18:00 BRT', async () => { const r = await run('/api/stats?k=k1'); assert.equal(r.body.window.start, '2026-11-10T21:00:00.000Z'); assert.equal(r.body.compras, null); assert.ok(calls.filter(c => /ts >= \$1/.test(c.q)).every(c => c.p[0] === '2026-11-10T21:00:00.000Z')); });
  process.env.MF_REPORTING_START_AT = 'all';
  await t('all = all history, no cutoff params, compras kept', async () => { const r = await run('/api/stats?k=k1'); assert.equal(r.body.window.start, null); assert.ok(calls.every(c => !/\$1/.test(c.q))); assert.equal(r.body.compras, 4); });
  process.env.MF_REPORTING_START_AT = '2026-11-10T09:00:00-03:00';
  await t('set = 8 cutoff queries (6 eventos + roda + A/B), inclusive, compras null', async () => { const r = await run('/api/stats?k=k1'); const cut = calls.filter(c => /ts >= \$1::timestamptz/.test(c.q)); assert.equal(cut.length, 8); assert.ok(cut.every(c => c.p[0] === '2026-11-10T12:00:00.000Z')); assert.ok(!calls.some(c => /FROM compras/.test(c.q))); assert.equal(r.body.compras, null); assert.equal(r.body.receita, null); assert.equal(r.body.window.start, '2026-11-10T12:00:00.000Z'); assert.ok(calls.every(c => (c.q.match(/WHERE/g) || []).length <= 1)); });
  await t('A/B query: per-version unique visitors, forced views excluded, inside window', async () => { await run('/api/stats?k=k1'); const q = calls.find(c => /extra->>'carta'/.test(c.q)); assert.ok(q); assert.match(q.q, /carta_forcada','0'\) <> '1'/); assert.match(q.q, /ts >= \$1::timestamptz/); assert.equal(q.p[0], '2026-11-10T12:00:00.000Z'); });
  process.env.MF_REPORTING_START_AT = 'garbage';
  await t('invalid cutoff = explicit error, not demo', async () => { const r = await run('/api/stats?k=k1'); assert.equal(r.status, 500); assert.match(r.body.error, /MF_REPORTING_START_AT/); assert.equal(calls.length, 0); });
  dbOn = false; process.env.MF_REPORTING_START_AT = '2026-11-10T09:00:00-03:00';
  sheetRows = [['ts', 'ev', 'vid', 'sid', 'page', 'lang', 'path', 'utm_source'],
    ['2026-11-10T11:59:59.000Z', 'page_view', 'a', 's1', 'index', 'pt', '/', 'old'],
    ['2026-11-10T12:00:00.000Z', 'page_view', 'b', 's2', 'index', 'pt', '/', 'email'],
    ['2026-11-11T10:00:00.000Z', 'quiz_start', 'b', 's2', 'index', 'pt', '/', 'email'],
    ['', 'page_view', 'c', 's3', 'index', 'pt', '/', 'nodate'],
    ['2026-11-11T10:05:00.000Z', 'letter_view', 'b', 's2', 'carta', 'pt', '/', 'email', '', '', '', '', '', '', '{"carta":"A","carta_forcada":0}'],
    ['2026-11-11T10:06:00.000Z', 'letter_view', 'd', 's4', 'carta', 'pt', '/', 'email', '', '', '', '', '', '', '{"carta":"B","carta_forcada":1}'],
    ['2026-11-11T10:07:00.000Z', 'checkout_click', 'b', 's2', 'carta', 'pt', '/', 'email', '', '', '', '', '', '', '{"carta":"A","carta_forcada":0}']];
  await t('sheets fallback applies inclusive cutoff, keeps nothing older or undated', async () => { const r = await run('/api/stats?k=k1'); assert.equal(r.body.source, 'sheets'); assert.equal(r.body.visitors, 2); assert.deepEqual(r.body.sources, { email: 1 }); assert.equal(r.body.events.page_view, 1); assert.equal(r.body.rows, 5); assert.deepEqual(r.body.ab, { A: { letter_view: 1, checkout_click: 1 } }); });
  process.env.MF_REPORTING_START_AT = 'all';
  await t('sheets fallback all = all rows', async () => { const r = await run('/api/stats?k=k1'); assert.equal(r.body.visitors, 4); assert.equal(r.body.rows, 7); });
  console.log(`TOTAL ${n} passed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });

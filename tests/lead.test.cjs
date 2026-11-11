// node tests/lead.test.cjs — /api/lead with a fake DB (no network, no real data).
const path = require('path');
const dbPath = path.join(__dirname, '..', 'api', '_db.js');
const calls = [];
require.cache[require.resolve(dbPath)] = { id: dbPath, filename: dbPath, loaded: true,
  exports: { configured: () => !!process.env.FAKE_DB, sql: async q => { calls.push(['sql', q]); return []; }, insert: async (t, o) => { calls.push(['insert', t, o]); return { ok: true }; } } };
const lead = require('../api/lead.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log(c ? 'PASS' : 'FAIL', m); };
const run = async (method, body) => { const res = { h: {}, statusCode: 200, setHeader(k, v) { this.h[k] = v; }, end() { this.done = true; } }; await lead({ method, body }, res); return res; };
const good = { email: ' Maria@Exemplo.com.br ', consent: lead.CONSENT, vals: '3x50777' + '1', alto: 'memoria', baixo: 'financas', vid: 'v1', sid: 's1', lang: 'pt', utm_source: 'insta', src: 'story', path: '/black26', ts: 1794330000000 };
(async () => {
  ok((await run('GET', {})).statusCode === 405, 'GET refused');
  delete process.env.FAKE_DB;
  let r = await run('POST', good); ok(r.statusCode === 204 && r.h['x-mf-reason'] === 'storage-not-configured', 'no storage: no-op 204');
  process.env.FAKE_DB = '1';
  ok((await run('POST', { ...good, email: 'not-an-email' })).statusCode === 400, 'bad email refused');
  ok((await run('POST', { ...good, consent: '' })).statusCode === 400, 'missing consent refused');
  r = await run('POST', { ...good, test: '1' }); ok(r.statusCode === 204 && r.h['x-mf-reason'] === 'excluded-test-or-staff' && !calls.length, 'test/staff not stored');
  r = await run('POST', good);
  const ins = calls.find(c => c[0] === 'insert');
  ok(r.statusCode === 204 && r.h['x-mf-stored'] === '1', 'valid lead stored');
  ok(calls[0][0] === 'sql' && /CREATE TABLE IF NOT EXISTS leads/.test(calls[0][1]), 'table created if missing');
  ok(ins && ins[1] === 'leads' && ins[2].email === 'maria@exemplo.com.br', 'email trimmed and lowercased');
  ok(ins && ins[2].vals === '3x507771' && ins[2].alto === 'memoria' && ins[2].baixo === 'financas' && ins[2].utm_source === 'insta' && ins[2].src === 'story' && ins[2].path === '/black26' && 'carta' in ins[2], 'result + tags kept');
  ok(ins && ins[2].ts === new Date(1794330000000).toISOString() && ins[2].consent === lead.CONSENT, 'timestamp + consent version');
  calls.length = 0; const all = 'proposito+movimento+alimentacao+memoria+financas+relacoes+crescimento+espiritualidade';
  await run('POST', { ...good, alto: all, baixo: all }); const ins2 = calls.find(c => c[0] === 'insert'); ok(ins2 && ins2[2].alto === all && ins2[2].baixo === all, 'eight-way tie kept whole');
  calls.length = 0; await run('POST', good); ok(calls.filter(c => c[0] === 'sql').length === 0, 'table check runs once per instance');
  console.log(`TOTAL ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();

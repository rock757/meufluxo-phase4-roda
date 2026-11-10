// node tests/payt.test.cjs — api/payt.js with a mocked DB; synthetic payloads only, no network, no real keys.
const path = require('path'), assert = require('assert'), { Readable } = require('stream');
const dbp = path.join(__dirname, '..', 'api', '_db.js'); let calls = [], dbOn = true, fail = false;
require.cache[dbp] = { id: dbp, filename: dbp, loaded: true, exports: { configured: () => dbOn, sql: async (q, p) => { if (fail) throw new Error('boom'); calls.push({ q, p }); return []; } } };
const payt = require(path.join(__dirname, '..', 'api', 'payt.js'));
function call(method, body, ctype = 'application/json') { return new Promise(ok => { const req = Readable.from([typeof body === 'string' ? body : JSON.stringify(body || {})]); req.method = method; req.headers = { 'content-type': ctype };
  const res = { statusCode: 200, h: {}, setHeader(k, v) { this.h[k] = v }, end(b) { ok({ status: this.statusCode, reason: this.h['x-mf-reason'], body: b }) } }; payt(req, res); }); }
const KEY = 'test-key-not-real';
const PAID = { integration_key: KEY, transaction_id: 'TX9', status: 'paid', type: 'order', test: false,
  transaction: { payment_method: 'pix', payment_status: 'paid', total_price: 99700, paid_at: '2026-11-10T21:05:00-03:00', created_at: '2026-11-10T21:00:00-03:00', updated_at: '2026-11-10T21:05:02-03:00' },
  customer: { name: 'Fulana', email: 'f@example.com', document: '000', phone: '1' }, product: { code: 'ILIM5' },
  link: { sources: { src: 'bn', utm_source: 'email', utm_medium: 'news', utm_campaign: 'bn26', utm_content: 'c1', utm_term: 't' }, query_params: { carta: 'B', prioridade: 'memoria' } } };
let n = 0; const t = async (name, f) => { calls = []; await f(); n++; console.log('PASS', name); };
(async () => {
  delete process.env.MF_PAYT_POSTBACK_ON; process.env.PAYT_INTEGRATION_KEY = KEY;
  await t('off by default: 404, nothing stored', async () => { const r = await call('POST', PAID); assert.equal(r.status, 404); assert.equal(r.reason, 'disabled'); assert.equal(calls.length, 0); });
  process.env.MF_PAYT_POSTBACK_ON = '1';
  await t('GET refused', async () => { assert.equal((await call('GET')).status, 405); });
  delete process.env.PAYT_INTEGRATION_KEY;
  await t('on but no key configured: 503, nothing stored', async () => { const r = await call('POST', PAID); assert.equal(r.status, 503); assert.equal(calls.length, 0); });
  process.env.PAYT_INTEGRATION_KEY = KEY;
  await t('wrong or missing key: 401', async () => { assert.equal((await call('POST', { ...PAID, integration_key: 'nope' })).status, 401); assert.equal((await call('POST', { ...PAID, integration_key: undefined })).status, 401); assert.equal(calls.length, 0); });
  await t('Payt test event: 200, not stored', async () => { const r = await call('POST', { ...PAID, test: true }); assert.equal(r.status, 200); assert.equal(r.reason, 'test-ignored'); assert.equal(calls.length, 0); const seen = JSON.parse(r.body).seen; assert.equal(seen.utm_campaign, 'bn26'); assert.ok(!/Fulana|example/.test(r.body)); });
  await t('bad body: 400', async () => { assert.equal((await call('POST', '{not json')).status, 400); });
  await t('missing transaction_id/status: 400', async () => { assert.equal((await call('POST', { integration_key: KEY })).status, 400); });
  await t('paid sale stored with approval time, value, origin; no customer data', async () => {
    const r = await call('POST', PAID); assert.equal(r.status, 200); assert.equal(calls.length, 1); const { q, p } = calls[0];
    assert.match(q, /ON CONFLICT \(transaction_id, status, payment_status, updated_at\) DO NOTHING/);
    const row = Object.fromEntries(q.match(/\(([^)]+)\) VALUES/)[1].split(',').map((c, i) => [c, p[i]]));
    assert.equal(row.transaction_id, 'TX9'); assert.equal(row.valor, 997); assert.equal(row.paid_at, '2026-11-11T00:05:00.000Z');
    assert.equal(row.utm_source, 'email'); assert.equal(row.src, 'bn'); assert.equal(row.carta, 'B'); assert.equal(row.prioridade, 'memoria'); assert.equal(row.payment_method, 'pix');
    assert.ok(!/Fulana|example\.com/.test(JSON.stringify(p)), 'no customer data'); });
  await t('form-encoded body accepted', async () => { const r = await call('POST', new URLSearchParams({ integration_key: KEY, transaction_id: 'TX10', status: 'waiting_payment' }).toString(), 'application/x-www-form-urlencoded'); assert.equal(r.status, 200); assert.equal(calls[0].p[0], 'TX10'); });
  fail = true;
  await t('storage error: 500 so Payt retries', async () => { assert.equal((await call('POST', PAID)).status, 500); });
  fail = false; dbOn = false;
  await t('no database configured: 503', async () => { assert.equal((await call('POST', PAID)).status, 503); });
  console.log(`TOTAL ${n} passed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });

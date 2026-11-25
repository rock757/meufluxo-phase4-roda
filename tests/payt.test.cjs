// node tests/payt.test.cjs — api/payt.js with a mocked DB; synthetic payloads only, no network, no real keys.
const path = require('path'), assert = require('assert'), { Readable } = require('stream');
const dbp = path.join(__dirname, '..', 'api', '_db.js'); let calls = [], dbOn = true, fail = false, dup = false;
require.cache[dbp] = { id: dbp, filename: dbp, loaded: true, exports: { configured: () => dbOn, sql: async (q, p) => { if (fail) throw new Error('boom'); calls.push({ q, p }); return dup ? [] : [{ id: 1 }]; } } };
const payt = require(path.join(__dirname, '..', 'api', 'payt.js'));
function call(method, body, ctype = 'application/json', parsed) {
  return new Promise(ok => {
    const req = Readable.from([typeof body === 'string' ? body : JSON.stringify(body || {})]); req.method = method; req.headers = { 'content-type': ctype };
    if (parsed !== undefined) req.body = parsed; // Vercel may hand over an already-parsed body
    const res = { statusCode: 200, h: {}, setHeader(k, v) { this.h[k] = v }, end(b) { ok({ status: this.statusCode, reason: this.h['x-mf-reason'], body: b }) } };
    payt(req, res);
  });
}
const row = c => Object.fromEntries(payt.COLS.map((k, i) => [k, c.p[i]]));
const KEY = 'test-key-not-real';
// Shape follows the public PayT V1 postback guide. Customer/shipping/commission values are fake and must never be stored.
const PAID = { integration_key: KEY, transaction_id: 'TX9', seller_id: 'S1', test: false, type: 'order', status: 'paid', tangible: false,
  customer: { name: 'Fulana Teste', email: 'fulana@example.com', doc: '00000000000', phone: '11999999999', ip: '10.0.0.1', origin: { name: 'camp', code: 'C1' } },
  product: { name: 'MeuFluxo Ilimitado Black November', price: 99700, code: 'ILIM5', type: 'digital', quantity: 1 },
  link: { title: 'Checkout BN', url: 'https://checkout.payt.com.br/abc?cart=SECRET', seller_email: 'seller@example.com',
    sources: { src: 'Email-cartaA', utm_source: 'Email', utm_medium: 'RODA', utm_campaign: 'blacknov20261117', utm_content: 'BN1117-E4', utm_term: 'carta-A' },
    query_params: { carta: 'A', prioridade: 'memoria', split: '12' } },
  transaction: { payment_method: 'credit_card', payment_status: 'paid', total_price: 120120, installments: 12, installment_price: 10010,
    paid_at: '2026-11-16 20:19:05', created_at: '2026-11-16 20:17:00', updated_at: '2026-11-16 20:19:06' },
  commission: [{ name: 'Produtor', email: 'prod@example.com', type: 'producer', amount: 100000 }],
  started_at: '2026-11-16 20:15:40', updated_at: '2026-11-16 20:19:06' };
let n = 0; const t = async (name, f) => { calls = []; await f(); n++; console.log('PASS', name); };
(async () => {
  delete process.env.PAYT_INTEGRATION_KEY;
  await t('no key configured: 503, nothing stored', async () => { const r = await call('POST', PAID); assert.equal(r.status, 503); assert.equal(r.reason, 'key-not-set'); assert.equal(calls.length, 0); });
  process.env.PAYT_INTEGRATION_KEY = KEY;
  await t('GET refused', async () => { assert.equal((await call('GET')).status, 405); });
  await t('wrong, missing or prefix key: 401, nothing stored', async () => {
    assert.equal((await call('POST', { ...PAID, integration_key: 'nope' })).status, 401);
    assert.equal((await call('POST', { ...PAID, integration_key: undefined })).status, 401);
    assert.equal((await call('POST', { ...PAID, integration_key: KEY.slice(0, 5) })).status, 401);
    assert.equal(calls.length, 0); });
  await t('Payt test event: 200, not stored, echoes the row without customer data', async () => {
    const r = await call('POST', { ...PAID, test: true }); assert.equal(r.status, 200); assert.equal(r.reason, 'test-not-stored'); assert.equal(calls.length, 0);
    const seen = JSON.parse(r.body).seen; assert.equal(seen.utm_content, 'BN1117-E4'); assert.equal(seen.carta, 'A'); assert.ok(!/Fulana|example\.com|00000000000/.test(r.body)); });
  await t('bad body: 400', async () => { assert.equal((await call('POST', '{not json')).status, 400); assert.equal((await call('POST', '[1,2]')).status, 400); });
  await t('missing transaction_id/status: 400', async () => { assert.equal((await call('POST', { integration_key: KEY })).status, 400); });
  await t('paid sale: email tags, letter, approval time in BRT, value, installments; idempotent insert', async () => {
    const r = await call('POST', PAID); assert.equal(r.status, 200); assert.equal(r.reason, 'stored'); assert.equal(calls.length, 1);
    assert.match(calls[0].q, /^INSERT INTO compras \(/); assert.match(calls[0].q, /ON CONFLICT \(pedido, status, payment_status\) DO NOTHING/);
    const x = row(calls[0]);
    assert.equal(x.pedido, 'TX9'); assert.equal(x.status, 'paid'); assert.equal(x.payment_status, 'paid'); assert.equal(x.payment_method, 'credit_card');
    assert.equal(x.valor, 1201.2); assert.equal(x.parcelas, 12); assert.equal(x.produto, 'MeuFluxo Ilimitado Black November'); assert.equal(x.produto_codigo, 'ILIM5');
    assert.equal(x.paid_at, '2026-11-16T23:19:05.000Z', 'Payt time is Brasília (-03:00)'); assert.equal(x.payt_updated_at, '2026-11-16T23:19:06.000Z');
    assert.equal(x.utm_source, 'Email'); assert.equal(x.utm_campaign, 'blacknov20261117'); assert.equal(x.utm_content, 'BN1117-E4'); assert.equal(x.utm_term, 'carta-A'); assert.equal(x.src, 'Email-cartaA');
    assert.equal(x.carta, 'A'); assert.equal(x.prioridade, 'memoria'); assert.equal(x.tipo, 'order'); });
  await t('raw keeps the sale but drops customer, key, commission, seller e-mail and cart id', async () => {
    await call('POST', PAID); const raw = row(calls[0]).raw; assert.equal(typeof raw, 'string'); const j = JSON.parse(raw);
    assert.ok(!/Fulana|example\.com|00000000000|11999999999|10\.0\.0\.1|SECRET/.test(raw), 'no personal data');
    assert.equal(j.integration_key, undefined); assert.equal(j.commission, undefined); assert.deepEqual(j.customer, { origin: { name: 'camp', code: 'C1' } });
    assert.equal(j.link.url, 'https://checkout.payt.com.br/abc'); assert.equal(j.link.sources.utm_content, 'BN1117-E4'); assert.equal(j.transaction.total_price, 120120);
    assert.ok(!JSON.stringify(row(calls[0])).includes('Fulana'), 'no personal data in any column'); });
  await t('resend of the same notice: 200 duplicate (Payt stops retrying)', async () => { dup = true; const r = await call('POST', PAID); dup = false; assert.equal(r.status, 200); assert.equal(r.reason, 'duplicate'); });
  await t('Pix waiting payment then refund keep their own status', async () => {
    await call('POST', { ...PAID, status: 'waiting_payment', transaction: { payment_method: 'pix', payment_status: 'waiting_payment', total_price: 99700, pix_code: 'PIXSECRET', pix_url: 'https://x/qr' } });
    const w = row(calls[0]); assert.equal(w.status, 'waiting_payment'); assert.equal(w.paid_at, null); assert.ok(!/PIXSECRET|x\/qr/.test(w.raw));
    await call('POST', { ...PAID, status: 'canceled', transaction: { ...PAID.transaction, payment_status: 'refunded' } });
    assert.equal(row(calls[1]).payment_status, 'refunded'); });
  await t('letter from src when utm_term was taken (e.g. Rebeca link); review/test suffix kept', async () => {
    const z = (s, qp = {}) => payt.normalize({ link: { sources: s, query_params: qp } }).carta;
    assert.equal(z({ utm_term: 'telefone', src: 'Email-cartaB' }), 'B');
    assert.equal(z({ utm_term: 'carta-B-rev' }, { carta: 'B' }), 'B-rev');
    assert.equal(z({ src: 'Email-cartaA-teste' }), 'A-teste');
    assert.equal(z({ src: 'API' }, { carta: 'a' }), 'A');
    assert.equal(z({ src: 'API', utm_term: 'diagnostico' }), ''); });
  await t('dates: Payt local, ISO with offset, junk', async () => {
    assert.equal(payt.toIso('2026-11-16 20:19:05'), '2026-11-16T23:19:05.000Z'); assert.equal(payt.toIso('2026-11-16T20:19:05-03:00'), '2026-11-16T23:19:05.000Z');
    assert.equal(payt.toIso('2026-11-16'), '2026-11-16T03:00:00.000Z'); assert.equal(payt.toIso('nope'), null); assert.equal(payt.toIso(''), null); });
  await t('form-encoded body accepted', async () => { const r = await call('POST', new URLSearchParams({ integration_key: KEY, transaction_id: 'TX10', status: 'waiting_payment' }).toString(), 'application/x-www-form-urlencoded'); assert.equal(r.status, 200); assert.equal(row(calls[0]).pedido, 'TX10'); });
  await t('already-parsed body (Vercel) accepted', async () => { const r = await call('POST', '', 'application/json', PAID); assert.equal(r.status, 200); assert.equal(row(calls[0]).pedido, 'TX9'); });
  fail = true;
  await t('storage error: 500 so Payt retries', async () => { assert.equal((await call('POST', PAID)).status, 500); });
  fail = false; dbOn = false;
  await t('no database configured: 503', async () => { assert.equal((await call('POST', PAID)).status, 503); });
  console.log(`TOTAL ${n} passed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });

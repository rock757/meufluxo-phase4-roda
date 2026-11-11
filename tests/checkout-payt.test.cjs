// node tests/checkout-payt.test.cjs — letter A/B reaches Payt-supported fields (src, utm_term). No network.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'carta-variante.js'), 'utf8');
function load({ search = '', ls = {}, rand = 0.1, test = '' } = {}) {
  const store = Object.assign({}, ls); const jar = { s: '' };
  const win = { MF_CONFIG: { splitTeste: { ativo: true, variantes: ['A', 'B'] } } };
  const ctx = { window: win, location: { search, protocol: 'https:' }, URLSearchParams, Math, RegExp, String, Object, decodeURIComponent, encodeURIComponent,
    document: { get cookie() { return jar.s }, set cookie(v) { jar.s = v.split(';')[0] } },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v) } },
    crypto: { getRandomValues: a => { a[0] = Math.floor(rand * 4294967296); return a } } };
  vm.runInNewContext(SRC, ctx); win.MF_TRACK = { flags: { test } }; return win;
}
// Same merge rule as carta.js checkoutHref: never overwrite a parameter already in the checkout URL.
function href(win, stored, base = 'https://checkout.payt.com.br/4ced8f35dc1c393cca8c3c80148b86b3?split=12') {
  const u = new URL(base); const p = win.MF_CARTA_PAYT(stored);
  Object.entries(p).forEach(([k, v]) => { if (v && !u.searchParams.has(k)) u.searchParams.set(k, v) }); return u;
}
const CAMP = { utm_source: 'Email', utm_medium: 'RODA', utm_campaign: 'blacknov20261111', utm_content: 'RODA01' };
let n = 0; const t = (name, f) => { f(); n++; console.log('PASS', name); };
t('campaign link, letter A: src + utm_term carry A, channel UTMs untouched', () => {
  const u = href(load({ rand: 0.1 }), CAMP);
  assert.equal(u.searchParams.get('src'), 'Email-cartaA'); assert.equal(u.searchParams.get('utm_term'), 'carta-A'); assert.equal(u.searchParams.get('carta'), 'A');
  for (const [k, v] of Object.entries(CAMP)) assert.equal(u.searchParams.get(k), v); assert.equal(u.searchParams.get('split'), '12'); });
t('letter B', () => { const u = href(load({ rand: 0.9 }), CAMP); assert.equal(u.searchParams.get('src'), 'Email-cartaB'); assert.equal(u.searchParams.get('utm_term'), 'carta-B'); });
t('returning visitor keeps stored letter in src', () => { const u = href(load({ rand: 0.9, ls: { mf_carta: 'A' } }), CAMP); assert.equal(u.searchParams.get('src'), 'Email-cartaA'); });
t('existing src (e.g. ManyChat) is kept; A/B still in utm_term', () => { const u = href(load({ rand: 0.9 }), Object.assign({ src: 'API' }, CAMP)); assert.equal(u.searchParams.get('src'), 'API'); assert.equal(u.searchParams.get('utm_term'), 'carta-B'); });
t('existing utm_term is kept; A/B still in src', () => { const u = href(load({ rand: 0.1 }), Object.assign({ utm_term: 'x1' }, CAMP)); assert.equal(u.searchParams.get('utm_term'), 'x1'); assert.equal(u.searchParams.get('src'), 'Email-cartaA'); });
t('no UTMs at all: explicit "direto"', () => { const u = href(load({ rand: 0.1 }), {}); assert.equal(u.searchParams.get('src'), 'direto-cartaA'); assert.equal(u.searchParams.get('utm_term'), 'carta-A'); assert.equal(u.searchParams.get('utm_source'), null); });
t('forced review view is labelled -rev', () => { const u = href(load({ search: '?carta=b' }), CAMP); assert.equal(u.searchParams.get('src'), 'Email-cartaB-rev'); assert.equal(u.searchParams.get('utm_term'), 'carta-B-rev'); });
t('test session (mf_test) is labelled -teste', () => { const u = href(load({ rand: 0.1, test: 'qa' }), CAMP); assert.equal(u.searchParams.get('src'), 'Email-cartaA-teste'); });
t('odd characters in utm_source are dropped from src', () => { const u = href(load({ rand: 0.1 }), { utm_source: 'kit mail/x' }); assert.equal(u.searchParams.get('src'), 'kitmailx-cartaA'); });
t('no variant (test off, no ?carta) = params unchanged', () => {
  const win = { MF_CONFIG: { splitTeste: { ativo: false } } }; vm.runInNewContext(SRC, { window: win, location: { search: '', protocol: 'https:' }, URLSearchParams, Math, RegExp, String, Object, decodeURIComponent, encodeURIComponent, document: { cookie: '' }, localStorage: { getItem: () => null, setItem() {} } });
  assert.deepEqual(win.MF_CARTA_PAYT(CAMP), CAMP); });
console.log(`TOTAL ${n} passed`);

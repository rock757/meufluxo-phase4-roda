// node tests/carta-variante.test.cjs — runs carta-variante.js in a fake browser; no network.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'carta-variante.js'), 'utf8');
function run({ ativo = true, search = '', cookie = '', ls = {}, rand } = {}) {
  const jar = { s: cookie }; const store = Object.assign({}, ls);
  const win = { MF_CONFIG: { splitTeste: { ativo, variantes: ['A', 'B'] } } };
  const ctx = { window: win, location: { search, protocol: 'https:' }, URLSearchParams, Math, RegExp, String, decodeURIComponent, encodeURIComponent,
    document: { get cookie() { return jar.s }, set cookie(v) { const kv = v.split(';')[0]; const k = kv.split('=')[0]; jar.s = jar.s.split('; ').filter(x => x && !x.startsWith(k + '=')).concat(kv).join('; ') } },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v) } },
    crypto: { getRandomValues: a => { a[0] = Math.floor((rand !== undefined ? rand : Math.random()) * 4294967296); return a } } };
  vm.runInNewContext(SRC, ctx); return { ab: win.MF_CARTA, cookie: jar.s, ls: store };
}
let n = 0; const t = (name, f) => { f(); n++; console.log('PASS', name); };
t('off + no param = no variant, nothing stored', () => { const r = run({ ativo: false }); assert.equal(r.ab, null); assert.equal(r.cookie, ''); assert.deepEqual(r.ls, {}); });
t('?carta=b forces B even when off, not persisted', () => { const r = run({ ativo: false, search: '?carta=b' }); assert.deepEqual(r.ab, { variant: 'B', forced: true }); assert.equal(r.cookie, ''); });
t('?carta=x is ignored', () => { const r = run({ ativo: false, search: '?carta=x' }); assert.equal(r.ab, null); });
t('on: new visitor assigned and persisted in cookie + localStorage', () => { const r = run({ rand: 0.7 }); assert.equal(r.ab.variant, 'B'); assert.match(r.cookie, /mf_carta=B/); assert.equal(r.ls.mf_carta, 'B'); });
t('on: returning visitor keeps localStorage variant', () => { const r = run({ rand: 0.9, ls: { mf_carta: 'A' } }); assert.equal(r.ab.variant, 'A'); });
t('on: falls back to cookie when localStorage empty', () => { const r = run({ rand: 0.1, cookie: 'mf_vid=x; mf_carta=B' }); assert.equal(r.ab.variant, 'B'); assert.equal(r.ls.mf_carta, 'B'); });
t('on: forced param wins over stored and does not overwrite it', () => { const r = run({ search: '?carta=A', ls: { mf_carta: 'B' } }); assert.equal(r.ab.variant, 'A'); assert.equal(r.ls.mf_carta, 'B'); });
t('on: ~50/50 over 4000 new visitors', () => { let a = 0; for (let i = 0; i < 4000; i++) if (run({}).ab.variant === 'A') a++; assert.ok(a > 1850 && a < 2150, 'A=' + a); console.log('     A=' + a + ' B=' + (4000 - a)); });
console.log(`TOTAL ${n} passed`);

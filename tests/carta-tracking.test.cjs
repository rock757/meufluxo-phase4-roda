// node tests/carta-tracking.test.cjs — runs carta.js in a fake browser; no network.
// Guards the Nov 12 bug: tapping an area block in the letter (div.cf-area, data-area="<slug>")
// set prio=NaN, and every later data-track click (checkout_click included) threw before it was recorded.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const SRC = { config: R('config.js'), data: R('data.js'), trilha: R('trilha.js'), carta: process.env.CARTA_SRC ? fs.readFileSync(process.env.CARTA_SRC, 'utf8') : R('carta.js') };

function el(tag, dataset = {}) {
  const ls = {};
  const e = { tagName: tag.toUpperCase(), dataset, style: {}, classList: { add() {}, remove() {}, toggle() {} }, innerHTML: '',
    addEventListener: (ev, f) => { (ls[ev] = ls[ev] || []).push(f) },
    getBoundingClientRect: () => ({ top: 9999, bottom: 10999 }),
    fire(ev) { if (ev === 'click' && e.onclick) e.onclick(); (ls[ev] || []).forEach(f => f()) } };
  return e;
}
function matches(e, sel) {
  return sel.split(',').some(part => {
    const m = part.trim().match(/^([a-z]*)\[data-([a-z]+)\]$/); if (!m) return false;
    return (!m[1] || e.tagName === m[1].toUpperCase()) && e.dataset[m[2]] !== undefined;
  });
}
function run(search = '') {
  const tracked = [];
  const areaBlock = el('div', { area: 'proposito' });    // letter block: <div class="cf-area" data-area="proposito">
  const areaButton = el('button', { area: '2' });         // fallback picker: <button data-area="2">
  const checkout = el('a', { track: 'checkout_click' });
  const ctaTop = el('a', { track: 'cta_offer_top' });
  const pool = [areaBlock, areaButton, checkout, ctaTop];
  const byId = { app: el('div'), prog: el('div'), 'oferta-bloco': el('div') };
  const store = {};
  const ctx = {
    location: { search, pathname: '/carta.html', hash: '' }, URLSearchParams, URL, console, setTimeout: () => 0, Event: function () {},
    history: { replaceState() {} }, sessionStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v) } },
    addEventListener() {}, scrollTo() {}, dispatchEvent() {}, innerHeight: 800,
    document: { title: '', documentElement: { scrollTop: 0, scrollHeight: 2000, clientHeight: 800 },
      getElementById: id => byId[id] || null, querySelector: () => null,
      querySelectorAll: sel => pool.filter(e => matches(e, sel)) },
    MF_TRACK: (ev, p) => tracked.push([ev, p])
  };
  ctx.window = ctx; vm.createContext(ctx);
  for (const k of ['config', 'data', 'trilha', 'carta']) vm.runInContext(SRC[k], ctx, { filename: k + '.js' });
  return { tracked, areaBlock, areaButton, checkout, ctaTop };
}
const clicks = (r, ev) => r.tracked.filter(t => t[0] === ev);
let n = 0; const t = (name, f) => { f(); n++; console.log('PASS', name); };

t('checkout click is recorded on a clean visit', () => {
  const r = run(); r.checkout.fire('click'); assert.equal(clicks(r, 'checkout_click').length, 1);
});
t('tapping a letter area block does not break checkout tracking', () => {
  const r = run(); try { r.areaBlock.fire('click') } catch (e) { /* old code threw here */ }
  r.checkout.fire('click'); r.ctaTop.fire('click');
  assert.equal(clicks(r, 'checkout_click').length, 1, 'checkout_click lost after tapping an area block');
  assert.equal(clicks(r, 'cta_offer_top').length, 1);
});
t('tapping a letter area block does not throw and records no bogus priority_pick', () => {
  const r = run(); assert.doesNotThrow(() => r.areaBlock.fire('click')); assert.equal(clicks(r, 'priority_pick').length, 0);
});
t('picker buttons still set the area', () => {
  const r = run(); r.areaButton.fire('click');
  const pick = clicks(r, 'priority_pick'); assert.equal(pick.length, 1); assert.ok(pick[0][1].area);
});
t('prioridade from the URL is passed on checkout_click', () => {
  const r = run('?prioridade=financas'); r.checkout.fire('click');
  assert.equal(clicks(r, 'checkout_click')[0][1].prioridade, 'financas');
});
console.log(`TOTAL ${n} passed`);

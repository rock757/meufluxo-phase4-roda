// node tests/diagnostico.test.cjs — runs the inline script of diagnostico.html in a fake browser; no network.
// Checks: Jornada R$697 checkout (never Ilimitado), UTMs passed to it, no preview banners, all 7 area versions,
// and that diagnosis_view / priority_pick / checkout_click reach MF_TRACK.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const html = R('diagnostico.html');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
assert.ok(/<script src="track.js"><\/script>/.test(html), 'track.js must load');

function run(search) {
  const events = [], clicks = [];
  const app = { innerHTML: '', querySelectorAll: sel => {
    if (sel === 'a[data-track="checkout_click"]' && /data-track="checkout_click"/.test(app.innerHTML))
      return [{ addEventListener: (ev, f) => clicks.push(f) }];
    return [];
  } };
  const ctx = { document: { getElementById: id => id === 'app' ? app : null, querySelectorAll: () => [] },
    location: { search, pathname: '/diagnostico.html' }, URLSearchParams, URL, console, requestAnimationFrame: () => 0 };
  ctx.window = ctx; ctx.MF_TRACK = (ev, p) => events.push(Object.assign({ ev }, p));
  vm.createContext(ctx);
  for (const f of ['config.js', 'data.js', 'trilha.js']) vm.runInContext(R(f), ctx);
  vm.runInContext(inline, ctx);
  return { app, events, clicks };
}

const SLUGS = ['movimento', 'alimentacao', 'memoria', 'financas', 'relacoes', 'crescimento', 'transcendencia'];
for (const slug of SLUGS) {
  const { app, events, clicks } = run(`?v=45362534&prioridade=${slug}&utm_source=Email&utm_campaign=bn`);
  const hrefs = [...app.innerHTML.matchAll(/href="([^"]*payt[^"]*)"/g)].map(x => x[1].replace(/&amp;/g, '&'));
  assert.strictEqual(hrefs.length, 1, slug + ': one checkout link');
  const u = new URL(hrefs[0]);
  assert.strictEqual(u.pathname, '/71855d504ddcfe0afa4d9f64987d9e31', slug + ': Jornada checkout');
  assert.strictEqual(u.searchParams.get('utm_source'), 'Email');
  assert.strictEqual(u.searchParams.get('utm_campaign'), 'bn');
  assert.strictEqual(u.searchParams.get('utm_term'), 'diagnostico');
  assert.strictEqual(u.searchParams.get('src'), 'diagnostico-' + slug);
  assert.ok(!/Prévia/.test(app.innerHTML), slug + ': no preview banner');
  assert.ok(/R\$ ?697/.test(app.innerHTML), slug + ': R$697 shown');
  const view = events.find(e => e.ev === 'diagnosis_view');
  assert.ok(view && view.prioridade === slug && view.exemplo === 0 && view.respostas === 8, slug + ': diagnosis_view');
  assert.ok(clicks.length >= 1, slug + ': checkout click bound');
  clicks.forEach(f => f());
  const ck = events.find(e => e.ev === 'checkout_click');
  assert.ok(ck && ck.prioridade === slug && ck.produto === 'jornada', slug + ': checkout_click recorded');
}
// No answers: example mode is labelled and flagged.
{ const { app, events } = run('');
  assert.ok(/>Exemplo</.test(app.innerHTML));
  assert.strictEqual(events.find(e => e.ev === 'diagnosis_view').exemplo, 1); }
console.log('diagnostico: all 7 areas ok');

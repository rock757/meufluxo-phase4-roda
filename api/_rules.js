// MeuFluxo · Fase 4 — regras de classificação de tráfego (versão v1, 2026-11-06). Um só lugar para ingest e painel.
// Princípio: o dado bruto nunca é alterado; o ingest grava EVIDÊNCIA (bot_reason, test_label, internal_reason),
// e o painel deriva a classe na leitura. Sem evidência, ninguém é chamado de robô.
const RULE_VERSION = 'v1-2026-11-06';
const INGEST_VERSION = 'ingest-v1';
// Evidência de automação no user-agent (nunca guardamos o UA inteiro, só o motivo).
const BOT_UA = /(\bbot\b|[a-z]bot\/|[a-z]bot;|\+https?:|crawl|spider|slurp|headless|phantomjs|selenium|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|python-requests|python-urllib|curl\/|wget\/|node-fetch|undici|axios\/|go-http|okhttp|java\/|libwww|httpclient|facebookexternalhit|preview|monitor|uptime|vercel-screenshot)/i;
function botReason(ua, wd) {
  if (!ua) return 'ua:empty';
  const m = String(ua).match(BOT_UA); if (m) { const w = String(ua).match(/([a-z]*bot)\b/i); const k = /bot/i.test(m[1]) && w ? w[1] : m[1]; return 'ua:' + (k.toLowerCase().replace(/[^a-z-]/g, '') || 'crawler-url'); }
  if (String(wd) === '1') return 'webdriver';
  return null;
}
// Rótulos de teste explícitos: ?mf_test=<nome> (guardado no navegador) ou utm_source de teste.
const TEST_SOURCES = ['prova', 'teste', 'test', 'qa', 'fixture'];
const TEST_EVENTS = ['ping', 'teste_local'];
const cleanLabel = v => String(v || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || null;
// Páginas privadas (equipe): nunca contam como público.
const PRIVATE_PAGES = ['painel', 'overview', 'decidir'];
// Eventos que só acontecem com interação real (clique, toque, tecla, mouse). page_view, leave e scroll automático NÃO contam.
const INTERACTION_EVENTS = ['interact', 'quiz_start', 'answer', 'quiz_done', 'priority_pick', 'cta_letter', 'cta_offer_top', 'cta_offer_hero', 'cta_offer_letter', 'cta_offer_sticky', 'checkout_click', 'faq_open', 'proof_open', 'help_click', 'downsell_click'];
const APPROVED = ['aprovado', 'approved', 'paid', 'pago'];
const REFUNDED = ['reembolsado', 'estornado', 'chargeback', 'refunded', 'cancelado_apos_aprovacao'];
const sqlList = a => a.map(x => "'" + String(x).replace(/'/g, "''") + "'").join(',');
/* ids externos (trck do central = UUID; chave Payt = alfanumérica curta): só [A-Za-z0-9_-], até 64 */
function cleanId(v) { const s = String(v == null ? '' : v).trim(); return /^[A-Za-z0-9_-]{4,64}$/.test(s) ? s : null; }
module.exports = { cleanId, RULE_VERSION, INGEST_VERSION, botReason, TEST_SOURCES, TEST_EVENTS, cleanLabel, PRIVATE_PAGES, INTERACTION_EVENTS, APPROVED, REFUNDED, sqlList };

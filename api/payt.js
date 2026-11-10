// POST /api/payt  ← postback do Payt ("PayT V1"). DESLIGADO por padrão.
// Liga somente com as duas variáveis na Vercel (decisão do Rock; nada disso é configurado por este código):
//   MF_PAYT_POSTBACK_ON=1        liga o recebimento
//   PAYT_INTEGRATION_KEY=...     a "chave única" que o Payt gera ao cadastrar o postback (nunca no repositório)
// O que guarda (tabela payt_eventos, ver db/payt_eventos.sql): id da transação, status, horário de PAGAMENTO (paid_at),
// valor, forma de pagamento, produto e a origem (src + utm_*, carta, prioridade). NÃO guarda nome, e-mail, documento,
// telefone ou endereço do cliente. Eventos de teste do Payt (test=true) não são gravados: a resposta mostra o que seria gravado.
// Campos baseados em documentação de terceiros (não oficial); conferir com um "Testar URL" antes de confiar nos números.
const crypto = require('crypto');
const DB = require('./_db.js');

function readRaw(req) {
  if (req.body !== undefined) return Promise.resolve(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  return new Promise((ok, ko) => { let d = ''; req.on('data', c => { d += c; if (d.length > 200000) { ko(new Error('too-big')); req.destroy(); } }); req.on('end', () => ok(d)); req.on('error', ko); });
}
function parse(raw, ctype) {
  if (/json/i.test(ctype || '') || /^\s*[{[]/.test(raw)) return JSON.parse(raw || '{}');
  const o = {}; new URLSearchParams(raw).forEach((v, k) => { o[k] = v; }); return o;
}
const str = (v, n) => (v === undefined || v === null ? '' : String(v)).slice(0, n || 120);
const iso = v => { if (!v) return null; const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString(); };
function sameKey(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}
function normalize(b) {
  const t = b.transaction || {}, link = b.link || {}, src = link.sources || b.sources || {}, qp = link.query_params || {}, prod = b.product || {};
  const cents = t.total_price !== undefined ? t.total_price : b.total_price;
  return {
    transaction_id: str(b.transaction_id || t.id, 80),
    status: str(b.status, 40),
    payment_status: str(t.payment_status || b.payment_status, 40),
    payment_method: str(t.payment_method || b.payment_method, 20),
    valor: cents === undefined || cents === '' || isNaN(Number(cents)) ? null : Number(cents) / 100,
    paid_at: iso(t.paid_at || b.paid_at),
    created_at: iso(t.created_at || b.started_at || b.created_at),
    updated_at: iso(t.updated_at || b.updated_at) || iso(t.paid_at || b.paid_at) || iso(t.created_at || b.started_at || b.created_at) || '1970-01-01T00:00:00.000Z', // nunca nulo: faz parte da chave anti-duplicata
    product_code: str(prod.code || prod.sku || b.product_code, 60),
    tipo: str(b.type, 30),
    src: str(src.src), utm_source: str(src.utm_source), utm_medium: str(src.utm_medium), utm_campaign: str(src.utm_campaign),
    utm_content: str(src.utm_content), utm_term: str(src.utm_term),
    carta: str(qp.carta, 4), prioridade: str(qp.prioridade, 20)
  };
}
const COLS = ['transaction_id', 'status', 'payment_status', 'payment_method', 'valor', 'paid_at', 'created_at', 'updated_at', 'product_code', 'tipo',
  'src', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'carta', 'prioridade'];
const INSERT = `INSERT INTO payt_eventos (${COLS.join(',')}) VALUES (${COLS.map((_, i) => '$' + (i + 1)).join(',')}) ON CONFLICT (transaction_id, status, payment_status, updated_at) DO NOTHING`;

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const done = (code, reason, extra) => { res.statusCode = code; res.setHeader('x-mf-reason', reason); res.end(JSON.stringify(Object.assign({ ok: code < 300, reason }, extra || {}))); };
  if (process.env.MF_PAYT_POSTBACK_ON !== '1') return done(404, 'disabled');
  if (req.method !== 'POST') return done(405, 'method');
  const key = process.env.PAYT_INTEGRATION_KEY || '';
  if (!key) return done(503, 'key-not-set');
  if (!DB.configured()) return done(503, 'storage-not-configured');
  let b; try { b = parse(await readRaw(req), req.headers && req.headers['content-type']); } catch (e) { return done(400, 'bad-body'); }
  if (!sameKey(b.integration_key, key)) return done(401, 'bad-key');
  if (b.test === true || b.test === 'true' || b.test === 1 || b.test === '1') return done(200, 'test-ignored', { seen: normalize(b) }); // devolve o que SERIA gravado (sem dados do cliente), para conferir pelo 'Testar URL'
  const r = normalize(b);
  if (!r.transaction_id || !r.status) return done(400, 'missing-fields');
  try { await DB.sql(INSERT, COLS.map(c => r[c])); } catch (e) { console.error('payt', e.message); return done(500, 'store-failed'); } // 500 = Payt tenta de novo
  return done(200, 'stored');
}
module.exports = handler;
module.exports.normalize = normalize;
module.exports.INSERT = INSERT;

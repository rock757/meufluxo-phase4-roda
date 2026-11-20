// POST /api/payt  ← postback do Payt ("PayT V1"). Grava cada aviso de venda na tabela compras (Neon), com a origem
// (utm_*, src) e a versão da carta (A/B), para o painel mostrar vendas por e-mail e por carta.
//
// Fica desligado até existir a variável PAYT_INTEGRATION_KEY na Vercel (a "chave de integração" que o Payt mostra ao
// cadastrar o postback; nunca no repositório). Sem ela, responde 503 e não grava nada.
// Antes de ligar, aplicar db/compras_payt.sql no banco meufluxo_fase4 (acrescenta colunas e o índice anti-duplicata).
//
// Privacidade: NÃO grava nome, e-mail, CPF, telefone, IP ou endereço do comprador, nem códigos/links de Pix e boleto.
// A coluna raw guarda o aviso do Payt SEM esses campos (ver redact()).
// Formato dos campos: guia público do postback PayT V1 (github.com/ventuinha/payt-postback, não oficial). Conferir com
// o "Testar URL" do Payt, que manda test=true: esse aviso não é gravado; a resposta mostra o que seria gravado.
const crypto = require('crypto');
const DB = require('./_db.js');

function readRaw(req) {
  if (req.body !== undefined && req.body !== null) return Promise.resolve(typeof req.body === 'string' ? req.body : (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body)));
  return new Promise((ok, ko) => { let d = ''; req.on('data', c => { d += c; if (d.length > 200000) { ko(new Error('too-big')); req.destroy(); } }); req.on('end', () => ok(d)); req.on('error', ko); });
}
function parse(raw, ctype) {
  if (/json/i.test(ctype || '') || /^\s*[{[]/.test(raw)) { const o = JSON.parse(raw || '{}'); if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('not-object'); return o; }
  const o = {}; new URLSearchParams(raw).forEach((v, k) => { o[k] = v; }); return o;
}
const str = (v, n) => (v === undefined || v === null ? '' : String(v)).slice(0, n || 120);
const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
// Datas do Payt vêm como "Y-m-d H:i:s" sem fuso: são horário de Brasília (sem horário de verão desde 2019).
function toIso(v) {
  if (v === undefined || v === null || v === '') return null;
  let s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) s = s.replace(' ', 'T') + '-03:00';
  else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00-03:00';
  const d = new Date(s); return isNaN(d.getTime()) ? null : d.toISOString();
}
function sameKey(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}
// Versão da carta: ?carta= no checkout, senão utm_term "carta-A" ou src "Email-cartaA". Sufixos -rev/-teste ficam
// no valor (ex.: "B-rev"), para nunca contarem como venda do teste A/B.
function cartaDe(qp, s) {
  const direct = str(qp.carta, 4).toUpperCase();
  for (const v of [s.utm_term, s.src]) { const m = /carta-?([A-Z])((?:-(?:rev|teste))*)$/i.exec(str(v)); if (m) return (m[1].toUpperCase() + m[2].toLowerCase()).slice(0, 20); }
  return /^[A-Z]$/.test(direct) ? direct : '';
}
function normalize(b) {
  const t = obj(b.transaction), link = obj(b.link), prod = obj(b.product), qp = obj(link.query_params);
  const s = Object.assign({}, obj(b.sources), obj(link.sources));
  const cents = t.total_price !== undefined ? t.total_price : b.total_price;
  const parcelas = parseInt(t.installments, 10);
  return {
    pedido: str(b.transaction_id || t.id, 80),
    status: str(b.status, 40),
    payment_status: str(t.payment_status || b.payment_status, 40),
    payment_method: str(t.payment_method || b.payment_method, 20),
    tipo: str(b.type, 30),
    valor: cents === undefined || cents === null || cents === '' || isNaN(Number(cents)) ? null : Number(cents) / 100,
    parcelas: isNaN(parcelas) ? null : parcelas,
    produto: str(prod.name, 120),
    produto_codigo: str(prod.code || prod.sku || b.product_code, 60),
    paid_at: toIso(t.paid_at || b.paid_at),
    payt_updated_at: toIso(b.updated_at || t.updated_at),
    src: str(s.src), utm_source: str(s.utm_source), utm_medium: str(s.utm_medium), utm_campaign: str(s.utm_campaign),
    utm_content: str(s.utm_content), utm_term: str(s.utm_term),
    sck: str(qp.sck), xcod: str(qp.xcod), vid: str(qp.vid, 40),
    carta: cartaDe(qp, s), prioridade: str(qp.prioridade, 20)
  };
}
// Cópia do aviso sem dados pessoais nem meios de pagamento.
function redact(b) {
  const c = JSON.parse(JSON.stringify(b || {}));
  delete c.integration_key; delete c.shipping; delete c.commission;
  if (c.customer && typeof c.customer === 'object') c.customer = c.customer.origin ? { origin: c.customer.origin } : {};
  if (c.link && typeof c.link === 'object') {
    delete c.link.seller_email; delete c.link.admin_url;
    if (typeof c.link.url === 'string') c.link.url = c.link.url.split(/[?#]/)[0]; // carrinho abandonado traz o id de recuperação na URL
  }
  if (c.transaction && typeof c.transaction === 'object') ['pix_url', 'pix_code', 'bankslip_url', 'bankslip_code', 'payment_url'].forEach(k => delete c.transaction[k]);
  return c;
}
const COLS = ['pedido', 'status', 'payment_status', 'payment_method', 'tipo', 'valor', 'parcelas', 'produto', 'produto_codigo', 'paid_at', 'payt_updated_at',
  'src', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'sck', 'xcod', 'vid', 'carta', 'prioridade', 'raw'];
// Reenvio do mesmo aviso (mesmo pedido, status e status do pagamento) não duplica.
const INSERT = `INSERT INTO compras (${COLS.join(',')}) VALUES (${COLS.map((c, i) => '$' + (i + 1) + (c === 'raw' ? '::jsonb' : '')).join(',')}) ON CONFLICT (pedido, status, payment_status) DO NOTHING RETURNING id`;

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json');
  const done = (code, reason, extra) => { res.statusCode = code; res.setHeader('x-mf-reason', reason); res.end(JSON.stringify(Object.assign({ ok: code < 300, reason }, extra || {}))); };
  if (req.method !== 'POST') return done(405, 'method');
  const key = process.env.PAYT_INTEGRATION_KEY || '';
  if (!key) return done(503, 'key-not-set');
  if (!DB.configured()) return done(503, 'storage-not-configured');
  let b; try { b = parse(await readRaw(req), req.headers && req.headers['content-type']); } catch (e) { return done(400, 'bad-body'); }
  if (!sameKey(b.integration_key, key)) return done(401, 'bad-key');
  const r = normalize(b);
  if (b.test === true || b.test === 'true' || b.test === 1 || b.test === '1') return done(200, 'test-not-stored', { seen: r });
  if (!r.pedido || !r.status) return done(400, 'missing-fields');
  let rows;
  try { rows = await DB.sql(INSERT, COLS.map(c => (c === 'raw' ? JSON.stringify(redact(b)) : r[c]))); } catch (e) { console.error('payt', e.message); return done(500, 'store-failed'); } // 500 = Payt tenta de novo
  return done(200, rows && rows.length ? 'stored' : 'duplicate');
}
module.exports = handler;
Object.assign(module.exports, { normalize, redact, toIso, cartaDe, INSERT, COLS });

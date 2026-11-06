// POST /api/payt?token=…  (ou cabeçalho x-webhook-token)  ← webhook "PayT V1" cadastrado em app.payt.com.br/admin/postbacks
// DESLIGADO por padrão (PAYT_RECEIVER_ENABLED=1 + PAYT_WEBHOOK_TOKEN). Receptor PARALELO e só de leitura para o painel da Fase 4. A autoridade de venda e o Purchase do pixel continuam no central
// (tracking-meufluxo), que já recebe o webhook do Payt. Este arquivo NUNCA dispara pixel, e-mail, acesso ou boas-vindas.
//  · Guarda o corpo REDIGIDO (sem e-mail, nome, telefone, documento, endereço, cartão, IP) em compras_raw (auditoria/replay) e UMA linha por (pedido, status) em compras (reenvio = ignorado).
//  · Mapeamento de campos = 'payt-v0-unverified' até Évila/Rock confirmarem um exemplo real do Payt; campos não reconhecidos
//    ficam no raw, nunca viram venda. Sem chave de pedido reconhecível → só raw + 202 (visível como 'não mapeado').
//  · Não grava nome, e-mail ou telefone: só o hash SHA-256 do e-mail (para casar com o central se um dia for preciso).
const crypto = require('crypto');
const DB = require('./_db.js');
const R = require('./_rules.js');
const S = require('./_sheets.js');
const MAP_VERSION = 'payt-v0-unverified';
// Dados pessoais NUNCA entram no banco da Fase 4: chaves com estes nomes são trocadas por '[redacted]' em qualquer profundidade.
const PII = /(e-?mail|phone|telefone|celular|whatsapp|\bname\b|nome|first_name|last_name|document|cpf|cnpj|rg\b|address|endere|street|rua|cep|zip|city|cidade|state|estado|neighborhood|bairro|card|cartao|cart[aã]o|\bip\b|ip_address|birth|nasc|password|token|secret)/i;
function redact(v, depth) { depth = depth || 0; if (depth > 8) return '[depth]'; if (Array.isArray(v)) return v.slice(0, 50).map(x => redact(x, depth + 1));
  if (v && typeof v === 'object') { const o = {}; Object.keys(v).slice(0, 80).forEach(k => { o[k] = PII.test(k) ? '[redacted]' : redact(v[k], depth + 1); }); return o; }
  return typeof v === 'string' ? (/@/.test(v) || /(^|[^0-9a-f-])\d[\d .()-]{7,}\d([^0-9a-f-]|$)/i.test(v) && !/^[0-9a-f-]{32,36}$/i.test(v) ? '[redacted]' : v.slice(0, 200)) : v; } // valores: e-mail e sequências longas de dígitos (telefone/CPF/cartão) também saem
const pick = (o, keys) => { for (const k of keys) { const v = k.split('.').reduce((a, p) => (a && a[p] !== undefined ? a[p] : undefined), o); if (v !== undefined && v !== null && v !== '') return v; } return undefined; };
const STATUS_MAP = { approved: 'aprovado', paid: 'aprovado', aprovado: 'aprovado', aprovada: 'aprovado', finalizada: 'aprovado', pago: 'aprovado', completed: 'aprovado',
  waiting_payment: 'pendente', pending: 'pendente', pendente: 'pendente', aguardando: 'pendente', boleto: 'pendente', pix: 'pendente',
  refunded: 'reembolsado', reembolsado: 'reembolsado', estornado: 'reembolsado', chargeback: 'chargeback', chargedback: 'chargeback',
  canceled: 'cancelado', cancelled: 'cancelado', cancelado: 'cancelado', failed: 'recusado', refused: 'recusado', recusado: 'recusado', denied: 'recusado' };
function safeEqual(a, b) { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y); }
function extract(b) {
  const o = (b && typeof b === 'object') ? b : {};
  const key = pick(o, ['transaction_id', 'transaction_key', 'transaction.key', 'transaction', 'transaction_id', 'order_id', 'order.id', 'id', 'pedido', 'codigo', 'code', 'sale.id', 'purchase.transaction']);
  const statusRaw = pick(o, ['status', 'transaction_status', 'order.status', 'purchase.status', 'event', 'evento', 'situacao']);
  const status = statusRaw == null ? null : (STATUS_MAP[String(statusRaw).toLowerCase().trim()] || null);
  const amount = pick(o, ['amount', 'total', 'value', 'valor', 'price', 'order.total', 'purchase.price.value']);
  const product = pick(o, ['product.name', 'product_name', 'produto', 'product', 'offer.name', 'items.0.name']);
  const productId = pick(o, ['product.id', 'product_id', 'product_code', 'offer.id', 'offer_code']);
  const email = pick(o, ['customer.email', 'buyer.email', 'email', 'cliente.email']);
  const tr = o.tracking || o.utm || o.origin || o.params || {};
  const f = k => S.clean(pick(o, [k, 'tracking.' + k, 'utm.' + k, 'origin.' + k, 'params.' + k, 'metadata.' + k, 'custom.' + k]) || tr[k]);
  const sck = f('sck'), xcod = f('xcod'), trck = R.cleanId(f('trck')) || R.cleanId(xcod) || R.cleanId(sck); // o central decora o link com trck=sck=xcod=<id>
  const amountNum = (() => { const n = Number(String(amount == null ? '' : amount).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; })();
  return { key: R.cleanId(key), statusRaw: statusRaw == null ? null : S.clean(statusRaw, 40), status, amount: amountNum, product: S.clean(product, 120), productId: S.clean(productId, 60),
    email_hash: email ? crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex') : null,
    utm: { utm_source: f('utm_source'), utm_medium: f('utm_medium'), utm_campaign: f('utm_campaign'), utm_content: f('utm_content'), utm_term: f('utm_term'), src: f('src'), sck, xcod }, trck,
    currency: S.clean(pick(o, ['currency', 'moeda', 'purchase.price.currency_value']) || 'BRL', 8), installments: Number(pick(o, ['installments', 'parcelas', 'purchase.payment.installments_number'])) || null };
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  if (process.env.PAYT_RECEIVER_ENABLED !== '1') { res.statusCode = 503; res.setHeader('x-mf-reason', 'payt-receiver-disabled'); return res.end(); } // desligado até o mapeamento ser verificado com um exemplo real
  const expected = process.env.PAYT_WEBHOOK_TOKEN;
  const q = new URL(req.url || '/', 'http://x').searchParams;
  const given = (req.headers && req.headers['x-webhook-token']) || q.get('token');
  if (!expected) { res.statusCode = 503; res.setHeader('x-mf-reason', 'payt-token-not-configured'); return res.end(); }
  if (!safeEqual(given, expected)) { res.statusCode = 401; return res.end(); }
  const b = await S.readBody(req, 65536);
  if (!b || typeof b !== 'object') { res.statusCode = 400; return res.end(); }
  if (!DB.configured() || !(await DB.batch2Ready())) { res.statusCode = 503; res.setHeader('x-mf-reason', 'db-or-migration-pending'); return res.end(); }
  const x = extract(b);
  try {
    await DB.insert('compras_raw', { source: 'payt', event_key: x.key, status: x.statusRaw, body: JSON.stringify(redact(b)).slice(0, 65536), note: x.key && x.status ? null : 'unmapped' });
    if (!x.key || !x.status) { res.statusCode = 202; res.setHeader('x-mf-reason', 'unmapped-kept-raw'); return res.end(); }
    const rows = await DB.sql(`INSERT INTO compras (pedido, status, valor, produto, parcelas, vid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, sck, xcod, raw, source, event_id, currency, trck, email_hash, mapping_version)
      VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,$8,$9,$10,$11,$12,$13,$14,'payt',$15,$16,$17,$18,$19) ON CONFLICT (pedido, lower(status), source) WHERE source = 'payt' DO NOTHING RETURNING id`,
      [x.key, x.status, x.amount, x.product || x.productId, x.installments, x.utm.utm_source, x.utm.utm_medium, x.utm.utm_campaign, x.utm.utm_content, x.utm.utm_term, x.utm.src, x.utm.sck, x.utm.xcod,
        JSON.stringify({ status_raw: x.statusRaw, product_id: x.productId, keys: Object.keys(b).slice(0, 40) }), 'pur_' + x.key, x.currency, x.trck, x.email_hash, MAP_VERSION]);
    res.setHeader('x-mf-order', rows && rows.length ? 'new' : 'duplicate'); res.statusCode = 200; res.end('ok');
  } catch (e) { console.error('payt', e.message); res.statusCode = 500; res.end(); }
};
module.exports.extract = extract; module.exports.redact = redact;

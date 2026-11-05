// POST /api/track  ← track.js (sendBeacon). Uma linha por evento na aba "eventos" da planilha.
// Colunas (criar a linha de cabeçalho na planilha):
// ts_iso | ev | vid | sid | page | lang | path | utm_source | utm_medium | utm_campaign | utm_content | utm_term | ref | landing | extra(json)
const S = require('./_sheets.js');
const BASE = ['ev', 'vid', 'sid', 'page', 'lang', 'path', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'ts'];
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const b = await S.readBody(req);
  if (!b || !b.ev) { res.statusCode = 400; return res.end(); }
  if (!S.configured()) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'storage-not-configured'); res.statusCode = 204; return res.end(); } // no-op até configurar as variáveis
  const extra = {}; Object.keys(b).forEach(k => { if (!BASE.includes(k)) extra[k] = b[k]; });
  const row = [new Date(Number(b.ts) || Date.now()).toISOString(), S.clean(b.ev, 40), S.clean(b.vid, 40), S.clean(b.sid, 40), S.clean(b.page, 40), S.clean(b.lang, 5), S.clean(b.path, 120),
    S.clean(b.utm_source), S.clean(b.utm_medium), S.clean(b.utm_campaign), S.clean(b.utm_content), S.clean(b.utm_term), S.clean(b.ref), S.clean(b.landing, 40), S.clean(JSON.stringify(extra), 500)];
  try { await S.append('eventos', row); res.setHeader('x-mf-stored', '1'); res.statusCode = 204; } catch (e) { console.error('track', e.message); res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'append-failed'); res.statusCode = 202; }
  res.end();
};

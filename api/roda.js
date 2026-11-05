// POST /api/roda  ← quiz.js (ao escolher a área e ao clicar para a carta). Uma linha por envio na aba "roda".
// Colunas (criar a linha de cabeçalho na planilha):
// ts_iso | vid | sid | lang | q1..q8 (dias 0-7, x = não soube dizer) | prioridade | ordem | g | r | utm_source | utm_medium | utm_campaign | utm_content | utm_term | ref
// Sem nome, sem e-mail, sem telefone: só a autoavaliação e a origem. O vid liga as linhas da mesma pessoa (cookie de 1 ano).
const S = require('./_sheets.js');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const b = await S.readBody(req);
  const vals = String(b.vals || '');
  if (!/^[0-7x]{8}$/.test(vals)) { res.statusCode = 400; return res.end(); }
  if (!S.configured()) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'storage-not-configured'); res.statusCode = 204; return res.end(); }
  const row = [new Date(Number(b.ts) || Date.now()).toISOString(), S.clean(b.vid, 40), S.clean(b.sid, 40), S.clean(b.lang, 5), ...vals.split(''),
    S.clean(b.prioridade, 20), S.clean(b.ordem, 16), S.clean(b.g, 2), S.clean(b.r, 2),
    S.clean(b.utm_source), S.clean(b.utm_medium), S.clean(b.utm_campaign), S.clean(b.utm_content), S.clean(b.utm_term), S.clean(b.ref)];
  try { await S.append('roda', row); res.setHeader('x-mf-stored', '1'); res.statusCode = 204; } catch (e) { console.error('roda', e.message); res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'append-failed'); res.statusCode = 202; }
  res.end();
};

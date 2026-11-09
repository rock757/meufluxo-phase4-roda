// POST /api/roda  ← quiz.js (ao escolher a área e ao clicar para a carta). Uma linha por envio na aba "roda".
// Colunas (criar a linha de cabeçalho na planilha):
// ts_iso | vid | sid | lang | q1..q8 (dias 0-7, x = não soube dizer) | prioridade | ordem | g | r | utm_source | utm_medium | utm_campaign | utm_content | utm_term | ref
// Sem nome, sem e-mail, sem telefone: só a autoavaliação e a origem. O vid liga as linhas da mesma pessoa (cookie de 1 ano).
const S = require('./_sheets.js');
const DB = require('./_db.js');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const b = await S.readBody(req);
  // Defense in depth for explicitly marked tests/staff: never append them to campaign storage.
  if (b && (b.test || b.internal)) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'excluded-test-or-staff'); res.statusCode = 204; return res.end(); }
  const vals = String(b.vals || '');
  if (!/^[0-7x]{8}$/.test(vals)) { res.statusCode = 400; return res.end(); }
  if (!DB.configured() && !S.configured()) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'storage-not-configured'); res.statusCode = 204; return res.end(); }
  const row = [new Date(Number(b.ts) || Date.now()).toISOString(), S.clean(b.vid, 40), S.clean(b.sid, 40), S.clean(b.lang, 5), ...vals.split(''),
    S.clean(b.prioridade, 20), S.clean(b.ordem, 16), S.clean(b.g, 2), S.clean(b.r, 2),
    S.clean(b.utm_source), S.clean(b.utm_medium), S.clean(b.utm_campaign), S.clean(b.utm_content), S.clean(b.utm_term), S.clean(b.ref)];
  try { if (DB.configured()) { const q = vals.split(''); await DB.insert('roda', { ts: row[0], vid: row[1], sid: row[2], lang: row[3], q1: q[0], q2: q[1], q3: q[2], q4: q[3], q5: q[4], q6: q[5], q7: q[6], q8: q[7], prioridade: row[12], ordem: row[13], g: row[14], r: row[15], utm_source: row[16], utm_medium: row[17], utm_campaign: row[18], utm_content: row[19], utm_term: row[20], ref: row[21] }); } else await S.append('roda', row); res.setHeader('x-mf-stored', '1'); res.statusCode = 204; } catch (e) { console.error('roda', e.message); res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'append-failed'); res.statusCode = 202; }
  res.end();
};

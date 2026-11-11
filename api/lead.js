// POST /api/lead  ← quiz.js (tela de resultado), quando a pessoa deixa o e-mail para receber a jornada recomendada.
// Guarda: e-mail, resultado da Roda (respostas, áreas mais alta e mais baixa), origem (UTMs/src/ref), carta e horário.
// NÃO envia e-mail e não fala com nenhuma ferramenta de e-mail: só guarda, para uma consulta futura
// (ex.: quem deixou o e-mail e não comprou o Ilimitado 5 anos).
// Armazenamento: Neon (tabela leads, criada aqui se não existir) ou, sem Neon, a aba "leads" da planilha.
// Colunas da aba (criar o cabeçalho): ts_iso | email | consent | vid | sid | lang | vals | alto | baixo | carta | utm_source | utm_medium | utm_campaign | utm_content | utm_term | src | ref | path
const S = require('./_sheets.js');
const DB = require('./_db.js');

const EMAIL = /^[^\s@<>"',;]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
const CONSENT = 'v1-2026-11-10'; // versão do texto de consentimento mostrado na tela

const TABLE = `CREATE TABLE IF NOT EXISTS leads (
  id bigserial PRIMARY KEY, ts timestamptz NOT NULL, email text NOT NULL, consent text NOT NULL,
  vid text, sid text, lang text, vals text, alto text, baixo text, carta text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text, src text, ref text, path text)`;
let tableReady = false;

function cleanEmail(v) { const e = String(v || '').trim().toLowerCase(); return EMAIL.test(e) && e.length <= 200 ? e : ''; }

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const b = await S.readBody(req);
  if (b && (b.test || b.internal)) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'excluded-test-or-staff'); res.statusCode = 204; return res.end(); }
  const email = cleanEmail(b && b.email);
  if (!email || !(b && b.consent === CONSENT)) { res.statusCode = 400; return res.end(); }
  const vals = /^[0-7x]{8}$/.test(String(b.vals || '')) ? String(b.vals) : '';
  if (!DB.configured() && !S.configured()) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'storage-not-configured'); res.statusCode = 204; return res.end(); }
  const rec = {
    ts: new Date(Number(b.ts) || Date.now()).toISOString(), email, consent: CONSENT,
    vid: S.clean(b.vid, 40), sid: S.clean(b.sid, 40), lang: S.clean(b.lang, 5), vals,
    // empates: áreas unidas por '+', até as 8
    alto: S.clean(b.alto, 200), baixo: S.clean(b.baixo, 200), carta: S.clean(b.carta, 2),
    utm_source: S.clean(b.utm_source), utm_medium: S.clean(b.utm_medium), utm_campaign: S.clean(b.utm_campaign),
    utm_content: S.clean(b.utm_content), utm_term: S.clean(b.utm_term), src: S.clean(b.src), ref: S.clean(b.ref), path: S.clean(b.path, 120),
  };
  try {
    if (DB.configured()) {
      if (!tableReady) { await DB.sql(TABLE); tableReady = true; }
      await DB.insert('leads', rec);
    } else await S.append('leads', Object.values(rec));
    res.setHeader('x-mf-stored', '1'); res.statusCode = 204;
  } catch (e) { console.error('lead', e.message); res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'append-failed'); res.statusCode = 202; } // nunca registra o e-mail no log
  res.end();
}
module.exports = handler;
module.exports.CONSENT = CONSENT;
module.exports.cleanEmail = cleanEmail;

// POST /api/track  ← track.js (sendBeacon). Uma linha por evento na tabela "eventos" (Neon); planilha só como reserva.
// Batch 1 (2026-11-06): o servidor grava a hora em que RECEBEU o evento (received_at, padrão do banco) e guarda a hora do
// navegador só se for plausível (occurred_at). Grava também a EVIDÊNCIA de tráfego: robô (user-agent/webdriver), teste
// (rótulo explícito) e interno (páginas privadas / navegador da equipe). Não grava o user-agent inteiro.
const S = require('./_sheets.js');
const DB = require('./_db.js');
const R = require('./_rules.js');
const BASE = ['ev', 'vid', 'sid', 'page', 'lang', 'path', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'ts', 'test', 'internal', 'wd', 'trck'];
const EV_OK = /^[a-z][a-z0-9_]{1,39}$/;
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const b = await S.readBody(req);
  if (!b || !b.ev || !EV_OK.test(String(b.ev))) { res.statusCode = 400; return res.end(); }
  if (!DB.configured() && !S.configured()) { res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'storage-not-configured'); res.statusCode = 204; return res.end(); }
  const now = Date.now();
  const clientTs = Number(b.ts);
  const plausible = Number.isFinite(clientTs) && clientTs > now - 24 * 3600e3 && clientTs < now + 5 * 60e3;
  const extra = {}; Object.keys(b).forEach(k => { if (!BASE.includes(k)) extra[k] = b[k]; });
  const page = S.clean(b.page, 40);
  const utmSource = S.clean(b.utm_source);
  const testLabel = R.cleanLabel(b.test) || (R.TEST_SOURCES.includes(String(utmSource).toLowerCase()) ? 'utm_source=' + String(utmSource).toLowerCase() : null) || (R.TEST_EVENTS.includes(b.ev) ? 'ev=' + b.ev : null);
  const internal = R.cleanLabel(b.internal) ? 'browser:' + R.cleanLabel(b.internal) : (R.PRIVATE_PAGES.includes(page) ? 'page=' + page : null);
  const bot = R.botReason(req.headers && req.headers['user-agent'], b.wd);
  const legacy = { ts: new Date(Number.isFinite(clientTs) ? clientTs : now).toISOString(), ev: S.clean(b.ev, 40), vid: S.clean(b.vid, 40), sid: S.clean(b.sid, 40), page, lang: S.clean(b.lang, 5), path: S.clean(b.path, 120),
    utm_source: utmSource, utm_medium: S.clean(b.utm_medium), utm_campaign: S.clean(b.utm_campaign), utm_content: S.clean(b.utm_content), utm_term: S.clean(b.utm_term), ref: S.clean(b.ref), landing: S.clean(b.landing, 40), extra: (() => { const j = JSON.stringify(extra); return j.length <= 500 ? S.clean(j, 500) : JSON.stringify({ truncated: true, keys: Object.keys(extra).slice(0, 10) }); })() };
  try {
    if (DB.configured()) {
      if (await DB.batch1Ready()) {
        await DB.insert('eventos', Object.assign(legacy, { occurred_at: plausible ? new Date(clientTs).toISOString() : null, ts_flag: plausible ? null : (Number.isFinite(clientTs) ? 'client_ts_out_of_range' : 'client_ts_missing'),
          bot_reason: bot, test_label: testLabel, internal_reason: internal, ingest_version: R.INGEST_VERSION }, (await DB.batch2Ready()) ? { trck: R.cleanId(b.trck) } : {})); // received_at = now() no banco
        res.setHeader('x-mf-class-evidence', [testLabel && 'test', internal && 'internal', bot && 'bot'].filter(Boolean).join(',') || 'none');
      } else { await DB.insert('eventos', legacy); res.setHeader('x-mf-reason', 'batch1-migration-pending'); }
    } else {
      await S.append('eventos', [legacy.ts, legacy.ev, legacy.vid, legacy.sid, legacy.page, legacy.lang, legacy.path, legacy.utm_source, legacy.utm_medium, legacy.utm_campaign, legacy.utm_content, legacy.utm_term, legacy.ref, legacy.landing, legacy.extra]);
    }
    res.setHeader('x-mf-stored', '1'); res.statusCode = 204;
  } catch (e) { console.error('track', e.message); res.setHeader('x-mf-stored', '0'); res.setHeader('x-mf-reason', 'append-failed'); res.statusCode = 202; }
  res.end();
};

// GET /api/stats  → funil agregado para o painel (painel.html). Lê a aba "eventos" da planilha.
// Responde {configured:false} enquanto as variáveis não existirem (o painel mostra os dados de demonstração).
const S = require('./_sheets.js');
const DB = require('./_db.js');
// Janela de relatório (não destrutiva): MF_REPORTING_START_AT = instante ISO com fuso (ex.: 2026-11-10T09:00:00-03:00).
// Vazia = todo o histórico. Nada é apagado: só os agregados contam a partir do corte (inclusivo).
// Início da campanha escolhido por Rock (2026-11-09 21:07 BRT): 10/11/2026 às 18:00 BRT. A variável na Vercel, se existir,
// tem prioridade; MF_REPORTING_START_AT=all mostra todo o histórico.
const CAMPAIGN_START = '2026-11-10T18:00:00-03:00';
function startSetting(env) { const v = String(env == null ? '' : env).trim(); return v === '' ? CAMPAIGN_START : (v.toLowerCase() === 'all' ? '' : v); }
function reportingWindow(raw) {
  const v = String(raw || '').trim();
  if (!v) return { ok: true, start: null };
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v)) return { ok: false };
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;
  const d = new Date(v); if (isNaN(d.getTime())) return { ok: false };
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;
  const label = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(d) + ' (BRT)';
  return { ok: true, start: d.toISOString(), label };
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // Privado: exige PAINEL_KEY (Vercel env) igual ao parâmetro k. Sem PAINEL_KEY definida, nunca devolve dados reais.
  const key = process.env.PAINEL_KEY || '';
  const q = new URL(req.url, 'http://x').searchParams;
  if (!DB.configured() && !S.configured()) return res.end(JSON.stringify({ configured: false, reason: 'storage-not-configured' }));
  if (!key) return res.end(JSON.stringify({ configured: true, locked: true, reason: 'PAINEL_KEY-not-set' }));
  if (q.get('k') !== key) { res.statusCode = 403; return res.end(JSON.stringify({ configured: true, locked: true, reason: 'bad-key' })); }
  const win = reportingWindow(startSetting(process.env.MF_REPORTING_START_AT));
  if (!win.ok) { res.statusCode = 500; return res.end(JSON.stringify({ configured: true, error: 'MF_REPORTING_START_AT inválida (use ISO com fuso, ex.: 2026-11-10T09:00:00-03:00)' })); }
  const windowInfo = { start: win.start, label: win.start ? win.label : null, tz: 'America/Sao_Paulo' };
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;
  if (DB.configured()) {
    try {
      const P = win.start ? [win.start] : [];
      const W = win.start ? ' ts >= $1::timestamptz' : '';           // corte inclusivo
      const where = extra => (W || extra) ? ' WHERE' + [W, extra].filter(Boolean).join(' AND') : '';
      const [tot] = await DB.sql("SELECT count(*)::int AS rows, count(distinct vid)::int AS visitors, count(distinct sid)::int AS sessions FROM eventos" + where(''), P);
      const ev = {}, unique = {}; (await DB.sql("SELECT ev, count(*)::int AS n, count(distinct vid)::int AS u FROM eventos" + where('') + " GROUP BY ev", P)).forEach(r => { ev[r.ev] = r.n; unique[r.ev] = r.u; });
      const pages = {}; (await DB.sql("SELECT page, count(*)::int AS n FROM eventos" + where(" ev='page_view'") + " GROUP BY page", P)).forEach(r => pages[r.page || '?'] = r.n);
      const sources = {}; (await DB.sql("SELECT coalesce(nullif(utm_source,''),'(direto)') AS s, count(*)::int AS n FROM eventos" + where(" ev='page_view'") + " GROUP BY 1", P)).forEach(r => sources[r.s] = r.n);
      const depth = {}; (await DB.sql("SELECT page, (extra->>'depth') AS d, count(*)::int AS n FROM eventos" + where(" ev='scroll'") + " GROUP BY 1,2", P)).forEach(r => depth[(r.page || '?') + ':' + r.d] = r.n);
      const days = {}; (await DB.sql("SELECT to_char(ts AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS d, count(*)::int AS n FROM eventos" + where(" ev='page_view'") + " GROUP BY 1 ORDER BY 1", P)).forEach(r => days[r.d] = r.n);
      const [rd] = await DB.sql("SELECT count(*)::int AS n FROM roda" + where(''), P);
      // Teste A/B da carta: visitantes únicos por versão nas etapas da carta (visitas forçadas por ?carta= ficam de fora).
      const ab = {}; (await DB.sql("SELECT extra->>'carta' AS c, ev, count(distinct vid)::int AS u FROM eventos" + where(" ev IN ('letter_view','offer_view','checkout_click') AND extra->>'carta' IN ('A','B') AND coalesce(extra->>'carta_forcada','0') <> '1'") + " GROUP BY 1,2", P)).forEach(r => { (ab[r.c] = ab[r.c] || {})[r.ev] = r.u; });
      // Compras/receita: com janela ativa ficam indisponíveis (null), não zero. O horário gravado pode ser o de recebimento,
      // não o de aprovação do pagamento; só contar depois de confirmar essa semântica com o Payt.
      let compras = null, receita = null;
      if (!win.start) { const [cp] = await DB.sql("SELECT count(*)::int AS n, coalesce(sum(valor),0)::float AS total FROM compras WHERE status='aprovado'"); compras = cp.n; receita = cp.total; }
      return res.end(JSON.stringify({ configured: true, source: 'neon', window: windowInfo, ab, visitors: tot.visitors, sessions: tot.sessions, pages, sources, events: ev, unique, depth, days, rows: tot.rows, rodas: rd.n, compras, receita, comprasNota: win.start ? 'indisponível na janela: horário de aprovação ainda não verificado' : undefined }));
    } catch (e) { res.statusCode = 500; return res.end(JSON.stringify({ configured: true, error: e.message })); }
  }
  try {
    const rows = await S.readTab('eventos', 'A:O');
    const head = rows[0] || []; const ix = n => head.indexOf(n);
    const iEv = ix('ev'), iVid = ix('vid'), iSid = ix('sid'), iPage = ix('page'), iSrc = ix('utm_source'), iExtra = ix('extra(json)') >= 0 ? ix('extra(json)') : 14;
    const vis = new Set(), ses = new Set(), by = {}, src = {}, depth = {}, days = {};
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;
    const ev = {}; const uniq = {}; // por evento: total e visitantes únicos
    const cut = win.start ? Date.parse(win.start) : null;
    const abSets = {};
    rows.slice(1).forEach(r => {
      const e = r[iEv], v = r[iVid]; if (!e) return;
      if (cut !== null) { const t = Date.parse(r[0] || ''); if (isNaN(t) || t < cut) return; } // corte inclusivo; sem data = fora da janela
      vis.add(v); ses.add(r[iSid]);
      ev[e] = (ev[e] || 0) + 1; (uniq[e] = uniq[e] || new Set()).add(v);
      if (e === 'page_view') { const p = r[iPage] || '?'; by[p] = (by[p] || 0) + 1; const s = r[iSrc] || '(direto)'; src[s] = (src[s] || 0) + 1; const d = (r[0] || '').slice(0, 10); days[d] = (days[d] || 0) + 1; }
      if (['letter_view', 'offer_view', 'checkout_click'].includes(e)) { try { const x = JSON.parse(r[iExtra] || '{}'); if ((x.carta === 'A' || x.carta === 'B') && String(x.carta_forcada || '0') !== '1') { const k = x.carta + ':' + e; (abSets[k] = abSets[k] || new Set()).add(v); } } catch (x) {} }
      if (e === 'scroll') { try { const x = JSON.parse(r[iExtra] || '{}'); const k = (r[iPage] || '?') + ':' + x.depth; depth[k] = (depth[k] || 0) + 1; } catch (x) {} }
    });
    const u = {}; Object.keys(uniq).forEach(k => u[k] = uniq[k].size);
    const ab = {}; Object.keys(abSets).forEach(k => { const [c, e] = k.split(':'); (ab[c] = ab[c] || {})[e] = abSets[k].size; });
    res.end(JSON.stringify({ configured: true, source: 'sheets', window: windowInfo, ab, visitors: vis.size, sessions: ses.size, pages: by, sources: src, events: ev, unique: u, depth, days, rows: cut === null ? rows.length - 1 : [...Object.values(ev)].reduce((a, b) => a + b, 0) }));
  } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ configured: true, error: e.message })); }
};
module.exports.reportingWindow = reportingWindow;
module.exports.startSetting = startSetting;
module.exports.CAMPAIGN_START = CAMPAIGN_START;

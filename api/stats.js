// GET /api/stats  → funil agregado para o painel (painel.html). Lê a aba "eventos" da planilha.
// Responde {configured:false} enquanto as variáveis não existirem (o painel mostra os dados de demonstração).
const S = require('./_sheets.js');
const DB = require('./_db.js');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // Privado: exige PAINEL_KEY (Vercel env) igual ao parâmetro k. Sem PAINEL_KEY definida, nunca devolve dados reais.
  const key = process.env.PAINEL_KEY || '';
  const q = new URL(req.url, 'http://x').searchParams;
  if (!DB.configured() && !S.configured()) return res.end(JSON.stringify({ configured: false, reason: 'storage-not-configured' }));
  if (!key) return res.end(JSON.stringify({ configured: true, locked: true, reason: 'PAINEL_KEY-not-set' }));
  if (q.get('k') !== key) { res.statusCode = 403; return res.end(JSON.stringify({ configured: true, locked: true, reason: 'bad-key' })); }
  if (DB.configured()) {
    try {
      const [tot] = await DB.sql("SELECT count(*)::int AS rows, count(distinct vid)::int AS visitors, count(distinct sid)::int AS sessions FROM eventos");
      const ev = {}, unique = {}; (await DB.sql("SELECT ev, count(*)::int AS n, count(distinct vid)::int AS u FROM eventos GROUP BY ev")).forEach(r => { ev[r.ev] = r.n; unique[r.ev] = r.u; });
      const pages = {}; (await DB.sql("SELECT page, count(*)::int AS n FROM eventos WHERE ev='page_view' GROUP BY page")).forEach(r => pages[r.page || '?'] = r.n);
      const sources = {}; (await DB.sql("SELECT coalesce(nullif(utm_source,''),'(direto)') AS s, count(*)::int AS n FROM eventos WHERE ev='page_view' GROUP BY 1")).forEach(r => sources[r.s] = r.n);
      const depth = {}; (await DB.sql("SELECT page, (extra->>'depth') AS d, count(*)::int AS n FROM eventos WHERE ev='scroll' GROUP BY 1,2")).forEach(r => depth[(r.page || '?') + ':' + r.d] = r.n);
      const days = {}; (await DB.sql("SELECT to_char(ts AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS d, count(*)::int AS n FROM eventos WHERE ev='page_view' GROUP BY 1 ORDER BY 1")).forEach(r => days[r.d] = r.n);
      const [rd] = await DB.sql("SELECT count(*)::int AS n FROM roda"); const [cp] = await DB.sql("SELECT count(*)::int AS n, coalesce(sum(valor),0)::float AS total FROM compras WHERE status='aprovado'");
      return res.end(JSON.stringify({ configured: true, source: 'neon', visitors: tot.visitors, sessions: tot.sessions, pages, sources, events: ev, unique, depth, days, rows: tot.rows, rodas: rd.n, compras: cp.n, receita: cp.total }));
    } catch (e) { res.statusCode = 500; return res.end(JSON.stringify({ configured: true, error: e.message })); }
  }
  try {
    const rows = await S.readTab('eventos', 'A:O');
    const head = rows[0] || []; const ix = n => head.indexOf(n);
    const iEv = ix('ev'), iVid = ix('vid'), iSid = ix('sid'), iPage = ix('page'), iSrc = ix('utm_source'), iExtra = ix('extra(json)') >= 0 ? ix('extra(json)') : 14;
    const vis = new Set(), ses = new Set(), by = {}, src = {}, depth = {}, days = {};
    const ev = {}; const uniq = {}; // por evento: total e visitantes únicos
    rows.slice(1).forEach(r => {
      const e = r[iEv], v = r[iVid]; if (!e) return;
      vis.add(v); ses.add(r[iSid]);
      ev[e] = (ev[e] || 0) + 1; (uniq[e] = uniq[e] || new Set()).add(v);
      if (e === 'page_view') { const p = r[iPage] || '?'; by[p] = (by[p] || 0) + 1; const s = r[iSrc] || '(direto)'; src[s] = (src[s] || 0) + 1; const d = (r[0] || '').slice(0, 10); days[d] = (days[d] || 0) + 1; }
      if (e === 'scroll') { try { const x = JSON.parse(r[iExtra] || '{}'); const k = (r[iPage] || '?') + ':' + x.depth; depth[k] = (depth[k] || 0) + 1; } catch (x) {} }
    });
    const u = {}; Object.keys(uniq).forEach(k => u[k] = uniq[k].size);
    res.end(JSON.stringify({ configured: true, visitors: vis.size, sessions: ses.size, pages: by, sources: src, events: ev, unique: u, depth, days, rows: rows.length - 1 }));
  } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ configured: true, error: e.message })); }
};

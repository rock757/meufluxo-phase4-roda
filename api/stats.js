// GET /api/stats  → funil agregado para o painel (painel.html). Lê a aba "eventos" da planilha.
// Responde {configured:false} enquanto as variáveis não existirem (o painel mostra os dados de demonstração).
const S = require('./_sheets.js');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!S.configured()) return res.end(JSON.stringify({ configured: false }));
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

// GET /api/stats?k=<PAINEL_KEY>&from=YYYY-MM-DD&to=YYYY-MM-DD  → painel.html
// Batch 1 (2026-11-06): a taxa de conversão usa a COORTE ELEGÍVEL, não o tráfego bruto.
//  · Cada identidade de navegador (vid) com evento no período recebe UMA classe, por evidência, nesta ordem:
//    teste (rótulo explícito) > equipe (páginas privadas / navegador da equipe) > robô (user-agent / webdriver)
//    > histórico (só linhas de antes da medição limpa, sem evidência) > elegível (visitou e interagiu de verdade)
//    > desconhecido (visitou, sem interação nem evidência). Nada é apagado: o bruto continua disponível.
//  · Numerador = pedidos APROVADOS e verificados (tabela compras), um por pedido, reembolsos à parte,
//    no mesmo período e ligados à mesma coorte. Pedidos sem visita ligada aparecem como "não atribuídos".
//  · Datas: received_at (hora do servidor), dias no fuso America/Sao_Paulo. Linhas antigas usam ts e ficam marcadas.
const S = require('./_sheets.js');
const DB = require('./_db.js');
const R = require('./_rules.js');
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const L = R.sqlList;
const CTE = `WITH w AS (SELECT (($1::date)::timestamp AT TIME ZONE 'America/Sao_Paulo') AS a, ((($2::date)+1)::timestamp AT TIME ZONE 'America/Sao_Paulo') AS b),
ev AS (
  SELECT e.vid, e.sid, e.ev, e.page, e.utm_source, e.extra, e.ingest_version, coalesce(e.received_at, e.ts) AS t,
    CASE WHEN e.test_label IS NOT NULL THEN e.test_label
         WHEN lower(coalesce(e.utm_source,'')) IN (${L(R.TEST_SOURCES)}) THEN 'utm_source=' || lower(e.utm_source)
         WHEN e.ev IN (${L(R.TEST_EVENTS)}) THEN 'ev=' || e.ev END AS test_r,
    CASE WHEN e.internal_reason IS NOT NULL THEN e.internal_reason WHEN e.page IN (${L(R.PRIVATE_PAGES)}) THEN 'page=' || e.page END AS int_r,
    e.bot_reason AS bot_r
  FROM eventos e, w
  WHERE coalesce(e.received_at, e.ts) >= w.a AND coalesce(e.received_at, e.ts) < w.b AND nullif(e.vid,'') IS NOT NULL),
ids AS (
  SELECT vid, min(test_r) AS test_r, min(int_r) AS int_r, min(bot_r) AS bot_r,
    bool_or(ingest_version IS NOT NULL) AS has_v1, bool_or(ev = 'page_view') AS pv,
    bool_or(ev IN (${L(R.INTERACTION_EVENTS)})) AS inter,
    bool_or(ev = 'quiz_start') AS s1, bool_or(ev = 'quiz_done') AS s2, bool_or(ev = 'letter_view') AS s3, bool_or(ev = 'offer_view') AS s4, bool_or(ev = 'checkout_click') AS s5,
    (array_agg(nullif(utm_source,'') ORDER BY t) FILTER (WHERE ev = 'page_view' AND nullif(utm_source,'') IS NOT NULL))[1] AS src
  FROM ev GROUP BY vid),
cls AS (
  SELECT ids.*,
    CASE WHEN test_r IS NOT NULL THEN 'test' WHEN int_r IS NOT NULL THEN 'internal' WHEN bot_r IS NOT NULL THEN 'bot'
         WHEN NOT has_v1 THEN 'historical' WHEN pv AND inter THEN 'eligible' WHEN pv THEN 'unknown' ELSE 'no_pageview' END AS cohort,
    coalesce('teste: ' || test_r, 'equipe: ' || int_r, 'robô: ' || bot_r) AS reason
  FROM ids)`;
const n = v => Number(v) || 0;
const rate = (a, b) => b > 0 ? a / b : null;
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const key = process.env.PAINEL_KEY || '';
  const q = new URL(req.url, 'http://x').searchParams;
  if (!DB.configured() && !S.configured()) return res.end(JSON.stringify({ configured: false, reason: 'storage-not-configured' }));
  if (!key) return res.end(JSON.stringify({ configured: true, locked: true, reason: 'PAINEL_KEY-not-set' }));
  if (q.get('k') !== key) { res.statusCode = 403; return res.end(JSON.stringify({ configured: true, locked: true, reason: 'bad-key' })); }
  if (!DB.configured()) return res.end(JSON.stringify({ configured: true, error: 'cohort metrics need the database (Neon)' }));
  try {
    if (!(await DB.batch1Ready())) return res.end(JSON.stringify({ configured: true, needs_migration: true, reason: 'batch1-migration-pending' }));
    const b2 = await DB.batch2Ready(); // Batch 2: venda sem vid casa pelo id central (trck) gravado nos eventos
    const trckJoin = b2 ? "nullif(c.trck,'') IS NOT NULL AND e.trck = c.trck AND nullif(e.vid,'') IS NOT NULL" : 'false';
    const [meta] = await DB.sql(`SELECT to_char(min(received_at) FILTER (WHERE ingest_version IS NOT NULL) AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD HH24:MI') AS clean_start,
      to_char(min(received_at) FILTER (WHERE ingest_version IS NOT NULL) AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS clean_day,
      count(*) FILTER (WHERE ingest_version IS NULL)::int AS historical_rows, count(*)::int AS total_rows,
      to_char(now() AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS today FROM eventos`);
    const from = DAY.test(q.get('from') || '') ? q.get('from') : (meta.clean_day || meta.today);
    const to = DAY.test(q.get('to') || '') ? q.get('to') : meta.today;
    const P = [from, to];
    const [cohorts, reasons, [fun], sources, days, depth, [raw], orders, [src]] = await Promise.all([
      DB.sql(`${CTE} SELECT cohort, count(*)::int AS n FROM cls GROUP BY cohort`, P),
      DB.sql(`${CTE} SELECT cohort, reason, count(*)::int AS n FROM cls WHERE reason IS NOT NULL GROUP BY 1,2 ORDER BY 3 DESC LIMIT 30`, P),
      DB.sql(`${CTE} SELECT count(*)::int AS n0, count(*) FILTER (WHERE s1)::int AS n1, count(*) FILTER (WHERE s1 AND s2)::int AS n2, count(*) FILTER (WHERE s1 AND s2 AND s3)::int AS n3,
        count(*) FILTER (WHERE s1 AND s2 AND s3 AND s4)::int AS n4, count(*) FILTER (WHERE s1 AND s2 AND s3 AND s4 AND s5)::int AS n5, count(*) FILTER (WHERE s3 AND NOT s1)::int AS direct_letter FROM cls WHERE cohort = 'eligible'`, P),
      DB.sql(`${CTE} SELECT coalesce(src,'(direto)') AS s, count(*)::int AS n FROM cls WHERE cohort = 'eligible' GROUP BY 1 ORDER BY 2 DESC LIMIT 8`, P),
      DB.sql(`${CTE} SELECT to_char(ev.t AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS d, cls.cohort, count(DISTINCT ev.vid)::int AS n FROM ev JOIN cls USING (vid) WHERE ev.ev = 'page_view' GROUP BY 1,2 ORDER BY 1`, P),
      DB.sql(`${CTE} SELECT (ev.extra->>'depth') AS d, count(DISTINCT ev.vid)::int AS n FROM ev JOIN cls USING (vid) WHERE ev.ev = 'scroll' AND ev.page = 'carta' AND cls.cohort = 'eligible' GROUP BY 1`, P),
      DB.sql(`${CTE} SELECT count(*)::int AS rows, count(DISTINCT vid)::int AS ids, count(DISTINCT vid) FILTER (WHERE ev = 'page_view')::int AS pv_ids, count(DISTINCT sid)::int AS sessions, count(*) FILTER (WHERE ev = 'page_view')::int AS page_views FROM ev`, P),
      DB.sql(`${CTE}, ap AS (
          SELECT c.pedido, coalesce((array_agg(c.vid ORDER BY coalesce(c.received_at, c.ts)) FILTER (WHERE nullif(c.vid,'') IS NOT NULL))[1], (array_agg(tv.vid ORDER BY coalesce(c.received_at, c.ts)) FILTER (WHERE tv.vid IS NOT NULL))[1]) AS vid,
            max(c.valor)::float AS valor, bool_or(c.source = 'fixture') AS fixture, count(*)::int AS deliveries
          FROM compras c CROSS JOIN w LEFT JOIN LATERAL (SELECT e.vid FROM eventos e WHERE ${trckJoin} ORDER BY coalesce(e.received_at, e.ts) DESC LIMIT 1) tv ON true
          WHERE lower(c.status) IN (${L(R.APPROVED)}) AND nullif(c.pedido,'') IS NOT NULL
            AND coalesce(c.received_at, c.ts) >= w.a AND coalesce(c.received_at, c.ts) < w.b GROUP BY c.pedido),
        rf AS (SELECT DISTINCT pedido FROM compras WHERE lower(status) IN (${L(R.REFUNDED)}))
        SELECT ap.valor, ap.fixture, ap.deliveries, (rf.pedido IS NOT NULL) AS refunded, ap.vid AS v,
          CASE WHEN ap.vid IS NULL THEN 'unmatched' ELSE coalesce(cls.cohort, 'no_visit_in_window') END AS attr,
          coalesce(cls.s1 AND cls.s2 AND cls.s3 AND cls.s4 AND cls.s5, false) AS seq
        FROM ap LEFT JOIN rf USING (pedido) LEFT JOIN cls ON cls.vid = ap.vid`, P),
      b2 ? DB.sql(`SELECT count(*) FILTER (WHERE source = 'payt')::int AS payt, count(*) FILTER (WHERE source = 'fixture')::int AS fixture, count(*)::int AS total, (SELECT count(*)::int FROM compras_raw WHERE note = 'unmapped') AS raw_unmapped FROM compras`) : DB.sql(`SELECT count(*) FILTER (WHERE source = 'payt')::int AS payt, count(*) FILTER (WHERE source = 'fixture')::int AS fixture, count(*)::int AS total, 0 AS raw_unmapped FROM compras`)
    ]);
    const C = { eligible: 0, unknown: 0, bot: 0, internal: 0, test: 0, historical: 0, no_pageview: 0 };
    cohorts.forEach(r => { C[r.cohort] = n(r.n); });
    const net = orders.filter(o => !o.refunded);
    const buyers = attr => new Set(net.filter(o => o.attr === attr).map(o => o.v)).size;
    const by = {}; net.forEach(o => { const k = ['test', 'internal', 'bot'].includes(o.attr) ? 'excluded' : o.attr; by[k] = (by[k] || 0) + 1; });
    const pe = buyers('eligible'), pu = buyers('unknown');
    const flags = [];
    if (!meta.clean_start) flags.push('no_clean_data');
    if (n(src.payt) === 0) flags.push(n(src.fixture) > 0 ? 'sales_are_fixture' : 'payt_not_connected');
    if (C.eligible < 30) flags.push('small_sample');
    if (C.unknown > C.eligible) flags.push('unknown_high');
    if (C.historical > 0) flags.push('historical_in_window');
    const out = {
      configured: true, source: 'neon', rule_version: R.RULE_VERSION,
      window: { from, to, tz: 'America/Sao_Paulo' }, clean_start: meta.clean_start, historical_rows_total: meta.historical_rows, rows_total: meta.total_rows,
      cohorts: C, excluded: C.test + C.internal + C.bot,
      reasons: reasons.map(r => ({ cohort: r.cohort, reason: r.reason, n: n(r.n) })),
      funnel: { steps: [n(fun.n0), n(fun.n1), n(fun.n2), n(fun.n3), n(fun.n4), n(fun.n5), new Set(net.filter(o => o.attr === 'eligible' && o.seq).map(o => o.v)).size], direct_letter: n(fun.direct_letter) },
      sales: { verified: net.length, refunded: orders.length - net.length, duplicates_ignored: orders.reduce((a, o) => a + Math.max(0, n(o.deliveries) - 1), 0),
        by_attribution: by, buyers_eligible: pe, buyers_unknown: pu,
        gross: orders.reduce((a, o) => a + n(o.valor), 0), net: net.reduce((a, o) => a + n(o.valor), 0),
        sources: { payt: n(src.payt), fixture: n(src.fixture), total: n(src.total), raw_unmapped: n(src.raw_unmapped) } },
      conversion: {
        definition: 'identidades compradoras ÷ identidades elegíveis (mesmo período, dias BRT)',
        eligible: { num: pe, den: C.eligible, rate: rate(pe, C.eligible) },
        if_unknown_are_people: { num: pe + pu, den: C.eligible + C.unknown, rate: rate(pe + pu, C.eligible + C.unknown) },
        raw: { num: net.length, den: n(raw.pv_ids), rate: rate(net.length, n(raw.pv_ids)), definition: 'pedidos verificados ÷ todas as identidades com visita (inclui testes, equipe e robôs)' },
        reliable: flags.length === 0, flags },
      raw: { rows: n(raw.rows), identities: n(raw.ids), pv_identities: n(raw.pv_ids), sessions: n(raw.sessions), page_views: n(raw.page_views) },
      sources: sources.map(r => ({ s: r.s, n: n(r.n) })),
      days: days.map(r => ({ d: r.d, cohort: r.cohort, n: n(r.n) })),
      depth: Object.fromEntries(depth.map(r => [String(r.d), n(r.n)]))
    };
    res.end(JSON.stringify(out));
  } catch (e) { console.error('stats', e.message); res.statusCode = 500; res.end(JSON.stringify({ configured: true, error: 'stats query failed' })); }
};

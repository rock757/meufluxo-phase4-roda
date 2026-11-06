// MeuFluxo · Fase 4 — Neon Postgres via o endpoint HTTP /sql (sem dependências).
// Variável de ambiente (Vercel): MF_DATABASE_URL = string de conexão do banco meufluxo_fase4 (NUNCA no repositório).
function configured() { return !!process.env.MF_DATABASE_URL; }
async function sql(query, params) {
  const url = process.env.MF_DATABASE_URL; if (!url) return null;
  const host = new URL(url).host;
  const r = await fetch('https://' + host + '/sql', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': url }, body: JSON.stringify({ query, params: params || [] }) });
  if (!r.ok) throw new Error('db ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return (await r.json()).rows || [];
}
async function insert(table, obj) {
  const keys = Object.keys(obj); const vals = keys.map(k => obj[k]);
  const q = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')})`;
  await sql(q, vals); return { ok: true };
}
// Batch 1: a migração 2026-11-06 já foi aplicada? (cache por instância; permite publicar o código antes ou depois da migração)
let migrated = null, checkedAt = 0;
async function batch1Ready() {
  if (migrated === true) return true;
  if (migrated === false && Date.now() - checkedAt < 60000) return false;
  try { const r = await sql("SELECT count(*)::int AS n FROM information_schema.columns WHERE table_name='eventos' AND column_name IN ('received_at','ingest_version','bot_reason')"); migrated = !!(r && r[0] && r[0].n === 3); }
  catch (e) { migrated = false; }
  checkedAt = Date.now(); return migrated;
}
// Batch 2: coluna trck + tabela compras_raw já existem?
let m2 = null, checked2 = 0;
async function batch2Ready() {
  if (m2 === true) return true;
  if (m2 === false && Date.now() - checked2 < 60000) return false;
  try { const r = await sql("SELECT count(*)::int AS n FROM information_schema.columns WHERE (table_name='eventos' AND column_name='trck') OR (table_name='compras' AND column_name='trck') OR (table_name='compras_raw' AND column_name='body')"); m2 = !!(r && r[0] && r[0].n === 3); }
  catch (e) { m2 = false; }
  checked2 = Date.now(); return m2;
}
module.exports = { configured, sql, insert, batch1Ready, batch2Ready };

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
module.exports = { configured, sql, insert };

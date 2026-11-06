-- MeuFluxo Fase 4 · Batch 2 (2026-11-06): central identity (trck) + Payt receiver. ADDITIVE ONLY. Run after the Batch 1 migration.
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS trck text;
CREATE INDEX IF NOT EXISTS eventos_trck ON eventos(trck);
ALTER TABLE compras ADD COLUMN IF NOT EXISTS trck text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS email_hash text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS mapping_version text;
CREATE UNIQUE INDEX IF NOT EXISTS compras_pedido_status_source ON compras(pedido, lower(status), source) WHERE source = 'payt';
-- Raw webhook deliveries, kept verbatim (minus nothing) for audit/replay. Never read by the dashboard directly.
CREATE TABLE IF NOT EXISTS compras_raw (id bigserial primary key, received_at timestamptz not null default now(), source text not null, event_key text, status text, body jsonb, note text);
CREATE INDEX IF NOT EXISTS compras_raw_event_key ON compras_raw(event_key);
-- ROLLBACK: ALTER TABLE eventos DROP COLUMN trck; ALTER TABLE compras DROP COLUMN trck, DROP COLUMN email_hash, DROP COLUMN mapping_version; DROP INDEX compras_pedido_status_source; DROP TABLE compras_raw;

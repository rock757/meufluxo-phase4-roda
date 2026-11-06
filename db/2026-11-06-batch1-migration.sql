-- MeuFluxo Fase 4 · Batch 1 (2026-11-06): server timestamps + traffic evidence. ADDITIVE ONLY.
-- Existing rows are not modified: new columns stay NULL for history (no invented times, no guessed labels).
-- Run once on database meufluxo_fase4, one statement at a time (Neon HTTP runs one statement per call).
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS received_at timestamptz;
ALTER TABLE eventos ALTER COLUMN received_at SET DEFAULT now();
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS occurred_at timestamptz;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ts_flag text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS bot_reason text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS test_label text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS internal_reason text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ingest_version text;
CREATE INDEX IF NOT EXISTS eventos_received_at ON eventos(received_at);
CREATE INDEX IF NOT EXISTS eventos_vid ON eventos(vid);
CREATE INDEX IF NOT EXISTS eventos_ev ON eventos(ev);
ALTER TABLE roda ADD COLUMN IF NOT EXISTS received_at timestamptz;
ALTER TABLE roda ALTER COLUMN received_at SET DEFAULT now();
ALTER TABLE roda ADD COLUMN IF NOT EXISTS bot_reason text;
ALTER TABLE roda ADD COLUMN IF NOT EXISTS test_label text;
ALTER TABLE roda ADD COLUMN IF NOT EXISTS internal_reason text;
ALTER TABLE roda ADD COLUMN IF NOT EXISTS ingest_version text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS received_at timestamptz;
ALTER TABLE compras ALTER COLUMN received_at SET DEFAULT now();
ALTER TABLE compras ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS event_id text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS currency text;
-- ROLLBACK (only if ever needed; drops only the new columns, never the original data):
-- ALTER TABLE eventos DROP COLUMN received_at, DROP COLUMN occurred_at, DROP COLUMN ts_flag, DROP COLUMN bot_reason, DROP COLUMN test_label, DROP COLUMN internal_reason, DROP COLUMN ingest_version;
-- ALTER TABLE roda DROP COLUMN received_at, DROP COLUMN bot_reason, DROP COLUMN test_label, DROP COLUMN internal_reason, DROP COLUMN ingest_version;
-- ALTER TABLE compras DROP COLUMN received_at, DROP COLUMN source, DROP COLUMN event_id, DROP COLUMN currency;

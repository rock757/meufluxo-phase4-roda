-- Tabela do postback do Payt (api/payt.js). NÃO aplicada automaticamente: rodar no banco meufluxo_fase4 só quando o Rock decidir ligar.
-- Um registro por mudança de status. Receita da campanha = status pago com paid_at >= início da campanha (não o horário de chegada).
CREATE TABLE IF NOT EXISTS payt_eventos (
  id bigserial PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),   -- quando chegou aqui (pode ser reenvio)
  transaction_id text NOT NULL,
  status text NOT NULL,
  payment_status text NOT NULL DEFAULT '',
  payment_method text,
  valor numeric(12,2),
  paid_at timestamptz,                              -- quando o pagamento foi aprovado (use este para a campanha)
  created_at timestamptz,
  updated_at timestamptz NOT NULL,                  -- última mudança no Payt (sem ela: paid_at, created_at ou 1970)
  product_code text, tipo text,
  src text, utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  carta text, prioridade text
);
-- Reenvios do mesmo evento não duplicam.
CREATE UNIQUE INDEX IF NOT EXISTS payt_eventos_dedupe ON payt_eventos (transaction_id, status, payment_status, updated_at);

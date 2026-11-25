-- Postback do Payt (api/payt.js) → tabela compras, que já existe vazia no banco meufluxo_fase4.
-- NÃO é aplicado automaticamente. Rodar uma vez no Neon (SQL Editor do projeto, banco meufluxo_fase4) antes de ligar o postback.
-- Pode rodar de novo sem estragar nada (IF NOT EXISTS). Não apaga nem altera dados.
ALTER TABLE compras ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT '';
ALTER TABLE compras ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS tipo text;              -- order, upsell, abandoned-cart...
ALTER TABLE compras ADD COLUMN IF NOT EXISTS produto_codigo text;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS paid_at timestamptz;     -- quando o pagamento foi aprovado (use este, não ts)
ALTER TABLE compras ADD COLUMN IF NOT EXISTS payt_updated_at timestamptz;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS carta text;              -- A, B (ou A-rev / B-teste: revisão e teste, fora da conta)
ALTER TABLE compras ADD COLUMN IF NOT EXISTS prioridade text;
-- Um registro por mudança de status do pedido; reenvios do Payt não duplicam.
CREATE UNIQUE INDEX IF NOT EXISTS compras_payt_dedupe ON compras (pedido, status, payment_status);
CREATE INDEX IF NOT EXISTS compras_paid_at ON compras (paid_at);

ALTER TABLE cotacao_servico ADD COLUMN IF NOT EXISTS valor_pendente NUMERIC(15, 2);
ALTER TABLE cotacao_servico ADD COLUMN IF NOT EXISTS data_vencimento DATE;

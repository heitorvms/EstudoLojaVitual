-- Habilita similaridade trigram do Postgres (idempotente).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice GIN trigram em material_disponivel.descricao para fuzzy match performático.
CREATE INDEX IF NOT EXISTS idx_material_desc_trgm
    ON material_disponivel
    USING gin (descricao gin_trgm_ops);

-- Limpeza Fase 8: preço agora vive em material_preco (por distribuidora).
ALTER TABLE material_disponivel DROP COLUMN IF EXISTS preco_unitario;

ALTER TABLE cotacao_servico ADD COLUMN IF NOT EXISTS endereco VARCHAR(255);

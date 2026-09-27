-- Habilita similaridade trigram do Postgres (idempotente).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice GIN trigram em material_disponivel.descricao para fuzzy match performático.
CREATE INDEX IF NOT EXISTS idx_material_desc_trgm
    ON material_disponivel
    USING gin (descricao gin_trgm_ops);

-- Limpeza Fase 8: preço agora vive em material_preco (por distribuidora).
ALTER TABLE material_disponivel DROP COLUMN IF EXISTS preco_unitario;

ALTER TABLE cotacao_servico ADD COLUMN IF NOT EXISTS endereco VARCHAR(255);

ALTER TABLE configuracao_whatsapp ADD COLUMN IF NOT EXISTS url_wppconnect VARCHAR(255) DEFAULT 'http://localhost:21465';
ALTER TABLE configuracao_whatsapp ADD COLUMN IF NOT EXISTS token_wppconnect TEXT;
ALTER TABLE configuracao_whatsapp ADD COLUMN IF NOT EXISTS nome_sessao VARCHAR(100) DEFAULT 'hsa-serralheria';

CREATE TABLE IF NOT EXISTS whatsapp_envio_log (
    id BIGSERIAL PRIMARY KEY,
    cotacao_id BIGINT NOT NULL REFERENCES cotacao_servico(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCESSO', 'ERRO')),
    telefone_destino VARCHAR(20),
    mensagem_enviada TEXT,
    data_envio TIMESTAMP NOT NULL DEFAULT NOW(),
    erro_detalhe TEXT
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_envio_log_cotacao ON whatsapp_envio_log(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_envio_log_data_envio ON whatsapp_envio_log(data_envio);

ALTER TABLE cotacao_servico ADD COLUMN IF NOT EXISTS valor_pendente NUMERIC(15, 2);
ALTER TABLE cotacao_servico ADD COLUMN IF NOT EXISTS data_vencimento DATE;

-- OS: status simplificado (Aberto / Em produção / Concluído / Cancelado).
ALTER TABLE ordem_servico DROP CONSTRAINT IF EXISTS ordem_servico_status_check;
UPDATE ordem_servico SET status = 'ABERTO' WHERE status = 'APROVADO';
UPDATE ordem_servico SET status = 'EM_PRODUCAO' WHERE status IN ('CORTE', 'SOLDA', 'PINTURA', 'INSTALACAO');
UPDATE ordem_servico SET status = 'CONCLUIDO' WHERE status = 'ENTREGUE';
ALTER TABLE ordem_servico ADD CONSTRAINT ordem_servico_status_check
    CHECK (status IN ('ABERTO', 'EM_PRODUCAO', 'CONCLUIDO', 'CANCELADO'));

-- OS anteriores já deram baixa no estoque pela antiga lista de corte.
UPDATE ordem_servico SET estoque_baixado = TRUE WHERE estoque_baixado IS NULL;

-- Mão de obra: etapa substituída por turno (noturno).
ALTER TABLE ordem_servico_mao_obra DROP COLUMN IF EXISTS etapa;
UPDATE ordem_servico_mao_obra SET data_trabalho = CAST(data_criacao AS DATE) WHERE data_trabalho IS NULL;
UPDATE ordem_servico_mao_obra SET pago_funcionario = FALSE WHERE pago_funcionario IS NULL;

-- Pagamento da OS agora vem do financeiro (contas por categoria).
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS material_pago;
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS mao_de_obra_pago;

-- Remoção de tipos de serviço, medidas, lista de corte e retalhos.
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS id_tipo_servico;
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS tipo_produto;
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS largura_cm;
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS altura_cm;
ALTER TABLE ordem_servico DROP COLUMN IF EXISTS folga_cm;
ALTER TABLE cotacao_servico DROP COLUMN IF EXISTS id_tipo_servico;
ALTER TABLE cotacao_servico DROP COLUMN IF EXISTS tipo_produto;
ALTER TABLE cotacao_servico DROP COLUMN IF EXISTS largura_cm;
ALTER TABLE cotacao_servico DROP COLUMN IF EXISTS altura_cm;
ALTER TABLE cotacao_servico DROP COLUMN IF EXISTS folga_cm;
DROP TABLE IF EXISTS item_corte CASCADE;
DROP TABLE IF EXISTS retalho CASCADE;
DROP TABLE IF EXISTS tipo_servico_item CASCADE;
DROP TABLE IF EXISTS tipo_servico CASCADE;
ALTER TABLE movimentacao_estoque DROP CONSTRAINT IF EXISTS movimentacao_estoque_tipo_check;
DELETE FROM movimentacao_estoque WHERE tipo NOT IN ('ENTRADA_COMPRA', 'SAIDA_OS', 'AJUSTE');
ALTER TABLE movimentacao_estoque ADD CONSTRAINT movimentacao_estoque_tipo_check
    CHECK (tipo IN ('ENTRADA_COMPRA', 'SAIDA_OS', 'AJUSTE'));

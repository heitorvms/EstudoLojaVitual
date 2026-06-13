ALTER TABLE configuracao_whatsapp ADD COLUMN IF NOT EXISTS url_wppconnect VARCHAR(255) DEFAULT 'http://localhost:21465';
ALTER TABLE configuracao_whatsapp ADD COLUMN IF NOT EXISTS token_wppconnect TEXT;
ALTER TABLE configuracao_whatsapp ADD COLUMN IF NOT EXISTS nome_sessao VARCHAR(100) DEFAULT 'hsa-serralheria';

INSERT INTO configuracao_whatsapp (id, mensagem_orcamento, mensagem_cobranca, url_wppconnect, nome_sessao)
VALUES (
    1,
    'Olá {nome_cliente}! Segue o orçamento "{nome_orcamento}" (nº {numero_orcamento}). Valor total: {valor_total}. Data: {data_emissao}. HSA Serralheria',
    'Olá {nome_cliente}, referente ao orçamento "{nome_orcamento}" (nº {numero_orcamento}), pendência de {valor_pendente}, vencimento {data_vencimento}. HSA Serralheria',
    'http://localhost:21465',
    'hsa-serralheria'
)
ON CONFLICT (id) DO NOTHING;

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

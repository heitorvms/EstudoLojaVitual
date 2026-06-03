package com.dev.Backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.dto.ConfiguracaoWhatsappDTO;
import com.dev.Backend.dto.PlaceholderWhatsappDTO;
import com.dev.Backend.entity.ConfiguracaoWhatsapp;
import com.dev.Backend.repository.ConfiguracaoWhatsappRepository;

@Service
public class ConfiguracaoWhatsappService {

    private static final String MENSAGEM_ORCAMENTO_PADRAO = """
            Olá {nome_cliente}!

            Segue o orçamento "{nome_orcamento}" (nº {numero_orcamento}).
            Valor total: {valor_total}
            Data: {data_emissao}

            O PDF da cotação será anexado automaticamente no envio.

            HSA Serralheria
            """.trim();

    private static final String MENSAGEM_COBRANCA_PADRAO = """
            Olá {nome_cliente}, tudo bem?

            Referente ao orçamento "{nome_orcamento}" (nº {numero_orcamento}), \
            informamos pendência no valor de {valor_pendente}, com vencimento em {data_vencimento}.

            Qualquer dúvida, estamos à disposição.

            HSA Serralheria
            """.trim();

    private static final List<PlaceholderWhatsappDTO> PLACEHOLDERS_ORCAMENTO = List.of(
            new PlaceholderWhatsappDTO("{nome_orcamento}", "Nome do orçamento", "Portão basculante - Casa Silva"),
            new PlaceholderWhatsappDTO("{numero_orcamento}", "Número da cotação", "42"),
            new PlaceholderWhatsappDTO("{nome_cliente}", "Nome do cliente", "João Silva"),
            new PlaceholderWhatsappDTO("{telefone_cliente}", "Telefone do cliente", "(18) 99999-9999"),
            new PlaceholderWhatsappDTO("{endereco_cliente}", "Endereço do cliente", "Rua Exemplo, 123"),
            new PlaceholderWhatsappDTO("{valor_total}", "Valor total do orçamento", "R$ 3.450,00"),
            new PlaceholderWhatsappDTO("{data_emissao}", "Data de emissão", "23/05/2026")
    );

    private static final List<PlaceholderWhatsappDTO> PLACEHOLDERS_COBRANCA = List.of(
            new PlaceholderWhatsappDTO("{nome_cliente}", "Nome do cliente", "João Silva"),
            new PlaceholderWhatsappDTO("{telefone_cliente}", "Telefone do cliente", "(18) 99999-9999"),
            new PlaceholderWhatsappDTO("{nome_orcamento}", "Nome do orçamento", "Portão basculante - Casa Silva"),
            new PlaceholderWhatsappDTO("{numero_orcamento}", "Número da cotação", "42"),
            new PlaceholderWhatsappDTO("{valor_total}", "Valor total do orçamento", "R$ 3.450,00"),
            new PlaceholderWhatsappDTO("{valor_pendente}", "Valor pendente de pagamento", "R$ 1.500,00"),
            new PlaceholderWhatsappDTO("{data_vencimento}", "Data de vencimento", "30/05/2026")
    );

    private final ConfiguracaoWhatsappRepository repository;

    public ConfiguracaoWhatsappService(ConfiguracaoWhatsappRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoWhatsappDTO obter() {
        ConfiguracaoWhatsapp config = buscarOuCriarPadrao();
        return toDto(config);
    }

    @Transactional
    public ConfiguracaoWhatsappDTO salvar(ConfiguracaoWhatsappDTO dto) {
        ConfiguracaoWhatsapp config = buscarOuCriarPadrao();
        config.setMensagemOrcamento(normalizarMensagem(dto.getMensagemOrcamento(), MENSAGEM_ORCAMENTO_PADRAO));
        config.setMensagemCobranca(normalizarMensagem(dto.getMensagemCobranca(), MENSAGEM_COBRANCA_PADRAO));
        repository.save(config);
        return toDto(config);
    }

    private ConfiguracaoWhatsapp buscarOuCriarPadrao() {
        return repository.findById(ConfiguracaoWhatsapp.ID_UNICO).orElseGet(() -> {
            ConfiguracaoWhatsapp nova = new ConfiguracaoWhatsapp();
            nova.setId(ConfiguracaoWhatsapp.ID_UNICO);
            nova.setMensagemOrcamento(MENSAGEM_ORCAMENTO_PADRAO);
            nova.setMensagemCobranca(MENSAGEM_COBRANCA_PADRAO);
            return repository.save(nova);
        });
    }

    private ConfiguracaoWhatsappDTO toDto(ConfiguracaoWhatsapp config) {
        ConfiguracaoWhatsappDTO dto = new ConfiguracaoWhatsappDTO();
        dto.setMensagemOrcamento(config.getMensagemOrcamento());
        dto.setMensagemCobranca(config.getMensagemCobranca());
        dto.setPlaceholdersOrcamento(PLACEHOLDERS_ORCAMENTO);
        dto.setPlaceholdersCobranca(PLACEHOLDERS_COBRANCA);
        return dto;
    }

    private String normalizarMensagem(String valor, String padrao) {
        if (valor == null || valor.isBlank()) {
            return padrao;
        }
        return valor.trim();
    }
}

package com.dev.Backend.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.dev.Backend.dto.WhatsappEnvioLogDTO;
import com.dev.Backend.entity.ConfiguracaoWhatsapp;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.entity.WhatsappEnvioLog;
import com.dev.Backend.exception.RegraNegocioException;
import com.dev.Backend.repository.CotacaoServicoRepository;
import com.dev.Backend.repository.WhatsappEnvioLogRepository;
import com.dev.Backend.util.WppConnectTokenUtil;

@Service
public class WhatsappService {

    private static final String RELATORIO_ORCAMENTO = "RelatorioCotacaoSimples";
    private static final String STATUS_SUCESSO = "SUCESSO";
    private static final String STATUS_ERRO = "ERRO";

    private final CotacaoServicoRepository cotacaoServicoRepository;
    private final ConfiguracaoWhatsappService configuracaoWhatsappService;
    private final RelatorioService relatorioService;
    private final WhatsappEnvioLogRepository whatsappEnvioLogRepository;
    private final RestTemplate restTemplate;

    public WhatsappService(
            CotacaoServicoRepository cotacaoServicoRepository,
            ConfiguracaoWhatsappService configuracaoWhatsappService,
            RelatorioService relatorioService,
            WhatsappEnvioLogRepository whatsappEnvioLogRepository,
            RestTemplate restTemplate) {
        this.cotacaoServicoRepository = cotacaoServicoRepository;
        this.configuracaoWhatsappService = configuracaoWhatsappService;
        this.relatorioService = relatorioService;
        this.whatsappEnvioLogRepository = whatsappEnvioLogRepository;
        this.restTemplate = restTemplate;
    }

    public String normalizarTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) {
            return "";
        }
        String digits = telefone.replaceAll("\\D", "");
        if (digits.startsWith("55") && digits.length() >= 12) {
            return digits;
        }
        if (digits.length() == 10 || digits.length() == 11) {
            return "55" + digits;
        }
        return digits;
    }

    public String substituirPlaceholders(String template, CotacaoServico cotacao) {
        if (template == null) {
            return "";
        }
        String msg = template;
        msg = msg.replace("{nome_cliente}", safe(cotacao.getClienteNome()));
        msg = msg.replace("{nome_orcamento}", safe(cotacao.getNome()));
        msg = msg.replace("{numero_orcamento}", cotacao.getId() != null ? String.valueOf(cotacao.getId()) : "-");
        msg = msg.replace("{valor_total}", formatarMoeda(cotacao.getValorTotalOrcamento()));
        msg = msg.replace("{data_emissao}", formatarData(cotacao.getDataCriacao()));
        msg = msg.replace("{telefone_cliente}", safe(cotacao.getTelefone()));
        msg = msg.replace("{endereco_cliente}", safe(cotacao.getEndereco()));
        msg = msg.replace("{valor_pendente}", formatarMoeda(cotacao.getValorPendente()));
        msg = msg.replace("{data_vencimento}", formatarData(cotacao.getDataVencimento()));
        return msg;
    }

    public List<WhatsappEnvioLogDTO> listarLogs(Long cotacaoId) {
        cotacaoServicoRepository.findById(cotacaoId)
                .orElseThrow(() -> new RegraNegocioException("Cotação não encontrada: " + cotacaoId));
        return whatsappEnvioLogRepository.findByCotacao_IdOrderByDataEnvioDesc(cotacaoId).stream()
                .map(this::toLogDto)
                .collect(Collectors.toList());
    }

    public byte[] gerarPdfEmMemoria(Long cotacaoId) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Map<String, Object> parametros = new HashMap<>();
            parametros.put("id_cotacao", cotacaoId);
            relatorioService.gerarRelatorio(RELATORIO_ORCAMENTO, parametros, outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Falha ao gerar PDF do orçamento: " + e.getMessage());
        }
    }

    @Transactional
    public void enviarOrcamento(Long cotacaoId) {
        CotacaoServico cotacao = cotacaoServicoRepository.findById(cotacaoId)
                .orElseThrow(() -> new RegraNegocioException("Cotação não encontrada: " + cotacaoId));

        ConfiguracaoWhatsapp config = configuracaoWhatsappService.buscarConfiguracao();
        validarConfiguracaoWpp(config);

        String telefone = normalizarTelefone(cotacao.getTelefone());
        if (telefone.length() < 12) {
            throw new RegraNegocioException("Telefone do cliente inválido para envio WhatsApp.");
        }

        String mensagem = substituirPlaceholders(config.getMensagemOrcamento(), cotacao);

        try {
            byte[] pdf = gerarPdfEmMemoria(cotacaoId);
            String base64 = Base64.getEncoder().encodeToString(pdf);
            String base64ComPrefixo = "data:application/pdf;base64," + base64;

            String url = montarUrlEnvio(config);
            Map<String, Object> payload = new HashMap<>();
            payload.put("phone", telefone);
            payload.put("base64", base64ComPrefixo);
            payload.put("filename", "Orcamento_" + cotacaoId + ".pdf");
            payload.put("caption", mensagem);
            payload.put("isGroup", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String tokenApi = WppConnectTokenUtil.extrairTokenApi(
                    config.getTokenWppconnect(), config.getNomeSessao());
            headers.setBearerAuth(tokenApi);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                String detalhe = "HTTP " + response.getStatusCode().value() + ": " + response.getBody();
                salvarLog(cotacao, STATUS_ERRO, telefone, mensagem, detalhe);
                throw new RegraNegocioException("WPPConnect retornou erro: " + detalhe);
            }

            salvarLog(cotacao, STATUS_SUCESSO, telefone, mensagem, null);
        } catch (RegraNegocioException e) {
            throw e;
        } catch (RestClientException e) {
            salvarLog(cotacao, STATUS_ERRO, telefone, mensagem, e.getMessage());
            throw new RegraNegocioException("Falha ao comunicar com WPPConnect: " + e.getMessage());
        } catch (Exception e) {
            salvarLog(cotacao, STATUS_ERRO, telefone, mensagem, e.getMessage());
            throw new RegraNegocioException("Erro ao enviar orçamento via WhatsApp: " + e.getMessage());
        }
    }

    @Transactional
    public void enviarCobranca(Long cotacaoId) {
        CotacaoServico cotacao = cotacaoServicoRepository.findById(cotacaoId)
                .orElseThrow(() -> new RegraNegocioException("Cotação não encontrada: " + cotacaoId));

        if (cotacao.getValorPendente() == null || cotacao.getValorPendente().signum() <= 0) {
            throw new RegraNegocioException("Informe o valor pendente antes de enviar a cobrança.");
        }
        if (cotacao.getDataVencimento() == null) {
            throw new RegraNegocioException("Informe a data de vencimento antes de enviar a cobrança.");
        }

        ConfiguracaoWhatsapp config = configuracaoWhatsappService.buscarConfiguracao();
        validarConfiguracaoWpp(config);

        String telefone = normalizarTelefone(cotacao.getTelefone());
        if (telefone.length() < 12) {
            throw new RegraNegocioException("Telefone do cliente inválido para envio WhatsApp.");
        }

        String mensagem = substituirPlaceholders(config.getMensagemCobranca(), cotacao);

        try {
            String url = montarUrlMensagem(config);
            Map<String, Object> payload = new HashMap<>();
            payload.put("phone", telefone);
            payload.put("message", mensagem);
            payload.put("isGroup", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String tokenApi = WppConnectTokenUtil.extrairTokenApi(
                    config.getTokenWppconnect(), config.getNomeSessao());
            headers.setBearerAuth(tokenApi);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                String detalhe = "HTTP " + response.getStatusCode().value() + ": " + response.getBody();
                salvarLog(cotacao, STATUS_ERRO, telefone, mensagem, detalhe);
                throw new RegraNegocioException("WPPConnect retornou erro: " + detalhe);
            }

            salvarLog(cotacao, STATUS_SUCESSO, telefone, mensagem, null);
        } catch (RegraNegocioException e) {
            throw e;
        } catch (RestClientException e) {
            salvarLog(cotacao, STATUS_ERRO, telefone, mensagem, e.getMessage());
            throw new RegraNegocioException("Falha ao comunicar com WPPConnect: " + e.getMessage());
        } catch (Exception e) {
            salvarLog(cotacao, STATUS_ERRO, telefone, mensagem, e.getMessage());
            throw new RegraNegocioException("Erro ao enviar cobrança via WhatsApp: " + e.getMessage());
        }
    }

    private void validarConfiguracaoWpp(ConfiguracaoWhatsapp config) {
        if (config.getUrlWppconnect() == null || config.getUrlWppconnect().isBlank()) {
            throw new RegraNegocioException("Configure a URL do WPPConnect em Configurações > WhatsApp.");
        }
        if (config.getTokenWppconnect() == null || config.getTokenWppconnect().isBlank()) {
            throw new RegraNegocioException("Configure o token do WPPConnect em Configurações > WhatsApp.");
        }
        if (config.getNomeSessao() == null || config.getNomeSessao().isBlank()) {
            throw new RegraNegocioException("Configure o nome da sessão WPPConnect em Configurações > WhatsApp.");
        }
    }

    private String montarUrlEnvio(ConfiguracaoWhatsapp config) {
        return montarUrlWpp(config, "/send-file-base64");
    }

    private String montarUrlMensagem(ConfiguracaoWhatsapp config) {
        return montarUrlWpp(config, "/send-message");
    }

    private String montarUrlWpp(ConfiguracaoWhatsapp config, String sufixo) {
        String base = config.getUrlWppconnect().trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/api/" + config.getNomeSessao().trim() + sufixo;
    }

    private WhatsappEnvioLogDTO toLogDto(WhatsappEnvioLog log) {
        WhatsappEnvioLogDTO dto = new WhatsappEnvioLogDTO();
        dto.setId(log.getId());
        dto.setStatus(log.getStatus());
        dto.setTelefoneDestino(log.getTelefoneDestino());
        dto.setDataEnvio(log.getDataEnvio());
        dto.setErroDetalhe(resumirErro(log.getErroDetalhe()));
        return dto;
    }

    private String resumirErro(String erro) {
        if (erro == null || erro.isBlank()) {
            return null;
        }
        String limpo = erro.trim();
        if (limpo.length() <= 200) {
            return limpo;
        }
        return limpo.substring(0, 197) + "...";
    }

    private void salvarLog(
            CotacaoServico cotacao,
            String status,
            String telefone,
            String mensagem,
            String erroDetalhe) {
        WhatsappEnvioLog log = new WhatsappEnvioLog();
        log.setCotacao(cotacao);
        log.setStatus(status);
        log.setTelefoneDestino(telefone);
        log.setMensagemEnviada(mensagem);
        log.setErroDetalhe(erroDetalhe);
        log.setDataEnvio(new Date());
        whatsappEnvioLogRepository.save(log);
    }

    private String formatarMoeda(BigDecimal valor) {
        if (valor == null) {
            return "R$ 0,00";
        }
        return NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(valor);
    }

    private String formatarData(Date data) {
        if (data == null) {
            return "-";
        }
        return new SimpleDateFormat("dd/MM/yyyy").format(data);
    }

    private String safe(String valor) {
        return valor != null && !valor.isBlank() ? valor : "-";
    }
}

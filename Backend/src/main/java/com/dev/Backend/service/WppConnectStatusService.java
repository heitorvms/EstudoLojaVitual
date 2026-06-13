package com.dev.Backend.service;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.dev.Backend.entity.ConfiguracaoWhatsapp;
import com.dev.Backend.exception.RegraNegocioException;
import com.dev.Backend.util.WppConnectTokenUtil;

@Service
public class WppConnectStatusService {

    private static final String STATUS_CONNECTED = "CONNECTED";
    private static final String STATUS_DISCONNECTED = "DISCONNECTED";
    private static final String STATUS_OFFLINE = "OFFLINE";

    private final ConfiguracaoWhatsappService configuracaoWhatsappService;
    private final RestTemplate restTemplate;

    public WppConnectStatusService(
            ConfiguracaoWhatsappService configuracaoWhatsappService,
            RestTemplate restTemplate) {
        this.configuracaoWhatsappService = configuracaoWhatsappService;
        this.restTemplate = restTemplate;
    }

    public String obterStatus() {
        ConfiguracaoWhatsapp config = configuracaoWhatsappService.buscarConfiguracao();
        if (!credenciaisValidas(config)) {
            return STATUS_OFFLINE;
        }

        try {
            String url = montarUrl(config, "/status-session");
            HttpEntity<Void> request = new HttpEntity<>(headersComToken(config));
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return STATUS_OFFLINE;
            }

            String statusWpp = extrairStatus(response.getBody());
            if (STATUS_CONNECTED.equalsIgnoreCase(statusWpp)) {
                return STATUS_CONNECTED;
            }
            return STATUS_DISCONNECTED;
        } catch (RestClientException e) {
            return STATUS_OFFLINE;
        }
    }

    public String obterQrCode() {
        ConfiguracaoWhatsapp config = configuracaoWhatsappService.buscarConfiguracao();
        validarCredenciais(config);

        try {
            String startUrl = montarUrl(config, "/start-session");
            HttpEntity<Map<String, Object>> startRequest = new HttpEntity<>(new HashMap<>(), headersComToken(config));
            ResponseEntity<Map> startResponse = restTemplate.postForEntity(startUrl, startRequest, Map.class);

            String qrcodeJson = extrairQrCodeDoJson(startResponse.getBody());
            if (qrcodeJson != null) {
                return normalizarQrCodeDataUrl(qrcodeJson);
            }

            String qrUrl = montarUrl(config, "/qrcode-session");
            HttpEntity<Void> qrRequest = new HttpEntity<>(headersComToken(config));
            ResponseEntity<byte[]> qrResponse = restTemplate.exchange(qrUrl, HttpMethod.GET, qrRequest, byte[].class);

            if (!qrResponse.getStatusCode().is2xxSuccessful()
                    || qrResponse.getBody() == null
                    || qrResponse.getBody().length == 0) {
                throw new RegraNegocioException("QR Code indisponível. Tente novamente.");
            }

            String base64 = Base64.getEncoder().encodeToString(qrResponse.getBody());
            return "data:image/png;base64," + base64;
        } catch (RegraNegocioException e) {
            throw e;
        } catch (RestClientException e) {
            throw new RegraNegocioException("Falha ao obter QR Code do WPPConnect: " + e.getMessage());
        }
    }

    public void desconectar() {
        ConfiguracaoWhatsapp config = configuracaoWhatsappService.buscarConfiguracao();
        validarCredenciais(config);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(new HashMap<>(), headersComToken(config));

        try {
            String logoutUrl = montarUrl(config, "/logout-session");
            ResponseEntity<Map> logoutResponse = restTemplate.postForEntity(logoutUrl, request, Map.class);
            if (logoutResponse.getStatusCode().is2xxSuccessful() && respostaIndicaSucesso(logoutResponse.getBody())) {
                return;
            }
        } catch (RestClientException ignored) {
        }

        try {
            String closeUrl = montarUrl(config, "/close-session");
            ResponseEntity<Map> closeResponse = restTemplate.postForEntity(closeUrl, request, Map.class);
            if (closeResponse.getStatusCode().is2xxSuccessful() && respostaIndicaSucesso(closeResponse.getBody())) {
                return;
            }
            throw new RegraNegocioException("WPPConnect não confirmou a desconexão da sessão.");
        } catch (RegraNegocioException e) {
            throw e;
        } catch (RestClientException e) {
            throw new RegraNegocioException("Falha ao desconectar do WPPConnect: " + e.getMessage());
        }
    }

    private boolean respostaIndicaSucesso(Map body) {
        if (body == null || body.isEmpty()) {
            return true;
        }
        Object status = body.get("status");
        if (status instanceof Boolean) {
            return (Boolean) status;
        }
        if (status != null) {
            String valor = status.toString().trim();
            if ("true".equalsIgnoreCase(valor) || "success".equalsIgnoreCase(valor) || "CONNECTED".equalsIgnoreCase(valor)) {
                return true;
            }
            if ("false".equalsIgnoreCase(valor) || "error".equalsIgnoreCase(valor)) {
                return false;
            }
        }
        Object message = body.get("message");
        if (message != null && message.toString().toLowerCase().contains("success")) {
            return true;
        }
        return true;
    }

    private boolean credenciaisValidas(ConfiguracaoWhatsapp config) {
        return config.getUrlWppconnect() != null && !config.getUrlWppconnect().isBlank()
                && config.getTokenWppconnect() != null && !config.getTokenWppconnect().isBlank()
                && config.getNomeSessao() != null && !config.getNomeSessao().isBlank();
    }

    private void validarCredenciais(ConfiguracaoWhatsapp config) {
        if (!credenciaisValidas(config)) {
            throw new RegraNegocioException(
                    "Credenciais WPPConnect não configuradas. Reinicie o backend com o servidor WPPConnect online.");
        }
    }

    private String montarUrl(ConfiguracaoWhatsapp config, String sufixo) {
        String base = config.getUrlWppconnect().trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/api/" + config.getNomeSessao().trim() + sufixo;
    }

    private HttpHeaders headersComToken(ConfiguracaoWhatsapp config) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String tokenApi = WppConnectTokenUtil.extrairTokenApi(
                config.getTokenWppconnect(), config.getNomeSessao());
        headers.setBearerAuth(tokenApi);
        return headers;
    }

    private String extrairQrCodeDoJson(Map body) {
        if (body == null) {
            return null;
        }
        Object qrcode = body.get("qrcode");
        if (qrcode == null || qrcode.toString().isBlank()) {
            return null;
        }
        return qrcode.toString().trim();
    }

    private String normalizarQrCodeDataUrl(String qrcode) {
        String valor = qrcode.trim();
        if (valor.startsWith("data:image")) {
            return valor;
        }
        return "data:image/png;base64," + valor;
    }

    private String extrairStatus(Map body) {
        Object status = body.get("status");
        if (status != null && !status.toString().isBlank()) {
            return status.toString().trim().toUpperCase();
        }
        Object state = body.get("state");
        if (state != null && !state.toString().isBlank()) {
            return state.toString().trim().toUpperCase();
        }
        return STATUS_DISCONNECTED;
    }
}

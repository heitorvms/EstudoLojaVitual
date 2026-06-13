package com.dev.Backend.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.dev.Backend.service.ConfiguracaoWhatsappService;
import com.dev.Backend.util.WppConnectTokenUtil;

@Component
public class WppConnectStartup {

    private static final Logger log = LoggerFactory.getLogger(WppConnectStartup.class);

    private final WppConnectProperties properties;
    private final ConfiguracaoWhatsappService configuracaoWhatsappService;
    private final RestTemplate restTemplate;

    public WppConnectStartup(
            WppConnectProperties properties,
            ConfiguracaoWhatsappService configuracaoWhatsappService,
            RestTemplate restTemplate) {
        this.properties = properties;
        this.configuracaoWhatsappService = configuracaoWhatsappService;
        this.restTemplate = restTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void inicializarTokenWppConnect() {
        String baseUrl = normalizarBaseUrl(properties.getUrl());
        String sessao = properties.getSessao();
        String secretKey = properties.getSecretkey();
        String url = baseUrl + "/api/" + sessao + "/" + secretKey + "/generate-token";

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("WPPConnect: falha ao gerar token (HTTP {}). Sistema iniciado sem token WhatsApp.",
                        response.getStatusCode().value());
                return;
            }

            Object tokenObj = response.getBody().get("token");
            if (tokenObj == null || tokenObj.toString().isBlank()) {
                Object fullObj = response.getBody().get("full");
                if (fullObj == null || fullObj.toString().isBlank()) {
                    log.warn("WPPConnect: resposta sem token. Sistema iniciado sem token WhatsApp.");
                    return;
                }
                tokenObj = WppConnectTokenUtil.extrairTokenApi(fullObj.toString(), sessao);
            }

            String token = tokenObj.toString().trim();
            configuracaoWhatsappService.atualizarCredenciaisWpp(baseUrl, token, sessao);
            log.info("WPPConnect: token gerado e salvo para sessão '{}'.", sessao);
        } catch (RestClientException e) {
            log.warn("WPPConnect offline ao iniciar: {}. Sistema subiu normalmente.", e.getMessage());
        } catch (Exception e) {
            log.warn("WPPConnect: erro inesperado ao gerar token: {}. Sistema subiu normalmente.", e.getMessage());
        }
    }

    private String normalizarBaseUrl(String url) {
        if (url == null) {
            return "http://localhost:21465";
        }
        String base = url.trim();
        if (base.endsWith("/")) {
            return base.substring(0, base.length() - 1);
        }
        return base;
    }
}

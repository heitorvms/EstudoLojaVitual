package com.dev.Backend.util;

public final class WppConnectTokenUtil {

    private WppConnectTokenUtil() {
    }

    public static String extrairTokenApi(String tokenSalvo, String nomeSessao) {
        if (tokenSalvo == null || tokenSalvo.isBlank()) {
            return "";
        }
        String token = tokenSalvo.trim();
        if (nomeSessao != null && !nomeSessao.isBlank()) {
            String prefixo = nomeSessao.trim() + ":";
            if (token.startsWith(prefixo)) {
                return token.substring(prefixo.length());
            }
        }
        int separador = token.indexOf(':');
        if (separador > 0) {
            String sufixo = token.substring(separador + 1);
            if (sufixo.startsWith("$2")) {
                return sufixo;
            }
        }
        return token;
    }
}

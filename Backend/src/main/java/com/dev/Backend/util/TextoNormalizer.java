package com.dev.Backend.util;

import java.text.Normalizer;

public final class TextoNormalizer {

    private TextoNormalizer() {}

    public static String normalizar(String texto) {
        if (texto == null) return "";
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento
            .toLowerCase()
            .trim()
            .replaceAll("\\s+", " ");
    }
}

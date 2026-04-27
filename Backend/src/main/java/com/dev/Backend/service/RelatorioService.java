package com.dev.Backend.service;

import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.repository.CotacaoServicoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.sf.jasperreports.engine.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Connection;
import java.util.*;

@Service
public class RelatorioService {
    private final DataSource dataSource;
    private final CotacaoServicoRepository cotacaoServicoRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public RelatorioService(DataSource dataSource, CotacaoServicoRepository cotacaoServicoRepository) {
        this.dataSource = dataSource;
        this.cotacaoServicoRepository = cotacaoServicoRepository;
    }

    public void gerarRelatorio(String nomeRelatorio, Map<String, Object> parametros, OutputStream outputStream) throws JRException {
        String caminhoJasper = "/relatorios/" + nomeRelatorio + ".jasper";
        String caminhoJrxml = "/relatorios/" + nomeRelatorio + ".jrxml";

        try (Connection conexao = dataSource.getConnection()) {
            Map<String, Object> parametrosConvertidos = converterParametros(parametros);
            enriquecerParametros(nomeRelatorio, parametrosConvertidos);

            // Tenta carregar o .jasper; se não existir, compila o .jrxml em memória
            InputStream relatorioStream = getClass().getResourceAsStream(caminhoJasper);
            JasperPrint impressao;
            if (relatorioStream != null) {
                impressao = JasperFillManager.fillReport(relatorioStream, parametrosConvertidos, conexao);
            } else {
                InputStream jrxmlStream = getClass().getResourceAsStream(caminhoJrxml);
                if (jrxmlStream == null) {
                    throw new JRException("Relatório não encontrado: " + caminhoJasper + " ou " + caminhoJrxml);
                }
                JasperReport relatorioCompilado = JasperCompileManager.compileReport(jrxmlStream);
                impressao = JasperFillManager.fillReport(relatorioCompilado, parametrosConvertidos, conexao);
            }

            JasperExportManager.exportReportToPdfStream(impressao, outputStream);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar o relatório: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> converterParametros(Map<String, Object> parametros) {
        Map<String, Object> convertidos = new HashMap<>();

        for (Map.Entry<String, Object> entry : parametros.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if ("id_cotacao".equals(key) && value != null) {
                try {
                    if (value instanceof String) {
                        convertidos.put(key, Long.parseLong((String) value));
                    } else if (value instanceof Number) {
                        convertidos.put(key, ((Number) value).longValue());
                    } else {
                        convertidos.put(key, value);
                    }
                } catch (NumberFormatException e) {
                    convertidos.put(key, null);
                }
            } else {
                convertidos.put(key, value);
            }
        }

        return convertidos;
    }


   
    private void enriquecerParametros(String nomeRelatorio, Map<String, Object> params) {
        if (!"RelatorioCotacaoSimples".equalsIgnoreCase(nomeRelatorio)) {
            return;
        }

        Object idParam = params.get("id_cotacao");
        if (!(idParam instanceof Number)) {
            return;
        }
        Long idCotacao = ((Number) idParam).longValue();

        Optional<CotacaoServico> opt = cotacaoServicoRepository.findById(idCotacao);
        if (opt.isEmpty()) return;

        CotacaoServico cot = opt.get();
        // Cliente no cabeçalho
        if (!params.containsKey("cliente_nome") || params.get("cliente_nome") == null) {
            params.put("cliente_nome", cot.getClienteNome());
        }

        // Distribuidora aprovada (pode ser única ou lista, conforme tipo de análise)
        if (params.get("distribuidora_nome") == null) {
            String escolhida = extrairDistribuidoraAprovada(cot.getAnaliseEscolhaJson());
            if (escolhida != null && !escolhida.isBlank()) {
                params.put("distribuidora_nome", escolhida);
            }
        }
    }

    private String extrairDistribuidoraAprovada(String analiseEscolhaJson) {
        if (analiseEscolhaJson == null || analiseEscolhaJson.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(analiseEscolhaJson);
            JsonNode resumo = root.path("resumoEscolha");
            String tipo = null;
            if (resumo.hasNonNull("tipo")) tipo = resumo.get("tipo").asText();
            if (tipo == null && root.hasNonNull("tipoEscolhido")) tipo = root.get("tipoEscolhido").asText();

            if ("distribuidoras".equalsIgnoreCase(tipo)) {
                // Preferência 1: resumoEscolha.distribuidora
                if (resumo.hasNonNull("distribuidora")) {
                    return resumo.get("distribuidora").asText();
                }
                // Alternativa: escolhas.valorTotal.distribuidora
                JsonNode vt = root.path("escolhas").path("valorTotal");
                if (vt.hasNonNull("distribuidora")) {
                    return vt.get("distribuidora").asText();
                }
            } else if ("materiais".equalsIgnoreCase(tipo)) {
                // Pode haver várias distribuidoras selecionadas (uma por material). Retorna lista única separada por vírgula.
                List<String> nomes = new ArrayList<>();
                JsonNode mats = resumo.path("materiais");
                if (!mats.isArray() || mats.size() == 0) {
                    mats = root.path("escolhas").path("materiais");
                }
                if (mats != null && mats.isArray()) {
                    for (JsonNode m : mats) {
                        if (m.hasNonNull("distribuidora")) {
                            String nome = m.get("distribuidora").asText();
                            if (nome != null && !nome.isBlank() && !nomes.contains(nome)) {
                                nomes.add(nome);
                            }
                        }
                    }
                }
                if (!nomes.isEmpty()) {
                    return String.join(", ", nomes);
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
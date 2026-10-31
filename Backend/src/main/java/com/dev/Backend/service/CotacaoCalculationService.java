package com.dev.Backend.service;

import com.dev.Backend.dto.DistribuidoraCotacaoDTO;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.Material;
import com.dev.Backend.entity.PrecoMaterialCotacao;
import com.dev.Backend.entity.TipoMaoDeObra;
import com.dev.Backend.exception.RegraNegocioException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CotacaoCalculationService {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private final ObjectMapper objectMapper;

    public CotacaoCalculationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<DistribuidoraCotacaoDTO> calcularValoresPorDistribuidora(CotacaoServico cotacao, Double percentualLucro) {
        Map<Long, DistribuidoraCotacaoDTO> resultados = new HashMap<>();

        for (PrecoMaterialCotacao preco : cotacao.getPrecosMateriais()) {
            Distribuidora distribuidora = preco.getDistribuidora();
            Double valorItem = preco.getPreco() * preco.getMaterial().getQuantidade();

            resultados.computeIfAbsent(distribuidora.getId(), k -> {
                DistribuidoraCotacaoDTO dto = new DistribuidoraCotacaoDTO();
                dto.setDistribuidoraId(distribuidora.getId());
                dto.setNome(distribuidora.getNome());
                dto.setValorTotal(0.0);
                return dto;
            });

            DistribuidoraCotacaoDTO dto = resultados.get(distribuidora.getId());
            dto.setValorTotal(dto.getValorTotal() + valorItem);
            dto.setValorTotalComLucro(dto.getValorTotal() * (1 + percentualLucro / 100));
        }

        return new ArrayList<>(resultados.values());
    }

    /**
     * Mesma regra da tela: preço da distribuidora escolhida (ou o menor, sem escolha) × barras,
     * insumos sobre materiais e mão de obra (percentual sobre o custo ou valor fixo) somada ao custo.
     */
    public void aplicarComposicaoCustos(CotacaoServico cotacao) {
        BigDecimal percentualInsumos = naoNegativo(cotacao.getPercentualInsumos(), "Percentual de insumos");
        BigDecimal frete = naoNegativo(cotacao.getValorFrete(), "Frete");
        TipoMaoDeObra tipoMaoDeObra = cotacao.getTipoMaoDeObra() != null ? cotacao.getTipoMaoDeObra() : TipoMaoDeObra.PERCENTUAL;
        EscolhaDistribuidora escolha = lerEscolha(cotacao.getAnaliseEscolhaJson());

        BigDecimal totalMateriais = BigDecimal.ZERO;
        for (Material material : cotacao.getMateriais()) {
            int barras = material.getQuantidade() != null ? material.getQuantidade() : 0;
            Optional<BigDecimal> preco = precoDoMaterial(cotacao, material, escolha);
            if (barras > 0 && preco.isPresent()) {
                totalMateriais = totalMateriais.add(preco.get().multiply(BigDecimal.valueOf(barras)));
            }
        }
        totalMateriais = dinheiro(totalMateriais);
        BigDecimal valorInsumos = percentualDe(totalMateriais, percentualInsumos);
        BigDecimal totalCusto = dinheiro(totalMateriais.add(valorInsumos).add(frete));

        BigDecimal percentualMaoDeObra = null;
        BigDecimal valorMaoDeObra;
        if (tipoMaoDeObra == TipoMaoDeObra.VALOR_FIXO) {
            valorMaoDeObra = dinheiro(naoNegativo(cotacao.getValorMaoDeObra(), "Valor da mão de obra"));
        } else {
            percentualMaoDeObra = naoNegativo(cotacao.getPercentualMaoDeObra(), "Percentual de mão de obra");
            valorMaoDeObra = percentualDe(totalCusto, percentualMaoDeObra);
        }

        cotacao.setPercentualInsumos(percentualInsumos);
        cotacao.setValorFrete(frete);
        cotacao.setTotalCustoMateriais(totalMateriais);
        cotacao.setValorInsumos(valorInsumos);
        cotacao.setTipoMaoDeObra(tipoMaoDeObra);
        cotacao.setPercentualMaoDeObra(percentualMaoDeObra);
        cotacao.setValorMaoDeObra(valorMaoDeObra);
        cotacao.setValorTotalOrcamento(dinheiro(totalCusto.add(valorMaoDeObra)));
    }

    /** Sem preço na distribuidora escolhida, usa o menor preço informado para o material. */
    private Optional<BigDecimal> precoDoMaterial(CotacaoServico cotacao, Material material, EscolhaDistribuidora escolha) {
        String escolhida = escolha.distribuidoraDe(material.getMaterialDisponivel().getId());
        List<PrecoMaterialCotacao> precosValidos = cotacao.getPrecosMateriais().stream()
                .filter(p -> p.getMaterial().getId().equals(material.getId()))
                .filter(p -> p.getPreco() != null && p.getPreco() > 0)
                .toList();
        Optional<BigDecimal> precoEscolhido = precosValidos.stream()
                .filter(p -> escolhida != null && escolhida.equalsIgnoreCase(p.getDistribuidora().getNome()))
                .map(p -> BigDecimal.valueOf(p.getPreco()))
                .findFirst();
        if (precoEscolhido.isPresent()) return precoEscolhido;
        return precosValidos.stream()
                .map(p -> BigDecimal.valueOf(p.getPreco()))
                .min(Comparator.naturalOrder());
    }

    private EscolhaDistribuidora lerEscolha(String analiseEscolhaJson) {
        if (analiseEscolhaJson == null || analiseEscolhaJson.isBlank()) return EscolhaDistribuidora.NENHUMA;
        try {
            JsonNode raiz = objectMapper.readTree(analiseEscolhaJson);
            if ("distribuidoras".equalsIgnoreCase(raiz.path("tipoEscolhido").asText())) {
                String unica = raiz.path("resumoEscolha").path("distribuidora").asText(null);
                if (unica == null) unica = raiz.path("escolhas").path("valorTotal").path("distribuidora").asText(null);
                return new EscolhaDistribuidora(unica, Map.of());
            }
            Map<Long, String> porMaterial = new HashMap<>();
            for (JsonNode item : raiz.path("escolhas").path("materiais")) {
                if (item.hasNonNull("materialId") && item.hasNonNull("distribuidoraSelecionada")) {
                    porMaterial.put(item.get("materialId").asLong(), item.get("distribuidoraSelecionada").asText());
                }
            }
            return new EscolhaDistribuidora(null, porMaterial);
        } catch (JsonProcessingException e) {
            return EscolhaDistribuidora.NENHUMA;
        }
    }

    private record EscolhaDistribuidora(String distribuidoraUnica, Map<Long, String> porMaterialDisponivel) {
        static final EscolhaDistribuidora NENHUMA = new EscolhaDistribuidora(null, Map.of());

        String distribuidoraDe(Long materialDisponivelId) {
            return distribuidoraUnica != null ? distribuidoraUnica : porMaterialDisponivel.get(materialDisponivelId);
        }
    }

    private BigDecimal naoNegativo(BigDecimal valor, String campo) {
        if (valor == null) return BigDecimal.ZERO;
        if (valor.signum() < 0) throw new RegraNegocioException(campo + " não pode ser negativo");
        return valor;
    }

    private BigDecimal percentualDe(BigDecimal base, BigDecimal percentual) {
        return dinheiro(base.multiply(percentual).divide(CEM, 10, RoundingMode.HALF_UP));
    }

    private BigDecimal dinheiro(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    public DistribuidoraCotacaoDTO buscarDistribuidoraMaisBarata(CotacaoServico cotacao, Double percentualLucro) {
        List<DistribuidoraCotacaoDTO> distribuidoras = calcularValoresPorDistribuidora(cotacao, percentualLucro);
        
        return distribuidoras.stream()
            .min(Comparator.comparing(DistribuidoraCotacaoDTO::getValorTotalComLucro))
            .orElse(null);
    }
}
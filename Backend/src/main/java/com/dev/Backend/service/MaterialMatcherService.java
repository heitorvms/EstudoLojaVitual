package com.dev.Backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.dto.CandidatoMatchDTO;
import com.dev.Backend.entity.MaterialApelido;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import com.dev.Backend.util.TextoNormalizer;

@Service
public class MaterialMatcherService {

    private static final BigDecimal TOLERANCIA_TAMANHO = new BigDecimal("0.01");

    @Autowired
    private MaterialDisponivelRepository repository;

    @Autowired
    private MaterialApelidoService apelidoService;

    /**
     * Match exato em memória: normaliza descrição (com dimensão concatenada)
     * e compara com tamanho aproximado (±0,01m).
     */
    public Optional<MaterialDisponivel> matchExato(String descricao, String dimensao, BigDecimal tamanho) {
        if (descricao == null || tamanho == null) return Optional.empty();

        String chave = construirChave(descricao, dimensao);
        BigDecimal min = tamanho.subtract(TOLERANCIA_TAMANHO);
        BigDecimal max = tamanho.add(TOLERANCIA_TAMANHO);

        List<MaterialDisponivel> todos = repository.findAll();
        return todos.stream()
            .filter(m -> m.getTamanho() != null
                && m.getTamanho().compareTo(min) >= 0
                && m.getTamanho().compareTo(max) <= 0)
            .filter(m -> TextoNormalizer.normalizar(m.getDescricao()).equals(chave))
            .findFirst();
    }

    /**
     * Lista completa (pra ser usada quando for processar lote: evita N consultas ao banco).
     */
    public List<MaterialDisponivel> listarTodos() {
        return repository.findAll();
    }

    /**
     * Match com lista pré-carregada (otimização para batch).
     */
    public Optional<MaterialDisponivel> matchExatoEmLista(
            String descricao, String dimensao, BigDecimal tamanho,
            List<MaterialDisponivel> lista) {
        if (descricao == null || tamanho == null) return Optional.empty();
        String chave = construirChave(descricao, dimensao);
        BigDecimal min = tamanho.subtract(TOLERANCIA_TAMANHO);
        BigDecimal max = tamanho.add(TOLERANCIA_TAMANHO);

        return lista.stream()
            .filter(m -> m.getTamanho() != null
                && m.getTamanho().compareTo(min) >= 0
                && m.getTamanho().compareTo(max) <= 0)
            .filter(m -> TextoNormalizer.normalizar(m.getDescricao()).equals(chave))
            .findFirst();
    }

    public String construirChave(String descricao, String dimensao) {
        String full = (descricao == null ? "" : descricao)
            + (dimensao != null && !dimensao.isBlank() ? " " + dimensao : "");
        return TextoNormalizer.normalizar(full);
    }

    /**
     * Busca apelido por (distribuidora, descrição+dimensão normalizada).
     */
    public Optional<MaterialDisponivel> matchPorApelido(Long distribuidoraId,
                                                          String descricao, String dimensao) {
        if (distribuidoraId == null) return Optional.empty();
        Optional<MaterialApelido> apelido = apelidoService.buscar(distribuidoraId, descricao, dimensao);
        return apelido.map(MaterialApelido::getMaterialDisponivel);
    }

    /**
     * Fuzzy match via pg_trgm: retorna candidatos com similaridade > 0.4
     * e tamanho próximo (±0,01m).
     */
    public List<CandidatoMatchDTO> buscarCandidatosFuzzy(String descricao, String dimensao,
                                                          BigDecimal tamanho) {
        if (descricao == null || tamanho == null) return new ArrayList<>();
        String termo = construirChave(descricao, dimensao);
        BigDecimal min = tamanho.subtract(TOLERANCIA_TAMANHO);
        BigDecimal max = tamanho.add(TOLERANCIA_TAMANHO);

        List<Object[]> linhas = repository.buscarCandidatosFuzzy(termo, min, max);
        List<CandidatoMatchDTO> candidatos = new ArrayList<>();
        for (Object[] linha : linhas) {
            Long id = ((Number) linha[0]).longValue();
            String desc = (String) linha[1];
            BigDecimal tam = (BigDecimal) linha[2];
            Double sim = ((Number) linha[3]).doubleValue();
            candidatos.add(new CandidatoMatchDTO(id, desc, tam, sim));
        }
        return candidatos;
    }
}

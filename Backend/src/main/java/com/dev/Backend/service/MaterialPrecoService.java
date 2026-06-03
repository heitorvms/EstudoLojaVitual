package com.dev.Backend.service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.entity.MaterialPreco;
import com.dev.Backend.entity.OrigemPreco;
import com.dev.Backend.repository.MaterialPrecoRepository;

@Service
public class MaterialPrecoService {

    @Autowired
    private MaterialPrecoRepository repository;

    /**
     * Registra um novo preço vigente. Se já existir vigente para o par
     * material+distribuidora, fecha o anterior (data_fim = agora) e cria o novo.
     * Garante histórico automático e apenas 1 vigente por par.
     */
    @Transactional
    public MaterialPreco registrarPreco(MaterialDisponivel material,
                                         Distribuidora distribuidora,
                                         BigDecimal precoUnitario,
                                         Integer prazoEntregaDias,
                                         String observacao,
                                         OrigemPreco origem) {
        if (precoUnitario == null || precoUnitario.signum() < 0) {
            throw new IllegalArgumentException("Preço inválido.");
        }
        Date agora = new Date();

        Optional<MaterialPreco> vigente = repository.findVigente(material.getId(), distribuidora.getId());
        vigente.ifPresent(mp -> {
            mp.setDataFim(agora);
            repository.save(mp);
        });

        MaterialPreco novo = new MaterialPreco();
        novo.setMaterialDisponivel(material);
        novo.setDistribuidora(distribuidora);
        novo.setPrecoUnitario(precoUnitario);
        novo.setPrazoEntregaDias(prazoEntregaDias);
        novo.setObservacao(observacao);
        novo.setOrigem(origem == null ? OrigemPreco.MANUAL : origem);
        novo.setDataInicio(agora);
        novo.setDataFim(null);
        return repository.save(novo);
    }

    public Optional<MaterialPreco> buscarVigente(Long materialId, Long distribuidoraId) {
        return repository.findVigente(materialId, distribuidoraId);
    }

    public List<MaterialPreco> listarVigentesPorMaterial(Long materialId) {
        return repository.findVigentesPorMaterial(materialId);
    }

    public Optional<MaterialPreco> buscarMenorPrecoVigente(Long materialId) {
        List<MaterialPreco> vigentes = repository.findVigentesPorMaterial(materialId);
        return vigentes.isEmpty() ? Optional.empty() : Optional.of(vigentes.get(0));
    }

    public List<MaterialPreco> listarVigentesPorDistribuidora(Long distribuidoraId) {
        return repository.findVigentesPorDistribuidora(distribuidoraId);
    }

    public List<MaterialPreco> listarHistorico(Long materialId, Long distribuidoraId) {
        return repository.findHistorico(materialId, distribuidoraId);
    }
}

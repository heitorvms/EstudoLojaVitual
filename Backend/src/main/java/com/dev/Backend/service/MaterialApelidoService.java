package com.dev.Backend.service;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.MaterialApelido;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.repository.MaterialApelidoRepository;
import com.dev.Backend.util.TextoNormalizer;

@Service
public class MaterialApelidoService {

    @Autowired
    private MaterialApelidoRepository repository;

    public Optional<MaterialApelido> buscar(Long distribuidoraId, String descricaoFornecedor, String dimensao) {
        String norm = construirChave(descricaoFornecedor, dimensao);
        return repository.findByDistribuidoraIdAndDescricaoNormalizada(distribuidoraId, norm);
    }

    @Transactional
    public MaterialApelido salvarSeNaoExiste(MaterialDisponivel material, Distribuidora distribuidora,
                                              String descricaoFornecedor, String dimensao) {
        String norm = construirChave(descricaoFornecedor, dimensao);
        return repository
            .findByDistribuidoraIdAndDescricaoNormalizada(distribuidora.getId(), norm)
            .orElseGet(() -> {
                MaterialApelido novo = new MaterialApelido();
                novo.setMaterialDisponivel(material);
                novo.setDistribuidora(distribuidora);
                novo.setDescricaoNoFornecedor(montarDescricaoOriginal(descricaoFornecedor, dimensao));
                novo.setDescricaoNormalizada(norm);
                novo.setDataCriacao(new Date());
                return repository.save(novo);
            });
    }

    private String construirChave(String descricao, String dimensao) {
        return TextoNormalizer.normalizar(montarDescricaoOriginal(descricao, dimensao));
    }

    private String montarDescricaoOriginal(String descricao, String dimensao) {
        String d = descricao == null ? "" : descricao.trim();
        if (dimensao != null && !dimensao.isBlank()) d = d + " " + dimensao.trim();
        return d;
    }
}

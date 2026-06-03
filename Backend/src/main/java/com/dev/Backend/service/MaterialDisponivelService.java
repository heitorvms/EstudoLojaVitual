package com.dev.Backend.service;

import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialDisponivelService {

    @Autowired
    private MaterialDisponivelRepository repository;

    public List<MaterialDisponivel> findTop5ByDescricaoContaining(String query) {
        return repository.findTop5ByDescricaoContainingIgnoreCase(query);
    }

    public List<MaterialDisponivel> findOpcoes(String query) {
        if (query == null || query.isBlank()) {
            return repository.findFirst10ByOrderByDescricaoAsc();
        }
        return repository.findTop20ByDescricaoContainingIgnoreCaseOrderByDescricaoAsc(query.trim());
    }

    public List<MaterialDisponivel> findAll(String query) {
        if (query != null && !query.isEmpty()) {
            return repository.findTop5ByDescricaoContainingIgnoreCase(query);
        }
        return repository.findAll();
    }

    public List<MaterialDisponivel> findAll() {
        return repository.findAll();
    }

    public MaterialDisponivel save(MaterialDisponivel material) {
        material.setDataCriacao(new Date());
        material.setDataAtualizacao(new Date());
        return repository.save(material);
    }

    public List<MaterialDisponivel> saveAll(List<MaterialDisponivel> materiais) {
        Date agora = new Date();
        for (MaterialDisponivel m : materiais) {
            m.setId(null);
            m.setDataCriacao(agora);
            m.setDataAtualizacao(agora);
        }
        return repository.saveAll(materiais);
    }

    public Optional<MaterialDisponivel> findById(Long id) {
        return repository.findById(id);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public MaterialDisponivel update(Long id, MaterialDisponivel material) {
        MaterialDisponivel updated = repository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                "Material não encontrado: id=" + id));

        updated.setDescricao(material.getDescricao());
        updated.setTamanho(material.getTamanho());
        updated.setDataAtualizacao(new Date());
        return repository.save(updated);
    }
}
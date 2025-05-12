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

    public List<MaterialDisponivel> findAll(String query) {
        if (query != null && !query.isEmpty()) {
            return repository.findByDescricaoContainingIgnoreCase(query);
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

    public Optional<MaterialDisponivel> findById(Long id) {
        return repository.findById(id);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public MaterialDisponivel update(Long id, MaterialDisponivel material) {
        Optional<MaterialDisponivel> existing = repository.findById(id);
        if (existing.isPresent()) {
            MaterialDisponivel updated = existing.get();
            updated.setDescricao(material.getDescricao());
            updated.setDataAtualizacao(new Date());
            return repository.save(updated);
        }
        throw new RuntimeException("Material não encontrado");
    }
}
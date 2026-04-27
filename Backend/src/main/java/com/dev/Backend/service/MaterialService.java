package com.dev.Backend.service;

import com.dev.Backend.entity.Material;
import com.dev.Backend.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository repository;

    public List<Material> findAll() {
        return repository.findAll();
    }

    public Material save(Material material) {
        material.setDataCriacao(new Date());
        material.setDataAtualizacao(new Date());
        return repository.save(material);
    }

    public Optional<Material> findById(Long id) {
        return repository.findById(id);
    }

    public Material update(Long id, Material material) {
        Optional<Material> existing = repository.findById(id);
        if (existing.isPresent()) {
            Material updated = existing.get();
            updated.setMaterialDisponivel(material.getMaterialDisponivel());
            updated.setCotacaoServico(material.getCotacaoServico());
            updated.setQuantidade(material.getQuantidade());
            updated.setDataAtualizacao(new Date());
            return repository.save(updated);
        }
        throw new RuntimeException("Material não encontrado");
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
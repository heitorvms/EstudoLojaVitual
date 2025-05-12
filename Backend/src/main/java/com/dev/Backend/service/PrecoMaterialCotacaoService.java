package com.dev.Backend.service;

import com.dev.Backend.entity.PrecoMaterialCotacao;
import com.dev.Backend.repository.PrecoMaterialCotacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrecoMaterialCotacaoService {

    @Autowired
    private PrecoMaterialCotacaoRepository repository;

    public List<PrecoMaterialCotacao> findAll() {
        return repository.findAll();
    }

    public PrecoMaterialCotacao save(PrecoMaterialCotacao preco) {
        return repository.save(preco);
    }

    public Optional<PrecoMaterialCotacao> findById(Long id) {
        return repository.findById(id);
    }

    public PrecoMaterialCotacao update(Long id, PrecoMaterialCotacao preco) {
        Optional<PrecoMaterialCotacao> existing = repository.findById(id);
        if (existing.isPresent()) {
            PrecoMaterialCotacao updated = existing.get();
            updated.setCotacaoServico(preco.getCotacaoServico());
            updated.setDistribuidora(preco.getDistribuidora());
            updated.setMaterial(preco.getMaterial());
            updated.setPreco(preco.getPreco());
            return repository.save(updated);
        }
        throw new RuntimeException("Preço não encontrado");
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
package com.dev.Backend.service;

import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.repository.DistribuidoraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DistribuidoraService {

    @Autowired
    private DistribuidoraRepository repository;

    public List<Distribuidora> findAll() {
        return repository.findAll();
    }

    public Distribuidora save(Distribuidora distribuidora) {
        List<Distribuidora> existentes = repository.findByNomeContainingIgnoreCase(distribuidora.getNome());
        if (!existentes.isEmpty()) {
            throw new RuntimeException("Já existe uma distribuidora com nome semelhante: " + existentes.get(0).getNome());
        }
        distribuidora.setDataCriacao(new Date());
        distribuidora.setDataAtualizacao(new Date());
        return repository.save(distribuidora);
    }

    public Optional<Distribuidora> findById(Long id) {
        return repository.findById(id);
    }

    public Distribuidora update(Long id, Distribuidora distribuidora) {
        Optional<Distribuidora> existing = repository.findById(id);
        if (existing.isPresent()) {
            Distribuidora updated = existing.get();
            updated.setNome(distribuidora.getNome());
            updated.setDataAtualizacao(new Date());
            return repository.save(updated);
        }
        throw new RuntimeException("Distribuidora não encontrada");
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public Page<Distribuidora> findSugestoesByNome(String query, Pageable pageable) {
        return repository.findByNomeContainingIgnoreCase(query.trim(), pageable);
    }

    public Page<Distribuidora> findAll(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return repository.findByNomeContainingIgnoreCase(query.trim(), pageable);
        }
        return repository.findAll(pageable);
    }
}
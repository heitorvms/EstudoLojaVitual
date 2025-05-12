package com.dev.Backend.service;

import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.repository.DistribuidoraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
package com.dev.Backend.service;

import com.dev.Backend.entity.Servico;
import com.dev.Backend.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository repository;

    public List<Servico> findAll() {
        return repository.findAll();
    }

    public Servico save(Servico servico) {
        servico.setDataCriacao(new Date());
        servico.setDataAtualizacao(new Date());
        return repository.save(servico);
    }

    public Optional<Servico> findById(Long id) {
        return repository.findById(id);
    }

    public Servico update(Long id, Servico servico) {
        Optional<Servico> existing = repository.findById(id);
        if (existing.isPresent()) {
            Servico updated = existing.get();
            updated.setCliente(servico.getCliente());
            updated.setMateriais(servico.getMateriais());
            updated.setDistribuidoras(servico.getDistribuidoras());
            updated.setDataAtualizacao(new Date());
            return repository.save(updated);
        }
        throw new RuntimeException("Serviço não encontrado");
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
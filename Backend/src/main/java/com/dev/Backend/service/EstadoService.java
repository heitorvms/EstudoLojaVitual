package com.dev.Backend.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dev.Backend.entity.Estado;
import com.dev.Backend.repository.EstadoReposotory;

@Service
public class EstadoService {

    @Autowired
    private EstadoReposotory estadoReposotory;

    public Page<Estado> buscarTodos(Pageable pageable) {
        return estadoReposotory.findAll(pageable);
    }

    public Page<Estado> buscarPorNome(String nome, Pageable pageable) {
        return estadoReposotory.findByNomeContaining(nome, pageable);
    }

    public Estado inserir(Estado estado) {
        estado.setDataCriacao(new Date());
        Estado estadoNovo = estadoReposotory.saveAndFlush(estado);
        return estadoNovo;
    }

    public Estado alterar(Estado estado) {
        estado.setDataAtualizacao(new Date());
        return estadoReposotory.saveAndFlush(estado);
    }

    public void excluir(Long id) {
        Estado estado = estadoReposotory.findById(id).get();
        estadoReposotory.delete(estado);
    }
}

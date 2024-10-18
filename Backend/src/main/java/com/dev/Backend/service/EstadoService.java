package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Estado;
import com.dev.Backend.repository.EstadoReposotory;

@Service
public class EstadoService {

    @Autowired
    private EstadoReposotory estadoReposotory;

    public List<Estado> buscarTodos() {
        return estadoReposotory.findAll();
    }

    public Estado inserir(Estado estado) {
        estado.setDataCriaca(new Date());
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

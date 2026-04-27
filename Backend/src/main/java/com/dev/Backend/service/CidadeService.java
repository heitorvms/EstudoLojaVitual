package com.dev.Backend.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Cidade;
import com.dev.Backend.repository.CidadeReposotory;

@Service
public class CidadeService {

    @Autowired
    private CidadeReposotory cidadeReposotory;

    public Page<Cidade> buscarTodos(Pageable pageable) {
        return cidadeReposotory.findAll(pageable);
    }

    public Page<Cidade> buscarPorNome(String nome, Pageable pageable) {
        return cidadeReposotory.findByNomeContaining(nome, pageable);
    }

    public Page<Cidade> buscarPorEstado(Long estadoId, Pageable pageable) {
        return cidadeReposotory.findByEstadoId(estadoId, pageable);
    }

    public Cidade inserir(Cidade cidade) {
        cidade.setDataCriacao(new Date());
        Cidade cidadeNovo = cidadeReposotory.saveAndFlush(cidade);
        return cidadeNovo;
    }

    public Cidade alterar(Cidade cidade) {
        cidade.setDataAtualizacao(new Date());
        return cidadeReposotory.saveAndFlush(cidade);
    }

    public void excluir(Long id) {
        Cidade cidade = cidadeReposotory.findById(id).get();
        cidadeReposotory.delete(cidade);
    }
}
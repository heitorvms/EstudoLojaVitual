package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PessoaReposotory;

@Service
public class PessoaService {

    @Autowired
    private PessoaReposotory pessoaReposotory;

    public List<Pessoa> buscarTodos() {
        return pessoaReposotory.findAll();
    }

    public Pessoa inserir(Pessoa pessoa) {
        pessoa.setDataCriaca(new Date());
        Pessoa pessoaNova = pessoaReposotory.saveAndFlush(pessoa);
        return pessoaNova;
    }

    public Pessoa alterar(Pessoa pessoa) {
        pessoa.setDataAtualizacao(new Date());
        return pessoaReposotory.saveAndFlush(pessoa);
    }

    public void excluir(Long id) {
        Pessoa pessoa = pessoaReposotory.findById(id).get();
        pessoaReposotory.delete(pessoa);
    }
}

package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PessoaReposotory;

@Service
public class PessoaService {

    @Autowired
    private PessoaReposotory pessoaReposotory;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Pessoa> buscarTodos() {
        return pessoaReposotory.findAll();
    }

    public Pessoa buscarPorEmail(String email) {
        return pessoaReposotory.findByEmail(email);
    }

    public Pessoa inserir(Pessoa pessoa) {
        if (pessoaReposotory.findByEmail(pessoa.getEmail()) != null) {
            throw new RuntimeException("Email já cadastrado");
        }
        pessoa.setSenha(passwordEncoder.encode(pessoa.getSenha()));
        pessoa.setDataCriacao(new Date());
        pessoa.setDataAtualizacao(new Date());

        return pessoaReposotory.saveAndFlush(pessoa);
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
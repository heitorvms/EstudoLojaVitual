package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Permissao;
import com.dev.Backend.entity.PermissaoPessoa;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PermissaoReposotory;
import com.dev.Backend.repository.PessoaReposotory;


import jakarta.transaction.Transactional;

@Service
public class PessoaService {

    @Autowired
    private PessoaReposotory pessoaReposotory;

    @Autowired
    private PessoaReposotory pessoaRepository;

    @Autowired
    private PermissaoReposotory permissaoRepository;


    @Autowired
    private PermissaoPessoaService permissaoPessoaService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Pessoa> buscarTodos() {
        return pessoaReposotory.findAll();
    }

    public Pessoa buscarPorEmail(String email) {
        return pessoaReposotory.findByEmail(email);
    }

    public Pessoa inserir(Pessoa pessoa, String nomePermissao) {
        if (pessoaReposotory.findByEmail(pessoa.getEmail()) != null) {
            throw new RuntimeException("Email já cadastrado");
        }
        pessoa.setSenha(passwordEncoder.encode(pessoa.getSenha()));
        pessoa.setDataCriacao(new Date());
        pessoa.setDataAtualizacao(new Date());

        Pessoa pessoaSalva = pessoaReposotory.saveAndFlush(pessoa);
        permissaoPessoaService.vincularPessoaPermissao(pessoaSalva, nomePermissao);

        return pessoaSalva;
    }

    @Transactional
    public void alterarPermissao(Long pessoaId, String novoPerfil) {
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
            .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        // Remove permissões antigas
        pessoa.getPermissaoPessoas().clear();

        // Busca a nova permissão
        Permissao permissao = permissaoRepository.findByNome(novoPerfil)
            .stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Permissão não encontrada"));

        // Cria nova relação
        PermissaoPessoa permissaoPessoa = new PermissaoPessoa();
        permissaoPessoa.setPessoa(pessoa);
        permissaoPessoa.setPermissao(permissao);

        pessoa.getPermissaoPessoas().add(permissaoPessoa);

        pessoaRepository.save(pessoa);
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
package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Permissao;
import com.dev.Backend.repository.PermissaoReposotory;

@Service
public class PermissaoService {

    @Autowired
    private PermissaoReposotory permissaoReposotory;

    public List<Permissao> buscarTodos() {
        return permissaoReposotory.findAll();
    }

    public Permissao inserir(Permissao permissao) {
        permissao.setDataCriacao(new Date());
        Permissao permissaoNovo = permissaoReposotory.saveAndFlush(permissao);
        return permissaoNovo;
    }

    public Permissao alterar(Permissao permissao) {
        permissao.setDataAtualizacao(new Date());
        return permissaoReposotory.saveAndFlush(permissao);
    }

    public void excluir(Long id) {
        Permissao permissao = permissaoReposotory.findById(id).get();
        permissaoReposotory.delete(permissao);
    }
}
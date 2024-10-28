package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Cidade;
import com.dev.Backend.repository.CidadeReposotory;

@Service
public class CidadeService {
    
    @Autowired
    private CidadeReposotory cidadeReposotory;

    public List<Cidade> buscarTodos(){
        return cidadeReposotory.findAll();
    }

    public Cidade inserir(Cidade cidade){
        cidade.setDataCriaca(new Date());
        Cidade cidadeNovo = cidadeReposotory.saveAndFlush(cidade);
        return cidadeNovo;
    }

    public Cidade alterar(Cidade cidade){
        cidade.setDataAtualizacao(new Date());
        return cidadeReposotory.saveAndFlush(cidade);
    }

    public void excluir(Long id){
        Cidade cidade = cidadeReposotory.findById(id).get();
        cidadeReposotory.delete(cidade);
    }
}

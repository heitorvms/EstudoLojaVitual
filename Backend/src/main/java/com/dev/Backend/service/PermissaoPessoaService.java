package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.entity.Permissao;
import com.dev.Backend.entity.PermissaoPessoa;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PermissaoPessoaReposotory;
import com.dev.Backend.repository.PermissaoReposotory;



@Service
public class PermissaoPessoaService {

    @Autowired
    private PermissaoPessoaReposotory permissaoPessoaRepository;

    @Autowired
    private PermissaoReposotory permissaoRepository;

    // ...existing code...

public void vincularPessoaPermissao(Pessoa pessoa, String nomePermissao){
    List<Permissao> listaPermissao = permissaoRepository.findByNome(nomePermissao);
    if(listaPermissao.size() > 0){
        Permissao permissao = listaPermissao.get(0);
        PermissaoPessoa permissaoPessoa = new PermissaoPessoa();
        permissaoPessoa.setPessoa(pessoa);
        permissaoPessoa.setPermissao(permissao);
        permissaoPessoa.setDataCriacao(new Date());
        permissaoPessoaRepository.saveAndFlush(permissaoPessoa);
    } else {
        throw new RuntimeException("Permissão não encontrada: " + nomePermissao);
    }
}
// ...existing code...

    public void vincularPessoaPermissaoCliente(Pessoa pessoa){
        List<Permissao> listaPermissao = permissaoRepository.findByNome("gerente");
        if(listaPermissao.size()>0){
            PermissaoPessoa permissaoPessoa = new PermissaoPessoa();
            permissaoPessoaRepository.saveAndFlush(permissaoPessoa);
        }
    }
   
}
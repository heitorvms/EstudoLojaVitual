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


    public void vincularPessoaPermissaoCliente(Pessoa pessoa){
        List<Permissao> listaPermissao = permissaoRepository.findByNome("cliente");
        if(listaPermissao.size()>0){
            PermissaoPessoa permissaoPessoa = new PermissaoPessoa();
            permissaoPessoa.setPessoa(pessoa);
            permissaoPessoa.setPermissao(listaPermissao.get(0));
            permissaoPessoa.setDataCriaca(new Date());
            permissaoPessoaRepository.saveAndFlush(permissaoPessoa);
        }
    }
   
}
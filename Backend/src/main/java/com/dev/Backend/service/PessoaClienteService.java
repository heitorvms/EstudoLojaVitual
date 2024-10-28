package com.dev.Backend.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.Backend.dto.PessoaClienteRequestDTO;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.repository.PessoaClienteReposotory;


@Service
public class PessoaClienteService {

    @Autowired
    private PessoaClienteReposotory pessoaReposotory;

    @Autowired
    private PermissaoPessoaService permissaoPessoaService;

    @Autowired
    private EmailService emailService;

    public Pessoa registrar(PessoaClienteRequestDTO pessoaClienteRequestDTO) {
        Pessoa pessoa = new PessoaClienteRequestDTO().converter(pessoaClienteRequestDTO);
        pessoa.setDataCriaca(new Date());
        Pessoa objetoNovo = pessoaReposotory.saveAndFlush(pessoa);
        permissaoPessoaService.vincularPessoaPermissaoCliente(objetoNovo);
        emailService.enviarEmailTexto(objetoNovo.getEmail(), "Cadastro na Loja Tabajara", "O registro na loja foi realizado com sucesso. Em breve você receberá a senha de acesso por e-mail!!");
        return objetoNovo;

    }
}
package com.dev.Backend.dto;

import org.springframework.beans.BeanUtils;

import com.dev.Backend.entity.Cidade;
import com.dev.Backend.entity.Pessoa;

import lombok.Data;

@Data
public class PessoaClienteRequestDTO {
    private String nome;
    private String cpf;
    private String email;
    private String endereco;
    private String cep;
    private Cidade cidade;

    public Pessoa converter(PessoaClienteRequestDTO clienteRequestDTO){
        Pessoa pessoa = new Pessoa();
        BeanUtils.copyProperties(clienteRequestDTO, pessoa);
        return pessoa;
    }

}

package com.dev.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.Backend.dto.PessoaClienteRequestDTO;
import com.dev.Backend.entity.Pessoa;
import com.dev.Backend.service.PessoaClienteService;

@RestController
@RequestMapping("/api/cliente") 
public class PessoaClienteController {

    @Autowired
    private PessoaClienteService pessoaService;

    @PostMapping("/")
    @CrossOrigin("http://localhost:3000/")
    public Pessoa inserir(@RequestBody PessoaClienteRequestDTO pessoaClienteRequestDTO) {
        return pessoaService.registrar(pessoaClienteRequestDTO);
    }
}

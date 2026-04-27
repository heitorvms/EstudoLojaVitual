package com.dev.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Pessoa;

public interface PessoaClienteReposotory extends JpaRepository<Pessoa, Long> {

    Pessoa findByEmail(String email);
    
}

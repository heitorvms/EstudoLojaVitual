package com.dev.Backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Pessoa;

public interface PessoaReposotory extends JpaRepository<Pessoa, Long> {

    Optional<Pessoa> findFirstByEmailOrderByIdAsc(String email);

    Pessoa findByEmailAndCodigoRecuperacaoSenha(String email, String codigoRecuperacaoSenha);
}

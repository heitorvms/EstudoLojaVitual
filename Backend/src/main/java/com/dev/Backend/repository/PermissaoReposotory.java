package com.dev.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Permissao;

public interface PermissaoReposotory extends JpaRepository<Permissao, Long> {
     List<Permissao> findByNome(String nome);
}
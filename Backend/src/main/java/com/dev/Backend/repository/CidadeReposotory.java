package com.dev.Backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Cidade;

public interface CidadeReposotory extends JpaRepository<Cidade, Long> {
    Page<Cidade> findByNomeContaining(String nome, Pageable pageable);
    Page<Cidade> findByEstadoId(Long estadoId, Pageable pageable);
}
package com.dev.Backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Estado;


public interface EstadoReposotory extends JpaRepository<Estado, Long>{
    Page<Estado> findByNomeContaining(String nome, Pageable pageable);
}

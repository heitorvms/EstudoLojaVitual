package com.dev.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Categoria;

public interface CategoriaReposotory extends JpaRepository<Categoria, Long> {
    
}

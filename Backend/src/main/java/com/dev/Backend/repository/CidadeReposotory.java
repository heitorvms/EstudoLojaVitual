package com.dev.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.Cidade;

public interface CidadeReposotory extends JpaRepository<Cidade, Long> {

}
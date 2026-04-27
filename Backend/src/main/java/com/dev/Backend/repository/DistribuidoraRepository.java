package com.dev.Backend.repository;

import com.dev.Backend.entity.Distribuidora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface DistribuidoraRepository extends JpaRepository<Distribuidora, Long> {
    Distribuidora findByNome(String nome);
    List<Distribuidora> findByNomeContainingIgnoreCase(String nome);
    Page<Distribuidora> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}
package com.dev.Backend.repository;

import com.dev.Backend.entity.Distribuidora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DistribuidoraRepository extends JpaRepository<Distribuidora, Long> {
    Distribuidora findByNome(String nome);
}
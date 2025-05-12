package com.dev.Backend.repository;

import com.dev.Backend.entity.MaterialDisponivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialDisponivelRepository extends JpaRepository<MaterialDisponivel, Long> {
    List<MaterialDisponivel> findByDescricaoContainingIgnoreCase(String query);
}
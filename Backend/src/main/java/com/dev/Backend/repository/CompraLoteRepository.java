package com.dev.Backend.repository;

import com.dev.Backend.entity.CompraLote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompraLoteRepository extends JpaRepository<CompraLote, Long> {

    @Query("""
        SELECT c FROM CompraLote c
        WHERE (:q IS NULL OR :q = ''
           OR LOWER(COALESCE(c.numeroNota, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(c.observacao, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(c.distribuidora.nome, '')) LIKE LOWER(CONCAT('%', :q, '%')))
        """)
    Page<CompraLote> search(@Param("q") String q, Pageable pageable);
}

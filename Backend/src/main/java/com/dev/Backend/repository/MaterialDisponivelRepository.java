package com.dev.Backend.repository;

import com.dev.Backend.entity.MaterialDisponivel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MaterialDisponivelRepository extends JpaRepository<MaterialDisponivel, Long> {

    List<MaterialDisponivel> findTop5ByDescricaoContainingIgnoreCase(String query);

    List<MaterialDisponivel> findFirst10ByOrderByDescricaoAsc();

    List<MaterialDisponivel> findTop20ByDescricaoContainingIgnoreCaseOrderByDescricaoAsc(String query);

    @Query(value = """
        SELECT m.id, m.descricao, m.tamanho, similarity(m.descricao, :termo) AS sim
        FROM material_disponivel m
        WHERE m.descricao % :termo
          AND m.tamanho BETWEEN :tamMin AND :tamMax
        ORDER BY sim DESC
        LIMIT 3
        """, nativeQuery = true)
    List<Object[]> buscarCandidatosFuzzy(@Param("termo") String termo,
                                          @Param("tamMin") BigDecimal tamMin,
                                          @Param("tamMax") BigDecimal tamMax);
}
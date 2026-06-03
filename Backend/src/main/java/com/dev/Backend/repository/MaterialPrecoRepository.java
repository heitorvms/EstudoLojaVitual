package com.dev.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dev.Backend.entity.MaterialPreco;

public interface MaterialPrecoRepository extends JpaRepository<MaterialPreco, Long> {

    @Query("SELECT mp FROM MaterialPreco mp " +
           "WHERE mp.materialDisponivel.id = :materialId " +
           "  AND mp.distribuidora.id = :distribuidoraId " +
           "  AND mp.dataFim IS NULL")
    Optional<MaterialPreco> findVigente(@Param("materialId") Long materialId,
                                         @Param("distribuidoraId") Long distribuidoraId);

    @Query("SELECT mp FROM MaterialPreco mp " +
           "JOIN FETCH mp.distribuidora d " +
           "WHERE mp.materialDisponivel.id = :materialId " +
           "  AND mp.dataFim IS NULL " +
           "ORDER BY mp.precoUnitario ASC")
    List<MaterialPreco> findVigentesPorMaterial(@Param("materialId") Long materialId);

    @Query("SELECT mp FROM MaterialPreco mp " +
           "JOIN FETCH mp.materialDisponivel m " +
           "WHERE mp.distribuidora.id = :distribuidoraId " +
           "  AND mp.dataFim IS NULL " +
           "ORDER BY m.descricao ASC")
    List<MaterialPreco> findVigentesPorDistribuidora(@Param("distribuidoraId") Long distribuidoraId);

    @Query("SELECT mp FROM MaterialPreco mp " +
           "WHERE mp.materialDisponivel.id = :materialId " +
           "  AND mp.distribuidora.id = :distribuidoraId " +
           "ORDER BY mp.dataInicio DESC")
    List<MaterialPreco> findHistorico(@Param("materialId") Long materialId,
                                       @Param("distribuidoraId") Long distribuidoraId);
}

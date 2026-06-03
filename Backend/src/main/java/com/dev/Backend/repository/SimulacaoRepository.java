package com.dev.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dev.Backend.entity.Simulacao;

public interface SimulacaoRepository extends JpaRepository<Simulacao, Long> {

    List<Simulacao> findAllByOrderByDataCriacaoDesc();

    @Query("SELECT s FROM Simulacao s " +
           "LEFT JOIN FETCH s.itens i " +
           "LEFT JOIN FETCH i.materialDisponivel " +
           "WHERE s.id = :id")
    Optional<Simulacao> findByIdComItens(@Param("id") Long id);
}

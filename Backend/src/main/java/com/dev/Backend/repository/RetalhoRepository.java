package com.dev.Backend.repository;

import com.dev.Backend.entity.Retalho;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RetalhoRepository extends JpaRepository<Retalho, Long> {

    @EntityGraph(attributePaths = {"materialDisponivel", "ordemServico"})
    List<Retalho> findAllByOrderByMaterialDisponivelDescricaoAscComprimentoMmDesc();

    void deleteByOrdemServicoId(Long ordemServicoId);
}

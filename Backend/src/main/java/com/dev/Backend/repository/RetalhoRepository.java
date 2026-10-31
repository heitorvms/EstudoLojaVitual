package com.dev.Backend.repository;

import com.dev.Backend.entity.Retalho;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RetalhoRepository extends JpaRepository<Retalho, Long> {

    @EntityGraph(attributePaths = {"materialDisponivel", "ordemServico"})
    Page<Retalho> findByMaterialDisponivelDescricaoContainingIgnoreCase(String descricao, Pageable pageable);

    @EntityGraph(attributePaths = {"materialDisponivel", "ordemServico"})
    List<Retalho> findByMaterialDisponivelIdOrderByComprimentoMmDesc(Long materialDisponivelId);

    void deleteByOrdemServicoId(Long ordemServicoId);
}

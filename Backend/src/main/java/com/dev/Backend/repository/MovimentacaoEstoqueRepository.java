package com.dev.Backend.repository;

import com.dev.Backend.entity.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findByMaterialDisponivelIdOrderByDataMovimentacaoDesc(Long materialId);
}

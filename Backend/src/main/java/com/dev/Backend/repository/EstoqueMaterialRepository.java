package com.dev.Backend.repository;

import com.dev.Backend.entity.EstoqueMaterial;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstoqueMaterialRepository extends JpaRepository<EstoqueMaterial, Long> {
    Optional<EstoqueMaterial> findByMaterialDisponivelId(Long materialId);

    @Override
    @EntityGraph(attributePaths = "materialDisponivel")
    List<EstoqueMaterial> findAll();
}

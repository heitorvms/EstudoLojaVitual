package com.dev.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.MaterialApelido;

public interface MaterialApelidoRepository extends JpaRepository<MaterialApelido, Long> {

    Optional<MaterialApelido> findByDistribuidoraIdAndDescricaoNormalizada(
        Long distribuidoraId, String descricaoNormalizada);

    List<MaterialApelido> findByMaterialDisponivelId(Long materialId);

    List<MaterialApelido> findByDistribuidoraId(Long distribuidoraId);
}

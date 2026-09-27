package com.dev.Backend.repository;

import com.dev.Backend.entity.OrdemServico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {
    Optional<OrdemServico> findByCotacaoId(Long cotacaoId);
    boolean existsByCotacaoId(Long cotacaoId);

    @Query("""
        SELECT o FROM OrdemServico o
        WHERE LOWER(COALESCE(o.nome, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(o.clienteNome, '')) LIKE LOWER(CONCAT('%', :q, '%'))
        """)
    Page<OrdemServico> search(@Param("q") String q, Pageable pageable);
}

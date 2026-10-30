package com.dev.Backend.repository;

import com.dev.Backend.entity.CotacaoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CotacaoServicoRepository extends JpaRepository<CotacaoServico, Long> {

    @Query("""
        SELECT c FROM CotacaoServico c
        WHERE (:q = ''
               OR LOWER(COALESCE(c.nome, '')) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(COALESCE(c.clienteNome, '')) LIKE LOWER(CONCAT('%', :q, '%'))
               OR COALESCE(c.telefone, '') LIKE CONCAT('%', :q, '%'))
          AND (:situacao = 'TODAS'
               OR (:situacao = 'COM_OS' AND EXISTS (SELECT 1 FROM OrdemServico o WHERE o.cotacao = c))
               OR (:situacao = 'ABERTAS' AND NOT EXISTS (SELECT 1 FROM OrdemServico o WHERE o.cotacao = c)))
        """)
    Page<CotacaoServico> buscar(@Param("q") String q, @Param("situacao") String situacao, Pageable pageable);
}

package com.dev.Backend.repository;

import com.dev.Backend.entity.CompraLote;
import com.dev.Backend.entity.CompraLoteItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompraLoteRepository extends JpaRepository<CompraLote, Long> {

    @Query("""
        SELECT c FROM CompraLote c
        LEFT JOIN c.distribuidora d
        WHERE (:q IS NULL OR :q = ''
           OR LOWER(COALESCE(c.numeroNota, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(c.observacao, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(d.nome, '')) LIKE LOWER(CONCAT('%', :q, '%')))
        """)
    Page<CompraLote> search(@Param("q") String q, Pageable pageable);

    @Query("""
        SELECT i FROM CompraLoteItem i
        JOIN FETCH i.compraLote c
        LEFT JOIN FETCH i.distribuidora
        WHERE i.materialDisponivel.id = :materialId
          AND c.status = com.dev.Backend.entity.StatusCompraLote.ATIVA
        ORDER BY c.dataCompra DESC, c.id DESC
        """)
    List<CompraLoteItem> findItensAtivosDoMaterial(@Param("materialId") Long materialId);

    @Query("""
        SELECT i.materialDisponivel.id, SUM(i.barras), SUM(i.valorTotal) FROM CompraLoteItem i
        WHERE i.compraLote.status = com.dev.Backend.entity.StatusCompraLote.ATIVA
        GROUP BY i.materialDisponivel.id
        """)
    List<Object[]> totaisCompradosPorMaterial();

    @Query("""
        SELECT i.materialDisponivel.id, SUM(i.barras) FROM CompraLoteItem i
        WHERE i.compraLote.cotacaoId = :cotacaoId
          AND i.compraLote.status = com.dev.Backend.entity.StatusCompraLote.ATIVA
        GROUP BY i.materialDisponivel.id
        """)
    List<Object[]> barrasCompradasDaCotacao(@Param("cotacaoId") Long cotacaoId);

    @Query("""
        SELECT d, SUM(i.valorTotal) FROM CompraLoteItem i
        JOIN i.distribuidora d
        WHERE i.compraLote.cotacaoId = :cotacaoId
          AND i.compraLote.status = com.dev.Backend.entity.StatusCompraLote.ATIVA
        GROUP BY d
        ORDER BY d.nome
        """)
    List<Object[]> valorCompradoPorDistribuidoraDaCotacao(@Param("cotacaoId") Long cotacaoId);
}

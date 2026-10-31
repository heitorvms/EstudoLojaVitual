package com.dev.Backend.repository;

import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.dev.Backend.entity.ContaFinanceira;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;

public interface ContaFinanceiraRepository extends JpaRepository<ContaFinanceira, Long>, JpaSpecificationExecutor<ContaFinanceira> {

    List<ContaFinanceira> findByCotacaoServicoIdOrderByTipoAscIdAsc(Long idCotacao);

    boolean existsByCotacaoServicoId(Long idCotacao);

    List<ContaFinanceira> findByCompraLoteIdOrderByIdAsc(Long idCompraLote);

    List<ContaFinanceira> findByStatusInAndDataVencimentoBefore(
            Collection<StatusContaFinanceira> statuses, Date dataLimite);

    List<ContaFinanceira> findByTipoAndStatusIn(
            TipoContaFinanceira tipo, Collection<StatusContaFinanceira> statuses);
}

package com.dev.Backend.repository;

import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.ContaFinanceira;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;

public interface ContaFinanceiraRepository extends JpaRepository<ContaFinanceira, Long> {

    List<ContaFinanceira> findByCotacaoServicoIdOrderByTipoAscIdAsc(Long idCotacao);

    boolean existsByCotacaoServicoId(Long idCotacao);

    Page<ContaFinanceira> findByTipo(TipoContaFinanceira tipo, Pageable pageable);

    Page<ContaFinanceira> findByStatus(StatusContaFinanceira status, Pageable pageable);

    Page<ContaFinanceira> findByTipoAndStatus(TipoContaFinanceira tipo, StatusContaFinanceira status, Pageable pageable);

    List<ContaFinanceira> findByStatusInAndDataVencimentoBefore(
            Collection<StatusContaFinanceira> statuses, Date dataLimite);

    List<ContaFinanceira> findByTipoAndStatusIn(
            TipoContaFinanceira tipo, Collection<StatusContaFinanceira> statuses);
}

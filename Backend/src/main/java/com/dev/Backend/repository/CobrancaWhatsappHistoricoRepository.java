package com.dev.Backend.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.CobrancaWhatsappHistorico;

public interface CobrancaWhatsappHistoricoRepository extends JpaRepository<CobrancaWhatsappHistorico, Long> {

    List<CobrancaWhatsappHistorico> findByContaIdOrderByDataDisparoDesc(Long contaId);

    void deleteByContaIdIn(Collection<Long> contaIds);
}

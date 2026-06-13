package com.dev.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.Backend.entity.WhatsappEnvioLog;

public interface WhatsappEnvioLogRepository extends JpaRepository<WhatsappEnvioLog, Long> {

    List<WhatsappEnvioLog> findByCotacao_IdOrderByDataEnvioDesc(Long cotacaoId);
}

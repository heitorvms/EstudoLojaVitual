package com.dev.Backend.repository;

import com.dev.Backend.entity.CotacaoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CotacaoServicoRepository extends JpaRepository<CotacaoServico, Long> {
    Page<CotacaoServico> findByNomeContainingOrClienteNomeContainingOrTelefoneContaining(String nome, String clienteNome, String telefone, Pageable pageable);
}
package com.dev.Backend.repository;

import com.dev.Backend.entity.OrdemServicoMaoDeObra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface OrdemServicoMaoDeObraRepository extends JpaRepository<OrdemServicoMaoDeObra, Long> {
    List<OrdemServicoMaoDeObra> findByFuncionarioIdAndDataTrabalhoBetweenOrderByDataTrabalhoDescIdDesc(
            Long funcionarioId, LocalDate inicio, LocalDate fim);

    List<OrdemServicoMaoDeObra> findByFuncionarioIdAndIdIn(Long funcionarioId, Collection<Long> ids);

    boolean existsByFuncionarioId(Long funcionarioId);
}

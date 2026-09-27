package com.dev.Backend.repository;

import com.dev.Backend.entity.FuncionarioOficina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuncionarioOficinaRepository extends JpaRepository<FuncionarioOficina, Long> {
    List<FuncionarioOficina> findByAtivoTrueOrderByNomeAsc();
}

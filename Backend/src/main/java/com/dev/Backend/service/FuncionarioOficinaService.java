package com.dev.Backend.service;

import com.dev.Backend.dto.FuncionarioResumoDTO;
import com.dev.Backend.entity.FuncionarioOficina;
import com.dev.Backend.entity.OrdemServicoMaoDeObra;
import com.dev.Backend.repository.FuncionarioOficinaRepository;
import com.dev.Backend.repository.OrdemServicoMaoDeObraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Service
public class FuncionarioOficinaService {

    @Autowired
    private FuncionarioOficinaRepository repository;

    @Autowired
    private OrdemServicoMaoDeObraRepository maoDeObraRepository;

    public List<FuncionarioOficina> listarTodos() {
        return repository.findAll();
    }

    public List<FuncionarioOficina> listarAtivos() {
        return repository.findByAtivoTrueOrderByNomeAsc();
    }

    public FuncionarioOficina salvar(FuncionarioOficina f) {
        Date now = new Date();
        if (f.getId() == null) {
            f.setDataCriacao(now);
            if (f.getAtivo() == null) f.setAtivo(true);
        }
        f.setDataAtualizacao(now);
        return repository.save(f);
    }

    public FuncionarioOficina atualizar(Long id, FuncionarioOficina input) {
        FuncionarioOficina f = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
        f.setNome(input.getNome());
        f.setTelefone(input.getTelefone());
        f.setCargo(input.getCargo());
        f.setValorHora(input.getValorHora());
        f.setValorHoraNoturno(input.getValorHoraNoturno());
        if (input.getAtivo() != null) f.setAtivo(input.getAtivo());
        f.setDataAtualizacao(new Date());
        return repository.save(f);
    }

    @Transactional(readOnly = true)
    public FuncionarioResumoDTO resumo(Long id, LocalDate inicio, LocalDate fim) {
        LocalDate de = inicio != null ? inicio : LocalDate.of(1900, 1, 1);
        LocalDate ate = fim != null ? fim : LocalDate.of(9999, 12, 31);
        return FuncionarioResumoDTO.from(
                maoDeObraRepository.findByFuncionarioIdAndDataTrabalhoBetweenOrderByDataTrabalhoDescIdDesc(id, de, ate));
    }

    @Transactional
    public void registrarPagamento(Long id, List<Long> lancamentoIds, boolean pago) {
        if (lancamentoIds == null || lancamentoIds.isEmpty()) return;
        List<OrdemServicoMaoDeObra> lancamentos = maoDeObraRepository.findByFuncionarioIdAndIdIn(id, lancamentoIds);
        for (OrdemServicoMaoDeObra l : lancamentos) {
            l.setPagoFuncionario(pago);
            l.setDataPagamentoFuncionario(pago ? LocalDate.now() : null);
        }
        maoDeObraRepository.saveAll(lancamentos);
    }

    /** Funcionário com horas lançadas é apenas desativado, preservando o histórico. Retorna true se excluiu. */
    @Transactional
    public boolean excluir(Long id) {
        if (!maoDeObraRepository.existsByFuncionarioId(id)) {
            repository.deleteById(id);
            return true;
        }
        FuncionarioOficina f = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
        f.setAtivo(false);
        f.setDataAtualizacao(new Date());
        repository.save(f);
        return false;
    }
}

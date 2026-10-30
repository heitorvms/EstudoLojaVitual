package com.dev.Backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.dto.PlanoCorteDTO;
import com.dev.Backend.dto.RetalhoDTO;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.entity.OrdemServico;
import com.dev.Backend.entity.Retalho;
import com.dev.Backend.repository.RetalhoRepository;

@Service
public class RetalhoService {

    private final RetalhoRepository retalhoRepository;

    public RetalhoService(RetalhoRepository retalhoRepository) {
        this.retalhoRepository = retalhoRepository;
    }

    @Transactional(readOnly = true)
    public List<RetalhoDTO> listar() {
        return retalhoRepository.findAllByOrderByMaterialDisponivelDescricaoAscComprimentoMmDesc()
            .stream().map(RetalhoDTO::from).toList();
    }

    @Transactional
    public void registrar(OrdemServico os, MaterialDisponivel material, List<PlanoCorteDTO.Retalho> retalhos) {
        Date agora = new Date();
        for (PlanoCorteDTO.Retalho r : retalhos) {
            Retalho retalho = new Retalho();
            retalho.setMaterialDisponivel(material);
            retalho.setOrdemServico(os);
            retalho.setComprimentoMm(r.comprimentoMm());
            retalho.setQuantidade(r.quantidade());
            retalho.setDataCriacao(agora);
            retalhoRepository.save(retalho);
        }
    }

    @Transactional
    public void removerDaOrdem(Long ordemServicoId) {
        retalhoRepository.deleteByOrdemServicoId(ordemServicoId);
    }

    /** Retira unidades do estoque de retalhos; zerado, o registro é removido. */
    @Transactional
    public void usar(Long id, Integer quantidade) {
        Retalho retalho = retalhoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Retalho não encontrado."));
        if (quantidade == null || quantidade < 1 || quantidade > retalho.getQuantidade()) {
            throw new IllegalArgumentException(
                "Informe uma quantidade entre 1 e " + retalho.getQuantidade() + ".");
        }
        if (quantidade.equals(retalho.getQuantidade())) {
            retalhoRepository.delete(retalho);
            return;
        }
        retalho.setQuantidade(retalho.getQuantidade() - quantidade);
        retalhoRepository.save(retalho);
    }
}

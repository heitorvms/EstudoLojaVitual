package com.dev.Backend.dto;

import com.dev.Backend.entity.OrdemServico;
import com.dev.Backend.entity.Retalho;

import java.util.Date;

public record RetalhoDTO(
    Long id,
    Long materialDisponivelId,
    String material,
    Integer comprimentoMm,
    Integer quantidade,
    Long ordemServicoId,
    String ordemServicoNome,
    Date dataCriacao) {

    public static RetalhoDTO from(Retalho r) {
        OrdemServico os = r.getOrdemServico();
        return new RetalhoDTO(
            r.getId(),
            r.getMaterialDisponivel().getId(),
            r.getMaterialDisponivel().getDescricao(),
            r.getComprimentoMm(),
            r.getQuantidade(),
            os != null ? os.getId() : null,
            os != null ? os.getNome() : null,
            r.getDataCriacao());
    }
}

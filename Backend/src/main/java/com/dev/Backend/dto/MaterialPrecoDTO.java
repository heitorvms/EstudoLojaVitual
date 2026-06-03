package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;
import com.dev.Backend.entity.MaterialPreco;
import com.dev.Backend.entity.OrigemPreco;
import lombok.Data;

@Data
public class MaterialPrecoDTO {
    private Long id;
    private Long materialDisponivelId;
    private String materialDescricao;
    private BigDecimal materialTamanho;
    private Long distribuidoraId;
    private String distribuidoraNome;
    private BigDecimal precoUnitario;
    private Integer prazoEntregaDias;
    private String observacao;
    private OrigemPreco origem;
    private Date dataInicio;
    private Date dataFim;

    public static MaterialPrecoDTO fromEntity(MaterialPreco mp) {
        MaterialPrecoDTO dto = new MaterialPrecoDTO();
        dto.setId(mp.getId());
        if (mp.getMaterialDisponivel() != null) {
            dto.setMaterialDisponivelId(mp.getMaterialDisponivel().getId());
            dto.setMaterialDescricao(mp.getMaterialDisponivel().getDescricao());
            dto.setMaterialTamanho(mp.getMaterialDisponivel().getTamanho());
        }
        if (mp.getDistribuidora() != null) {
            dto.setDistribuidoraId(mp.getDistribuidora().getId());
            dto.setDistribuidoraNome(mp.getDistribuidora().getNome());
        }
        dto.setPrecoUnitario(mp.getPrecoUnitario());
        dto.setPrazoEntregaDias(mp.getPrazoEntregaDias());
        dto.setObservacao(mp.getObservacao());
        dto.setOrigem(mp.getOrigem());
        dto.setDataInicio(mp.getDataInicio());
        dto.setDataFim(mp.getDataFim());
        return dto;
    }
}

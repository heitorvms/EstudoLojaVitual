package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class MaterialImportadoDTO {
    private String descricao;
    private String dimensao;
    private BigDecimal tamanho;
    private BigDecimal precoUnitario;
    private Integer linha;
    private String erro;
    private boolean valido;

    /** ID do material já cadastrado quando há match. NULL = será criado novo. */
    private Long materialMatchId;
    /** Descrição do material casado (pra mostrar no preview). */
    private String materialMatchDescricao;
    /** Status do match: APELIDO_CONHECIDO | MATERIAL_EXISTENTE | AMBIGUO | NOVO_MATERIAL */
    private String statusMatch;
    /** Lista de candidatos quando AMBIGUO (fuzzy). Vazio nos outros casos. */
    private List<CandidatoMatchDTO> candidatos = new ArrayList<>();
    /** Frontend marca como true quando usuário escolhe um candidato manualmente, pra criar apelido. */
    private boolean gravarApelido;
}

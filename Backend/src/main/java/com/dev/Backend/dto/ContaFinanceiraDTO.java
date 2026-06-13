package com.dev.Backend.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.dev.Backend.entity.FormaPagamento;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;

import lombok.Data;

@Data
public class ContaFinanceiraDTO {
    private Long id;
    private TipoContaFinanceira tipo;
    private StatusContaFinanceira status;
    private FormaPagamento formaPagamento;
    private BigDecimal valor;
    private BigDecimal valorPago;
    private BigDecimal valorPendente;
    private String descricao;
    private String clienteNomeSnapshot;
    private String telefoneClienteSnapshot;
    private Date dataVencimento;
    private Date dataPagamento;
    private Long cotacaoId;
    private String cotacaoNome;
    private Long distribuidoraId;
    private String distribuidoraNome;
    private Date dataCriacao;
    private Date dataAtualizacao;
    private Integer numeroParcela;
    private Integer totalParcelas;
    private String grupoParcela;
}

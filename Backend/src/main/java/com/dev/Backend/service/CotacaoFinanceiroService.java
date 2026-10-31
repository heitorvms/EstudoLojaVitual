package com.dev.Backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.BiFunction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.dto.BaixaContaFinanceiraDTO;
import com.dev.Backend.dto.CobrancaHistoricoDTO;
import com.dev.Backend.dto.ContaFinanceiraDTO;
import com.dev.Backend.dto.FiltroContaFinanceiraDTO;
import com.dev.Backend.dto.FinanceiroResumoDTO;
import com.dev.Backend.dto.GerarContasFinanceirasDTO;
import com.dev.Backend.dto.RegistrarCobrancaWhatsappDTO;
import com.dev.Backend.dto.WhatsappCobrancaPreviewDTO;
import com.dev.Backend.entity.CategoriaContaFinanceira;
import com.dev.Backend.entity.CobrancaWhatsappHistorico;
import com.dev.Backend.entity.CompraLote;
import com.dev.Backend.entity.CompraLoteItem;
import com.dev.Backend.entity.ContaFinanceira;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.entity.Distribuidora;
import com.dev.Backend.entity.FormaPagamento;
import com.dev.Backend.entity.OrdemServico;
import com.dev.Backend.entity.StatusCompraLote;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;
import com.dev.Backend.entity.TipoDisparoCobranca;
import com.dev.Backend.entity.ConfiguracaoWhatsapp;
import com.dev.Backend.repository.CobrancaWhatsappHistoricoRepository;
import com.dev.Backend.repository.CompraLoteRepository;
import com.dev.Backend.repository.ConfiguracaoWhatsappRepository;
import com.dev.Backend.repository.ContaFinanceiraRepository;
import com.dev.Backend.repository.ContaFinanceiraSpecifications;
import com.dev.Backend.repository.OrdemServicoRepository;
import com.dev.Backend.exception.RegraNegocioException;

@Service
public class CotacaoFinanceiroService {

    private final ContaFinanceiraRepository contaFinanceiraRepository;
    private final ConfiguracaoWhatsappRepository configuracaoWhatsappRepository;
    private final FinanceiroVencimentoService financeiroVencimentoService;
    private final CobrancaWhatsappHistoricoRepository cobrancaHistoricoRepository;
    private final CompraLoteRepository compraLoteRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    private static final List<StatusContaFinanceira> STATUS_EM_ABERTO = List.of(
            StatusContaFinanceira.PENDENTE,
            StatusContaFinanceira.PARCIAL,
            StatusContaFinanceira.VENCIDA);

    public CotacaoFinanceiroService(
            ContaFinanceiraRepository contaFinanceiraRepository,
            ConfiguracaoWhatsappRepository configuracaoWhatsappRepository,
            FinanceiroVencimentoService financeiroVencimentoService,
            CobrancaWhatsappHistoricoRepository cobrancaHistoricoRepository,
            CompraLoteRepository compraLoteRepository,
            OrdemServicoRepository ordemServicoRepository) {
        this.contaFinanceiraRepository = contaFinanceiraRepository;
        this.configuracaoWhatsappRepository = configuracaoWhatsappRepository;
        this.financeiroVencimentoService = financeiroVencimentoService;
        this.cobrancaHistoricoRepository = cobrancaHistoricoRepository;
        this.compraLoteRepository = compraLoteRepository;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    public int atualizarContasVencidas() {
        return financeiroVencimentoService.atualizarContasVencidas();
    }

    @Transactional(readOnly = true)
    public Page<ContaFinanceiraDTO> listar(FiltroContaFinanceiraDTO filtro, Pageable pageable) {
        atualizarContasVencidas();
        Long cotacaoDaOs = null;
        if (filtro.ordemServicoId() != null) {
            Optional<OrdemServico> os = ordemServicoRepository.findById(filtro.ordemServicoId());
            if (os.isEmpty()) return Page.empty(pageable);
            cotacaoDaOs = os.get().getCotacao().getId();
        }
        return contaFinanceiraRepository
                .findAll(ContaFinanceiraSpecifications.comFiltro(filtro, cotacaoDaOs), pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ContaFinanceiraDTO> listarPorCotacao(Long idCotacao) {
        atualizarContasVencidas();
        return contaFinanceiraRepository.findByCotacaoServicoIdOrderByTipoAscIdAsc(idCotacao)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContaFinanceiraDTO buscarPorId(Long id) {
        ContaFinanceira conta = contaFinanceiraRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Conta financeira não encontrada: " + id));
        return toDTO(conta);
    }

    /** Retorna false quando o orçamento já possui contas que não podem ser substituídas. */
    @Transactional
    public boolean gerarContasDaOrdem(OrdemServico os, GerarContasFinanceirasDTO opcoes) {
        CotacaoServico cotacao = os.getCotacao();
        if (cotacao == null || !descartarContasAntigasSemPagamento(cotacao.getId())) {
            return false;
        }
        GerarContasFinanceirasDTO opts = opcoes != null ? opcoes : GerarContasFinanceirasDTO.padrao();
        BigDecimal valorMaterial = valorMaterialCliente(cotacao);
        BigDecimal valorMaoDeObra = valorMaoDeObraCliente(cotacao);

        List<ContaFinanceira> geradas = new ArrayList<>();
        geradas.addAll(criarParcelasReceber(os, CategoriaContaFinanceira.MATERIAL, valorMaterial, opts.getMaterial(), opts.intervaloDias()));
        geradas.addAll(criarParcelasReceber(os, CategoriaContaFinanceira.MAO_DE_OBRA, valorMaoDeObra, opts.getMaoDeObra(), opts.intervaloDias()));
        geradas.addAll(criarContasPagar(os, opts));
        contaFinanceiraRepository.saveAll(geradas);
        return true;
    }

    /**
     * Cotações antigas geravam contas sem categoria ao serem salvas. Elas são substituídas pelas contas
     * da OS, exceto quando já houver pagamento registrado. Retorna true quando a geração pode prosseguir.
     */
    private boolean descartarContasAntigasSemPagamento(Long idCotacao) {
        List<ContaFinanceira> existentes = contaFinanceiraRepository.findByCotacaoServicoIdOrderByTipoAscIdAsc(idCotacao);
        if (existentes.isEmpty()) {
            return true;
        }
        boolean jaGeradasPelaOs = existentes.stream().anyMatch(c -> c.getCategoria() != null);
        boolean possuiPagamento = existentes.stream().anyMatch(c -> c.getStatus() == StatusContaFinanceira.PAGA
                || c.getStatus() == StatusContaFinanceira.PARCIAL);
        if (jaGeradasPelaOs || possuiPagamento) {
            return false;
        }
        cobrancaHistoricoRepository.deleteByContaIdIn(existentes.stream().map(ContaFinanceira::getId).toList());
        contaFinanceiraRepository.deleteAll(existentes);
        return true;
    }

    public BigDecimal valorMaterialCliente(CotacaoServico cotacao) {
        return nz(cotacao.getTotalCustoMateriais())
                .add(nz(cotacao.getValorInsumos()))
                .add(nz(cotacao.getValorFrete()));
    }

    public BigDecimal valorMaoDeObraCliente(CotacaoServico cotacao) {
        return nz(cotacao.getValorTotalOrcamento()).subtract(valorMaterialCliente(cotacao)).max(BigDecimal.ZERO);
    }

    /** Retorna null quando a cotação não possui contas a receber da categoria. */
    @Transactional(readOnly = true)
    public Boolean recebimentoQuitado(Long idCotacao, CategoriaContaFinanceira categoria) {
        List<ContaFinanceira> contas = recebimentosAtivos(idCotacao, categoria);
        if (contas.isEmpty()) {
            return null;
        }
        return contas.stream().allMatch(c -> c.getStatus() == StatusContaFinanceira.PAGA);
    }

    @Transactional
    public void quitarRecebimento(Long idCotacao, CategoriaContaFinanceira categoria) {
        List<ContaFinanceira> contas = recebimentosAtivos(idCotacao, categoria);
        if (contas.isEmpty()) {
            throw new RegraNegocioException("Não há contas a receber desta categoria para a OS.");
        }
        Date agora = new Date();
        for (ContaFinanceira conta : contas) {
            if (conta.getStatus() == StatusContaFinanceira.PAGA) continue;
            conta.setValorPago(conta.getValor());
            conta.setDataPagamento(agora);
            conta.setStatus(StatusContaFinanceira.PAGA);
        }
        contaFinanceiraRepository.saveAll(contas);
    }

    @Transactional
    public void estornarRecebimento(Long idCotacao, CategoriaContaFinanceira categoria) {
        List<ContaFinanceira> contas = recebimentosAtivos(idCotacao, categoria);
        for (ContaFinanceira conta : contas) {
            conta.setValorPago(BigDecimal.ZERO);
            conta.setDataPagamento(null);
            conta.setStatus(StatusContaFinanceira.PENDENTE);
        }
        contaFinanceiraRepository.saveAll(contas);
        atualizarContasVencidas();
    }

    /**
     * O material comprado continua devido ao fornecedor (volta ao estoque), então a conta dele é mantida.
     * Parcelas com pagamento parcial ficam só com o valor já pago.
     */
    @Transactional
    public void cancelarContasEmAberto(Long idCotacao) {
        List<ContaFinanceira> contas = contaFinanceiraRepository.findByCotacaoServicoIdOrderByTipoAscIdAsc(idCotacao);
        for (ContaFinanceira conta : contas) {
            if (isPagarMaterial(conta)) continue;
            if (conta.getStatus() == StatusContaFinanceira.PENDENTE || conta.getStatus() == StatusContaFinanceira.VENCIDA) {
                conta.setStatus(StatusContaFinanceira.CANCELADA);
            } else if (conta.getStatus() == StatusContaFinanceira.PARCIAL) {
                BigDecimal saldo = conta.getValor().subtract(nz(conta.getValorPago()));
                conta.setValor(nz(conta.getValorPago()));
                conta.setStatus(StatusContaFinanceira.PAGA);
                conta.setDescricao(conta.getDescricao() + " (saldo de " + formatarMoeda(saldo) + " cancelado com a OS)");
            }
        }
        contaFinanceiraRepository.saveAll(contas);
    }

    private boolean isPagarMaterial(ContaFinanceira conta) {
        return conta.getTipo() == TipoContaFinanceira.PAGAR && conta.getCategoria() == CategoriaContaFinanceira.MATERIAL;
    }

    private List<ContaFinanceira> recebimentosAtivos(Long idCotacao, CategoriaContaFinanceira categoria) {
        return contaFinanceiraRepository.findByCotacaoServicoIdOrderByTipoAscIdAsc(idCotacao).stream()
                .filter(c -> c.getTipo() == TipoContaFinanceira.RECEBER)
                .filter(c -> c.getCategoria() == categoria)
                .filter(c -> c.getStatus() != StatusContaFinanceira.CANCELADA)
                .toList();
    }

    @Transactional(readOnly = true)
    public FinanceiroResumoDTO obterResumo() {
        financeiroVencimentoService.atualizarContasVencidas();
        FinanceiroResumoDTO resumo = new FinanceiroResumoDTO();
        for (ContaFinanceira conta : contaFinanceiraRepository.findAll()) {
            BigDecimal pendente = conta.getValor().subtract(nz(conta.getValorPago())).max(BigDecimal.ZERO);
            if (conta.getStatus() == StatusContaFinanceira.PAGA) {
                resumo.setQuantidadeContasPagas(resumo.getQuantidadeContasPagas() + 1);
                continue;
            }
            if (conta.getStatus() == StatusContaFinanceira.CANCELADA) {
                continue;
            }
            if (STATUS_EM_ABERTO.contains(conta.getStatus())) {
                resumo.setQuantidadeContasPendentes(resumo.getQuantidadeContasPendentes() + 1);
            }
            if (conta.getStatus() == StatusContaFinanceira.VENCIDA) {
                resumo.setQuantidadeContasVencidas(resumo.getQuantidadeContasVencidas() + 1);
            }
            if (conta.getTipo() == TipoContaFinanceira.RECEBER && STATUS_EM_ABERTO.contains(conta.getStatus())) {
                resumo.setTotalReceberPendente(resumo.getTotalReceberPendente().add(pendente));
                if (conta.getStatus() == StatusContaFinanceira.VENCIDA) {
                    resumo.setTotalVencidoReceber(resumo.getTotalVencidoReceber().add(pendente));
                }
            }
            if (conta.getTipo() == TipoContaFinanceira.PAGAR && STATUS_EM_ABERTO.contains(conta.getStatus())) {
                resumo.setTotalPagarPendente(resumo.getTotalPagarPendente().add(pendente));
            }
        }
        return resumo;
    }

    @Transactional(readOnly = true)
    public List<CobrancaHistoricoDTO> listarHistoricoCobranca(Long idConta) {
        return cobrancaHistoricoRepository.findByContaIdOrderByDataDisparoDesc(idConta).stream()
                .map(this::toHistoricoDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public WhatsappCobrancaPreviewDTO previewCobrancaWhatsapp(Long idConta) {
        ContaFinanceira conta = carregarContaParaCobranca(idConta);
        return montarPreviewWhatsapp(conta);
    }

    @Transactional(readOnly = true)
    public List<WhatsappCobrancaPreviewDTO> listarPreviewsCobrancaVencidas() {
        financeiroVencimentoService.atualizarContasVencidas();
        return contaFinanceiraRepository
                .findByTipoAndStatusIn(TipoContaFinanceira.RECEBER, List.of(StatusContaFinanceira.VENCIDA))
                .stream()
                .map(this::montarPreviewWhatsapp)
                .toList();
    }

    @Transactional
    public CobrancaHistoricoDTO registrarCobrancaWhatsapp(Long idConta, RegistrarCobrancaWhatsappDTO body) {
        ContaFinanceira conta = carregarContaParaCobranca(idConta);
        WhatsappCobrancaPreviewDTO preview = montarPreviewWhatsapp(conta);
        TipoDisparoCobranca tipo = body != null && body.getTipo() != null
                ? body.getTipo()
                : TipoDisparoCobranca.ABERTURA_WHATSAPP;
        return toHistoricoDTO(salvarHistorico(conta, preview, tipo));
    }

    @Transactional
    public List<CobrancaHistoricoDTO> registrarCobrancaLoteVencidas() {
        financeiroVencimentoService.atualizarContasVencidas();
        List<CobrancaHistoricoDTO> registros = new ArrayList<>();
        for (ContaFinanceira conta : contaFinanceiraRepository.findByTipoAndStatusIn(
                TipoContaFinanceira.RECEBER, List.of(StatusContaFinanceira.VENCIDA))) {
            WhatsappCobrancaPreviewDTO preview = montarPreviewWhatsapp(conta);
            registros.add(toHistoricoDTO(salvarHistorico(conta, preview, TipoDisparoCobranca.LOTE_VENCIDAS)));
        }
        return registros;
    }

    private ContaFinanceira carregarContaParaCobranca(Long idConta) {
        ContaFinanceira conta = contaFinanceiraRepository.findById(idConta)
                .orElseThrow(() -> new RegraNegocioException("Conta financeira não encontrada: " + idConta));
        if (conta.getTipo() != TipoContaFinanceira.RECEBER) {
            throw new RegraNegocioException("Cobrança WhatsApp disponível apenas para contas a receber.");
        }
        if (conta.getStatus() == StatusContaFinanceira.PAGA || conta.getStatus() == StatusContaFinanceira.CANCELADA) {
            throw new RegraNegocioException("Conta quitada ou cancelada não pode gerar cobrança.");
        }
        return conta;
    }

    private WhatsappCobrancaPreviewDTO montarPreviewWhatsapp(ContaFinanceira conta) {
        ConfiguracaoWhatsapp config = configuracaoWhatsappRepository.findById(ConfiguracaoWhatsapp.ID_UNICO)
                .orElseThrow(() -> new RegraNegocioException("Configure o template de cobrança em Configurações > WhatsApp."));
        String template = config.getMensagemCobranca();
        if (template == null || template.isBlank()) {
            throw new RegraNegocioException("Template de cobrança não configurado.");
        }
        String mensagem = aplicarPlaceholdersCobranca(template, conta);
        String telefone = normalizarTelefoneWa(conta.getTelefoneClienteSnapshot());
        WhatsappCobrancaPreviewDTO dto = new WhatsappCobrancaPreviewDTO();
        dto.setContaId(conta.getId());
        dto.setTelefone(telefone);
        dto.setMensagem(mensagem);
        dto.setLinkWhatsapp(montarLinkWhatsapp(telefone, mensagem));
        return dto;
    }

    private CobrancaWhatsappHistorico salvarHistorico(
            ContaFinanceira conta, WhatsappCobrancaPreviewDTO preview, TipoDisparoCobranca tipo) {
        CobrancaWhatsappHistorico historico = new CobrancaWhatsappHistorico();
        historico.setConta(conta);
        historico.setMensagem(preview.getMensagem());
        historico.setTelefone(preview.getTelefone());
        historico.setLinkWhatsapp(preview.getLinkWhatsapp());
        historico.setTipo(tipo);
        return cobrancaHistoricoRepository.save(historico);
    }

    private CobrancaHistoricoDTO toHistoricoDTO(CobrancaWhatsappHistorico h) {
        CobrancaHistoricoDTO dto = new CobrancaHistoricoDTO();
        dto.setId(h.getId());
        dto.setContaId(h.getConta().getId());
        dto.setMensagem(h.getMensagem());
        dto.setTelefone(h.getTelefone());
        dto.setLinkWhatsapp(h.getLinkWhatsapp());
        dto.setTipo(h.getTipo());
        dto.setDataDisparo(h.getDataDisparo());
        return dto;
    }

    @Transactional
    public ContaFinanceiraDTO registrarBaixa(Long id, BaixaContaFinanceiraDTO dto) {
        ContaFinanceira conta = contaFinanceiraRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Conta financeira não encontrada: " + id));

        if (conta.getStatus() == StatusContaFinanceira.CANCELADA) {
            throw new RegraNegocioException("Conta cancelada não pode receber baixa.");
        }
        if (conta.getStatus() == StatusContaFinanceira.PAGA) {
            throw new RegraNegocioException("Conta já está quitada.");
        }

        BigDecimal pendente = conta.getValor().subtract(nz(conta.getValorPago())).max(BigDecimal.ZERO);
        if (pendente.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Não há valor pendente nesta conta.");
        }
        BigDecimal valorPago = dto.getValorPago() != null ? dto.getValorPago() : pendente;
        if (valorPago.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Valor pago deve ser maior que zero.");
        }
        if (valorPago.compareTo(pendente) > 0) {
            throw new RegraNegocioException("Valor pago não pode ser maior que o pendente (" + formatarMoeda(pendente) + ").");
        }

        BigDecimal acumulado = nz(conta.getValorPago()).add(valorPago);
        conta.setValorPago(acumulado.min(conta.getValor()));
        conta.setDataPagamento(dto.getDataPagamento() != null ? dto.getDataPagamento() : new Date());
        if (dto.getFormaPagamento() != null) {
            conta.setFormaPagamento(dto.getFormaPagamento());
        }

        if (conta.getValorPago().compareTo(conta.getValor()) >= 0) {
            conta.setStatus(StatusContaFinanceira.PAGA);
            conta.setValorPago(conta.getValor());
        } else {
            conta.setStatus(StatusContaFinanceira.PARCIAL);
        }

        return toDTO(contaFinanceiraRepository.save(conta));
    }

    @Transactional
    public ContaFinanceiraDTO cancelar(Long id) {
        ContaFinanceira conta = contaFinanceiraRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Conta financeira não encontrada: " + id));
        if (conta.getStatus() == StatusContaFinanceira.PAGA) {
            throw new RegraNegocioException("Conta quitada não pode ser cancelada.");
        }
        conta.setStatus(StatusContaFinanceira.CANCELADA);
        return toDTO(contaFinanceiraRepository.save(conta));
    }

    private List<ContaFinanceira> criarParcelasReceber(OrdemServico os, CategoriaContaFinanceira categoria,
                                                       BigDecimal valorTotal, GerarContasFinanceirasDTO.RecebimentoDTO opcoes,
                                                       int intervaloDias) {
        List<ContaFinanceira> contas = new ArrayList<>();
        if (valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return contas;
        }
        GerarContasFinanceirasDTO.RecebimentoDTO opts = opcoes != null ? opcoes : new GerarContasFinanceirasDTO.RecebimentoDTO();
        CotacaoServico cotacao = os.getCotacao();
        int parcelas = opts.totalParcelas();
        String grupo = UUID.randomUUID().toString();
        String rotulo = categoria == CategoriaContaFinanceira.MATERIAL ? "Material" : "Mão de obra";
        BigDecimal valorBase = valorTotal.divide(BigDecimal.valueOf(parcelas), 2, RoundingMode.HALF_UP);
        BigDecimal acumulado = BigDecimal.ZERO;

        for (int i = 1; i <= parcelas; i++) {
            BigDecimal valorParcela = (i == parcelas) ? valorTotal.subtract(acumulado) : valorBase;
            acumulado = acumulado.add(valorParcela);

            ContaFinanceira conta = baseConta(cotacao, TipoContaFinanceira.RECEBER);
            conta.setCategoria(categoria);
            conta.setValor(valorParcela);
            conta.setFormaPagamento(opts.forma());
            conta.setGrupoParcela(grupo);
            conta.setNumeroParcela(i);
            conta.setTotalParcelas(parcelas);
            String sufixoParcela = parcelas > 1 ? " — parcela " + i + "/" + parcelas : "";
            conta.setDescricao(rotulo + " — OS #" + os.getId() + " — " + safe(cotacao.getNome()) + sufixoParcela);
            preencherSnapshotCliente(cotacao, conta);
            conta.setDataVencimento(vencimentoComDias(opts.diasPrimeira() + intervaloDias * (i - 1)));
            contas.add(conta);
        }
        return contas;
    }

    private List<ContaFinanceira> criarContasPagar(OrdemServico os, GerarContasFinanceirasDTO opts) {
        CotacaoServico cotacao = os.getCotacao();
        FormaPagamento forma = opts.getFormaPagamentoPagar() != null
                ? opts.getFormaPagamentoPagar() : FormaPagamento.A_VISTA;
        List<ContaFinanceira> contas = new ArrayList<>();
        adicionarContasPagarMaterial(contas, os, forma, opts.diasPagar());
        adicionarContaPagar(contas, os, CategoriaContaFinanceira.INSUMOS, "Insumos", cotacao.getValorInsumos(), null, forma, opts.diasPagar());
        adicionarContaPagar(contas, os, CategoriaContaFinanceira.FRETE, "Frete", cotacao.getValorFrete(), null, forma, opts.diasPagar());
        return contas;
    }

    /** Uma conta por fornecedor das compras vinculadas; sem compras, usa o custo cotado. */
    private void adicionarContasPagarMaterial(List<ContaFinanceira> contas, OrdemServico os, FormaPagamento forma, int dias) {
        CotacaoServico cotacao = os.getCotacao();
        List<Object[]> compradoPorDistribuidora = compraLoteRepository.valorCompradoPorDistribuidoraDaCotacao(cotacao.getId());
        if (compradoPorDistribuidora.isEmpty()) {
            adicionarContaPagar(contas, os, CategoriaContaFinanceira.MATERIAL, "Materiais",
                    cotacao.getTotalCustoMateriais(), distribuidoraPrincipal(cotacao), forma, dias);
            return;
        }
        for (Object[] linha : compradoPorDistribuidora) {
            Distribuidora distribuidora = (Distribuidora) linha[0];
            adicionarContaPagar(contas, os, CategoriaContaFinanceira.MATERIAL, "Materiais " + distribuidora.getNome(),
                    (BigDecimal) linha[1], distribuidora, forma, dias);
        }
    }

    private void adicionarContaPagar(List<ContaFinanceira> contas, OrdemServico os, CategoriaContaFinanceira categoria,
                                     String rotulo, BigDecimal valor, Distribuidora distribuidora,
                                     FormaPagamento forma, int dias) {
        if (nz(valor).compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        ContaFinanceira conta = baseConta(os.getCotacao(), TipoContaFinanceira.PAGAR);
        conta.setCategoria(categoria);
        conta.setValor(nz(valor));
        conta.setFormaPagamento(forma);
        conta.setDescricao(rotulo + " — OS #" + os.getId());
        conta.setDataVencimento(vencimentoComDias(dias));
        conta.setNumeroParcela(1);
        conta.setTotalParcelas(1);
        conta.setDistribuidora(distribuidora);
        contas.add(conta);
    }

    /**
     * Mantém as contas a pagar de material iguais às compras ativas após criar, editar ou cancelar uma compra.
     * Compra para estoque tem contas próprias; compra de orçamento ajusta as contas geradas pela OS.
     */
    @Transactional
    public void sincronizarContasPagarDaCompra(CompraLote compra, Long cotacaoAnterior) {
        List<ContaFinanceira> daCompra = contaFinanceiraRepository.findByCompraLoteIdOrderByIdAsc(compra.getId()).stream()
                .filter(this::isPagarMaterial)
                .toList();
        boolean compraDeEstoque = compra.getCotacaoId() == null && compra.getStatus() == StatusCompraLote.ATIVA;
        Map<Distribuidora, BigDecimal> devidoEstoque = compraDeEstoque ? totalPorDistribuidora(compra) : Map.of();
        sincronizarPorDistribuidora(daCompra, devidoEstoque, (distribuidora, valor) -> novaContaCompraEstoque(compra, distribuidora, valor));

        Set<Long> cotacoes = new LinkedHashSet<>();
        if (cotacaoAnterior != null) cotacoes.add(cotacaoAnterior);
        if (compra.getCotacaoId() != null) cotacoes.add(compra.getCotacaoId());
        cotacoes.forEach(this::sincronizarContasPagarMaterialDaCotacao);
    }

    private void sincronizarContasPagarMaterialDaCotacao(Long idCotacao) {
        Optional<OrdemServico> os = ordemServicoRepository.findByCotacaoId(idCotacao);
        List<ContaFinanceira> contas = contaFinanceiraRepository.findByCotacaoServicoIdOrderByTipoAscIdAsc(idCotacao);
        boolean financeiroGeradoPelaOs = contas.stream().anyMatch(c -> c.getCategoria() != null);
        if (os.isEmpty() || !financeiroGeradoPelaOs) return;
        Map<Distribuidora, BigDecimal> devido = new LinkedHashMap<>();
        for (Object[] linha : compraLoteRepository.valorCompradoPorDistribuidoraDaCotacao(idCotacao)) {
            devido.put((Distribuidora) linha[0], (BigDecimal) linha[1]);
        }
        List<ContaFinanceira> material = contas.stream()
                .filter(this::isPagarMaterial)
                .filter(c -> c.getCompraLote() == null)
                .toList();
        sincronizarPorDistribuidora(material, devido, (distribuidora, valor) -> {
            List<ContaFinanceira> novas = new ArrayList<>();
            adicionarContaPagar(novas, os.get(), CategoriaContaFinanceira.MATERIAL, "Materiais " + distribuidora.getNome(),
                    valor, distribuidora, FormaPagamento.A_VISTA, GerarContasFinanceirasDTO.padrao().diasPagar());
            return novas.get(0);
        });
    }

    /**
     * O ajuste recai na conta em aberto de cada fornecedor; o que já foi pago nunca é alterado.
     */
    private void sincronizarPorDistribuidora(List<ContaFinanceira> existentes, Map<Distribuidora, BigDecimal> devido,
                                             BiFunction<Distribuidora, BigDecimal, ContaFinanceira> novaConta) {
        Map<Long, Distribuidora> distribuidoras = new LinkedHashMap<>();
        Map<Long, BigDecimal> devidoPorId = new HashMap<>();
        devido.forEach((d, valor) -> { distribuidoras.put(d.getId(), d); devidoPorId.put(d.getId(), nz(valor)); });
        Map<Long, List<ContaFinanceira>> contasPorId = new HashMap<>();
        for (ContaFinanceira conta : existentes) {
            if (conta.getStatus() == StatusContaFinanceira.CANCELADA || conta.getDistribuidora() == null) continue;
            distribuidoras.putIfAbsent(conta.getDistribuidora().getId(), conta.getDistribuidora());
            contasPorId.computeIfAbsent(conta.getDistribuidora().getId(), k -> new ArrayList<>()).add(conta);
        }

        List<ContaFinanceira> alteradas = new ArrayList<>();
        for (Map.Entry<Long, Distribuidora> entrada : distribuidoras.entrySet()) {
            BigDecimal valorDevido = devidoPorId.getOrDefault(entrada.getKey(), BigDecimal.ZERO);
            List<ContaFinanceira> contas = contasPorId.getOrDefault(entrada.getKey(), List.of());
            BigDecimal pago = contas.stream().map(c -> nz(c.getValorPago())).reduce(BigDecimal.ZERO, BigDecimal::add);
            if (valorDevido.compareTo(pago) < 0) {
                throw new RegraNegocioException("Já foram pagos " + formatarMoeda(pago) + " a " + entrada.getValue().getNome()
                        + " por este material e a compra ficaria em " + formatarMoeda(valorDevido)
                        + ". O valor da compra não pode ficar abaixo do que já foi pago ao fornecedor.");
            }
            Optional<ContaFinanceira> emAberto = contas.stream().filter(c -> c.getStatus() != StatusContaFinanceira.PAGA).findFirst();
            BigDecimal valorDasDemais = contas.stream()
                    .filter(c -> emAberto.isEmpty() || c != emAberto.get())
                    .map(ContaFinanceira::getValor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal restante = valorDevido.subtract(valorDasDemais);
            if (emAberto.isPresent()) {
                ContaFinanceira conta = emAberto.get();
                if (restante.signum() == 0 && nz(conta.getValorPago()).signum() == 0) {
                    conta.setStatus(StatusContaFinanceira.CANCELADA);
                } else {
                    conta.setValor(restante);
                    if (nz(conta.getValorPago()).compareTo(restante) >= 0) conta.setStatus(StatusContaFinanceira.PAGA);
                }
                alteradas.add(conta);
            } else if (restante.signum() > 0) {
                alteradas.add(novaConta.apply(entrada.getValue(), restante));
            }
        }
        contaFinanceiraRepository.saveAll(alteradas);
    }

    private Map<Distribuidora, BigDecimal> totalPorDistribuidora(CompraLote compra) {
        Map<Long, Distribuidora> distribuidoras = new LinkedHashMap<>();
        Map<Long, BigDecimal> totais = new LinkedHashMap<>();
        for (CompraLoteItem item : compra.getItens()) {
            distribuidoras.putIfAbsent(item.getDistribuidora().getId(), item.getDistribuidora());
            totais.merge(item.getDistribuidora().getId(), nz(item.getValorTotal()), BigDecimal::add);
        }
        Map<Distribuidora, BigDecimal> resultado = new LinkedHashMap<>();
        totais.forEach((id, total) -> resultado.put(distribuidoras.get(id), total));
        return resultado;
    }

    private ContaFinanceira novaContaCompraEstoque(CompraLote compra, Distribuidora distribuidora, BigDecimal valor) {
        ContaFinanceira conta = new ContaFinanceira();
        conta.setTipo(TipoContaFinanceira.PAGAR);
        conta.setStatus(StatusContaFinanceira.PENDENTE);
        conta.setCategoria(CategoriaContaFinanceira.MATERIAL);
        conta.setFormaPagamento(FormaPagamento.A_VISTA);
        conta.setValor(valor);
        conta.setValorPago(BigDecimal.ZERO);
        conta.setCompraLote(compra);
        conta.setDistribuidora(distribuidora);
        conta.setNumeroParcela(1);
        conta.setTotalParcelas(1);
        String nota = compra.getNumeroNota() != null && !compra.getNumeroNota().isBlank()
                ? "nota " + compra.getNumeroNota() : "compra #" + compra.getId();
        conta.setDescricao("Compra para estoque — " + distribuidora.getNome() + " — " + nota);
        Calendar vencimento = Calendar.getInstance();
        vencimento.setTime(compra.getDataCompra() != null ? compra.getDataCompra() : new Date());
        vencimento.add(Calendar.DAY_OF_MONTH, GerarContasFinanceirasDTO.padrao().diasPagar());
        conta.setDataVencimento(vencimento.getTime());
        return conta;
    }

    private void preencherSnapshotCliente(CotacaoServico cotacao, ContaFinanceira conta) {
        if (cotacao.getCliente() != null) {
            conta.setClienteNomeSnapshot(safe(cotacao.getCliente().getNome()));
        } else {
            conta.setClienteNomeSnapshot(safe(cotacao.getClienteNome()));
        }
        conta.setTelefoneClienteSnapshot(safe(cotacao.getTelefone()));
    }

    private Distribuidora distribuidoraPrincipal(CotacaoServico cotacao) {
        return cotacao.getDistribuidoras() != null && !cotacao.getDistribuidoras().isEmpty()
                ? cotacao.getDistribuidoras().get(0)
                : null;
    }

    private ContaFinanceira baseConta(CotacaoServico cotacao, TipoContaFinanceira tipo) {
        ContaFinanceira conta = new ContaFinanceira();
        conta.setCotacaoServico(cotacao);
        conta.setTipo(tipo);
        conta.setStatus(StatusContaFinanceira.PENDENTE);
        conta.setFormaPagamento(FormaPagamento.A_VISTA);
        conta.setValorPago(BigDecimal.ZERO);
        return conta;
    }

    private Date vencimentoComDias(int dias) {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, dias);
        return cal.getTime();
    }

    private String aplicarPlaceholdersCobranca(String template, ContaFinanceira conta) {
        CotacaoServico cot = conta.getCotacaoServico();
        BigDecimal pendente = conta.getValor().subtract(nz(conta.getValorPago())).max(BigDecimal.ZERO);
        String msg = template;
        msg = msg.replace("{nome_cliente}", safe(conta.getClienteNomeSnapshot()));
        msg = msg.replace("{telefone_cliente}", safe(conta.getTelefoneClienteSnapshot()));
        msg = msg.replace("{nome_orcamento}", cot != null ? safe(cot.getNome()) : "-");
        msg = msg.replace("{numero_orcamento}", cot != null ? String.valueOf(cot.getId()) : "-");
        msg = msg.replace("{valor_total}", formatarMoeda(cot != null ? cot.getValorTotalOrcamento() : conta.getValor()));
        msg = msg.replace("{valor_pendente}", formatarMoeda(pendente));
        msg = msg.replace("{data_vencimento}", formatarData(conta.getDataVencimento()));
        msg = msg.replace("{data_emissao}", formatarData(cot != null ? cot.getDataCriacao() : null));
        msg = msg.replace("{endereco_cliente}", cot != null ? safe(cot.getEndereco()) : "-");
        return msg;
    }

    private String montarLinkWhatsapp(String telefone, String mensagem) {
        if (telefone == null || telefone.isBlank()) {
            return null;
        }
        String encoded = URLEncoder.encode(mensagem, StandardCharsets.UTF_8);
        return "https://wa.me/" + telefone + "?text=" + encoded;
    }

    private String normalizarTelefoneWa(String telefone) {
        if (telefone == null) {
            return "";
        }
        String digits = telefone.replaceAll("\\D", "");
        if (digits.startsWith("55") && digits.length() >= 12) {
            return digits;
        }
        if (digits.length() >= 10 && digits.length() <= 11) {
            return "55" + digits;
        }
        return digits;
    }

    private String formatarMoeda(BigDecimal valor) {
        if (valor == null) {
            return "R$ 0,00";
        }
        return NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(valor);
    }

    private String formatarData(Date data) {
        if (data == null) {
            return "-";
        }
        return new SimpleDateFormat("dd/MM/yyyy").format(data);
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private String safe(String s) {
        return s != null && !s.isBlank() ? s : "-";
    }

    private ContaFinanceiraDTO toDTO(ContaFinanceira conta) {
        ContaFinanceiraDTO dto = new ContaFinanceiraDTO();
        dto.setId(conta.getId());
        dto.setTipo(conta.getTipo());
        dto.setCategoria(conta.getCategoria());
        dto.setStatus(conta.getStatus());
        dto.setFormaPagamento(conta.getFormaPagamento());
        dto.setValor(conta.getValor());
        dto.setValorPago(nz(conta.getValorPago()));
        dto.setValorPendente(conta.getStatus() == StatusContaFinanceira.CANCELADA
                ? BigDecimal.ZERO
                : conta.getValor().subtract(dto.getValorPago()).max(BigDecimal.ZERO));
        dto.setDescricao(conta.getDescricao());
        dto.setClienteNomeSnapshot(conta.getClienteNomeSnapshot());
        dto.setTelefoneClienteSnapshot(conta.getTelefoneClienteSnapshot());
        dto.setDataVencimento(conta.getDataVencimento());
        dto.setDataPagamento(conta.getDataPagamento());
        dto.setDataCriacao(conta.getDataCriacao());
        dto.setDataAtualizacao(conta.getDataAtualizacao());
        dto.setNumeroParcela(conta.getNumeroParcela());
        dto.setTotalParcelas(conta.getTotalParcelas());
        dto.setGrupoParcela(conta.getGrupoParcela());

        if (conta.getCotacaoServico() != null) {
            dto.setCotacaoId(conta.getCotacaoServico().getId());
            dto.setCotacaoNome(conta.getCotacaoServico().getNome());
        }
        if (conta.getCompraLote() != null) {
            dto.setCompraLoteId(conta.getCompraLote().getId());
        }
        if (conta.getDistribuidora() != null) {
            dto.setDistribuidoraId(conta.getDistribuidora().getId());
            dto.setDistribuidoraNome(conta.getDistribuidora().getNome());
        }
        return dto;
    }
}

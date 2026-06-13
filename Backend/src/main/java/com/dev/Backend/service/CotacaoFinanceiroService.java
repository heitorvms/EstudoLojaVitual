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
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.dto.BaixaContaFinanceiraDTO;
import com.dev.Backend.dto.CobrancaHistoricoDTO;
import com.dev.Backend.dto.ContaFinanceiraDTO;
import com.dev.Backend.dto.FinanceiroResumoDTO;
import com.dev.Backend.dto.GerarContasFinanceirasDTO;
import com.dev.Backend.dto.RegistrarCobrancaWhatsappDTO;
import com.dev.Backend.dto.WhatsappCobrancaPreviewDTO;
import com.dev.Backend.entity.CobrancaWhatsappHistorico;
import com.dev.Backend.entity.ContaFinanceira;
import com.dev.Backend.entity.CotacaoServico;
import com.dev.Backend.entity.FormaPagamento;
import com.dev.Backend.entity.StatusContaFinanceira;
import com.dev.Backend.entity.TipoContaFinanceira;
import com.dev.Backend.entity.TipoDisparoCobranca;
import com.dev.Backend.entity.ConfiguracaoWhatsapp;
import com.dev.Backend.repository.CobrancaWhatsappHistoricoRepository;
import com.dev.Backend.repository.ConfiguracaoWhatsappRepository;
import com.dev.Backend.repository.ContaFinanceiraRepository;
import com.dev.Backend.repository.CotacaoServicoRepository;
import com.dev.Backend.exception.RegraNegocioException;

@Service
public class CotacaoFinanceiroService {

    private final ContaFinanceiraRepository contaFinanceiraRepository;
    private final CotacaoServicoRepository cotacaoServicoRepository;
    private final ConfiguracaoWhatsappRepository configuracaoWhatsappRepository;
    private final FinanceiroVencimentoService financeiroVencimentoService;
    private final CobrancaWhatsappHistoricoRepository cobrancaHistoricoRepository;

    private static final List<StatusContaFinanceira> STATUS_EM_ABERTO = List.of(
            StatusContaFinanceira.PENDENTE,
            StatusContaFinanceira.PARCIAL,
            StatusContaFinanceira.VENCIDA);

    public CotacaoFinanceiroService(
            ContaFinanceiraRepository contaFinanceiraRepository,
            CotacaoServicoRepository cotacaoServicoRepository,
            ConfiguracaoWhatsappRepository configuracaoWhatsappRepository,
            FinanceiroVencimentoService financeiroVencimentoService,
            CobrancaWhatsappHistoricoRepository cobrancaHistoricoRepository) {
        this.contaFinanceiraRepository = contaFinanceiraRepository;
        this.cotacaoServicoRepository = cotacaoServicoRepository;
        this.configuracaoWhatsappRepository = configuracaoWhatsappRepository;
        this.financeiroVencimentoService = financeiroVencimentoService;
        this.cobrancaHistoricoRepository = cobrancaHistoricoRepository;
    }

    public int atualizarContasVencidas() {
        return financeiroVencimentoService.atualizarContasVencidas();
    }

    @Transactional(readOnly = true)
    public Page<ContaFinanceiraDTO> listar(TipoContaFinanceira tipo, StatusContaFinanceira status, Pageable pageable) {
        atualizarContasVencidas();
        Page<ContaFinanceira> page;
        if (tipo != null && status != null) {
            page = contaFinanceiraRepository.findByTipoAndStatus(tipo, status, pageable);
        } else if (tipo != null) {
            page = contaFinanceiraRepository.findByTipo(tipo, pageable);
        } else if (status != null) {
            page = contaFinanceiraRepository.findByStatus(status, pageable);
        } else {
            page = contaFinanceiraRepository.findAll(pageable);
        }
        return page.map(this::toDTO);
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

    @Transactional
    public List<ContaFinanceiraDTO> gerarContasDaCotacao(Long idCotacao, boolean substituirSeExistir) {
        return gerarContasDaCotacao(idCotacao, substituirSeExistir, GerarContasFinanceirasDTO.padrao());
    }

    @Transactional
    public List<ContaFinanceiraDTO> gerarContasDaCotacao(
            Long idCotacao, boolean substituirSeExistir, GerarContasFinanceirasDTO opcoes) {
        GerarContasFinanceirasDTO opts = opcoes != null ? opcoes : GerarContasFinanceirasDTO.padrao();
        CotacaoServico cotacao = cotacaoServicoRepository.findById(idCotacao)
                .orElseThrow(() -> new RegraNegocioException("Cotação não encontrada: " + idCotacao));

        if (contaFinanceiraRepository.existsByCotacaoServicoId(idCotacao)) {
            if (!substituirSeExistir) {
                throw new RegraNegocioException("Já existem contas financeiras para esta cotação. Use substituir=true para regerar.");
            }
            List<ContaFinanceira> existentes = contaFinanceiraRepository.findByCotacaoServicoIdOrderByTipoAscIdAsc(idCotacao);
            boolean temPaga = existentes.stream().anyMatch(c -> c.getStatus() == StatusContaFinanceira.PAGA
                    || c.getStatus() == StatusContaFinanceira.PARCIAL);
            if (temPaga) {
                throw new RegraNegocioException("Não é possível regerar: existem contas com pagamento registrado.");
            }
            List<Long> idsRemover = existentes.stream().map(ContaFinanceira::getId).toList();
            cobrancaHistoricoRepository.deleteByContaIdIn(idsRemover);
            contaFinanceiraRepository.deleteAll(existentes);
        }

        List<ContaFinanceira> geradas = new ArrayList<>();
        geradas.addAll(criarContasReceber(cotacao, opts));
        geradas.addAll(criarContasPagar(cotacao, opts));

        return contaFinanceiraRepository.saveAll(geradas).stream().map(this::toDTO).toList();
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

    private List<ContaFinanceira> criarContasReceber(CotacaoServico cotacao, GerarContasFinanceirasDTO opts) {
        BigDecimal valorTotal = nz(cotacao.getValorTotalOrcamento());
        if (valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Valor total do orçamento inválido para gerar conta a receber.");
        }

        int parcelas = opts.parcelasReceber();
        String grupo = UUID.randomUUID().toString();
        FormaPagamento forma = opts.getFormaPagamentoReceber() != null
                ? opts.getFormaPagamentoReceber() : FormaPagamento.A_VISTA;

        BigDecimal valorBase = valorTotal.divide(BigDecimal.valueOf(parcelas), 2, RoundingMode.HALF_UP);
        List<ContaFinanceira> contas = new ArrayList<>();
        BigDecimal acumulado = BigDecimal.ZERO;

        for (int i = 1; i <= parcelas; i++) {
            BigDecimal valorParcela = (i == parcelas)
                    ? valorTotal.subtract(acumulado)
                    : valorBase;
            acumulado = acumulado.add(valorParcela);

            ContaFinanceira conta = baseConta(cotacao, TipoContaFinanceira.RECEBER);
            conta.setValor(valorParcela);
            conta.setFormaPagamento(forma);
            conta.setGrupoParcela(grupo);
            conta.setNumeroParcela(i);
            conta.setTotalParcelas(parcelas);
            String sufixoParcela = parcelas > 1 ? " — parcela " + i + "/" + parcelas : "";
            conta.setDescricao("Recebimento orçamento #" + cotacao.getId() + " — " + safe(cotacao.getNome()) + sufixoParcela);
            preencherSnapshotCliente(cotacao, conta);
            conta.setDataVencimento(vencimentoComDias(opts.diasPrimeira() + opts.intervaloDias() * (i - 1)));
            contas.add(conta);
        }
        return contas;
    }

    private List<ContaFinanceira> criarContasPagar(CotacaoServico cotacao, GerarContasFinanceirasDTO opts) {
        List<ContaFinanceira> contas = new ArrayList<>();
        FormaPagamento forma = opts.getFormaPagamentoPagar() != null
                ? opts.getFormaPagamentoPagar() : FormaPagamento.A_VISTA;
        int dias = opts.diasPagar();

        BigDecimal materiais = nz(cotacao.getTotalCustoMateriais());
        if (materiais.compareTo(BigDecimal.ZERO) > 0) {
            ContaFinanceira contaMat = baseConta(cotacao, TipoContaFinanceira.PAGAR);
            contaMat.setValor(materiais);
            contaMat.setFormaPagamento(forma);
            contaMat.setDescricao("Materiais — orçamento #" + cotacao.getId());
            contaMat.setDataVencimento(vencimentoComDias(dias));
            contaMat.setNumeroParcela(1);
            contaMat.setTotalParcelas(1);
            vincularDistribuidoraPrincipal(cotacao, contaMat);
            contas.add(contaMat);
        }

        BigDecimal insumos = nz(cotacao.getValorInsumos());
        if (insumos.compareTo(BigDecimal.ZERO) > 0) {
            ContaFinanceira contaIns = baseConta(cotacao, TipoContaFinanceira.PAGAR);
            contaIns.setValor(insumos);
            contaIns.setFormaPagamento(forma);
            contaIns.setDescricao("Insumos — orçamento #" + cotacao.getId());
            contaIns.setDataVencimento(vencimentoComDias(dias));
            contaIns.setNumeroParcela(1);
            contaIns.setTotalParcelas(1);
            contas.add(contaIns);
        }

        BigDecimal frete = nz(cotacao.getValorFrete());
        if (frete.compareTo(BigDecimal.ZERO) > 0) {
            ContaFinanceira contaFrete = baseConta(cotacao, TipoContaFinanceira.PAGAR);
            contaFrete.setValor(frete);
            contaFrete.setFormaPagamento(forma);
            contaFrete.setDescricao("Frete — orçamento #" + cotacao.getId());
            contaFrete.setDataVencimento(vencimentoComDias(dias));
            contaFrete.setNumeroParcela(1);
            contaFrete.setTotalParcelas(1);
            contas.add(contaFrete);
        }

        return contas;
    }

    private void preencherSnapshotCliente(CotacaoServico cotacao, ContaFinanceira conta) {
        if (cotacao.getCliente() != null) {
            conta.setClienteNomeSnapshot(safe(cotacao.getCliente().getNome()));
        } else {
            conta.setClienteNomeSnapshot(safe(cotacao.getClienteNome()));
        }
        conta.setTelefoneClienteSnapshot(safe(cotacao.getTelefone()));
    }

    private void vincularDistribuidoraPrincipal(CotacaoServico cotacao, ContaFinanceira conta) {
        if (cotacao.getDistribuidoras() != null && !cotacao.getDistribuidoras().isEmpty()) {
            conta.setDistribuidora(cotacao.getDistribuidoras().get(0));
        }
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
        dto.setStatus(conta.getStatus());
        dto.setFormaPagamento(conta.getFormaPagamento());
        dto.setValor(conta.getValor());
        dto.setValorPago(nz(conta.getValorPago()));
        dto.setValorPendente(conta.getValor().subtract(dto.getValorPago()).max(BigDecimal.ZERO));
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
        if (conta.getDistribuidora() != null) {
            dto.setDistribuidoraId(conta.getDistribuidora().getId());
            dto.setDistribuidoraNome(conta.getDistribuidora().getNome());
        }
        return dto;
    }
}

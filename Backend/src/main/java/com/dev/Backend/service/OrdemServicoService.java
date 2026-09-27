package com.dev.Backend.service;

import com.dev.Backend.dto.GerarContasFinanceirasDTO;
import com.dev.Backend.dto.OrdemServicoDTO;
import com.dev.Backend.dto.OrdemServicoInputDTO;
import com.dev.Backend.entity.*;
import com.dev.Backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class OrdemServicoService {

    @Autowired private OrdemServicoRepository ordemServicoRepository;
    @Autowired private CotacaoServicoRepository cotacaoServicoRepository;
    @Autowired private FuncionarioOficinaRepository funcionarioOficinaRepository;
    @Autowired private EstoqueService estoqueService;
    @Autowired private CotacaoFinanceiroService financeiroService;

    @Transactional(readOnly = true)
    public Page<OrdemServicoDTO> listar(String query, Pageable pageable) {
        Page<OrdemServico> page = query != null && !query.isBlank()
                ? ordemServicoRepository.search(query.trim(), pageable)
                : ordemServicoRepository.findAll(pageable);
        return page.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<OrdemServicoDTO> buscar(Long id) {
        return ordemServicoRepository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public OrdemServicoDTO rascunhoDeCotacao(Long cotacaoId) {
        return toDTO(novaDeCotacao(cotacaoId));
    }

    @Transactional
    public OrdemServicoDTO criarDeCotacao(Long cotacaoId, OrdemServicoInputDTO input) {
        OrdemServico os = novaDeCotacao(cotacaoId);
        os.setDataCriacao(new Date());
        aplicarDados(os, input);
        OrdemServico salva = ordemServicoRepository.save(os);
        baixarEstoqueSeNecessario(salva);
        financeiroService.gerarContasDaOrdem(salva, input.getFinanceiro());
        return toDTO(ordemServicoRepository.save(salva));
    }

    @Transactional
    public OrdemServicoDTO atualizar(Long id, OrdemServicoInputDTO input) {
        OrdemServico os = buscarEntidade(id);
        StatusOrdemServico statusAnterior = os.getStatus();
        aplicarDados(os, input);
        if (os.getStatus() == StatusOrdemServico.CANCELADO && statusAnterior != StatusOrdemServico.CANCELADO) {
            cancelar(os, Boolean.TRUE.equals(input.getDevolverEstoque()));
        } else {
            baixarEstoqueSeNecessario(os);
        }
        return toDTO(ordemServicoRepository.save(os));
    }

    @Transactional
    public OrdemServicoDTO adicionarMaoDeObra(Long id, OrdemServicoInputDTO.MaoDeObraInputDTO lancamento) {
        OrdemServico os = buscarEntidade(id);
        if (os.getStatus() == StatusOrdemServico.CANCELADO) {
            throw new IllegalStateException("Não é possível lançar horas em OS cancelada");
        }
        os.getMaoDeObra().add(novaMaoDeObra(os, lancamento));
        os.setDataAtualizacao(new Date());
        return toDTO(ordemServicoRepository.save(os));
    }

    @Transactional
    public OrdemServicoDTO alterarPagamento(Long id, CategoriaContaFinanceira categoria, boolean pago) {
        OrdemServico os = buscarAtiva(id);
        Long cotacaoId = idCotacao(os);
        if (pago) {
            financeiroService.quitarRecebimento(cotacaoId, categoria);
        } else {
            financeiroService.estornarRecebimento(cotacaoId, categoria);
        }
        return toDTO(os);
    }

    @Transactional
    public OrdemServicoDTO gerarFinanceiro(Long id, GerarContasFinanceirasDTO opcoes) {
        OrdemServico os = buscarAtiva(id);
        idCotacao(os);
        if (!financeiroService.gerarContasDaOrdem(os, opcoes)) {
            throw new IllegalStateException(
                    "O orçamento já possui contas com pagamento registrado. Ajuste pelo módulo Financeiro.");
        }
        return toDTO(os);
    }

    private OrdemServico buscarAtiva(Long id) {
        OrdemServico os = buscarEntidade(id);
        if (os.getStatus() == StatusOrdemServico.CANCELADO) {
            throw new IllegalStateException("OS cancelada não permite alterações no financeiro.");
        }
        return os;
    }

    private OrdemServico buscarEntidade(Long id) {
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OS não encontrada"));
    }

    private Long idCotacao(OrdemServico os) {
        if (os.getCotacao() == null) {
            throw new IllegalStateException("OS sem orçamento vinculado");
        }
        return os.getCotacao().getId();
    }

    private OrdemServicoDTO toDTO(OrdemServico os) {
        OrdemServicoDTO dto = OrdemServicoDTO.from(os);
        CotacaoServico cotacao = os.getCotacao();
        if (cotacao == null) {
            return dto;
        }
        return dto.comFinanceiro(
                financeiroService.valorMaterialCliente(cotacao),
                financeiroService.valorMaoDeObraCliente(cotacao),
                financeiroService.recebimentoQuitado(cotacao.getId(), CategoriaContaFinanceira.MATERIAL),
                financeiroService.recebimentoQuitado(cotacao.getId(), CategoriaContaFinanceira.MAO_DE_OBRA));
    }

    private OrdemServico novaDeCotacao(Long cotacaoId) {
        if (ordemServicoRepository.existsByCotacaoId(cotacaoId)) {
            throw new IllegalStateException("Já existe OS para esta cotação");
        }
        CotacaoServico cot = cotacaoServicoRepository.findById(cotacaoId)
                .orElseThrow(() -> new RuntimeException("Cotação não encontrada"));

        OrdemServico os = new OrdemServico();
        os.setCotacao(cot);
        os.setStatus(StatusOrdemServico.ABERTO);
        os.setNome(cot.getNome());
        os.setClienteNome(cot.getClienteNome());
        os.setTelefone(cot.getTelefone());
        os.setEndereco(cot.getEndereco());
        os.setQuantidadeProduto(extrairQuantidade(cot.getQuantidadeProduto()));
        return os;
    }

    private void aplicarDados(OrdemServico os, OrdemServicoInputDTO input) {
        if (input.getStatus() != null) os.setStatus(input.getStatus());
        if (input.getObservacoes() != null) os.setObservacoes(input.getObservacoes());
        if (input.getMaoDeObra() != null) sincronizarMaoDeObra(os, input.getMaoDeObra());
        os.setDataAtualizacao(new Date());
    }

    /** Lançamentos já pagos ao funcionário não são alterados nem removidos. */
    private void sincronizarMaoDeObra(OrdemServico os, List<OrdemServicoInputDTO.MaoDeObraInputDTO> entradas) {
        Map<Long, OrdemServicoMaoDeObra> existentes = new HashMap<>();
        for (OrdemServicoMaoDeObra row : os.getMaoDeObra()) {
            existentes.put(row.getId(), row);
        }
        Set<Long> mantidos = new HashSet<>();
        List<OrdemServicoMaoDeObra> novos = new ArrayList<>();
        for (OrdemServicoInputDTO.MaoDeObraInputDTO entrada : entradas) {
            OrdemServicoMaoDeObra existente = entrada.getId() != null ? existentes.get(entrada.getId()) : null;
            if (existente == null) {
                novos.add(novaMaoDeObra(os, entrada));
                continue;
            }
            mantidos.add(existente.getId());
            if (!Boolean.TRUE.equals(existente.getPagoFuncionario())) {
                preencherMaoDeObra(existente, entrada);
            }
        }
        os.getMaoDeObra().removeIf(row -> !mantidos.contains(row.getId())
                && !Boolean.TRUE.equals(row.getPagoFuncionario()));
        os.getMaoDeObra().addAll(novos);
    }

    private OrdemServicoMaoDeObra novaMaoDeObra(OrdemServico os, OrdemServicoInputDTO.MaoDeObraInputDTO entrada) {
        OrdemServicoMaoDeObra row = new OrdemServicoMaoDeObra();
        row.setOrdemServico(os);
        row.setDataCriacao(new Date());
        preencherMaoDeObra(row, entrada);
        return row;
    }

    private void preencherMaoDeObra(OrdemServicoMaoDeObra row, OrdemServicoInputDTO.MaoDeObraInputDTO entrada) {
        boolean noturno = Boolean.TRUE.equals(entrada.getNoturno());
        row.setNoturno(noturno);
        row.setDataTrabalho(entrada.getDataTrabalho() != null ? entrada.getDataTrabalho() : LocalDate.now());
        row.setHoras(nz(entrada.getHoras()));
        BigDecimal vh = nz(entrada.getValorHora());
        FuncionarioOficina f = entrada.getFuncionarioId() != null
                ? funcionarioOficinaRepository.findById(entrada.getFuncionarioId()).orElse(null)
                : null;
        row.setFuncionario(f);
        if (vh.signum() == 0 && f != null) {
            vh = nz(noturno ? f.getValorHoraNoturno() : f.getValorHora());
        }
        row.setValorHora(vh);
        row.setValorTotal(row.getHoras().multiply(vh).setScale(2, RoundingMode.HALF_UP));
        row.setObservacao(entrada.getObservacao());
    }

    private void cancelar(OrdemServico os, boolean devolverEstoque) {
        if (os.getCotacao() != null) {
            financeiroService.cancelarContasEmAberto(os.getCotacao().getId());
        }
        if (devolverEstoque && Boolean.TRUE.equals(os.getEstoqueBaixado())) {
            movimentarMateriais(os, true);
            os.setEstoqueBaixado(false);
        }
    }

    private void baixarEstoqueSeNecessario(OrdemServico os) {
        boolean consumiuMaterial = os.getStatus() == StatusOrdemServico.EM_PRODUCAO
                || os.getStatus() == StatusOrdemServico.CONCLUIDO;
        if (!consumiuMaterial || Boolean.TRUE.equals(os.getEstoqueBaixado())) {
            return;
        }
        movimentarMateriais(os, false);
        os.setEstoqueBaixado(true);
    }

    private void movimentarMateriais(OrdemServico os, boolean devolucao) {
        if (os.getCotacao() == null) return;
        String ref = (devolucao ? "Devolução OS #" : "OS #") + os.getId();
        for (Material mat : os.getCotacao().getMateriais()) {
            MaterialDisponivel md = mat.getMaterialDisponivel();
            if (md == null) continue;
            int barras = barrasNecessarias(mat, md);
            if (devolucao) {
                estoqueService.devolverBarras(md, barras, ref);
            } else {
                estoqueService.baixarBarras(md, barras, ref);
            }
        }
    }

    private int barrasNecessarias(Material mat, MaterialDisponivel md) {
        if (mat.getQuantidade() != null && mat.getQuantidade() > 0) {
            return mat.getQuantidade();
        }
        if (mat.getMetros() == null || mat.getMetros().signum() <= 0) {
            return 0;
        }
        int barraMm = md.getComprimentoBarraMm() != null ? md.getComprimentoBarraMm() : 6000;
        return mat.getMetros()
                .multiply(BigDecimal.valueOf(1000))
                .divide(BigDecimal.valueOf(barraMm), 0, RoundingMode.CEILING)
                .intValue();
    }

    private Integer extrairQuantidade(String quantidadeProduto) {
        if (quantidadeProduto == null) return 1;
        String digitos = quantidadeProduto.replaceAll("\\D", "");
        if (digitos.isEmpty()) return 1;
        try {
            return Integer.parseInt(digitos);
        } catch (NumberFormatException e) {
            return 1;
        }
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}

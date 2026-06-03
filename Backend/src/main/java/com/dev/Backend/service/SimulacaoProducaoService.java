package com.dev.Backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.Backend.dto.ItemPersistidoDTO;
import com.dev.Backend.dto.ItemSimulacaoInputDTO;
import com.dev.Backend.dto.MaterialSimulacaoDTO;
import com.dev.Backend.dto.SimulacaoHistoricoDTO;
import com.dev.Backend.dto.SimulacaoRequestDTO;
import com.dev.Backend.dto.SimulacaoResponseDTO;
import com.dev.Backend.entity.MaterialDisponivel;
import com.dev.Backend.entity.MaterialPreco;
import com.dev.Backend.entity.Simulacao;
import com.dev.Backend.entity.SimulacaoItem;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import com.dev.Backend.repository.SimulacaoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class SimulacaoProducaoService {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    @Autowired
    private MaterialDisponivelRepository materialDisponivelRepository;

    @Autowired
    private SimulacaoRepository simulacaoRepository;

    @Autowired
    private MaterialPrecoService materialPrecoService;

    @Transactional(readOnly = true)
    public SimulacaoResponseDTO calcular(SimulacaoRequestDTO request) {
        validar(request);

        Map<Long, MaterialDisponivel> materiaisPorId = carregarMateriais(request);
        BigDecimal perda = perdaOuZero(request);

        SimulacaoResponseDTO response = new SimulacaoResponseDTO();
        response.setNomeTrabalho(request.getNomeTrabalho());
        response.setQuantidade(request.getQuantidade());
        response.setPercentualPerda(perda);

        BigDecimal totalMateriais = BigDecimal.ZERO;
        boolean temCusto = false;

        for (ItemSimulacaoInputDTO item : request.getItens()) {
            MaterialDisponivel md = materiaisPorId.get(item.getMaterialDisponivelId());
            MaterialSimulacaoDTO dto = CalculoMateriaisCalculator.calcular(
                md, item.getConsumoPorUnidade(), request.getQuantidade(), perda);
            aplicarMenorPrecoVigente(dto, md);
            response.getMateriais().add(dto);

            if (dto.getCustoEstimado() != null) {
                totalMateriais = totalMateriais.add(dto.getCustoEstimado());
                temCusto = true;
            }
        }

        aplicarTotaisComInsumosEFrete(response, request, temCusto ? totalMateriais : null);
        return response;
    }

    @Transactional
    public SimulacaoResponseDTO salvar(SimulacaoRequestDTO request) {
        SimulacaoResponseDTO calculado = calcular(request);

        Simulacao simulacao = new Simulacao();
        simulacao.setDataCriacao(new Date());
        preencherSimulacao(simulacao, request, calculado);

        Simulacao salvo = simulacaoRepository.saveAndFlush(simulacao);
        return toResponse(salvo);
    }

    @Transactional
    public SimulacaoResponseDTO atualizar(Long id, SimulacaoRequestDTO request) {
        Simulacao simulacao = simulacaoRepository.findByIdComItens(id)
            .orElseThrow(() -> new EntityNotFoundException(
                "Simulação não encontrada: id=" + id));

        SimulacaoResponseDTO calculado = calcular(request);
        preencherSimulacao(simulacao, request, calculado);

        Simulacao salvo = simulacaoRepository.saveAndFlush(simulacao);
        return toResponse(salvo);
    }

    private void preencherSimulacao(Simulacao simulacao,
                                    SimulacaoRequestDTO request,
                                    SimulacaoResponseDTO calculado) {
        simulacao.setNomeTrabalho(calculado.getNomeTrabalho());
        simulacao.setQuantidade(calculado.getQuantidade());
        simulacao.setPercentualPerda(calculado.getPercentualPerda());
        simulacao.setPercentualInsumos(calculado.getPercentualInsumos());
        simulacao.setValorFrete(calculado.getValorFrete());
        simulacao.setTotalCustoMateriais(calculado.getTotalCustoMateriais());
        simulacao.setValorInsumos(calculado.getValorInsumos());
        simulacao.setTotalCustoEstimado(calculado.getTotalCustoEstimado());

        Map<Long, MaterialDisponivel> materiaisPorId = carregarMateriais(request);
        simulacao.getItens().clear();

        for (int i = 0; i < request.getItens().size(); i++) {
            ItemSimulacaoInputDTO input = request.getItens().get(i);
            MaterialSimulacaoDTO calc = calculado.getMateriais().get(i);

            SimulacaoItem item = new SimulacaoItem();
            item.setSimulacao(simulacao);
            item.setMaterialDisponivel(materiaisPorId.get(input.getMaterialDisponivelId()));
            item.setConsumoPorUnidade(input.getConsumoPorUnidade());
            item.setConsumoTotal(calc.getConsumoTotal());
            item.setTotalComPerda(calc.getTotalComPerda());
            item.setQuantidadeBarras(calc.getQuantidadeBarras());
            item.setSobraEstimada(calc.getSobraEstimada());
            item.setPrecoUnitarioSnapshot(calc.getPrecoUnitario());
            item.setDistribuidoraNomeSnapshot(calc.getDistribuidoraNome());
            item.setCustoEstimado(calc.getCustoEstimado());
            simulacao.getItens().add(item);
        }
    }

    @Transactional(readOnly = true)
    public List<SimulacaoHistoricoDTO> listarHistorico() {
        return simulacaoRepository.findAllByOrderByDataCriacaoDesc()
            .stream()
            .map(this::toHistoricoDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public SimulacaoResponseDTO obterHistorico(Long id) {
        Simulacao s = simulacaoRepository.findByIdComItens(id)
            .orElseThrow(() -> new EntityNotFoundException(
                "Simulação não encontrada: id=" + id));
        return toResponse(s);
    }

    @Transactional
    public void excluirHistorico(Long id) {
        Simulacao s = simulacaoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException(
                "Simulação não encontrada: id=" + id));
        simulacaoRepository.delete(s);
    }

    private Map<Long, MaterialDisponivel> carregarMateriais(SimulacaoRequestDTO request) {
        List<Long> ids = request.getItens().stream()
            .map(ItemSimulacaoInputDTO::getMaterialDisponivelId)
            .toList();

        List<MaterialDisponivel> encontrados = materialDisponivelRepository.findAllById(ids);
        if (encontrados.size() != new HashSet<>(ids).size()) {
            throw new EntityNotFoundException(
                "Um ou mais materiais informados não foram encontrados.");
        }
        return encontrados.stream()
            .collect(Collectors.toMap(MaterialDisponivel::getId, m -> m));
    }

    private BigDecimal perdaOuZero(SimulacaoRequestDTO request) {
        return request.getPercentualPerda() == null
            ? BigDecimal.ZERO
            : request.getPercentualPerda();
    }

    private void validar(SimulacaoRequestDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("Payload obrigatório.");
        }
        if (req.getQuantidade() == null || req.getQuantidade() < 1) {
            throw new IllegalArgumentException("quantidade deve ser maior ou igual a 1.");
        }
        BigDecimal perda = req.getPercentualPerda();
        if (perda != null
            && (perda.signum() < 0 || perda.compareTo(BigDecimal.valueOf(100)) > 0)) {
            throw new IllegalArgumentException("percentualPerda deve estar entre 0 e 100.");
        }
        BigDecimal pctInsumos = req.getPercentualInsumos();
        if (pctInsumos != null
            && (pctInsumos.signum() < 0 || pctInsumos.compareTo(BigDecimal.valueOf(100)) > 0)) {
            throw new IllegalArgumentException("percentualInsumos deve estar entre 0 e 100.");
        }
        BigDecimal frete = req.getValorFrete();
        if (frete != null && frete.signum() < 0) {
            throw new IllegalArgumentException("valorFrete não pode ser negativo.");
        }
        if (req.getItens() == null || req.getItens().isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos um material.");
        }
        Set<Long> idsVistos = new HashSet<>();
        for (ItemSimulacaoInputDTO item : req.getItens()) {
            if (item == null || item.getMaterialDisponivelId() == null) {
                throw new IllegalArgumentException(
                    "materialDisponivelId é obrigatório em todos os itens.");
            }
            if (item.getConsumoPorUnidade() == null
                || item.getConsumoPorUnidade().signum() <= 0) {
                throw new IllegalArgumentException(
                    "consumoPorUnidade deve ser maior que zero em todos os itens.");
            }
            if (!idsVistos.add(item.getMaterialDisponivelId())) {
                throw new IllegalArgumentException(
                    "Há materiais duplicados na lista de itens.");
            }
        }
    }

    private SimulacaoHistoricoDTO toHistoricoDTO(Simulacao s) {
        SimulacaoHistoricoDTO dto = new SimulacaoHistoricoDTO();
        dto.setId(s.getId());
        dto.setNomeTrabalho(s.getNomeTrabalho());
        dto.setQuantidade(s.getQuantidade());
        dto.setPercentualPerda(s.getPercentualPerda());
        dto.setTotalCustoEstimado(s.getTotalCustoEstimado());
        dto.setDataCriacao(s.getDataCriacao());
        return dto;
    }

    private SimulacaoResponseDTO toResponse(Simulacao s) {
        SimulacaoResponseDTO dto = new SimulacaoResponseDTO();
        dto.setId(s.getId());
        dto.setNomeTrabalho(s.getNomeTrabalho());
        dto.setQuantidade(s.getQuantidade());
        dto.setPercentualPerda(s.getPercentualPerda());
        dto.setPercentualInsumos(s.getPercentualInsumos());
        dto.setValorFrete(s.getValorFrete());
        dto.setTotalCustoMateriais(s.getTotalCustoMateriais());
        dto.setValorInsumos(s.getValorInsumos());
        dto.setTotalCustoEstimado(s.getTotalCustoEstimado());
        dto.setDataCriacao(s.getDataCriacao());

        for (SimulacaoItem item : s.getItens()) {
            MaterialDisponivel md = item.getMaterialDisponivel();

            MaterialSimulacaoDTO calc = new MaterialSimulacaoDTO();
            calc.setMaterialId(md.getId());
            calc.setNome(md.getDescricao());
            calc.setConsumoPorUnidade(item.getConsumoPorUnidade());
            calc.setConsumoTotal(item.getConsumoTotal());
            calc.setTotalComPerda(item.getTotalComPerda());
            calc.setTamanho(md.getTamanho());
            calc.setQuantidadeBarras(item.getQuantidadeBarras());
            calc.setSobraEstimada(item.getSobraEstimada());
            calc.setPrecoUnitario(item.getPrecoUnitarioSnapshot());
            calc.setDistribuidoraNome(item.getDistribuidoraNomeSnapshot());
            calc.setCustoEstimado(item.getCustoEstimado());
            dto.getMateriais().add(calc);

            ItemPersistidoDTO persistido = new ItemPersistidoDTO();
            persistido.setId(item.getId());
            persistido.setMaterialDisponivelId(md.getId());
            persistido.setConsumoPorUnidade(item.getConsumoPorUnidade());
            dto.getItens().add(persistido);
        }
        return dto;
    }

    private void aplicarMenorPrecoVigente(MaterialSimulacaoDTO dto, MaterialDisponivel material) {
        Optional<MaterialPreco> menorOpt = materialPrecoService.buscarMenorPrecoVigente(material.getId());
        if (menorOpt.isEmpty()) {
            dto.setPrecoUnitario(null);
            dto.setCustoEstimado(null);
            dto.setDistribuidoraId(null);
            dto.setDistribuidoraNome(null);
            return;
        }

        MaterialPreco menor = menorOpt.get();
        dto.setPrecoUnitario(menor.getPrecoUnitario());
        dto.setDistribuidoraId(menor.getDistribuidora().getId());
        dto.setDistribuidoraNome(menor.getDistribuidora().getNome());

        if (dto.getQuantidadeBarras() != null && dto.getQuantidadeBarras() > 0) {
            BigDecimal custo = menor.getPrecoUnitario()
                .multiply(BigDecimal.valueOf(dto.getQuantidadeBarras()))
                .setScale(2, RoundingMode.HALF_UP);
            dto.setCustoEstimado(custo);
        } else {
            dto.setCustoEstimado(null);
        }
    }

    private void aplicarTotaisComInsumosEFrete(SimulacaoResponseDTO response,
                                               SimulacaoRequestDTO request,
                                               BigDecimal totalMateriais) {
        BigDecimal pctInsumos = request.getPercentualInsumos() != null
            ? request.getPercentualInsumos() : BigDecimal.ZERO;
        BigDecimal frete = request.getValorFrete() != null
            ? request.getValorFrete() : BigDecimal.ZERO;

        response.setPercentualInsumos(pctInsumos);
        response.setValorFrete(frete.setScale(2, RoundingMode.HALF_UP));

        if (totalMateriais != null) {
            totalMateriais = totalMateriais.setScale(2, RoundingMode.HALF_UP);
            response.setTotalCustoMateriais(totalMateriais);

            BigDecimal valorInsumos = pctInsumos.signum() > 0
                ? totalMateriais.multiply(pctInsumos)
                    .divide(CEM, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            response.setValorInsumos(valorInsumos);

            BigDecimal total = totalMateriais.add(valorInsumos).add(frete)
                .setScale(2, RoundingMode.HALF_UP);
            response.setTotalCustoEstimado(total);
        } else {
            response.setTotalCustoMateriais(null);
            response.setValorInsumos(null);
            if (frete.signum() > 0) {
                response.setTotalCustoEstimado(frete.setScale(2, RoundingMode.HALF_UP));
            } else {
                response.setTotalCustoEstimado(null);
            }
        }
    }
}

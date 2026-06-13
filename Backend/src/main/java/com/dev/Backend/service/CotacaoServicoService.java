package com.dev.Backend.service;

import com.dev.Backend.dto.*;
import com.dev.Backend.entity.*;
import com.dev.Backend.repository.CotacaoServicoRepository;
import com.dev.Backend.repository.DistribuidoraRepository;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import com.dev.Backend.repository.PessoaReposotory;
import com.dev.Backend.exception.RegraNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CotacaoServicoService {

    private static final Logger log = LoggerFactory.getLogger(CotacaoServicoService.class);

    @Autowired
    private CotacaoServicoRepository cotacaoServicoRepository;

    @Autowired
    private MaterialDisponivelRepository materialDisponivelRepository;

    @Autowired
    private DistribuidoraRepository distribuidoraRepository;
    
    @Autowired
    private CotacaoCalculationService calculationService;

    @Autowired
    private CotacaoFinanceiroService cotacaoFinanceiroService;

    @Autowired
    private PessoaReposotory pessoaReposotory;
    
    public List<DistribuidoraCotacaoDTO> calcularValoresPorDistribuidora(Long cotacaoId, Double percentualLucro) {
        CotacaoServico cotacao = cotacaoServicoRepository.findById(cotacaoId)
            .orElseThrow(() -> new RuntimeException("Cotação não encontrada"));
        return calculationService.calcularValoresPorDistribuidora(cotacao, percentualLucro);
    }
    
    public DistribuidoraCotacaoDTO buscarDistribuidoraMaisBarata(Long cotacaoId, Double percentualLucro) {
        CotacaoServico cotacao = cotacaoServicoRepository.findById(cotacaoId)
            .orElseThrow(() -> new RuntimeException("Cotação não encontrada"));
        return calculationService.buscarDistribuidoraMaisBarata(cotacao, percentualLucro);
    }

    public Page<CotacaoServicoDTO> buscarTodos(Pageable pageable) {
        Page<CotacaoServico> cotacoes = cotacaoServicoRepository.findAll(pageable);
        return cotacoes.map(this::toDTO);
    }

    public CotacaoServico inserir(CotacaoServico cotacaoServico) {
        return cotacaoServicoRepository.save(cotacaoServico);
    }

    public CotacaoServico criarCotacao(CotacaoServicoInputDTO inputDTO) {
        CotacaoServico cotacao = new CotacaoServico();
        cotacao.setNome(inputDTO.getNome());
        if (inputDTO.getClienteId() != null) {
            Pessoa cliente = pessoaReposotory.findById(inputDTO.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + inputDTO.getClienteId()));
            cotacao.setCliente(cliente);
            if (inputDTO.getClienteNome() == null || inputDTO.getClienteNome().isBlank()) {
                cotacao.setClienteNome(cliente.getNome());
            } else {
                cotacao.setClienteNome(inputDTO.getClienteNome());
            }
        } else {
            cotacao.setClienteNome(inputDTO.getClienteNome());
        }
        cotacao.setTelefone(inputDTO.getTelefone());
        if (inputDTO.getEndereco() != null && !inputDTO.getEndereco().isBlank()) {
            cotacao.setEndereco(inputDTO.getEndereco());
        } else if (cotacao.getCliente() != null && cotacao.getCliente().getEndereco() != null) {
            cotacao.setEndereco(cotacao.getCliente().getEndereco());
        }
        cotacao.setQuantidadeProduto(inputDTO.getQuantidadeProduto().toString());
    cotacao.setDataCriacao(new Date());
    cotacao.setDataAtualizacao(new Date());
    cotacao.setAnaliseEscolhaJson(inputDTO.getAnaliseEscolhaJson());
    cotacao.setPercentualInsumos(inputDTO.getPercentualInsumos());
    cotacao.setValorFrete(inputDTO.getValorFrete());
    cotacao.setValorInsumos(inputDTO.getValorInsumos());
    cotacao.setTotalCustoMateriais(inputDTO.getTotalCustoMateriais());
    cotacao.setPercentualLucro(inputDTO.getPercentualLucro());
    cotacao.setValorLucro(inputDTO.getValorLucro());
    cotacao.setValorTotalOrcamento(inputDTO.getValorTotalOrcamento());

        for (MaterialInputDTO matInput : inputDTO.getMateriais()) {
            Material material = new Material();
            Optional<MaterialDisponivel> matDispOpt = materialDisponivelRepository.findById(matInput.getMaterialDisponivelId());
            if (matDispOpt.isPresent()) {
                material.setMaterialDisponivel(matDispOpt.get());
                material.setQuantidade(matInput.getQuantidade());
                material.setCotacaoServico(cotacao);
                material.setDataCriacao(new Date());
                material.setDataAtualizacao(new Date());
                cotacao.getMateriais().add(material);
            } else {
                throw new RuntimeException("MaterialDisponivel com ID " + matInput.getMaterialDisponivelId() + " não encontrado");
            }
        }

        for (DistribuidoraInputDTO distInput : inputDTO.getDistribuidoras()) {
            Distribuidora distribuidora = distribuidoraRepository.findByNome(distInput.getNome());
            if (distribuidora == null) {
                distribuidora = new Distribuidora();
                distribuidora.setNome(distInput.getNome());
                distribuidora.setDataCriacao(new Date());
                distribuidora.setDataAtualizacao(new Date());
                distribuidora = distribuidoraRepository.save(distribuidora);
            }
            cotacao.getDistribuidoras().add(distribuidora);
        }

        cotacao = cotacaoServicoRepository.save(cotacao);

        for (PrecoMaterialInputDTO precoInput : inputDTO.getPrecosMateriais()) {
            PrecoMaterialCotacao preco = new PrecoMaterialCotacao();
            preco.setCotacaoServico(cotacao);

            Optional<Material> materialOpt = cotacao.getMateriais().stream()
                .filter(m -> m.getMaterialDisponivel().getId().equals(precoInput.getMaterialId()))
                .findFirst();
            if (materialOpt.isPresent()) {
                preco.setMaterial(materialOpt.get());
            } else {
                throw new RuntimeException("Material com ID " + precoInput.getMaterialId() + " não encontrado na cotação");
            }

            Optional<Distribuidora> distribuidoraOpt = cotacao.getDistribuidoras().stream()
                .filter(d -> d.getNome().equals(precoInput.getDistribuidoraNome()))
                .findFirst();
            if (distribuidoraOpt.isPresent()) {
                preco.setDistribuidora(distribuidoraOpt.get());
            } else {
                throw new RuntimeException("Distribuidora " + precoInput.getDistribuidoraNome() + " não encontrada na cotação");
            }

            preco.setPreco(precoInput.getPreco());
            cotacao.getPrecosMateriais().add(preco);
        }

        cotacao = cotacaoServicoRepository.save(cotacao);

        try {
            cotacaoFinanceiroService.gerarContasDaCotacao(cotacao.getId(), false);
        } catch (Exception ex) {
            log.warn("Cotação #{} salva sem contas financeiras: {}", cotacao.getId(), ex.getMessage());
        }

        return cotacao;
    }

    public void excluir(Long id) {
        cotacaoServicoRepository.deleteById(id);
    }

    public Optional<CotacaoServico> findById(Long id) {
        return cotacaoServicoRepository.findById(id);
    }

    public CotacaoServicoDTO atualizarDadosCobranca(Long id, AtualizarDadosCobrancaDTO dto) {
        CotacaoServico cotacao = cotacaoServicoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Cotação não encontrada: " + id));
        cotacao.setValorPendente(dto.getValorPendente());
        cotacao.setDataVencimento(dto.getDataVencimento());
        cotacao.setDataAtualizacao(new Date());
        return toDTO(cotacaoServicoRepository.save(cotacao));
    }

    public CotacaoServicoDTO toDTO(CotacaoServico cotacao) {
        CotacaoServicoDTO dto = new CotacaoServicoDTO();
        dto.setId(cotacao.getId());
        dto.setNome(cotacao.getNome());
        if (cotacao.getCliente() != null) {
            dto.setClienteId(cotacao.getCliente().getId());
        }
        dto.setClienteNome(cotacao.getClienteNome());
        dto.setTelefone(cotacao.getTelefone());
        dto.setEndereco(cotacao.getEndereco());
        dto.setQuantidadeProduto(cotacao.getQuantidadeProduto());

        List<MaterialDTO> materiaisDTO = cotacao.getMateriais().stream()
            .map(this::toMaterialDTO)
            .collect(Collectors.toList());
        dto.setMateriais(materiaisDTO);

        List<DistribuidoraDTO> distribuidorasDTO = cotacao.getDistribuidoras().stream()
            .map(this::toDistribuidoraDTO)
            .collect(Collectors.toList());
        dto.setDistribuidoras(distribuidorasDTO);

    dto.setAnaliseEscolhaJson(cotacao.getAnaliseEscolhaJson());
    dto.setPercentualInsumos(cotacao.getPercentualInsumos());
    dto.setValorFrete(cotacao.getValorFrete());
    dto.setValorInsumos(cotacao.getValorInsumos());
    dto.setTotalCustoMateriais(cotacao.getTotalCustoMateriais());
    dto.setPercentualLucro(cotacao.getPercentualLucro());
    dto.setValorLucro(cotacao.getValorLucro());
    dto.setValorTotalOrcamento(cotacao.getValorTotalOrcamento());
    dto.setValorPendente(cotacao.getValorPendente());
    dto.setDataVencimento(cotacao.getDataVencimento());
            dto.setDataCriacao(cotacao.getDataCriacao());
            dto.setDataAtualizacao(cotacao.getDataAtualizacao());
    return dto;
    }

    private MaterialDTO toMaterialDTO(Material material) {
        MaterialDTO dto = new MaterialDTO();
        dto.setId(material.getId());
        dto.setQuantidade(material.getQuantidade().toString());
        dto.setMaterialDisponivel(toMaterialDisponivelDTO(material.getMaterialDisponivel()));

        List<PrecoMaterialCotacaoDTO> precosDTO = material.getCotacaoServico().getPrecosMateriais().stream()
            .filter(preco -> preco.getMaterial().getId().equals(material.getId()))
            .map(this::toPrecoMaterialCotacaoDTO)
            .collect(Collectors.toList());
        dto.setPrecos(precosDTO);

        return dto;
    }

    private DistribuidoraDTO toDistribuidoraDTO(Distribuidora distribuidora) {
        DistribuidoraDTO dto = new DistribuidoraDTO();
        dto.setId(distribuidora.getId());
        dto.setNome(distribuidora.getNome());
        return dto;
    }

    private MaterialDisponivelDTO toMaterialDisponivelDTO(MaterialDisponivel materialDisponivel) {
        MaterialDisponivelDTO dto = new MaterialDisponivelDTO();
        dto.setId(materialDisponivel.getId());
        dto.setDescricao(materialDisponivel.getDescricao());
        return dto;
    }

    private PrecoMaterialCotacaoDTO toPrecoMaterialCotacaoDTO(PrecoMaterialCotacao preco) {
        PrecoMaterialCotacaoDTO dto = new PrecoMaterialCotacaoDTO();
        dto.setId(preco.getId());
        dto.setDistribuidora(toDistribuidoraDTO(preco.getDistribuidora()));
        dto.setPreco(preco.getPreco());
        return dto;
    }

    public Page<CotacaoServicoDTO> search(String query, Pageable pageable) {
        Page<CotacaoServico> cotacoes = cotacaoServicoRepository.findByNomeContainingOrClienteNomeContainingOrTelefoneContaining(query, query, query, pageable);
        return cotacoes.map(this::toDTO);
}

}
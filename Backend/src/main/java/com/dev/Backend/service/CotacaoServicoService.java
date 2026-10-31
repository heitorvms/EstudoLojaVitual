package com.dev.Backend.service;

import com.dev.Backend.dto.*;
import com.dev.Backend.entity.*;
import com.dev.Backend.repository.CotacaoServicoRepository;
import com.dev.Backend.repository.DistribuidoraRepository;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import com.dev.Backend.repository.OrdemServicoRepository;
import com.dev.Backend.repository.PessoaReposotory;
import com.dev.Backend.exception.RegraNegocioException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CotacaoServicoService {

    @Autowired
    private CotacaoServicoRepository cotacaoServicoRepository;

    @Autowired
    private MaterialDisponivelRepository materialDisponivelRepository;

    @Autowired
    private DistribuidoraRepository distribuidoraRepository;
    
    @Autowired
    private CotacaoCalculationService calculationService;

    @Autowired
    private PessoaReposotory pessoaReposotory;

    @Autowired
    private PlanoCorteService planoCorteService;

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;
    
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

    public Page<CotacaoServicoDTO> buscar(String query, SituacaoCotacao situacao, Pageable pageable) {
        String termo = query == null ? "" : query.trim();
        return cotacaoServicoRepository.buscar(termo, situacao.name(), pageable).map(this::toDTO);
    }

    public CotacaoServico inserir(CotacaoServico cotacaoServico) {
        return cotacaoServicoRepository.save(cotacaoServico);
    }

    @Transactional
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
    cotacao.setTipoMaoDeObra(inputDTO.getTipoMaoDeObra() != null ? inputDTO.getTipoMaoDeObra() : TipoMaoDeObra.PERCENTUAL);
    cotacao.setPercentualMaoDeObra(inputDTO.getPercentualMaoDeObra());
    cotacao.setValorMaoDeObra(inputDTO.getValorMaoDeObra());

        for (MaterialInputDTO matInput : inputDTO.getMateriais()) {
            Material material = new Material();
            Optional<MaterialDisponivel> matDispOpt = materialDisponivelRepository.findById(matInput.getMaterialDisponivelId());
            if (matDispOpt.isPresent()) {
                material.setMaterialDisponivel(matDispOpt.get());
                material.setQuantidade(matInput.getQuantidade());
                material.setMetros(matInput.getMetros());
                adicionarPecas(material, matInput.getPecas());
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

        calculationService.aplicarComposicaoCustos(cotacao);
        return cotacaoServicoRepository.save(cotacao);
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
    dto.setTipoMaoDeObra(cotacao.getTipoMaoDeObra());
    dto.setPercentualMaoDeObra(cotacao.getPercentualMaoDeObra());
    dto.setValorMaoDeObra(cotacao.getValorMaoDeObra());
    dto.setValorTotalOrcamento(cotacao.getValorTotalOrcamento());
    dto.setValorPendente(cotacao.getValorPendente());
    dto.setDataVencimento(cotacao.getDataVencimento());
            dto.setDataCriacao(cotacao.getDataCriacao());
            dto.setDataAtualizacao(cotacao.getDataAtualizacao());
    ordemServicoRepository.findByCotacaoId(cotacao.getId())
            .ifPresent(os -> dto.setOrdemServicoId(os.getId()));
    return dto;
    }

    private MaterialDTO toMaterialDTO(Material material) {
        MaterialDTO dto = new MaterialDTO();
        dto.setId(material.getId());
        dto.setQuantidade(material.getQuantidade() != null ? material.getQuantidade().toString() : "0");
        dto.setMetros(material.getMetros());
        dto.setMaterialDisponivel(toMaterialDisponivelDTO(material.getMaterialDisponivel()));

        List<PrecoMaterialCotacaoDTO> precosDTO = material.getCotacaoServico().getPrecosMateriais().stream()
            .filter(preco -> preco.getMaterial().getId().equals(material.getId()))
            .map(this::toPrecoMaterialCotacaoDTO)
            .collect(Collectors.toList());
        dto.setPrecos(precosDTO);
        dto.setPecas(planoCorteService.pecasDe(material));
        dto.setPlanoCorte(planoCorteService.doMaterialDaCotacao(material));

        return dto;
    }

    private void adicionarPecas(Material material, List<PecaCorteDTO> pecas) {
        for (PecaCorteDTO p : planoCorteService.normalizar(pecas)) {
            MaterialPeca peca = new MaterialPeca();
            peca.setMaterial(material);
            peca.setDescricao(p.descricao());
            peca.setComprimentoMm(p.comprimentoMm());
            peca.setQuantidade(p.quantidade());
            material.getPecas().add(peca);
        }
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
        dto.setTamanho(materialDisponivel.getTamanho());
        if (materialDisponivel.getUnidade() != null) {
            dto.setUnidade(materialDisponivel.getUnidade().name());
        }
        dto.setComprimentoBarraMm(materialDisponivel.getComprimentoBarraMm());
        return dto;
    }

    private PrecoMaterialCotacaoDTO toPrecoMaterialCotacaoDTO(PrecoMaterialCotacao preco) {
        PrecoMaterialCotacaoDTO dto = new PrecoMaterialCotacaoDTO();
        dto.setId(preco.getId());
        dto.setDistribuidora(toDistribuidoraDTO(preco.getDistribuidora()));
        dto.setPreco(preco.getPreco());
        return dto;
    }

}
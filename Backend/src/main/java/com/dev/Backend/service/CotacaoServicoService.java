package com.dev.Backend.service;

import com.dev.Backend.dto.*;
import com.dev.Backend.entity.*;
import com.dev.Backend.repository.CotacaoServicoRepository;
import com.dev.Backend.repository.DistribuidoraRepository;
import com.dev.Backend.repository.MaterialDisponivelRepository;
import com.dev.Backend.repository.MaterialRepository;
import com.dev.Backend.repository.PrecoMaterialCotacaoRepository;
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

    @Autowired
    private CotacaoServicoRepository cotacaoServicoRepository;

    @Autowired
    private MaterialDisponivelRepository materialDisponivelRepository;

    @Autowired
    private DistribuidoraRepository distribuidoraRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private PrecoMaterialCotacaoRepository precoMaterialCotacaoRepository;

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
        cotacao.setClienteNome(inputDTO.getClienteNome());
        cotacao.setTelefone(inputDTO.getTelefone());
        cotacao.setQuantidadeProduto(inputDTO.getQuantidadeProduto().toString()); // Convertendo Integer para String
        cotacao.setDataCriacao(new Date());
        cotacao.setDataAtualizacao(new Date());

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

        // Processar distribuidoras
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

        // Salvar a cotação primeiro para ter o ID e associar corretamente os materiais
        cotacao = cotacaoServicoRepository.save(cotacao);

        // Processar precosMateriais
        for (PrecoMaterialInputDTO precoInput : inputDTO.getPrecosMateriais()) {
            PrecoMaterialCotacao preco = new PrecoMaterialCotacao();
            preco.setCotacaoServico(cotacao);

            // Encontrar o material na lista de materiais da cotação
            Optional<Material> materialOpt = cotacao.getMateriais().stream()
                .filter(m -> m.getMaterialDisponivel().getId().equals(precoInput.getMaterialId()))
                .findFirst();
            if (materialOpt.isPresent()) {
                preco.setMaterial(materialOpt.get());
            } else {
                throw new RuntimeException("Material com ID " + precoInput.getMaterialId() + " não encontrado na cotação");
            }

            // Encontrar a distribuidora na lista de distribuidoras da cotação
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

        // Salvar novamente para persistir os precosMateriais
        cotacao = cotacaoServicoRepository.save(cotacao);

        return cotacao;
    }

    public void excluir(Long id) {
        cotacaoServicoRepository.deleteById(id);
    }

    public Optional<CotacaoServico> findById(Long id) {
        return cotacaoServicoRepository.findById(id);
    }

    public CotacaoServicoDTO toDTO(CotacaoServico cotacao) {
        CotacaoServicoDTO dto = new CotacaoServicoDTO();
        dto.setId(cotacao.getId());
        dto.setNome(cotacao.getNome());
        dto.setClienteNome(cotacao.getClienteNome());
        dto.setTelefone(cotacao.getTelefone());
        dto.setQuantidadeProduto(cotacao.getQuantidadeProduto());

        List<MaterialDTO> materiaisDTO = cotacao.getMateriais().stream()
            .map(this::toMaterialDTO)
            .collect(Collectors.toList());
        dto.setMateriais(materiaisDTO);

        List<DistribuidoraDTO> distribuidorasDTO = cotacao.getDistribuidoras().stream()
            .map(this::toDistribuidoraDTO)
            .collect(Collectors.toList());
        dto.setDistribuidoras(distribuidorasDTO);

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
}
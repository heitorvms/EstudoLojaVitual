import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { AutoComplete } from "primereact/autocomplete";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import debounce from "lodash/debounce";
import { CotacaoService } from "../../services/CotacaoService";
import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import { DistribuidoraService } from "../../services/DistribuidoraService";
import {
  ContainerPage,
  Title,
  FormSection,
  SubTitle,
  FormRow,
  FormGroup,
  ButtonContainer,
  CardStyled,
  CardTitle,
  AnaliseSection,
  AnaliseContainer,
  AnaliseTitle,
  AnaliseFlexContainer,
  AnaliseColumnContainer,
  AnaliseRadioInput,
  AnaliseRadioLabel,
  AnaliseCardMargin,
  AnaliseDiferencaVerde,
  AnaliseSelectDistribuidora,
  AnaliseStatusDescricao,
  AnaliseDistribuidoraCard,
  AnaliseValorTotal,
  AnaliseDistribuidoraStatus,
  AnaliseDistribuidoraSelecionadaAviso,
  AnaliseConfirmarButtonContainer,
  ResumoAnaliseContainer,
  ResumoAnaliseTitle,
  ResumoAnaliseSection,
  ResumoAnaliseList,
  ResumoAnaliseValorTotal,
  DataTableStyled,
  RemoveDistribuidorButton,
  RemoveMaterialButton,
  DistribuidoresContainer,
  DistribuidorItem,
  Label,
  ErrorMessage,
  FormTitle,
  GlobalStyle,
  InputTextStyled,
  ButtonStyled
} from './styled';


const INITIAL_STATE = {
  nome: "",
  clienteNome: "",
  telefone: "",
  endereco: "",
  quantidadeProduto: "",
  materiais: [],
  precoMaterial: "",
};

const CriarCotacao = () => {
  const [cotacao, setCotacao] = useState(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [material, setMaterial] = useState({ selectedMaterials: [], quantidade: "", precos: [] });
  const [distribuidores, setDistribuidores] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [novoDistribuidor, setNovoDistribuidor] = useState("");
  const [distribuidorSuggestions, setDistribuidorSuggestions] = useState([]);
  const [availableDistribuidores, setAvailableDistribuidores] = useState([]);
  const [isAddingDistribuidor, setIsAddingDistribuidor] = useState(false);
  const [valoresDistribuidoras, setValoresDistribuidoras] = useState([]);
  const [distribuidoraMaisBarata, setDistribuidoraMaisBarata] = useState(null);
  const [distribuidoraSelecionada, setDistribuidoraSelecionada] = useState(null);
  const [showAnalise, setShowAnalise] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analiseMateriais, setAnaliseMateriais] = useState([]); 
  const [analiseDistribuidoras, setAnaliseDistribuidoras] = useState([]);
  const [distribuidoraTotalSelecionada, setDistribuidoraTotalSelecionada] = useState("");
  const [tipoAnaliseSelecionada, setTipoAnaliseSelecionada] = useState("");
  const [resumoAnalise, setResumoAnalise] = useState(null);
  const navigate = useNavigate();
  const toast = useRef(null);
  const cotacaoService = useRef(new CotacaoService()).current;
  const materialService = useRef(new MaterialDisponivelService()).current;
  const distribuidoraService = useRef(new DistribuidoraService()).current;

  useEffect(() => {
    const fetchDistribuidores = async () => {
      const result = await distribuidoraService.getPaginado(0, 10);
      if (result.success) {
        setAvailableDistribuidores(result.data.content);
      } else {
        toast.current.show(result.message);
      }
    };
    fetchDistribuidores();
  }, []);

  const formatPhoneNumber = (value) => {
    const cleaned = ("" + value).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `(${match[1]})${match[2]}${match[3] ? `-${match[3]}` : ""}`;
    }
    return cleaned;
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatNumber = (value) => {
    if (!value) return value;
    return value.replace(/\D/g, "");
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "R$ 0,00";
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  };

  const calcularPrecoFinal = () => {
    const precoInicial = cotacao.precoMaterial || 0;
    return Number(precoInicial).toFixed(2);
  };

  const validateForm = () => {
    const errors = {};
    const cleanedPhone = cotacao.telefone.replace(/\D/g, "");

    if (!cotacao.nome.trim()) errors.nome = "O nome da cotação é obrigatório";
    if (!cotacao.clienteNome.trim()) errors.clienteNome = "O nome do cliente é obrigatório";
    if (!cotacao.telefone || cleanedPhone.length !== 11)
      errors.telefone = "O telefone é obrigatório e deve ter 11 dígitos (ex: (XX) XXXXX-XXXX)";
    if (!cotacao.endereco.trim()) errors.endereco = "O endereço é obrigatório";
    if (distribuidores.length === 0) errors.distribuidores = "Pelo menos um distribuidor é obrigatório";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const debouncedSearchMateriais = useCallback(
    debounce(async (query) => {
      if (query.length >= 3) {
        try {
          const response = await materialService.getMateriais(query);
          if (response.success) {
            const selectedMaterials = cotacao.materiais.map((m) => m.materialDisponivel.descricao.toLowerCase());
            const filteredSuggestions = response.data.filter(
              (suggestion) => !selectedMaterials.includes(suggestion.descricao.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
          } else {
            toast.current.show(response.message);
            setSuggestions([]);
          }
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao buscar materiais",
            life: 3000,
          });
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 1000),
    [cotacao.materiais]
  );

  const searchMateriais = (event) => {
    debouncedSearchMateriais(event.query);
  };

  const debouncedSearchDistribuidores = useCallback(
    debounce(async (query) => {
      if (query && query.trim().length >= 3) {
        try {
          const response = await distribuidoraService.getSugestoes(query.trim(), 0, 10);
          if (response.success && response.data.content) {
            const suggestions = response.data.content.map((dist) => dist.nome.trim());
            const selectedDistribuidores = distribuidores.map((d) => d.trim().toLowerCase());
            const filteredSuggestions = suggestions.filter(
              (suggestion) => !selectedDistribuidores.includes(suggestion.trim().toLowerCase())
            );
            setDistribuidorSuggestions(filteredSuggestions);
            setAvailableDistribuidores((prev) => [
              ...prev,
              ...response.data.content.filter((dist) => !prev.some((existing) => existing.nome === dist.nome)),
            ]);
          } else {
            setDistribuidorSuggestions([]);
          }
        } catch (error) {
          console.error("Erro ao buscar distribuidores:", error);
          setDistribuidorSuggestions([]);
        }
      } else {
        setDistribuidorSuggestions([]);
      }
    }, 1000),
    [distribuidores]
  );

  const searchDistribuidores = (event) => {
    debouncedSearchDistribuidores(event.query);
  };

  const addDistribuidor = async (nome) => {
    setIsAddingDistribuidor(true);
    if (!nome || !nome.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Digite o nome do distribuidor",
        life: 3000,
      });
      setIsAddingDistribuidor(false);
      return;
    }
    if (distribuidores.length >= 6) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Você pode adicionar no máximo 6 distribuidores",
        life: 3000,
      });
      setIsAddingDistribuidor(false);
      return;
    }
    const normalizedNome = nome.trim().toLowerCase();
    if (distribuidores.some((d) => d.toLowerCase() === normalizedNome)) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Este distribuidor já foi adicionado",
        life: 3000,
      });
      setIsAddingDistribuidor(false);
      return;
    }
    const existingDistribuidor = availableDistribuidores.find((d) => d.nome.toLowerCase() === normalizedNome);
    if (existingDistribuidor) {
      setDistribuidores((prev) => [...prev, existingDistribuidor.nome]);
      setNovoDistribuidor("");
      setIsAddingDistribuidor(false);
      return;
    }
    try {
      const result = await distribuidoraService.postRequest({ nome });
      if (result.success) {
        setAvailableDistribuidores((prev) => [...prev, result.data]);
        setDistribuidores((prev) => [...prev, result.data.nome]);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: `Distribuidor ${result.data.nome} adicionado com sucesso`,
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: result.message.detail || "Erro ao adicionar distribuidor",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: error.response?.data?.message || "Erro ao adicionar distribuidor",
        life: 3000,
      });
    } finally {
      setIsAddingDistribuidor(false);
    }
    setNovoDistribuidor("");
  };

  const removeDistribuidor = (distribuidor) => {
    if (distribuidores.length <= 1) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Deve haver pelo menos um distribuidor",
        life: 3000,
      });
      return;
    }
    setDistribuidores((prev) => prev.filter((d) => d !== distribuidor));
    setMaterial((prev) => ({
      ...prev,
      precos: prev.precos.filter((p) => p.fornecedor !== distribuidor),
    }));
    setCotacao((prev) => ({
      ...prev,
      materiais: prev.materiais.map((m) => ({
        ...m,
        precos: m.precos.filter((p) => p.fornecedor !== distribuidor),
      })),
    }));
  };

  const onInputChange = (e, name) => {
    let value = e.target.value;
    if (name === "nome") {
      value = capitalizeFirstLetter(value);
    } else if (["quantidadeProduto", "precoMaterial"].includes(name)) {
      value = formatNumber(value);
    } else if (name === "telefone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 11);
      value = formatPhoneNumber(cleaned);
    }
    setCotacao((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const onMaterialChange = (e, name) => {
    let value = name === "selectedMaterials" ? e.value : e.target.value;
    if (name === "quantidade") {
      value = formatNumber(value);
    }
    setMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const onPrecoChange = (e, distribuidor) => {
    let value = e.target.value.replace(",", ".");
    setMaterial((prev) => {
      const newPrecos = [...prev.precos];
      const index = newPrecos.findIndex((p) => p.fornecedor === distribuidor);
      if (index !== -1) {
        newPrecos[index].preco = value;
      } else {
        newPrecos.push({ fornecedor: distribuidor, preco: value });
      }
      return { ...prev, precos: newPrecos };
    });
  };

  const addMaterial = () => {
    if (distribuidores.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione pelo menos um distribuidor",
        life: 3000,
      });
      return;
    }
    if (!material.selectedMaterials.length) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione pelo menos um material",
        life: 3000,
      });
      return;
    }
    if (!material.quantidade.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "A quantidade é obrigatória",
        life: 3000,
      });
      return;
    }
    if (isNaN(material.quantidade) || Number(material.quantidade) <= 0 || !Number.isInteger(Number(material.quantidade))) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Quantidade deve ser um número inteiro positivo",
        life: 3000,
      });
      return;
    }
    const precoInvalid = material.precos.some((p) => p.preco && (isNaN(p.preco) || Number(p.preco) < 0));
    if (precoInvalid) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Preços devem ser números não negativos",
        life: 3000,
      });
      return;
    }
    material.selectedMaterials.forEach((selected) => {
      setCotacao((prev) => ({
        ...prev,
        materiais: [
          ...prev.materiais,
          {
            materialDisponivel: selected,
            quantidade: Number(material.quantidade),
            precos: [...material.precos],
          },
        ],
      }));
    });
    setMaterial({ selectedMaterials: [], quantidade: "", precos: [] });
  };

  const removeMaterial = (index) => {
    setCotacao((prev) => ({
      ...prev,
      materiais: prev.materiais.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSubmitted(true);
    setFormErrors({});
    if (!validateForm()) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Por favor, corrija os campos inválidos",
        life: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      
      const escolhasMateriais = (analiseMateriais || []).map((m) => ({
        materialId: m.materialId,
        nome: m.nome,
        distribuidoraSelecionada: m.distribuidoraSelecionada || m.maisBarato?.distribuidora || null,
        valorSelecionado: (m.diferencas || []).find((d) => d.distribuidora === (m.distribuidoraSelecionada || m.maisBarato?.distribuidora))?.preco || null,
      }));

      const infoTotalSelecionado = (() => {
        if (!distribuidoraTotalSelecionada) return null;
        const dist = (analiseDistribuidoras || []).find((d) => d.distribuidora === distribuidoraTotalSelecionada);
        if (!dist) return { distribuidora: distribuidoraTotalSelecionada };
        return {
          distribuidora: dist.distribuidora,
          valorTotal: dist.valorTotal,
          status: dist.status,
        };
      })();

      
      const resumoAuto = (() => {
        if (resumoAnalise) return resumoAnalise;
        if (tipoAnaliseSelecionada === "materiais" && escolhasMateriais?.length) {
          const valorTotal = escolhasMateriais.reduce((acc, it) => acc + (Number(it.valorSelecionado) || 0), 0);
          return {
            tipo: "materiais",
            materiais: escolhasMateriais.map((it) => ({ nome: it.nome, distribuidora: it.distribuidoraSelecionada, valor: it.valorSelecionado || 0 })),
            valorTotal,
          };
        }
        if (tipoAnaliseSelecionada === "distribuidoras" && infoTotalSelecionado) {
          
          const materiaisDaDistrib = (analiseMateriais || []).map((m) => ({
            nome: m.nome,
            valor: (m.diferencas || []).find((d) => d.distribuidora === infoTotalSelecionado.distribuidora)?.preco || 0,
          }));
          return {
            tipo: "distribuidoras",
            distribuidora: infoTotalSelecionado.distribuidora,
            valorTotal: infoTotalSelecionado.valorTotal || materiaisDaDistrib.reduce((acc, it) => acc + (Number(it.valor) || 0), 0),
            materiais: materiaisDaDistrib,
          };
        }
        return null;
      })();

      const analiseCompleta = {
        tipoEscolhido: tipoAnaliseSelecionada || null,
        resumoEscolha: resumoAuto || null,
        analiseMateriais: analiseMateriais || [],
        analiseDistribuidoras: analiseDistribuidoras || [],
        escolhas: {
          materiais: escolhasMateriais,
          valorTotal: infoTotalSelecionado,
        },
      };

      const cotacaoToSave = {
        nome: cotacao.nome,
        clienteNome: cotacao.clienteNome,
        telefone: cotacao.telefone.replace(/\D/g, ""),
        quantidadeProduto: Number(cotacao.quantidadeProduto),
        materiais: cotacao.materiais.map((m) => ({
          materialDisponivelId: m.materialDisponivel.id,
          quantidade: Number(m.quantidade),
        })),
        distribuidoras: distribuidores.map((nome) => ({ nome })),
        precosMateriais: cotacao.materiais.flatMap((m) =>
          m.precos
            .filter((p) => p.fornecedor && p.preco !== undefined && p.preco !== null && !isNaN(parseFloat(p.preco)))
            .map((p) => ({
              materialId: m.materialDisponivel.id,
              distribuidoraNome: p.fornecedor,
              preco: parseFloat(Number(p.preco).toFixed(2)),
            }))
        ),
        analiseEscolhaJson: JSON.stringify(analiseCompleta),
      };

      const result = await cotacaoService.postRequest(cotacaoToSave);

      
      setCotacao((prev) => ({ ...prev, id: result?.id }));
      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Cotação criada com sucesso!",
        life: 3000,
      });
      
  navigate("/cotacoes");
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: error.response?.data?.message || error.message || "Erro ao criar cotação",
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const analisarValores = () => {
    
    const analise = cotacao.materiais.map((mat) => {
      const quantidade = Number(mat.quantidade) || 1;
      const precos = mat.precos
        .filter((p) => distribuidores.includes(p.fornecedor) && p.preco && !isNaN(p.preco))
        .map((p) => ({ distribuidora: p.fornecedor, preco: Number(p.preco) * quantidade }));
      if (precos.length === 0) return null;
      const maisBarato = precos.reduce((min, p) => (p.preco < min.preco ? p : min), precos[0]);
      const diferencas = precos.map((p) => ({
        distribuidora: p.distribuidora,
        preco: p.preco,
        diferenca: p.preco - maisBarato.preco,
      }));
      return {
        materialId: mat.materialDisponivel.id,
        nome: mat.materialDisponivel.descricao,
        maisBarato,
        diferencas,
        distribuidoraSelecionada: maisBarato.distribuidora,
        quantidade,
      };
    }).filter(Boolean);
    setAnaliseMateriais(analise);

    
    const distribuidoraValores = distribuidores.map((dist) => {
      let valorTotal = 0;
      cotacao.materiais.forEach((mat) => {
        const quantidade = Number(mat.quantidade) || 1;
        const preco = mat.precos.find((p) => p.fornecedor === dist && p.preco && !isNaN(p.preco));
        valorTotal += preco ? Number(preco.preco) * quantidade : 0;
      });
      return { distribuidora: dist, valorTotal };
    });
    
    const sorted = [...distribuidoraValores].sort((a, b) => a.valorTotal - b.valorTotal);
    const analiseDist = sorted.map((d, idx, arr) => {
      let status = "medio";
      if (idx === 0) status = "maisBarato";
      else if (idx === arr.length - 1) status = "maisCaro";
      return { ...d, status };
    });
    setAnaliseDistribuidoras(analiseDist);
    setDistribuidoraTotalSelecionada(analiseDist.find(d => d.status === "maisBarato")?.distribuidora || analiseDist[0]?.distribuidora || "");
    setShowAnalise(true);
  };

  const renderFormulario = () => (
    <FormSection>
      <FormTitle>Informações do Orçamento</FormTitle>
      <FormRow>
        <FormGroup>
          <Label htmlFor="nome">Nome do Orçamento</Label>
          <InputTextStyled
            id="nome"
            value={cotacao.nome}
            onChange={(e) => onInputChange(e, "nome")}
            className={classNames({ "p-invalid": submitted && formErrors.nome })}
          />
          {formErrors.nome && <ErrorMessage>{formErrors.nome}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="clienteNome">Nome do Cliente</Label>
          <InputTextStyled
            id="clienteNome"
            value={cotacao.clienteNome}
            onChange={(e) => onInputChange(e, "clienteNome")}
            className={classNames({ "p-invalid": submitted && formErrors.clienteNome })}
          />
          {formErrors.clienteNome && <ErrorMessage>{formErrors.clienteNome}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="telefone">Telefone</Label>
          <InputTextStyled
            id="telefone"
            value={cotacao.telefone}
            onChange={(e) => onInputChange(e, "telefone")}
            placeholder="(XX) XXXXX-XXXX"
            className={classNames({ "p-invalid": submitted && formErrors.telefone })}
          />
          {formErrors.telefone && <ErrorMessage>{formErrors.telefone}</ErrorMessage>}
        </FormGroup>
      </FormRow>
      <FormRow>
        <FormGroup>
          <Label htmlFor="endereco">Endereço</Label>
          <InputTextStyled
            id="endereco"
            value={cotacao.endereco}
            onChange={(e) => onInputChange(e, "endereco")}
            className={classNames({ "p-invalid": submitted && formErrors.endereco })}
          />
          {formErrors.endereco && <small className="p-error">{formErrors.endereco}</small>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="quantidadeProduto">Quantidade do Produto</label>
          <InputTextStyled
            id="quantidadeProduto"
            value={cotacao.quantidadeProduto}
            onChange={(e) => onInputChange(e, "quantidadeProduto")}
            className={classNames({ "p-invalid": submitted && formErrors.quantidadeProduto })}
          />
          {formErrors.quantidadeProduto && <small className="p-error">{formErrors.quantidadeProduto}</small>}
        </FormGroup>
      </FormRow>

    </FormSection>
  );

  const renderDistribuidores = () => (
    <FormSection>
      <SubTitle>Distribuidores</SubTitle>
      <FormRow>
        <FormGroup>
          <label htmlFor="novoDistribuidor">Adicionar Distribuidor</label>
          <AutoComplete
            inputId="novoDistribuidor"
            value={novoDistribuidor}
            suggestions={distribuidorSuggestions}
            completeMethod={searchDistribuidores}
            onChange={(e) => setNovoDistribuidor(e.value)}
            placeholder="Digite o nome do distribuidor"
            forceSelection={false}
            appendTo="self"
          />
          <ButtonStyled
            label="Adicionar"
            onClick={() => addDistribuidor(novoDistribuidor)}
            disabled={isAddingDistribuidor}
            className="mt-2"
          />
          {formErrors.distribuidores && <small className="p-error">{formErrors.distribuidores}</small>}
        </FormGroup>
      </FormRow>
      <DistribuidoresContainer>
        {distribuidores.map((dist, index) => (
          <DistribuidorItem key={index}>
            <span>{dist}</span>
            <RemoveDistribuidorButton
              icon="pi pi-times"
              onClick={() => removeDistribuidor(dist)}
            />
          </DistribuidorItem>
        ))}
      </DistribuidoresContainer>
    </FormSection>
  );

  const renderMateriais = () => (
    <FormSection>
      <SubTitle>Adicionar Materiais</SubTitle>
      <FormRow>
        <FormGroup>
          <label htmlFor="materialDisponivel">Materiais</label>
          <AutoComplete
            inputId="materialDisponivel"
            value={material.selectedMaterials}
            suggestions={suggestions}
            completeMethod={searchMateriais}
            field="descricao"
            itemTemplate={(suggestion) => <div>{suggestion.descricao}</div>}
            onChange={(e) => onMaterialChange(e, "selectedMaterials")}
            minLength={3}
            multiple
            forceSelection={true}
            appendTo="self"
            className={classNames({ "p-invalid": submitted && formErrors.materiais })}
          />
          {formErrors.materiais && <small className="p-error">{formErrors.materiais}</small>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="quantidadeMaterial">Quantidade</label>
          <InputTextStyled
            id="quantidadeMaterial"
            value={material.quantidade}
            onChange={(e) => onMaterialChange(e, "quantidade")}
            className={classNames({
              "p-invalid": !material.quantidade && material.selectedMaterials.length > 0
            })}
          />
          {!material.quantidade && material.selectedMaterials.length > 0 && (
            <small className="p-error">Quantidade é obrigatória</small>
          )}
        </FormGroup>
      </FormRow>
      <FormRow>
        {distribuidores.map((distribuidor, index) => (
          <FormGroup key={index}>
            <label htmlFor={`preco-${index}`}>{distribuidor}</label>
            <InputTextStyled
              id={`preco-${index}`}
              value={material.precos.find((p) => p.fornecedor === distribuidor)?.preco || ""}
              onChange={(e) => onPrecoChange(e, distribuidor)}
            />
          </FormGroup>
        ))}
      </FormRow>
      <ButtonStyled label="Adicionar Materiais" onClick={addMaterial} className="mb-3" />
      <DataTableStyled
        value={cotacao.materiais}
        className="mb-3"
        emptyMessage="Nenhum material adicionado"
      >
        <Column field="materialDisponivel.descricao" header="Material" />
        <Column field="quantidade" header="Quantidade" />
        {distribuidores.map((distribuidor) => (
          <Column
            key={distribuidor}
            header={distribuidor}
            body={(rowData) =>
              formatCurrency(rowData.precos.find((p) => p.fornecedor === distribuidor)?.preco || "")
            }
          />
        ))}
        <Column
          header="Ações"
          body={(rowData, { rowIndex }) => (
            <RemoveMaterialButton
              icon="pi pi-trash"
              onClick={() => removeMaterial(rowIndex)}
              className="p-button-rounded p-button-danger"
            />
          )}
        />
      </DataTableStyled>
    </FormSection>
  );

  const renderAnalise = () => (
    showAnalise && (
      <>
  <AnaliseFlexContainer>
          <AnaliseColumnContainer>
            <AnaliseTitle>
              <AnaliseRadioInput
                type="radio"
                id="analiseMateriais"
                name="tipoAnalise"
                value="materiais"
                checked={tipoAnaliseSelecionada === "materiais"}
                onChange={() => setTipoAnaliseSelecionada("materiais")}
              />
              <AnaliseRadioLabel
                htmlFor="analiseMateriais"
                selected={tipoAnaliseSelecionada === "materiais"}
              >
                Análise de Materiais por Distribuidora
              </AnaliseRadioLabel>
            </AnaliseTitle>
            {analiseMateriais.length === 0 && <div>Nenhum material para analisar.</div>}
            {analiseMateriais.map((mat) => (
              <CardStyled key={mat.materialId} className="analise-material">
                <CardTitle>{mat.nome}</CardTitle>
                <AnaliseCardMargin>
                  <strong>Mais barato:</strong> {mat.maisBarato.distribuidora} (R$ {mat.maisBarato.preco.toFixed(2)})
                </AnaliseCardMargin>
                <AnaliseCardMargin>
                  {mat.diferencas.map((dif) => (
                    dif.diferenca === 0 ? (
                      <AnaliseDiferencaVerde key={dif.distribuidora}>
                        {dif.distribuidora}: R$ {dif.preco.toFixed(2)} (Mais barato)
                      </AnaliseDiferencaVerde>
                    ) : (
                      <div key={dif.distribuidora} style={{ color: '#333' }}>
                        {dif.distribuidora}: R$ {dif.preco.toFixed(2)} (+R$ {dif.diferenca.toFixed(2)})
                      </div>
                    )
                  ))}
                </AnaliseCardMargin>
                <div style={{ marginBottom: 8 }}>
                  <strong>Escolher distribuidora:</strong>
                  <AnaliseSelectDistribuidora
                    value={mat.distribuidoraSelecionada}
                    onChange={e => {
                      setAnaliseMateriais(prev => prev.map(m => m.materialId === mat.materialId ? { ...m, distribuidoraSelecionada: e.target.value } : m));
                    }}
                  >
                    {mat.diferencas.map((dif) => (
                      <option key={dif.distribuidora} value={dif.distribuidora}>{dif.distribuidora}</option>
                    ))}
                  </AnaliseSelectDistribuidora>
                </div>
                <AnaliseStatusDescricao>
                  {mat.distribuidoraSelecionada === mat.maisBarato.distribuidora
                    ? 'Você selecionou a distribuidora mais barata.'
                    : `Você selecionou ${mat.distribuidoraSelecionada}. Diferença para o mais barato: R$ ${(
                        mat.diferencas.find(d => d.distribuidora === mat.distribuidoraSelecionada)?.diferenca || 0
                      ).toFixed(2)}`}
                </AnaliseStatusDescricao>
              </CardStyled>
            ))}
          </AnaliseColumnContainer>
          <AnaliseColumnContainer>
            <AnaliseTitle>
              <AnaliseRadioInput
                type="radio"
                id="analiseDistribuidoras"
                name="tipoAnalise"
                value="distribuidoras"
                checked={tipoAnaliseSelecionada === "distribuidoras"}
                onChange={() => setTipoAnaliseSelecionada("distribuidoras")}
              />
              <AnaliseRadioLabel
                htmlFor="analiseDistribuidoras"
                selected={tipoAnaliseSelecionada === "distribuidoras"}
              >
                Análise de Valor Total por Distribuidora
              </AnaliseRadioLabel>
            </AnaliseTitle>
            {analiseDistribuidoras.length === 0 && <div>Nenhuma distribuidora para analisar.</div>}
            {analiseDistribuidoras.map((dist) => (
              <AnaliseDistribuidoraCard
                key={dist.distribuidora}
                status={dist.status}
                selecionada={dist.distribuidora === distribuidoraTotalSelecionada}
                onClick={() => setDistribuidoraTotalSelecionada(dist.distribuidora)}
              >
                <CardTitle>{dist.distribuidora}</CardTitle>
                <AnaliseValorTotal>
                  R$ {dist.valorTotal.toFixed(2)}
                </AnaliseValorTotal>
                <AnaliseDistribuidoraStatus status={dist.status}>
                  {dist.status === 'maisBarato' && 'Mais barato'}
                  {dist.status === 'maisCaro' && 'Mais caro'}
                  {dist.status === 'medio' && 'Valor médio'}
                </AnaliseDistribuidoraStatus>
                {distribuidoraTotalSelecionada === dist.distribuidora && (
                  <AnaliseDistribuidoraSelecionadaAviso>
                    Distribuidora selecionada para o valor total
                  </AnaliseDistribuidoraSelecionadaAviso>
                )}
              </AnaliseDistribuidoraCard>
            ))}
          </AnaliseColumnContainer>
  </AnaliseFlexContainer>
        <AnaliseConfirmarButtonContainer>
          <ButtonStyled
            label="Confirmar Escolha"
            onClick={() => {
              if (tipoAnaliseSelecionada === "materiais") {
                
                const materiaisSelecionados = analiseMateriais.map(mat => ({
                  nome: mat.nome,
                  distribuidora: mat.distribuidoraSelecionada,
                  valor: mat.diferencas.find(d => d.distribuidora === mat.distribuidoraSelecionada)?.preco || 0
                }));
                const valorTotal = materiaisSelecionados.reduce((acc, m) => acc + m.valor, 0);
                setResumoAnalise({
                  tipo: "materiais",
                  materiais: materiaisSelecionados,
                  valorTotal,
                });
              } else if (tipoAnaliseSelecionada === "distribuidoras") {
                
                const dist = analiseDistribuidoras.find(d => d.distribuidora === distribuidoraTotalSelecionada);
                const materiaisDaDistribuidora = analiseMateriais.map(mat => {
                  const preco = mat.diferencas.find(d => d.distribuidora === distribuidoraTotalSelecionada)?.preco || 0;
                  return {
                    nome: mat.nome,
                    valor: preco
                  };
                });
                setResumoAnalise({
                  tipo: "distribuidoras",
                  distribuidora: distribuidoraTotalSelecionada,
                  valorTotal: dist?.valorTotal || 0,
                  materiais: materiaisDaDistribuidora,
                });
              }
            }}
            disabled={!tipoAnaliseSelecionada}
          />
        </AnaliseConfirmarButtonContainer>
        {resumoAnalise && (
          <ResumoAnaliseContainer>
            {resumoAnalise.tipo === "materiais" ? (
              <>
                <ResumoAnaliseTitle>Resumo da Escolha (Materiais por Distribuidora)</ResumoAnaliseTitle>
                <ResumoAnaliseSection>
                  <strong>Distribuidoras Selecionadas:</strong> {Array.from(new Set(resumoAnalise.materiais.map(m => m.distribuidora))).join(", ")}
                </ResumoAnaliseSection>
                <ResumoAnaliseSection>
                  <strong>Materiais:</strong>
                  <ResumoAnaliseList>
                    {resumoAnalise.materiais.map((m, idx) => (
                      <li key={idx}>{m.nome} - {m.distribuidora}: R$ {m.valor.toFixed(2)}</li>
                    ))}
                  </ResumoAnaliseList>
                </ResumoAnaliseSection>
                <ResumoAnaliseValorTotal>
                  <strong>Valor Total:</strong> R$ {resumoAnalise.valorTotal.toFixed(2)}
                </ResumoAnaliseValorTotal>
              </>
            ) : (
              <>
                <ResumoAnaliseTitle>Resumo da Escolha (Valor Total por Distribuidora)</ResumoAnaliseTitle>
                <ResumoAnaliseSection>
                  <strong>Distribuidora Selecionada:</strong> {resumoAnalise.distribuidora}
                  {(() => {
                    const distStatus = analiseDistribuidoras.find(d => d.distribuidora === resumoAnalise.distribuidora)?.status;
                    if (distStatus === 'maisBarato') return (
                      <span style={{ color: '#28a745', fontWeight: 600, marginLeft: 12 }}>(Mais barato)</span>
                    );
                    if (distStatus === 'medio') return (
                      <span style={{ color: '#ff9800', fontWeight: 600, marginLeft: 12 }}>(Valor médio)</span>
                    );
                    if (distStatus === 'maisCaro') return (
                      <span style={{ color: '#dc3545', fontWeight: 600, marginLeft: 12 }}>(Mais caro)</span>
                    );
                    return null;
                  })()}
                </ResumoAnaliseSection>
                <ResumoAnaliseSection>
                  <strong>Materiais:</strong>
                  <ResumoAnaliseList>
                    {resumoAnalise.materiais.map((m, idx) => (
                      <li key={idx}>{m.nome}: R$ {m.valor.toFixed(2)}</li>
                    ))}
                  </ResumoAnaliseList>
                </ResumoAnaliseSection>
                <ResumoAnaliseValorTotal>
                  <strong>Valor Total:</strong> R$ {resumoAnalise.valorTotal.toFixed(2)}
                </ResumoAnaliseValorTotal>
              </>
            )}
          </ResumoAnaliseContainer>
        )}
      </>
    )
  );

  return (
    <ContainerPage>
      <GlobalStyle />
      <Toast ref={toast} />
      <Title>Criar Nova Cotação</Title>
      {renderFormulario()}
      {renderDistribuidores()}
      {renderMateriais()}
      {renderAnalise()}
      <ButtonContainer>
        <ButtonStyled
          label="Cancelar"
          icon="pi pi-times"
          className="p-button-text"
          onClick={() => navigate("/cotacoes")}
        />
        <ButtonStyled
          label="Salvar"
          icon="pi pi-check"
          className="p-button-text"
          onClick={handleSave}
          loading={isLoading}
        />
        <ButtonStyled
          label="Analisar Valores"
          icon="pi pi-chart-bar"
          className="p-button-text"
          onClick={analisarValores}
          disabled={isLoading}
        />
      </ButtonContainer>
    </ContainerPage>
  );
};

export default CriarCotacao;
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tooltip } from "primereact/tooltip";
import { classNames } from "primereact/utils";
import debounce from "lodash/debounce";
import { CotacaoService } from "../../services/CotacaoService";
import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import { DistribuidoraService } from "../../services/DistribuidoraService";
import { MaterialPrecoService } from "../../services/MaterialPrecoService";
import {
  ContainerPage,
  Title,
  FormSection,
  SubTitle,
  FormRow,
  FormRowSplit,
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
  DistribuidoraPickerBox,
  DistribuidoraPickerField,
  DistribuidoraAddButton,
  DistribuidorasSelecionadasLabel,
  ListaMateriaisHeader,
  ListaMateriaisTitle,
  ComposicaoCustosGrid,
  ComposicaoCustosField,
  ComposicaoResumoCard,
  ComposicaoResumoLinha,
  ComposicaoResumoTotal,
  PrecoStatusLegenda,
  LegendaItem,
  TableInputStyled,
  Label,
  ErrorMessage,
  FormTitle,
  MateriaisSectionHeader,
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
};

const sincronizarPrecosComDistribuidores = (precos = [], distribuidores = []) =>
  distribuidores.map((nome) => {
    const existente = precos.find(
      (p) => p.fornecedor?.trim().toLowerCase() === nome.trim().toLowerCase()
    );
    return existente ?? { fornecedor: nome, preco: "", precoVigente: null };
  });

const aplicarSyncMateriais = (materiais, distribuidores) =>
  (materiais || []).map((mat) => ({
    ...mat,
    precos: sincronizarPrecosComDistribuidores(mat.precos, distribuidores),
  }));

const CriarCotacao = () => {
  const [cotacao, setCotacao] = useState(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [material, setMaterial] = useState({ materialId: null, quantidade: "" });
  const [materialOpcoes, setMaterialOpcoes] = useState([]);
  const [carregandoMateriais, setCarregandoMateriais] = useState(false);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const materialCacheRef = useRef(new Map());
  const [distribuidores, setDistribuidores] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [availableDistribuidores, setAvailableDistribuidores] = useState([]);
  const [isAddingDistribuidor, setIsAddingDistribuidor] = useState(false);
  const [distribuidoraDropdown, setDistribuidoraDropdown] = useState(null);
  const [preenchendoPrecos, setPreenchendoPrecos] = useState(false);
  const [showAnalise, setShowAnalise] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analiseMateriais, setAnaliseMateriais] = useState([]); 
  const [analiseDistribuidoras, setAnaliseDistribuidoras] = useState([]);
  const [distribuidoraTotalSelecionada, setDistribuidoraTotalSelecionada] = useState("");
  const [tipoAnaliseSelecionada, setTipoAnaliseSelecionada] = useState("");
  const [resumoAnalise, setResumoAnalise] = useState(null);
  const [origemSimulacao, setOrigemSimulacao] = useState(null);
  const [composicaoCustos, setComposicaoCustos] = useState({
    percentualInsumos: 15,
    valorFrete: 0,
    percentualLucro: 10,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef(null);
  const cotacaoService = useRef(new CotacaoService()).current;
  const materialService = useRef(new MaterialDisponivelService()).current;
  const distribuidoraService = useRef(new DistribuidoraService()).current;
  const precoService = useRef(new MaterialPrecoService()).current;

  useEffect(() => {
    const fetchDistribuidores = async () => {
      const result = await distribuidoraService.getPaginado(0, 200, "");
      if (result.success) {
        setAvailableDistribuidores(result.data.content);
      } else {
        toast.current.show(result.message);
      }
    };
    fetchDistribuidores();
  }, []);

  useEffect(() => {
    const dados = location.state;
    if (!dados || dados.origem !== "simulacao") return;

    setOrigemSimulacao({
      simulacaoId: dados.simulacaoId,
      nomeTrabalho: dados.nomeTrabalho,
    });

    const distNomes = [];
    const distVistos = new Set();
    for (const m of dados.materiais || []) {
      const nome = m.distribuidoraNome?.trim();
      if (nome && !distVistos.has(nome.toLowerCase())) {
        distVistos.add(nome.toLowerCase());
        distNomes.push(nome);
      }
    }

    setDistribuidores(distNomes);

    setComposicaoCustos({
      percentualInsumos: Number(dados.percentualInsumos ?? 15),
      valorFrete: Number(dados.valorFrete ?? 0),
      percentualLucro: Number(dados.percentualLucro ?? 10),
    });

    setCotacao((prev) => ({
      ...prev,
      nome: dados.nomeTrabalho || prev.nome,
      quantidadeProduto: dados.quantidade ? String(dados.quantidade) : prev.quantidadeProduto,
      materiais: aplicarSyncMateriais(
        (dados.materiais || []).map((m) => {
          const precosIniciais = [];
          if (m.distribuidoraNome && m.precoUnitario != null) {
            const precoNum = Number(m.precoUnitario);
            precosIniciais.push({
              fornecedor: m.distribuidoraNome,
              preco: precoNum.toFixed(2),
              precoVigente: precoNum,
            });
          }
          return {
            materialDisponivel: {
              id: m.materialDisponivelId,
              descricao: m.descricao,
              tamanho: m.tamanho,
            },
            quantidade: Number(m.quantidadeBarras || 0),
            precos: precosIniciais,
          };
        }),
        distNomes
      ),
    }));

    toast.current?.show({
      severity: "info",
      summary: "Simulação importada",
      detail: distNomes.length
        ? `Materiais, quantidades e preços da(s) distribuidora(s) ${distNomes.join(", ")} foram carregados.`
        : "Materiais e quantidades vieram da simulação. Adicione distribuidoras e preencha os preços.",
      life: 4500,
    });

    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

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

  const validateForm = () => {
    const errors = {};
    const cleanedPhone = cotacao.telefone.replace(/\D/g, "");

    if (!cotacao.nome.trim()) errors.nome = "O nome da cotação é obrigatório";
    if (!cotacao.clienteNome.trim()) errors.clienteNome = "O nome do cliente é obrigatório";
    if (!cotacao.telefone || cleanedPhone.length !== 11)
      errors.telefone = "O telefone é obrigatório e deve ter 11 dígitos (ex: (XX) XXXXX-XXXX)";
    if (!cotacao.endereco.trim()) errors.endereco = "O endereço é obrigatório";
    if (distribuidores.length === 0) errors.distribuidores = "Pelo menos um distribuidor é obrigatório";
    if (cotacao.materiais.length === 0) errors.materiais = "Adicione pelo menos um material";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const possuiPrecoPreenchido = () =>
    cotacao.materiais.some((mat) =>
      mat.precos.some((p) => p.preco !== "" && p.preco != null && !isNaN(Number(p.preco)))
    );

  const sugerirPrecosParaMaterial = async (materialId, distNomes) => {
    if (!materialId || !distNomes?.length) return [];
    const result = await precoService.vigentesPorMaterial(materialId);
    if (!result.success) return [];
    const lookup = new Map();
    for (const p of result.data) {
      lookup.set(p.distribuidoraNome?.trim().toLowerCase(), p.precoUnitario);
    }
    return distNomes
      .map((nome) => {
        const preco = lookup.get(nome?.trim().toLowerCase());
        if (preco == null) return null;
        return {
          fornecedor: nome,
          preco: Number(preco).toFixed(2),
          precoVigente: Number(preco),
        };
      })
      .filter(Boolean);
  };

  const formatMaterialLabel = (m) =>
    m.tamanho != null && m.tamanho !== ""
      ? `${m.descricao} (${m.tamanho}m)`
      : m.descricao;

  const carregarMaterialOpcoes = useCallback(
    async (query = "") => {
      setCarregandoMateriais(true);
      try {
        const result = await materialService.getOpcoes(query);
        if (!result.success) {
          toast.current?.show(result.message);
          setMaterialOpcoes([]);
          return;
        }
        const idsAdicionados = new Set(
          cotacao.materiais.map((m) => m.materialDisponivel.id)
        );
        const opcoes = (result.data || [])
          .filter((m) => !idsAdicionados.has(m.id))
          .map((m) => {
            materialCacheRef.current.set(m.id, m);
            return { label: formatMaterialLabel(m), value: m.id };
          });
        setMaterialOpcoes(opcoes);
      } finally {
        setCarregandoMateriais(false);
      }
    },
    [cotacao.materiais, materialService]
  );

  const debouncedCarregarMaterialOpcoes = useMemo(
    () => debounce((query) => carregarMaterialOpcoes(query), 300),
    [carregarMaterialOpcoes]
  );

  useEffect(
    () => () => debouncedCarregarMaterialOpcoes.cancel(),
    [debouncedCarregarMaterialOpcoes]
  );

  const adicionarDistribuidorNaLista = async (nome) => {
    const normalizedNome = nome.trim();
    const nextDists = [...distribuidores, normalizedNome];

    let preenchidos = 0;
    let novosMateriais = aplicarSyncMateriais(cotacao.materiais, nextDists);
    novosMateriais = await Promise.all(
      novosMateriais.map(async (mat) => {
        const sugeridos = await sugerirPrecosParaMaterial(mat.materialDisponivel.id, [
          normalizedNome,
        ]);
        if (!sugeridos.length) return mat;
        const sug = sugeridos[0];
        const novosPrecos = mat.precos.map((p) => {
          if (p.fornecedor?.toLowerCase() !== normalizedNome.toLowerCase()) return p;
          if (p.preco !== "" && p.preco != null) return p;
          preenchidos++;
          return { ...p, preco: sug.preco, precoVigente: sug.precoVigente };
        });
        return { ...mat, precos: novosPrecos };
      })
    );

    setDistribuidores(nextDists);
    setCotacao((prev) => ({ ...prev, materiais: novosMateriais }));

    if (preenchidos > 0) {
      toast.current?.show({
        severity: "info",
        summary: "Preços sugeridos",
        detail: `${preenchidos} preço(s) preenchido(s) com base no vigente de ${normalizedNome}.`,
        life: 3000,
      });
    }
  };

  const adicionarDistribuidoraSelecionada = async () => {
    if (!distribuidoraDropdown) return;
    if (distribuidores.length >= 6) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Você pode adicionar no máximo 6 distribuidoras.",
        life: 3000,
      });
      return;
    }
    const dist = availableDistribuidores.find((d) => d.id === distribuidoraDropdown);
    if (!dist) return;

    setIsAddingDistribuidor(true);
    await adicionarDistribuidorNaLista(dist.nome);
    setDistribuidoraDropdown(null);
    setIsAddingDistribuidor(false);
  };

  const preencherTodosPrecosVigentes = async () => {
    if (!distribuidores.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Adicione pelo menos uma distribuidora.",
        life: 3000,
      });
      return;
    }
    if (!cotacao.materiais.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Adicione materiais antes de preencher preços.",
        life: 3000,
      });
      return;
    }

    setPreenchendoPrecos(true);
    let total = 0;
    const synced = aplicarSyncMateriais(cotacao.materiais, distribuidores);
    const novosMateriais = await Promise.all(
      synced.map(async (mat) => {
        const sugeridos = await sugerirPrecosParaMaterial(
          mat.materialDisponivel.id,
          distribuidores
        );
        const mapa = new Map(sugeridos.map((s) => [s.fornecedor.toLowerCase(), s]));
        const novosPrecos = mat.precos.map((p) => {
          if (p.preco !== "" && p.preco != null) return p;
          const sug = mapa.get(p.fornecedor?.toLowerCase());
          if (!sug) return p;
          total++;
          return { ...p, preco: sug.preco, precoVigente: sug.precoVigente };
        });
        return { ...mat, precos: novosPrecos };
      })
    );
    setCotacao((prev) => ({ ...prev, materiais: novosMateriais }));
    setPreenchendoPrecos(false);

    toast.current?.show({
      severity: total > 0 ? "info" : "warn",
      summary: total > 0 ? "Preços sugeridos" : "Nenhum preço vigente",
      detail:
        total > 0
          ? `${total} campo(s) preenchido(s) com preço vigente. Campos já digitados foram mantidos.`
          : "Não há preços vigentes cadastrados para os pares material/distribuidora.",
      life: 4000,
    });
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
    const nextDists = distribuidores.filter((d) => d !== distribuidor);
    setDistribuidores(nextDists);
    setCotacao((prev) => ({
      ...prev,
      materiais: aplicarSyncMateriais(prev.materiais, nextDists),
    }));
  };

  const onInputChange = (e, name) => {
    let value = e.target.value;
    if (name === "nome") {
      value = capitalizeFirstLetter(value);
    } else if (name === "quantidadeProduto") {
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
    let value = name === "materialId" ? e.value : e.target.value;
    if (name === "quantidade") {
      value = formatNumber(value);
    }
    setMaterial((prev) => ({ ...prev, [name]: value }));
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
    if (!material.materialId) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione um material",
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
    (async () => {
      setIsAddingMaterial(true);
      try {
        const selected = materialCacheRef.current.get(material.materialId);
        if (!selected) {
          toast.current.show({
            severity: "warn",
            summary: "Atenção",
            detail: "Material não encontrado. Selecione novamente.",
            life: 3000,
          });
          return;
        }
        const sugeridosVigentes = await sugerirPrecosParaMaterial(
          selected.id,
          distribuidores
        );
        const precosFinais = sincronizarPrecosComDistribuidores([], distribuidores);
        let sugeridos = 0;
        for (const s of sugeridosVigentes) {
          const jaExiste = precosFinais.find(
            (p) => p.fornecedor?.toLowerCase() === s.fornecedor.toLowerCase()
          );
          if (jaExiste) {
            jaExiste.preco = s.preco;
            jaExiste.precoVigente = s.precoVigente;
            sugeridos++;
          } else {
            precosFinais.push(s);
            sugeridos++;
          }
        }
        setCotacao((prev) => ({
          ...prev,
          materiais: [
            ...prev.materiais,
            {
              materialDisponivel: selected,
              quantidade: Number(material.quantidade),
              precos: precosFinais,
            },
          ],
        }));
        if (sugeridos > 0) {
          toast.current?.show({
            severity: "info",
            summary: "Preços sugeridos",
            detail: `${sugeridos} preço(s) preenchido(s) automaticamente a partir do vigente.`,
            life: 3000,
          });
        }
        setMaterial({ materialId: null, quantidade: "" });
      } finally {
        setIsAddingMaterial(false);
      }
    })();
  };

  const removeMaterial = (index) => {
    setCotacao((prev) => ({
      ...prev,
      materiais: prev.materiais.filter((_, i) => i !== index),
    }));
  };

  const atualizarQuantidadeNaTabela = (rowIndex, valor) => {
    const qtd = formatNumber(valor);
    setCotacao((prev) => ({
      ...prev,
      materiais: prev.materiais.map((m, i) =>
        i === rowIndex ? { ...m, quantidade: qtd === "" ? "" : Number(qtd) } : m
      ),
    }));
  };

  const atualizarPrecoNaTabela = (rowIndex, distribuidor, valor) => {
    const preco = valor.replace(",", ".");
    setCotacao((prev) => ({
      ...prev,
      materiais: prev.materiais.map((m, i) => {
        if (i !== rowIndex) return m;
        const precosBase = sincronizarPrecosComDistribuidores(m.precos, distribuidores);
        return {
          ...m,
          precos: precosBase.map((p) =>
            p.fornecedor === distribuidor ? { ...p, preco } : p
          ),
        };
      }),
    }));
  };

  const obterStatusPreco = (preco, precoVigente) => {
    if (preco === "" || preco == null || isNaN(Number(preco))) {
      return { tipo: "sem-preco", bg: "#ffffff", label: "Sem preço" };
    }
    const num = Number(preco);
    if (precoVigente == null) return { tipo: "novo", bg: "#ffffff", label: "Novo" };
    if (Math.abs(num - precoVigente) < 0.001) {
      return { tipo: "vigente", bg: "#e8f5e9", label: "Vigente" };
    }
    return { tipo: "alterado", bg: "#fff3e0", label: "Alterado" };
  };

  const calcularSubtotalMaterial = (mat) => {
    const qtd = Number(mat.quantidade) || 0;
    const precosValidos = sincronizarPrecosComDistribuidores(mat.precos, distribuidores)
      .map((p) => Number(p.preco))
      .filter((v) => !isNaN(v) && v >= 0);
    if (!precosValidos.length || qtd <= 0) return null;
    const menorUnit = Math.min(...precosValidos);
    return menorUnit * qtd;
  };

  const calcularComposicaoCustos = (totalMateriaisOverride) => {
    const totalMateriais =
      totalMateriaisOverride ??
      cotacao.materiais.reduce((acc, m) => acc + (calcularSubtotalMaterial(m) || 0), 0);
    const pct = Number(composicaoCustos.percentualInsumos) || 0;
    const frete = Number(composicaoCustos.valorFrete) || 0;
    const pctLucro = Number(composicaoCustos.percentualLucro) || 0;
    const valorInsumos =
      totalMateriais > 0 && pct > 0
        ? Number(((totalMateriais * pct) / 100).toFixed(2))
        : 0;
    const totalCusto = Number((totalMateriais + valorInsumos + frete).toFixed(2));
    const valorLucro =
      totalCusto > 0 && pctLucro > 0
        ? Number(((totalCusto * pctLucro) / 100).toFixed(2))
        : 0;
    const totalGeral = Number((totalCusto + valorLucro).toFixed(2));
    return {
      totalMateriais: Number(totalMateriais.toFixed(2)),
      percentualInsumos: pct,
      valorInsumos,
      valorFrete: frete,
      totalCusto,
      percentualLucro: pctLucro,
      valorLucro,
      totalGeral,
    };
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
    if (!possuiPrecoPreenchido()) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Informe ao menos um preço de material antes de salvar.",
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

      const composicao = calcularComposicaoCustos();

      const analiseCompleta = {
        tipoEscolhido: tipoAnaliseSelecionada || null,
        resumoEscolha: resumoAuto || null,
        analiseMateriais: analiseMateriais || [],
        analiseDistribuidoras: analiseDistribuidoras || [],
        composicaoCustos: composicao,
        escolhas: {
          materiais: escolhasMateriais,
          valorTotal: infoTotalSelecionado,
        },
      };

      const cotacaoToSave = {
        nome: cotacao.nome,
        clienteNome: cotacao.clienteNome,
        telefone: cotacao.telefone.replace(/\D/g, ""),
        endereco: cotacao.endereco.trim(),
        quantidadeProduto: Number(cotacao.quantidadeProduto),
        percentualInsumos: composicao.percentualInsumos,
        valorFrete: composicao.valorFrete,
        valorInsumos: composicao.valorInsumos,
        totalCustoMateriais: composicao.totalMateriais,
        percentualLucro: composicao.percentualLucro,
        valorLucro: composicao.valorLucro,
        valorTotalOrcamento: composicao.totalGeral,
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

      const diffs = coletarDiffsDePreco();
      if (diffs.length > 0) {
        confirmDialog({
          message: `${diffs.length} preço(s) digitado(s) diferem do vigente (ou são novos). Deseja atualizar os preços vigentes? Origem ficará marcada como COTACAO.`,
          header: "Atualizar preços vigentes?",
          icon: "pi pi-question-circle",
          acceptLabel: "Sim, atualizar",
          rejectLabel: "Não",
          accept: async () => {
            await atualizarPrecosVigentes(diffs);
            navigate("/cotacoes");
          },
          reject: () => navigate("/cotacoes"),
        });
        return;
      }

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


  /**
   * Retorna { materialId, distribuidoraId, distribuidoraNome, preco }
   * para cada par (material, distribuidora) cujo preço digitado pelo
   * usuário difere do vigente, ou é novo (não tinha vigente cadastrado).
   */
  const coletarDiffsDePreco = () => {
    const distLookup = new Map(
      availableDistribuidores.map((d) => [d.nome?.trim().toLowerCase(), d.id])
    );
    const diffs = [];
    for (const mat of cotacao.materiais) {
      const precosSync = sincronizarPrecosComDistribuidores(mat.precos, distribuidores);
      for (const p of precosSync) {
        if (!p.fornecedor || p.preco == null || p.preco === "") continue;
        const precoNum = Number(p.preco);
        if (isNaN(precoNum) || precoNum < 0) continue;
        const vigente = p.precoVigente;
        if (vigente != null && Math.abs(precoNum - vigente) < 0.001) continue;
        const distribuidoraId = distLookup.get(p.fornecedor?.trim().toLowerCase());
        if (!distribuidoraId) continue;
        diffs.push({
          materialDisponivelId: mat.materialDisponivel.id,
          distribuidoraId,
          distribuidoraNome: p.fornecedor,
          precoUnitario: precoNum,
          isNovo: vigente == null,
        });
      }
    }
    return diffs;
  };

  const atualizarPrecosVigentes = async (diffs) => {
    let ok = 0;
    let erro = 0;
    for (const d of diffs) {
      const result = await precoService.registrar({
        materialDisponivelId: d.materialDisponivelId,
        distribuidoraId: d.distribuidoraId,
        precoUnitario: d.precoUnitario,
        observacao: `Atualizado via cotação "${cotacao.nome}"`,
        origem: "COTACAO",
      });
      if (result.success) ok++; else erro++;
    }
    toast.current?.show({
      severity: erro === 0 ? "success" : "warn",
      summary: "Preços vigentes",
      detail: `${ok} atualizado(s)` + (erro ? `, ${erro} falha(s)` : "."),
      life: 4000,
    });
  };

  const analisarValores = () => {
    if (!cotacao.materiais.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Adicione materiais antes de analisar.",
        life: 3000,
      });
      return;
    }
    if (!possuiPrecoPreenchido()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha ao menos um preço antes de analisar.",
        life: 3000,
      });
      return;
    }

    const analise = cotacao.materiais.map((mat) => {
      const quantidade = Number(mat.quantidade) || 1;
      const precosSync = sincronizarPrecosComDistribuidores(mat.precos, distribuidores);
      const precos = precosSync
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
        const precosSync = sincronizarPrecosComDistribuidores(mat.precos, distribuidores);
        const preco = precosSync.find((p) => p.fornecedor === dist && p.preco && !isNaN(p.preco));
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
      <FormRowSplit>
        <FormGroup>
          <Label htmlFor="endereco">Endereço</Label>
          <InputTextStyled
            id="endereco"
            value={cotacao.endereco}
            onChange={(e) => onInputChange(e, "endereco")}
            className={classNames({ "p-invalid": submitted && formErrors.endereco })}
          />
          {formErrors.endereco && <ErrorMessage>{formErrors.endereco}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="quantidadeProduto">Quantidade do Produto</Label>
          <InputTextStyled
            id="quantidadeProduto"
            value={cotacao.quantidadeProduto}
            onChange={(e) => onInputChange(e, "quantidadeProduto")}
            className={classNames({ "p-invalid": submitted && formErrors.quantidadeProduto })}
          />
          {formErrors.quantidadeProduto && <ErrorMessage>{formErrors.quantidadeProduto}</ErrorMessage>}
        </FormGroup>
      </FormRowSplit>

    </FormSection>
  );

  const distribuidorasDropdownOptions = availableDistribuidores
    .filter((d) => !distribuidores.some((n) => n.toLowerCase() === d.nome?.toLowerCase()))
    .map((d) => ({ label: d.nome, value: d.id }));

  const renderDistribuidores = () => (
    <FormSection>
      <SubTitle>Distribuidoras</SubTitle>
      <DistribuidoraPickerBox>
        <DistribuidoraPickerField>
          <label htmlFor="distribuidoraDropdown">Adicionar distribuidora</label>
          <Dropdown
            inputId="distribuidoraDropdown"
            value={distribuidoraDropdown}
            options={distribuidorasDropdownOptions}
            onChange={(e) => setDistribuidoraDropdown(e.value)}
            placeholder="Escolha uma distribuidora..."
            filter
            filterPlaceholder="Buscar..."
            showClear
            emptyMessage="Nenhuma disponível ou todas já foram adicionadas"
            disabled={isAddingDistribuidor || distribuidores.length >= 6}
          />
        </DistribuidoraPickerField>
        <DistribuidoraAddButton
          label="Adicionar"
          icon="pi pi-plus"
          disabled={!distribuidoraDropdown || isAddingDistribuidor || distribuidores.length >= 6}
          loading={isAddingDistribuidor}
          onClick={adicionarDistribuidoraSelecionada}
        />
      </DistribuidoraPickerBox>
      {formErrors.distribuidores && (
        <ErrorMessage style={{ marginBottom: 12 }}>{formErrors.distribuidores}</ErrorMessage>
      )}
      {distribuidores.length > 0 && (
        <>
          <DistribuidorasSelecionadasLabel>
            Selecionadas ({distribuidores.length}/6)
          </DistribuidorasSelecionadasLabel>
          <DistribuidoresContainer>
            {distribuidores.map((dist) => (
              <DistribuidorItem key={dist}>
                <span>{dist}</span>
                <RemoveDistribuidorButton
                  icon="pi pi-times"
                  onClick={() => removeDistribuidor(dist)}
                />
              </DistribuidorItem>
            ))}
          </DistribuidoresContainer>
        </>
      )}
    </FormSection>
  );

  const renderMateriais = () => (
    <FormSection>
      <Tooltip
        target=".btn-preencher-vigentes"
        content="Preenche os campos de preço vazios com o valor vigente de cada material por distribuidora. Valores já digitados são mantidos."
        position="bottom"
      />
      <MateriaisSectionHeader>
        <SubTitle>Materiais e Preços</SubTitle>
        {distribuidores.length > 0 && cotacao.materiais.length > 0 && (
          <ButtonStyled
            label="Preencher preços vigentes"
            icon="pi pi-sync"
            className="p-button-secondary btn-preencher-vigentes"
            loading={preenchendoPrecos}
            onClick={preencherTodosPrecosVigentes}
          />
        )}
      </MateriaisSectionHeader>
      {origemSimulacao && cotacao.materiais.length > 0 && (
        <div
          style={{
            background: "#fff8e6",
            border: "1px solid #ffc107",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          Materiais importados da simulação com a distribuidora de menor preço por material.
          {distribuidores.length === 0 && (
            <>
              {" "}Cadastre preços vigentes ou use <strong>Preencher preços vigentes</strong>.
            </>
          )}
        </div>
      )}
      {distribuidores.length > 0 && (
        <>
          <DistribuidoraPickerBox>
            <DistribuidoraPickerField>
              <label htmlFor="materialDropdown">Material</label>
              <Dropdown
                inputId="materialDropdown"
                value={material.materialId}
                options={materialOpcoes}
                onChange={(e) => onMaterialChange(e, "materialId")}
                onShow={() => carregarMaterialOpcoes("")}
                onFilter={(e) => debouncedCarregarMaterialOpcoes(e.filter || "")}
                placeholder="Escolha um material..."
                filter
                filterPlaceholder="Buscar..."
                showClear
                resetFilterOnHide
                emptyMessage="Nenhum material disponível"
                emptyFilterMessage="Nenhum resultado — digite para buscar"
                loading={carregandoMateriais}
                disabled={isAddingMaterial}
                className={classNames({ "p-invalid": submitted && formErrors.materiais })}
              />
            </DistribuidoraPickerField>
            <DistribuidoraPickerField className="picker-field-compact">
              <label htmlFor="quantidadeMaterial">Quantidade</label>
              <InputText
                id="quantidadeMaterial"
                value={material.quantidade}
                onChange={(e) => onMaterialChange(e, "quantidade")}
                className={classNames({
                  "p-invalid": !material.quantidade && material.materialId,
                })}
              />
            </DistribuidoraPickerField>
            <DistribuidoraAddButton
              label="Adicionar"
              icon="pi pi-plus"
              disabled={
                !material.materialId ||
                !material.quantidade.trim() ||
                isAddingMaterial
              }
              loading={isAddingMaterial}
              onClick={addMaterial}
            />
          </DistribuidoraPickerBox>
          {!material.quantidade && material.materialId && (
            <small className="p-error" style={{ display: "block", marginTop: -8, marginBottom: 12 }}>
              Quantidade é obrigatória
            </small>
          )}
        </>
      )}
      {distribuidores.length === 0 && (
        <div style={{ color: "#888", marginBottom: 12, fontSize: 14 }}>
          Adicione distribuidoras antes de incluir materiais e preços.
        </div>
      )}
      <ListaMateriaisHeader>
        <ListaMateriaisTitle>Lista de materiais</ListaMateriaisTitle>
        {distribuidores.length > 0 && (
          <PrecoStatusLegenda>
            <LegendaItem $cor="#e8f5e9">Vigente</LegendaItem>
            <LegendaItem $cor="#fff3e0">Alterado</LegendaItem>
          </PrecoStatusLegenda>
        )}
      </ListaMateriaisHeader>
      {submitted && formErrors.materiais && (
        <ErrorMessage>{formErrors.materiais}</ErrorMessage>
      )}
      <DataTableStyled
        value={cotacao.materiais}
        className="mb-3"
        emptyMessage="Nenhum material adicionado"
      >
        <Column field="materialDisponivel.descricao" header="Material" />
        <Column
          header="Qtd"
          style={{ width: 100 }}
          body={(rowData, { rowIndex }) => (
            <TableInputStyled
              value={rowData.quantidade ?? ""}
              onChange={(e) => atualizarQuantidadeNaTabela(rowIndex, e.target.value)}
            />
          )}
        />
        {distribuidores.map((distribuidor) => (
          <Column
            key={distribuidor}
            header={distribuidor}
            style={{ minWidth: 130 }}
            body={(rowData, { rowIndex }) => {
              const precosSync = sincronizarPrecosComDistribuidores(
                rowData.precos,
                distribuidores
              );
              const p = precosSync.find((x) => x.fornecedor === distribuidor);
              const status = obterStatusPreco(p?.preco, p?.precoVigente);
              return (
                <TableInputStyled
                  value={p?.preco ?? ""}
                  onChange={(e) =>
                    atualizarPrecoNaTabela(rowIndex, distribuidor, e.target.value)
                  }
                  placeholder="0,00"
                  style={{ backgroundColor: status.bg }}
                />
              );
            }}
          />
        ))}
        <Column
          header="Subtotal (menor)"
          style={{ width: 140 }}
          body={(row) => {
            const sub = calcularSubtotalMaterial(row);
            return sub != null ? formatCurrency(sub) : "-";
          }}
        />
        <Column
          header="Ações"
          style={{ width: 80 }}
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

  const renderComposicaoCustos = () => {
    if (cotacao.materiais.length === 0) return null;

    const c = calcularComposicaoCustos();

    return (
      <FormSection>
        <ListaMateriaisTitle>Insumos, Frete e Lucro</ListaMateriaisTitle>
        <ComposicaoCustosGrid>
          <ComposicaoCustosField>
            <Label htmlFor="percentualInsumos">Insumos (% sobre materiais)</Label>
            <InputNumber
              id="percentualInsumos"
              value={composicaoCustos.percentualInsumos}
              onValueChange={(e) =>
                setComposicaoCustos((prev) => ({
                  ...prev,
                  percentualInsumos: e.value ?? 0,
                }))
              }
              min={0}
              max={100}
              suffix="%"
              minFractionDigits={0}
              maxFractionDigits={2}
            />
          </ComposicaoCustosField>
          <ComposicaoCustosField>
            <Label htmlFor="valorFrete">Frete (R$)</Label>
            <InputNumber
              id="valorFrete"
              value={composicaoCustos.valorFrete}
              onValueChange={(e) =>
                setComposicaoCustos((prev) => ({
                  ...prev,
                  valorFrete: e.value ?? 0,
                }))
              }
              min={0}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </ComposicaoCustosField>
          <ComposicaoCustosField>
            <Label htmlFor="percentualLucro">Lucro (% sobre total de custos)</Label>
            <InputNumber
              id="percentualLucro"
              value={composicaoCustos.percentualLucro}
              onValueChange={(e) =>
                setComposicaoCustos((prev) => ({
                  ...prev,
                  percentualLucro: e.value ?? 0,
                }))
              }
              min={0}
              max={100}
              suffix="%"
              minFractionDigits={0}
              maxFractionDigits={2}
            />
          </ComposicaoCustosField>
        </ComposicaoCustosGrid>
        <ComposicaoResumoCard>
          <ComposicaoResumoLinha>
            <span>Materiais</span>
            <strong>{formatCurrency(c.totalMateriais)}</strong>
          </ComposicaoResumoLinha>
          <ComposicaoResumoLinha>
            <span>Insumos ({c.percentualInsumos}%)</span>
            <strong>{formatCurrency(c.valorInsumos)}</strong>
          </ComposicaoResumoLinha>
          <ComposicaoResumoLinha>
            <span>Frete</span>
            <strong>{formatCurrency(c.valorFrete)}</strong>
          </ComposicaoResumoLinha>
          <ComposicaoResumoLinha>
            <span>Subtotal de custos</span>
            <strong>{formatCurrency(c.totalCusto)}</strong>
          </ComposicaoResumoLinha>
          <ComposicaoResumoLinha>
            <span>Lucro ({c.percentualLucro}%)</span>
            <strong>{formatCurrency(c.valorLucro)}</strong>
          </ComposicaoResumoLinha>
          <ComposicaoResumoTotal>
            <span>Total do orçamento</span>
            <strong>{formatCurrency(c.totalGeral)}</strong>
          </ComposicaoResumoTotal>
        </ComposicaoResumoCard>
      </FormSection>
    );
  };

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
                const valorTotalMateriais = materiaisSelecionados.reduce((acc, m) => acc + m.valor, 0);
                const composicao = calcularComposicaoCustos(valorTotalMateriais);
                setResumoAnalise({
                  tipo: "materiais",
                  materiais: materiaisSelecionados,
                  valorTotalMateriais,
                  composicaoCustos: composicao,
                  valorTotal: composicao.totalGeral,
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
                const valorTotalMateriais = dist?.valorTotal || materiaisDaDistribuidora.reduce((acc, m) => acc + m.valor, 0);
                const composicao = calcularComposicaoCustos(valorTotalMateriais);
                setResumoAnalise({
                  tipo: "distribuidoras",
                  distribuidora: distribuidoraTotalSelecionada,
                  valorTotalMateriais,
                  composicaoCustos: composicao,
                  valorTotal: composicao.totalGeral,
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
                {resumoAnalise.composicaoCustos && (
                  <ResumoAnaliseSection>
                    <strong>Composição de custos:</strong>
                    <ResumoAnaliseList>
                      <li>Materiais: R$ {resumoAnalise.composicaoCustos.totalMateriais.toFixed(2)}</li>
                      <li>Insumos ({resumoAnalise.composicaoCustos.percentualInsumos}%): R$ {resumoAnalise.composicaoCustos.valorInsumos.toFixed(2)}</li>
                      <li>Frete: R$ {resumoAnalise.composicaoCustos.valorFrete.toFixed(2)}</li>
                      <li>Subtotal de custos: R$ {resumoAnalise.composicaoCustos.totalCusto.toFixed(2)}</li>
                      <li>Lucro ({resumoAnalise.composicaoCustos.percentualLucro}%): R$ {resumoAnalise.composicaoCustos.valorLucro.toFixed(2)}</li>
                    </ResumoAnaliseList>
                  </ResumoAnaliseSection>
                )}
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
                {resumoAnalise.composicaoCustos && (
                  <ResumoAnaliseSection>
                    <strong>Composição de custos:</strong>
                    <ResumoAnaliseList>
                      <li>Materiais: R$ {resumoAnalise.composicaoCustos.totalMateriais.toFixed(2)}</li>
                      <li>Insumos ({resumoAnalise.composicaoCustos.percentualInsumos}%): R$ {resumoAnalise.composicaoCustos.valorInsumos.toFixed(2)}</li>
                      <li>Frete: R$ {resumoAnalise.composicaoCustos.valorFrete.toFixed(2)}</li>
                      <li>Subtotal de custos: R$ {resumoAnalise.composicaoCustos.totalCusto.toFixed(2)}</li>
                      <li>Lucro ({resumoAnalise.composicaoCustos.percentualLucro}%): R$ {resumoAnalise.composicaoCustos.valorLucro.toFixed(2)}</li>
                    </ResumoAnaliseList>
                  </ResumoAnaliseSection>
                )}
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
      <ConfirmDialog />
      <Title>Criar Nova Cotação</Title>
      {origemSimulacao && (
        <div
          style={{
            width: "100%",
            background: "#e7f3ff",
            border: "1px solid #1A1A2E",
            borderLeft: "4px solid #1A1A2E",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#1A1A2E",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <i className="pi pi-info-circle" style={{ fontSize: 18 }} />
          <span>
            Cotação criada a partir da <strong>Simulação #{origemSimulacao.simulacaoId}</strong>.
            Nome, quantidade e materiais foram preenchidos automaticamente.
            Adicione as distribuidoras e os preços para gerar a análise.
          </span>
        </div>
      )}
      {renderFormulario()}
      {renderDistribuidores()}
      {renderMateriais()}
      {renderComposicaoCustos()}
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
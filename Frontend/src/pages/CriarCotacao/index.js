import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { RadioButton } from "primereact/radiobutton";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Tag } from "primereact/tag";
import { Tooltip } from "primereact/tooltip";
import { classNames } from "primereact/utils";
import debounce from "lodash/debounce";
import { CotacaoService } from "../../services/CotacaoService";
import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import { DistribuidoraService } from "../../services/DistribuidoraService";
import { MaterialPrecoService } from "../../services/MaterialPrecoService";
import {
  MAO_DE_OBRA_FIXA,
  MAO_DE_OBRA_PERCENTUAL,
  OPCOES_TIPO_MAO_DE_OBRA,
  percentualDoTotal,
  rotuloMaoDeObra,
} from "../../utils/maoDeObra";
import {
  ContainerPage,
  Title,
  FormSection,
  SubTitle,
  FormRow,
  FormRowSplit,
  FormGroup,
  ButtonContainer,
  EscolhaCabecalho,
  EscolhaCabecalhoValor,
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
  ComposicaoCustosCabecalho,
  ComposicaoCustosDica,
  TipoMaoDeObraOpcoes,
  ComposicaoResumoCard,
  ComposicaoResumoLinha,
  ComposicaoResumoTotal,
  PrecoStatusLegenda,
  LegendaItem,
  TableInputStyled,
  TablePrecoInput,
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

const ESCOLHA_POR_MATERIAL = "materiais";
const ESCOLHA_DISTRIBUIDORA_UNICA = "distribuidoras";

const precoValido = (preco) => {
  if (preco === "" || preco == null) return null;
  const n = Number(preco);
  return !isNaN(n) && n > 0 ? n : null;
};

/** Meio centavo arredonda para cima, como o BigDecimal HALF_UP do backend (evita 97,175 virar 97,17). */
const arredondarDinheiro = (valor) => Math.round(Number((valor * 100).toFixed(6))) / 100;

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
  const [isLoading, setIsLoading] = useState(false);
  const [escolhasPorMaterial, setEscolhasPorMaterial] = useState({});
  const [distribuidoraTotalSelecionada, setDistribuidoraTotalSelecionada] = useState("");
  const [tipoAnaliseSelecionada, setTipoAnaliseSelecionada] = useState(ESCOLHA_POR_MATERIAL);
  const [abaEscolhaAberta, setAbaEscolhaAberta] = useState(0);
  const [origemSimulacao, setOrigemSimulacao] = useState(null);
  const [composicaoCustos, setComposicaoCustos] = useState({
    percentualInsumos: 15,
    valorFrete: 0,
    tipoMaoDeObra: MAO_DE_OBRA_PERCENTUAL,
    percentualMaoDeObra: 10,
    valorMaoDeObraFixo: 0,
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

    let cancelled = false;

    (async () => {
      setOrigemSimulacao({
        simulacaoId: dados.simulacaoId,
        nomeTrabalho: dados.nomeTrabalho,
      });

      setComposicaoCustos((prev) => ({
        ...prev,
        percentualInsumos: Number(dados.percentualInsumos ?? 15),
        valorFrete: Number(dados.valorFrete ?? 0),
      }));

      const matsInput = dados.materiais || [];
      const vigentesPorId = new Map();
      const distPorNome = new Map();

      for (const m of matsInput) {
        const mid = m.materialDisponivelId;
        if (!mid) continue;
        const result = await precoService.vigentesPorMaterial(mid);
        const vigentes = result.success ? result.data || [] : [];
        vigentesPorId.set(mid, vigentes);
        for (const p of vigentes) {
          const nome = p.distribuidoraNome?.trim();
          if (nome) distPorNome.set(nome.toLowerCase(), nome);
        }
        const snapNome = m.distribuidoraNome?.trim();
        if (snapNome) distPorNome.set(snapNome.toLowerCase(), snapNome);
      }

      if (cancelled) return;

      const distNomes = Array.from(distPorNome.values());
      setDistribuidores(distNomes);

      const materiaisMontados = matsInput.map((m) => {
        const vigentes = vigentesPorId.get(m.materialDisponivelId) || [];
        const precosIniciais = distNomes.map((nomeDist) => {
          const vig = vigentes.find(
            (v) => v.distribuidoraNome?.trim().toLowerCase() === nomeDist.toLowerCase()
          );
          if (vig != null && vig.precoUnitario != null) {
            const precoNum = Number(vig.precoUnitario);
            return {
              fornecedor: nomeDist,
              preco: precoNum.toFixed(2),
              precoVigente: precoNum,
            };
          }
          if (
            m.distribuidoraNome?.trim().toLowerCase() === nomeDist.toLowerCase() &&
            m.precoUnitario != null
          ) {
            const precoNum = Number(m.precoUnitario);
            return {
              fornecedor: nomeDist,
              preco: precoNum.toFixed(2),
              precoVigente: precoNum,
            };
          }
          return { fornecedor: nomeDist, preco: "", precoVigente: null };
        });

        return {
          materialDisponivel: {
            id: m.materialDisponivelId,
            descricao: m.descricao,
            tamanho: m.tamanho,
          },
          quantidade: Number(m.quantidadeBarras || 0),
          pecas: m.pecas || [],
          precos: precosIniciais,
        };
      });

      setCotacao((prev) => ({
        ...prev,
        nome: dados.nomeTrabalho || prev.nome,
        quantidadeProduto: dados.quantidade ? String(dados.quantidade) : prev.quantidadeProduto,
        materiais: aplicarSyncMateriais(materiaisMontados, distNomes),
      }));

      toast.current?.show({
        severity: "info",
        summary: "Simulação importada",
        detail: distNomes.length
          ? `Materiais e preços vigentes de ${distNomes.length} distribuidora(s) carregados.`
          : "Materiais e quantidades vieram da simulação. Adicione distribuidoras e preencha os preços.",
        life: 4500,
      });

      navigate(location.pathname, { replace: true, state: null });
    })();

    return () => {
      cancelled = true;
    };
  }, [location, navigate, precoService]);

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
      mat.precos.some((p) => precoValido(p.preco) != null)
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
    const preco = valor ?? "";
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

  const analiseMateriais = useMemo(
    () =>
      cotacao.materiais
        .map((mat) => {
          const quantidade = Number(mat.quantidade) || 0;
          const precos = sincronizarPrecosComDistribuidores(mat.precos, distribuidores)
            .map((p) => ({ distribuidora: p.fornecedor, unitario: precoValido(p.preco) }))
            .filter((p) => p.unitario != null)
            .map((p) => ({ distribuidora: p.distribuidora, preco: p.unitario * quantidade }));
          if (precos.length === 0) return null;
          const maisBarato = precos.reduce((min, p) => (p.preco < min.preco ? p : min), precos[0]);
          const escolhida = escolhasPorMaterial[mat.materialDisponivel.id];
          return {
            materialId: mat.materialDisponivel.id,
            nome: mat.materialDisponivel.descricao,
            quantidade,
            maisBarato,
            diferencas: precos.map((p) => ({ ...p, diferenca: p.preco - maisBarato.preco })),
            distribuidoraSelecionada: precos.some((p) => p.distribuidora === escolhida)
              ? escolhida
              : maisBarato.distribuidora,
          };
        })
        .filter(Boolean),
    [cotacao.materiais, distribuidores, escolhasPorMaterial]
  );

  const analiseDistribuidoras = useMemo(() => {
    const valores = distribuidores.map((dist) => {
      let valorTotal = 0;
      let semPreco = 0;
      cotacao.materiais.forEach((mat) => {
        const p = sincronizarPrecosComDistribuidores(mat.precos, distribuidores).find(
          (x) => x.fornecedor === dist
        );
        const unitario = precoValido(p?.preco);
        if (unitario != null) valorTotal += unitario * (Number(mat.quantidade) || 0);
        else semPreco += 1;
      });
      return { distribuidora: dist, valorTotal, semPreco };
    });
    const porValor = (a, b) => a.valorTotal - b.valorTotal;
    const completas = valores.filter((d) => d.semPreco === 0).sort(porValor);
    const incompletas = valores.filter((d) => d.semPreco > 0).sort(porValor);
    return [
      ...completas.map((d, idx, arr) => {
        let status = "medio";
        if (idx === 0) status = "maisBarato";
        else if (idx === arr.length - 1) status = "maisCaro";
        return { ...d, status };
      }),
      ...incompletas.map((d) => ({ ...d, status: "incompleto" })),
    ];
  }, [cotacao.materiais, distribuidores]);

  const distribuidorasCompletas = analiseDistribuidoras.filter((d) => d.status !== "incompleto");
  const distribuidoraUnica =
    distribuidorasCompletas.find((d) => d.distribuidora === distribuidoraTotalSelecionada) ||
    distribuidorasCompletas[0] ||
    null;
  const usaDistribuidoraUnica =
    tipoAnaliseSelecionada === ESCOLHA_DISTRIBUIDORA_UNICA && distribuidoraUnica != null;

  const distribuidoraEscolhidaDoMaterial = (mat) =>
    usaDistribuidoraUnica ? distribuidoraUnica.distribuidora : mat.distribuidoraSelecionada;

  const valorEscolhidoDoMaterial = (mat) =>
    mat.diferencas.find((d) => d.distribuidora === distribuidoraEscolhidaDoMaterial(mat))?.preco ??
    mat.maisBarato.preco;

  const totalPorMaterial = analiseMateriais.reduce(
    (acc, m) => acc + (m.diferencas.find((d) => d.distribuidora === m.distribuidoraSelecionada)?.preco || 0),
    0
  );
  const totalMateriaisEscolhidos = analiseMateriais.reduce(
    (acc, m) => acc + valorEscolhidoDoMaterial(m),
    0
  );

  const calcularComposicaoCustos = () => {
    const totalMateriais = arredondarDinheiro(totalMateriaisEscolhidos);
    const pct = Number(composicaoCustos.percentualInsumos) || 0;
    const frete = Number(composicaoCustos.valorFrete) || 0;
    const tipoMaoDeObra = composicaoCustos.tipoMaoDeObra;
    const maoDeObraFixa = tipoMaoDeObra === MAO_DE_OBRA_FIXA;
    const pctMaoDeObra = maoDeObraFixa ? null : Number(composicaoCustos.percentualMaoDeObra) || 0;
    const valorInsumos = arredondarDinheiro((totalMateriais * pct) / 100);
    const totalCusto = arredondarDinheiro(totalMateriais + valorInsumos + frete);
    const valorMaoDeObra = maoDeObraFixa
      ? arredondarDinheiro(Number(composicaoCustos.valorMaoDeObraFixo) || 0)
      : arredondarDinheiro((totalCusto * pctMaoDeObra) / 100);
    const totalGeral = arredondarDinheiro(totalCusto + valorMaoDeObra);
    return {
      totalMateriais,
      percentualInsumos: pct,
      valorInsumos,
      valorFrete: frete,
      totalCusto,
      tipoMaoDeObra,
      percentualMaoDeObra: pctMaoDeObra,
      valorMaoDeObra,
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
      
      const escolhasMateriais = analiseMateriais.map((m) => ({
        materialId: m.materialId,
        nome: m.nome,
        distribuidoraSelecionada: m.distribuidoraSelecionada,
        valorSelecionado:
          m.diferencas.find((d) => d.distribuidora === m.distribuidoraSelecionada)?.preco ?? null,
      }));

      const infoTotalSelecionado = distribuidoraUnica && {
        distribuidora: distribuidoraUnica.distribuidora,
        valorTotal: distribuidoraUnica.valorTotal,
        status: distribuidoraUnica.status,
      };

      const composicao = calcularComposicaoCustos();
      const materiaisEscolhidos = analiseMateriais.map((m) => ({
        nome: m.nome,
        distribuidora: distribuidoraEscolhidaDoMaterial(m),
        valor: valorEscolhidoDoMaterial(m),
      }));
      const resumoEscolha = usaDistribuidoraUnica
        ? {
            tipo: ESCOLHA_DISTRIBUIDORA_UNICA,
            distribuidora: distribuidoraUnica.distribuidora,
            materiais: materiaisEscolhidos,
            valorTotalMateriais: composicao.totalMateriais,
            composicaoCustos: composicao,
            valorTotal: composicao.totalGeral,
          }
        : {
            tipo: ESCOLHA_POR_MATERIAL,
            materiais: materiaisEscolhidos,
            valorTotalMateriais: composicao.totalMateriais,
            composicaoCustos: composicao,
            valorTotal: composicao.totalGeral,
          };

      const analiseCompleta = {
        tipoEscolhido: usaDistribuidoraUnica ? ESCOLHA_DISTRIBUIDORA_UNICA : ESCOLHA_POR_MATERIAL,
        resumoEscolha,
        analiseMateriais,
        analiseDistribuidoras,
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
        tipoMaoDeObra: composicao.tipoMaoDeObra,
        percentualMaoDeObra: composicao.percentualMaoDeObra,
        valorMaoDeObra: composicao.valorMaoDeObra,
        valorTotalOrcamento: composicao.totalGeral,
        materiais: cotacao.materiais.map((m) => ({
          materialDisponivelId: m.materialDisponivel.id,
          quantidade: Number(m.quantidade),
          metros: m.metros != null ? Number(m.metros) : null,
          pecas: m.pecas || [],
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
                <TablePrecoInput
                  value={precoValido(p?.preco)}
                  onValueChange={(e) => atualizarPrecoNaTabela(rowIndex, distribuidor, e.value)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  min={0}
                  placeholder="R$ 0,00"
                  inputStyle={{ backgroundColor: status.bg }}
                />
              );
            }}
          />
        ))}
        <Column
          header="Subtotal (escolhido)"
          style={{ width: 150 }}
          body={(row) => {
            const mat = analiseMateriais.find((m) => m.materialId === row.materialDisponivel.id);
            return mat ? formatCurrency(valorEscolhidoDoMaterial(mat)) : "-";
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
        <ListaMateriaisTitle>Insumos, Frete e Mão de obra</ListaMateriaisTitle>
        <ComposicaoCustosGrid>
          <ComposicaoCustosField>
            <ComposicaoCustosCabecalho>
              <Label htmlFor="percentualInsumos">Insumos (% sobre materiais)</Label>
            </ComposicaoCustosCabecalho>
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
            <ComposicaoCustosCabecalho>
              <Label htmlFor="valorFrete">Frete (R$)</Label>
            </ComposicaoCustosCabecalho>
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
            <ComposicaoCustosCabecalho>
              <Label htmlFor="valorMaoDeObra">Mão de obra</Label>
              <TipoMaoDeObraOpcoes>
                {OPCOES_TIPO_MAO_DE_OBRA.map((opcao) => (
                  <label key={opcao.value}>
                    <RadioButton
                      name="tipoMaoDeObra"
                      value={opcao.value}
                      checked={composicaoCustos.tipoMaoDeObra === opcao.value}
                      onChange={(e) =>
                        setComposicaoCustos((prev) => ({ ...prev, tipoMaoDeObra: e.value }))
                      }
                    />
                    {opcao.label}
                  </label>
                ))}
              </TipoMaoDeObraOpcoes>
            </ComposicaoCustosCabecalho>
            {composicaoCustos.tipoMaoDeObra === MAO_DE_OBRA_FIXA ? (
              <InputNumber
                key="maoDeObraFixa"
                inputId="valorMaoDeObra"
                value={composicaoCustos.valorMaoDeObraFixo}
                onValueChange={(e) =>
                  setComposicaoCustos((prev) => ({ ...prev, valorMaoDeObraFixo: e.value ?? 0 }))
                }
                min={0}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
              />
            ) : (
              <InputNumber
                key="maoDeObraPercentual"
                inputId="valorMaoDeObra"
                value={composicaoCustos.percentualMaoDeObra}
                onValueChange={(e) =>
                  setComposicaoCustos((prev) => ({ ...prev, percentualMaoDeObra: e.value ?? 0 }))
                }
                min={0}
                suffix="%"
                minFractionDigits={0}
                maxFractionDigits={2}
              />
            )}
            <ComposicaoCustosDica>
              {composicaoCustos.tipoMaoDeObra === MAO_DE_OBRA_FIXA
                ? "Valor somado ao custo do serviço"
                : "Sobre materiais + insumos + frete"}
            </ComposicaoCustosDica>
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
            <span>{rotuloMaoDeObra(c.tipoMaoDeObra, c.percentualMaoDeObra)}</span>
            <strong>{formatCurrency(c.valorMaoDeObra)}</strong>
          </ComposicaoResumoLinha>
          <ComposicaoResumoTotal>
            <span>Total do orçamento</span>
            <strong>{formatCurrency(c.totalGeral)}</strong>
          </ComposicaoResumoTotal>
          <ComposicaoResumoLinha style={{ color: "#2e7d32" }}>
            <span>Valor ganho no serviço ({percentualDoTotal(c.valorMaoDeObra, c.totalGeral)}% do total)</span>
            <strong>{formatCurrency(c.valorMaoDeObra)}</strong>
          </ComposicaoResumoLinha>
        </ComposicaoResumoCard>
      </FormSection>
    );
  };

  const STATUS_DISTRIBUIDORA = {
    maisBarato: { label: "Mais barato", severity: "success" },
    medio: { label: "Valor médio", severity: "warning" },
    maisCaro: { label: "Mais caro", severity: "danger" },
  };

  const opcoesDistribuidoraDoMaterial = (mat) =>
    mat.diferencas.map((d) => ({
      value: d.distribuidora,
      label: `${d.distribuidora} — ${formatCurrency(d.preco)}${
        d.diferenca === 0 ? " (mais barato)" : ` (+${formatCurrency(d.diferenca)})`
      }`,
    }));

  const cabecalhoEscolha = (titulo, descricao, valor, emUso) => (
    <EscolhaCabecalho>
      <div>
        <strong>{titulo}</strong>
        <small>{descricao}</small>
      </div>
      <EscolhaCabecalhoValor>
        {emUso && <Tag value="Em uso no orçamento" severity="info" />}
        <span>{valor != null ? formatCurrency(valor) : "-"}</span>
      </EscolhaCabecalhoValor>
    </EscolhaCabecalho>
  );

  const alterarAbaEscolha = (e) => {
    setAbaEscolhaAberta(e.index);
    if (e.index === 0) setTipoAnaliseSelecionada(ESCOLHA_POR_MATERIAL);
    if (e.index === 1) setTipoAnaliseSelecionada(ESCOLHA_DISTRIBUIDORA_UNICA);
  };

  const renderEscolhaDistribuidora = () => {
    if (analiseMateriais.length === 0) return null;
    return (
      <FormSection>
        <ListaMateriaisTitle>Escolha da distribuidora</ListaMateriaisTitle>
        <Accordion activeIndex={abaEscolhaAberta} onTabChange={alterarAbaEscolha}>
          <AccordionTab
            header={cabecalhoEscolha(
              "Por material",
              "Escolha a distribuidora de cada material (padrão: a mais barata)",
              totalPorMaterial,
              !usaDistribuidoraUnica
            )}
          >
            <DataTable value={analiseMateriais} size="small" dataKey="materialId">
              <Column field="nome" header="Material" />
              <Column field="quantidade" header="Qtd" style={{ width: 70 }} />
              <Column
                header="Distribuidora"
                style={{ minWidth: 280 }}
                body={(mat) => (
                  <Dropdown
                    value={mat.distribuidoraSelecionada}
                    options={opcoesDistribuidoraDoMaterial(mat)}
                    onChange={(e) =>
                      setEscolhasPorMaterial((prev) => ({ ...prev, [mat.materialId]: e.value }))
                    }
                    style={{ width: "100%" }}
                  />
                )}
              />
              <Column
                header="Valor"
                style={{ width: 140 }}
                body={(mat) =>
                  formatCurrency(
                    mat.diferencas.find((d) => d.distribuidora === mat.distribuidoraSelecionada)?.preco
                  )
                }
              />
            </DataTable>
          </AccordionTab>
          <AccordionTab
            disabled={distribuidorasCompletas.length === 0}
            header={cabecalhoEscolha(
              "Uma distribuidora para tudo",
              distribuidorasCompletas.length
                ? `Compra todos os materiais em ${distribuidoraUnica.distribuidora}`
                : "Nenhuma distribuidora tem preço para todos os materiais",
              distribuidoraUnica?.valorTotal,
              usaDistribuidoraUnica
            )}
          >
            <DataTable
              value={analiseDistribuidoras}
              size="small"
              dataKey="distribuidora"
              rowClassName={(d) => ({ "linha-desabilitada": d.status === "incompleto" })}
            >
              <Column
                style={{ width: 50 }}
                body={(d) => (
                  <RadioButton
                    inputId={`dist-${d.distribuidora}`}
                    checked={distribuidoraUnica?.distribuidora === d.distribuidora}
                    disabled={d.status === "incompleto"}
                    onChange={() => setDistribuidoraTotalSelecionada(d.distribuidora)}
                  />
                )}
              />
              <Column
                header="Distribuidora"
                body={(d) => <label htmlFor={`dist-${d.distribuidora}`}>{d.distribuidora}</label>}
              />
              <Column header="Total dos materiais" style={{ width: 170 }} body={(d) => formatCurrency(d.valorTotal)} />
              <Column
                header="Situação"
                style={{ width: 210 }}
                body={(d) =>
                  d.status === "incompleto" ? (
                    <Tag
                      value={`Sem preço em ${d.semPreco} material${d.semPreco > 1 ? "is" : ""}`}
                      severity="secondary"
                    />
                  ) : (
                    <Tag value={STATUS_DISTRIBUIDORA[d.status].label} severity={STATUS_DISTRIBUIDORA[d.status].severity} />
                  )
                }
              />
            </DataTable>
          </AccordionTab>
        </Accordion>
      </FormSection>
    );
  };

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
      {renderEscolhaDistribuidora()}
      {renderComposicaoCustos()}
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
      </ButtonContainer>
    </ContainerPage>
  );
};

export default CriarCotacao;
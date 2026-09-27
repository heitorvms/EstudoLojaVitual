import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { classNames } from "primereact/utils";
import debounce from "lodash/debounce";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import { SimulacaoProducaoService } from "../../services/SimulacaoProducaoService";

import {
  ContainerPage,
  Title,
  FormSection,
  FormTitle,
  SubTitle,
  FormRow,
  FormGroup,
  Label,
  ErrorMessage,
  SectionHeader,
  ButtonContainer,
  ActionBar,
  ButtonStyled,
  IconActionButton,
  TabsWrap,
  InputTextStyled,
  DataTableStyled,
  ResumoGrid,
  ResumoCard,
  EmptyState,
  RemoveItemButton,
  ActionCell,
  InfoBadge,
  GlobalStyle,
} from "./styled";

import {
  DistribuidoraPickerBox,
  DistribuidoraPickerField,
  DistribuidoraAddButton,
  ListaMateriaisHeader,
  ListaMateriaisTitle,
} from "../CriarCotacao/styled";

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatMoney = (value) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
};

const formatMaterialLabel = (m) =>
  m.tamanho != null && m.tamanho !== ""
    ? `${m.descricao} (${Number(m.tamanho).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m)`
    : m.descricao;

const SimulacaoProducao = () => {
  const toast = useRef(null);
  const navigate = useNavigate();
  const materialService = useRef(new MaterialDisponivelService()).current;
  const simulacaoService = useRef(new SimulacaoProducaoService()).current;

  const [activeTab, setActiveTab] = useState(0);
  const ehPadronizado = activeTab === 1;

  const [modo, setModo] = useState("lista");
  const [selecionada, setSelecionada] = useState(null);
  const [formPadronizado, setFormPadronizado] = useState(false);

  const [nomeTrabalho, setNomeTrabalho] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [percentualPerda, setPercentualPerda] = useState(20);
  const [percentualInsumos, setPercentualInsumos] = useState(15);
  const [valorFrete, setValorFrete] = useState(0);
  const [itens, setItens] = useState([]);

  const [materialOpcoes, setMaterialOpcoes] = useState([]);
  const [carregandoMateriais, setCarregandoMateriais] = useState(false);
  const [materialPicker, setMaterialPicker] = useState({ materialId: null, consumoPorUnidade: null });
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const materialCacheRef = useRef(new Map());

  const [resultado, setResultado] = useState(null);
  const [carregandoCalc, setCarregandoCalc] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [lista, setLista] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

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
        const idsAdicionados = new Set(itens.map((i) => i.material?.id).filter(Boolean));
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
    [itens, materialService]
  );

  const debouncedCarregarMaterialOpcoes = useMemo(
    () => debounce((query) => carregarMaterialOpcoes(query), 300),
    [carregarMaterialOpcoes]
  );

  useEffect(
    () => () => debouncedCarregarMaterialOpcoes.cancel(),
    [debouncedCarregarMaterialOpcoes]
  );

  const carregarLista = useCallback(async () => {
    setCarregandoLista(true);
    const result = await simulacaoService.listarHistorico(ehPadronizado);
    setCarregandoLista(false);
    if (result.success) {
      setLista(result.data || []);
    } else if (toast.current) {
      toast.current.show(result.message);
    }
  }, [simulacaoService, ehPadronizado]);

  useEffect(() => {
    if (modo === "lista") {
      setSelecionada(null);
      carregarLista();
    }
  }, [carregarLista, modo]);

  const limparTudo = () => {
    setNomeTrabalho("");
    setQuantidade(1);
    setPercentualPerda(20);
    setPercentualInsumos(15);
    setValorFrete(0);
    setItens([]);
    setMaterialPicker({ materialId: null, consumoPorUnidade: null });
    setResultado(null);
    setFormErrors({});
    setSubmitted(false);
    setEditandoId(null);
  };

  const voltarLista = () => {
    limparTudo();
    setSelecionada(null);
    setModo("lista");
  };

  const criar = () => {
    limparTudo();
    setSelecionada(null);
    setFormPadronizado(ehPadronizado);
    if (ehPadronizado) {
      setQuantidade(1);
      setPercentualPerda(0);
      setPercentualInsumos(0);
      setValorFrete(0);
    }
    setModo("formulario");
  };

  const adicionarMaterialNaLista = () => {
    if (!materialPicker.materialId) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Selecione um material.", life: 3000 });
      return;
    }
    if (!materialPicker.consumoPorUnidade || materialPicker.consumoPorUnidade <= 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Informe o consumo por unidade (maior que zero).",
        life: 3000,
      });
      return;
    }
    const selected = materialCacheRef.current.get(materialPicker.materialId);
    if (!selected) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Material não encontrado. Selecione novamente.",
        life: 3000,
      });
      return;
    }
    if (itens.some((i) => i.material?.id === selected.id)) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Este material já está na lista.",
        life: 3000,
      });
      return;
    }
    setIsAddingMaterial(true);
    setItens((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        material: selected,
        consumoPorUnidade: materialPicker.consumoPorUnidade,
      },
    ]);
    setMaterialPicker({ materialId: null, consumoPorUnidade: null });
    setIsAddingMaterial(false);
    if (formErrors.itens) setFormErrors((prev) => ({ ...prev, itens: null }));
  };

  const atualizarItem = (uid, campo, valor) => {
    setItens((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [campo]: valor } : item))
    );
    if (formErrors.itens) setFormErrors((prev) => ({ ...prev, itens: null }));
  };

  const removerItem = (uid) => {
    setItens((prev) => prev.filter((i) => i.uid !== uid));
  };

  const validarFormulario = (somenteMateriais = false) => {
    const errors = {};
    if (!somenteMateriais) {
      if (!quantidade || quantidade < 1) {
        errors.quantidade = "Quantidade deve ser maior ou igual a 1.";
      }
      if (percentualPerda == null || percentualPerda < 0 || percentualPerda > 100) {
        errors.perda = "Perda deve estar entre 0 e 100.";
      }
      if (percentualInsumos == null || percentualInsumos < 0 || percentualInsumos > 100) {
        errors.insumos = "Insumos deve estar entre 0 e 100.";
      }
      if (valorFrete != null && valorFrete < 0) {
        errors.frete = "Frete não pode ser negativo.";
      }
    }
    const itensValidos = itens.filter(
      (i) => i.material?.id && i.consumoPorUnidade && i.consumoPorUnidade > 0
    );
    if (itensValidos.length === 0) {
      errors.itens = "Adicione pelo menos um material com consumo válido.";
    } else {
      const idsUsados = new Set();
      for (const i of itensValidos) {
        if (idsUsados.has(i.material.id)) {
          errors.itens = "Há materiais duplicados na lista.";
          break;
        }
        idsUsados.add(i.material.id);
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const montarPayload = (padronizado) => ({
    nomeTrabalho: nomeTrabalho?.trim() || null,
    quantidade: padronizado ? 1 : quantidade,
    percentualPerda: padronizado ? 0 : percentualPerda,
    percentualInsumos: padronizado ? 0 : (percentualInsumos ?? 0),
    valorFrete: padronizado ? 0 : (valorFrete ?? 0),
    padronizado: Boolean(padronizado),
    itens: itens
      .filter((i) => i.material?.id && i.consumoPorUnidade > 0)
      .map((i) => ({
        materialDisponivelId: i.material.id,
        consumoPorUnidade: i.consumoPorUnidade,
      })),
  });

  const calcular = async () => {
    setSubmitted(true);
    if (!validarFormulario(false)) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Corrija os campos inválidos.",
        life: 3000,
      });
      return;
    }
    setCarregandoCalc(true);
    const result = await simulacaoService.calcular(montarPayload(false));
    setCarregandoCalc(false);

    if (result.success) {
      setResultado(result.data);
      toast.current?.show({
        severity: "success",
        summary: "Simulação concluída",
        detail: `Cálculo realizado para ${quantidade} unidade(s).`,
        life: 2500,
      });
    } else {
      setResultado(null);
      toast.current?.show(result.message);
    }
  };

  const salvar = async () => {
    const padronizado = formPadronizado;
    setSubmitted(true);
    if (!validarFormulario(padronizado)) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Corrija os campos inválidos.",
        life: 3000,
      });
      return;
    }

    if (!padronizado && !resultado) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Calcule a simulação antes de salvar.",
        life: 3000,
      });
      return;
    }

    setSalvando(true);
    const payload = montarPayload(padronizado);
    if (padronizado) {
      const calc = await simulacaoService.calcular(payload);
      if (!calc.success) {
        setSalvando(false);
        toast.current?.show(calc.message);
        return;
      }
      setResultado(calc.data);
    }

    const result = editandoId
      ? await simulacaoService.atualizar(editandoId, payload)
      : await simulacaoService.salvar(payload);
    setSalvando(false);

    if (result.success) {
      toast.current?.show(result.message);
      if (padronizado) {
        setActiveTab(1);
      } else {
        setActiveTab(0);
      }
      voltarLista();
    } else {
      toast.current?.show(result.message);
    }
  };

  const aplicarRegistro = (sim, { comoPadronizado, novaSimulacao }) => {
    setEditandoId(novaSimulacao ? null : sim.id);
    setFormPadronizado(Boolean(comoPadronizado));
    setNomeTrabalho(sim.nomeTrabalho || "");

    if (comoPadronizado) {
      setQuantidade(1);
      setPercentualPerda(0);
      setPercentualInsumos(0);
      setValorFrete(0);
    } else if (novaSimulacao) {
      setQuantidade(1);
      setPercentualPerda(20);
      setPercentualInsumos(15);
      setValorFrete(0);
    } else {
      setQuantidade(sim.quantidade || 1);
      setPercentualPerda(Number(sim.percentualPerda ?? 20));
      setPercentualInsumos(Number(sim.percentualInsumos ?? 15));
      setValorFrete(Number(sim.valorFrete ?? 0));
    }

    const itensRestaurados = (sim.materiais || sim.itens || []).map((m) => {
      const materialId = m.materialId ?? m.materialDisponivelId;
      return {
        uid: `${materialId}-${Math.random().toString(36).slice(2, 7)}`,
        material: {
          id: materialId,
          descricao: m.nome || m.descricao,
          tamanho: m.tamanho,
          precoUnitario: m.precoUnitario,
        },
        consumoPorUnidade: Number(m.consumoPorUnidade),
      };
    });
    setItens(itensRestaurados);
    setResultado(null);
    setSubmitted(false);
    setFormErrors({});
  };

  const carregarRegistro = async (id) => {
    const result = await simulacaoService.obterHistorico(id);
    if (!result.success) {
      toast.current?.show(result.message);
      return null;
    }
    return result.data;
  };

  const editar = async () => {
    if (!selecionada?.id) return;
    const sim = await carregarRegistro(selecionada.id);
    if (!sim) return;
    aplicarRegistro(sim, { comoPadronizado: ehPadronizado, novaSimulacao: false });
    setModo("formulario");
  };

  const gerarSimulacaoDoPadrao = async () => {
    if (!selecionada?.id) return;
    const sim = await carregarRegistro(selecionada.id);
    if (!sim) return;
    aplicarRegistro(sim, { comoPadronizado: false, novaSimulacao: true });
    setActiveTab(0);
    setModo("formulario");
    toast.current?.show({
      severity: "info",
      summary: "Simulação montada",
      detail: "Materiais carregados. Informe perda, insumos e frete, depois calcule.",
      life: 3500,
    });
  };

  const gerarOrcamento = async () => {
    if (!selecionada?.id) return;
    const sim = await carregarRegistro(selecionada.id);
    if (!sim) return;

    navigate("/criar-cotacao", {
      state: {
        origem: "simulacao",
        simulacaoId: sim.id,
        nomeTrabalho: sim.nomeTrabalho || `Simulação #${sim.id}`,
        quantidade: sim.quantidade,
        percentualInsumos: sim.percentualInsumos,
        valorFrete: sim.valorFrete,
        valorInsumos: sim.valorInsumos,
        totalCustoMateriais: sim.totalCustoMateriais,
        materiais: (sim.materiais || []).map((m) => ({
          materialDisponivelId: m.materialId,
          descricao: m.nome,
          tamanho: m.tamanho,
          precoUnitario: m.precoUnitario,
          quantidadeBarras: m.quantidadeBarras,
          distribuidoraNome: m.distribuidoraNome,
        })),
      },
    });
  };

  const excluir = () => {
    if (!selecionada?.id) return;
    const id = selecionada.id;
    const nome = selecionada.nomeTrabalho || `#${id}`;
    confirmDialog({
      message: `Tem certeza que deseja excluir "${nome}"?`,
      header: ehPadronizado ? "Excluir modelo" : "Excluir simulação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Excluir",
      rejectLabel: "Cancelar",
      acceptClassName: "custom-accept-button",
      rejectClassName: "custom-reject-button",
      accept: async () => {
        const result = await simulacaoService.excluirHistorico(id);
        toast.current?.show(result.message);
        if (result.success) {
          setSelecionada(null);
          carregarLista();
        }
      },
    });
  };

  const totalBarras = useMemo(() => {
    if (!resultado?.materiais) return 0;
    return resultado.materiais.reduce((acc, m) => acc + (m.quantidadeBarras || 0), 0);
  }, [resultado]);

  const temSelecao = Boolean(selecionada?.id);

  if (modo === "lista") {
    return (
      <ContainerPage>
        <GlobalStyle />
        <ConfirmDialog />
        <Toast ref={toast} />

        <Title>Simulação de Produção</Title>

        <FormSection>
          <TabsWrap>
            <TabView
              activeIndex={activeTab}
              onTabChange={(e) => {
                setActiveTab(e.index);
                setSelecionada(null);
              }}
            >
              <TabPanel header="Simulações">
                <SectionHeader>
                  <SubTitle style={{ marginBottom: 0 }}>Registros de simulação</SubTitle>
                  <IconActionButton
                    icon="pi pi-refresh"
                    tooltip="Atualizar"
                    tooltipOptions={{ position: "top" }}
                    loading={carregandoLista && !ehPadronizado}
                    onClick={carregarLista}
                  />
                </SectionHeader>

                <DataTableStyled
                  value={!ehPadronizado ? lista : []}
                  emptyMessage="Nenhuma simulação registrada."
                  responsiveLayout="scroll"
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  selectionMode="single"
                  selection={!ehPadronizado ? selecionada : null}
                  onSelectionChange={(e) => setSelecionada(e.value)}
                  dataKey="id"
                  loading={carregandoLista && activeTab === 0}
                >
                  <Column header="Data" body={(row) => formatDate(row.dataCriacao)} style={{ width: 180 }} />
                  <Column header="Trabalho" body={(row) => row.nomeTrabalho || "Sem identificação"} />
                  <Column header="Quantidade" body={(row) => row.quantidade} style={{ width: 110 }} />
                  <Column
                    header="Perda"
                    body={(row) => `${formatNumber(row.percentualPerda, 2)}%`}
                    style={{ width: 100 }}
                  />
                  <Column
                    header="Custo total"
                    body={(row) => formatMoney(row.totalCustoEstimado)}
                    style={{ width: 150 }}
                  />
                </DataTableStyled>

                <ActionBar>
                  <IconActionButton
                    icon="pi pi-plus"
                    className="btn-create"
                    tooltip="Criar simulação"
                    tooltipOptions={{ position: "top" }}
                    onClick={criar}
                  />
                  <IconActionButton
                    icon="pi pi-pencil"
                    tooltip="Editar simulação"
                    tooltipOptions={{ position: "top" }}
                    disabled={!temSelecao}
                    onClick={editar}
                  />
                  <IconActionButton
                    icon="pi pi-file"
                    className="btn-success"
                    tooltip="Gerar orçamento desta simulação"
                    tooltipOptions={{ position: "top" }}
                    disabled={!temSelecao}
                    onClick={gerarOrcamento}
                  />
                  <IconActionButton
                    icon="pi pi-trash"
                    className="btn-delete"
                    tooltip="Excluir simulação"
                    tooltipOptions={{ position: "top" }}
                    disabled={!temSelecao}
                    onClick={excluir}
                  />
                </ActionBar>
              </TabPanel>

              <TabPanel header="Serviços Padronizados">
                <SectionHeader>
                  <SubTitle style={{ marginBottom: 0 }}>Modelos padronizados</SubTitle>
                  <IconActionButton
                    icon="pi pi-refresh"
                    tooltip="Atualizar"
                    tooltipOptions={{ position: "top" }}
                    loading={carregandoLista && ehPadronizado}
                    onClick={carregarLista}
                  />
                </SectionHeader>

                <DataTableStyled
                  value={ehPadronizado ? lista : []}
                  emptyMessage="Nenhum modelo padronizado cadastrado."
                  responsiveLayout="scroll"
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  selectionMode="single"
                  selection={ehPadronizado ? selecionada : null}
                  onSelectionChange={(e) => setSelecionada(e.value)}
                  dataKey="id"
                  loading={carregandoLista && activeTab === 1}
                >
                  <Column header="Data" body={(row) => formatDate(row.dataCriacao)} style={{ width: 180 }} />
                  <Column header="Modelo" body={(row) => row.nomeTrabalho || "Sem identificação"} />
                </DataTableStyled>

                <ActionBar>
                  <IconActionButton
                    icon="pi pi-plus"
                    className="btn-create"
                    tooltip="Criar modelo"
                    tooltipOptions={{ position: "top" }}
                    onClick={criar}
                  />
                  <IconActionButton
                    icon="pi pi-pencil"
                    tooltip="Editar modelo"
                    tooltipOptions={{ position: "top" }}
                    disabled={!temSelecao}
                    onClick={editar}
                  />
                  <IconActionButton
                    icon="pi pi-calculator"
                    className="btn-info"
                    tooltip="Gerar simulação deste modelo"
                    tooltipOptions={{ position: "top" }}
                    disabled={!temSelecao}
                    onClick={gerarSimulacaoDoPadrao}
                  />
                  <IconActionButton
                    icon="pi pi-trash"
                    className="btn-delete"
                    tooltip="Excluir modelo"
                    tooltipOptions={{ position: "top" }}
                    disabled={!temSelecao}
                    onClick={excluir}
                  />
                </ActionBar>
              </TabPanel>
            </TabView>
          </TabsWrap>
        </FormSection>
      </ContainerPage>
    );
  }

  return (
    <ContainerPage>
      <GlobalStyle />
      <ConfirmDialog />
      <Toast ref={toast} />

      <Title>
        {formPadronizado
          ? editandoId
            ? "Editar modelo padronizado"
            : "Novo modelo padronizado"
          : editandoId
            ? "Editar Simulação"
            : "Nova Simulação"}
      </Title>

      <FormSection>
        <FormTitle>
          {formPadronizado ? "Dados do modelo" : "Informações do Trabalho"}
        </FormTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="nomeTrabalho">
              {formPadronizado ? "Nome do modelo" : "Nome do Trabalho (opcional)"}
            </Label>
            <InputTextStyled
              id="nomeTrabalho"
              value={nomeTrabalho}
              onChange={(e) => setNomeTrabalho(e.target.value)}
              placeholder={formPadronizado ? "Ex.: Cadeira tubular modelo X" : "Ex.: Portão social cliente Maria"}
              maxLength={120}
            />
          </FormGroup>
          {!formPadronizado && (
            <>
              <FormGroup>
                <Label htmlFor="quantidade">Quantidade a Produzir</Label>
                <InputNumber
                  id="quantidade"
                  value={quantidade}
                  onValueChange={(e) => setQuantidade(e.value)}
                  min={1}
                  showButtons
                  buttonLayout="horizontal"
                  decrementButtonClassName="p-button-secondary"
                  incrementButtonClassName="p-button-secondary"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  inputClassName={classNames({ "p-invalid": submitted && formErrors.quantidade })}
                />
                {submitted && formErrors.quantidade && (
                  <ErrorMessage>{formErrors.quantidade}</ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label htmlFor="perda">Percentual de Perda (%)</Label>
                <InputNumber
                  id="perda"
                  value={percentualPerda}
                  onValueChange={(e) => setPercentualPerda(e.value)}
                  min={0}
                  max={100}
                  suffix="%"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  inputClassName={classNames({ "p-invalid": submitted && formErrors.perda })}
                />
                {submitted && formErrors.perda && (
                  <ErrorMessage>{formErrors.perda}</ErrorMessage>
                )}
              </FormGroup>
            </>
          )}
        </FormRow>
        {!formPadronizado && (
          <FormRow>
            <FormGroup>
              <Label htmlFor="insumos">Insumos (% sobre materiais)</Label>
              <InputNumber
                id="insumos"
                value={percentualInsumos}
                onValueChange={(e) => setPercentualInsumos(e.value)}
                min={0}
                max={100}
                suffix="%"
                minFractionDigits={0}
                maxFractionDigits={2}
                inputClassName={classNames({ "p-invalid": submitted && formErrors.insumos })}
              />
              {submitted && formErrors.insumos && (
                <ErrorMessage>{formErrors.insumos}</ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="frete">Frete (R$)</Label>
              <InputNumber
                id="frete"
                value={valorFrete}
                onValueChange={(e) => setValorFrete(e.value ?? 0)}
                min={0}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                inputClassName={classNames({ "p-invalid": submitted && formErrors.frete })}
              />
              {submitted && formErrors.frete && (
                <ErrorMessage>{formErrors.frete}</ErrorMessage>
              )}
            </FormGroup>
          </FormRow>
        )}
      </FormSection>

      <FormSection>
        <SubTitle>
          {formPadronizado ? "Materiais por unidade do modelo" : "Materiais Utilizados"}
        </SubTitle>

        <DistribuidoraPickerBox>
          <DistribuidoraPickerField>
            <label htmlFor="materialDropdown">Material</label>
            <Dropdown
              inputId="materialDropdown"
              value={materialPicker.materialId}
              options={materialOpcoes}
              onChange={(e) =>
                setMaterialPicker((prev) => ({ ...prev, materialId: e.value }))
              }
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
              className={classNames({
                "p-invalid": submitted && formErrors.itens && !materialPicker.materialId,
              })}
            />
          </DistribuidoraPickerField>
          <DistribuidoraPickerField className="picker-field-consumo">
            <label htmlFor="consumoPicker">Consumo / unidade (m)</label>
            <InputNumber
              id="consumoPicker"
              value={materialPicker.consumoPorUnidade}
              onValueChange={(e) =>
                setMaterialPicker((prev) => ({ ...prev, consumoPorUnidade: e.value }))
              }
              min={0}
              minFractionDigits={2}
              maxFractionDigits={4}
              suffix=" m"
              placeholder="0,00"
              inputClassName={classNames({
                "p-invalid":
                  submitted &&
                  formErrors.itens &&
                  materialPicker.materialId &&
                  (!materialPicker.consumoPorUnidade || materialPicker.consumoPorUnidade <= 0),
              })}
            />
          </DistribuidoraPickerField>
          <DistribuidoraAddButton
            label="Adicionar"
            icon="pi pi-plus"
            disabled={
              !materialPicker.materialId ||
              !materialPicker.consumoPorUnidade ||
              materialPicker.consumoPorUnidade <= 0 ||
              isAddingMaterial
            }
            loading={isAddingMaterial}
            onClick={adicionarMaterialNaLista}
          />
        </DistribuidoraPickerBox>

        <ListaMateriaisHeader>
          <ListaMateriaisTitle>Lista de materiais</ListaMateriaisTitle>
        </ListaMateriaisHeader>

        <DataTableStyled
          value={itens}
          emptyMessage="Nenhum material adicionado."
          dataKey="uid"
          selectionMode={null}
        >
          <Column field="material.descricao" header="Material" style={{ minWidth: 280 }} />
          <Column
            header="Tamanho"
            style={{ width: 170 }}
            body={(row) =>
              row.material?.tamanho
                ? <InfoBadge>{`${formatNumber(row.material.tamanho, 2)} m`}</InfoBadge>
                : "-"
            }
          />
          <Column
            header="Consumo / Unidade (m)"
            style={{ width: 220 }}
            body={(row) => (
              <InputNumber
                value={row.consumoPorUnidade}
                onValueChange={(e) => atualizarItem(row.uid, "consumoPorUnidade", e.value)}
                min={0}
                minFractionDigits={2}
                maxFractionDigits={4}
                suffix=" m"
                placeholder="0,00"
                inputClassName={classNames({
                  "p-invalid":
                    submitted &&
                    formErrors.itens &&
                    (!row.consumoPorUnidade || row.consumoPorUnidade <= 0),
                })}
              />
            )}
          />
          <Column
            header="Ações"
            style={{ width: 90 }}
            body={(row) => (
              <ActionCell>
                <RemoveItemButton
                  icon="pi pi-trash"
                  onClick={() => removerItem(row.uid)}
                  tooltip="Remover material"
                  tooltipOptions={{ position: "left" }}
                />
              </ActionCell>
            )}
          />
        </DataTableStyled>

        {submitted && formErrors.itens && (
          <ErrorMessage style={{ marginTop: 8 }}>{formErrors.itens}</ErrorMessage>
        )}
      </FormSection>

      {!formPadronizado && (
        resultado ? (
          <FormSection>
            <FormTitle>Resultado da Simulação</FormTitle>
            <ResumoGrid>
              <ResumoCard>
                <div className="label">Trabalho</div>
                <div className="value value-compact">{resultado.nomeTrabalho || "Sem identificação"}</div>
              </ResumoCard>
              <ResumoCard>
                <div className="label">Quantidade</div>
                <div className="value">{resultado.quantidade}</div>
              </ResumoCard>
              <ResumoCard>
                <div className="label">Perda aplicada</div>
                <div className="value">{formatNumber(resultado.percentualPerda, 2)}%</div>
              </ResumoCard>
              <ResumoCard>
                <div className="label">Total a comprar</div>
                <div className="value">{totalBarras} un.</div>
              </ResumoCard>
              <ResumoCard>
                <div className="label">Custo materiais</div>
                <div className="value">{formatMoney(resultado.totalCustoMateriais)}</div>
              </ResumoCard>
              <ResumoCard>
                <div className="label">
                  Insumos ({formatNumber(resultado.percentualInsumos ?? 0, 0)}%)
                </div>
                <div className="value">{formatMoney(resultado.valorInsumos)}</div>
              </ResumoCard>
              <ResumoCard>
                <div className="label">Frete</div>
                <div className="value">{formatMoney(resultado.valorFrete)}</div>
              </ResumoCard>
              <ResumoCard className="highlight">
                <div className="label">Custo total estimado</div>
                <div className="value">{formatMoney(resultado.totalCustoEstimado)}</div>
              </ResumoCard>
            </ResumoGrid>

            <SubTitle>Detalhamento por Material</SubTitle>
            <DataTableStyled
              value={resultado.materiais || []}
              emptyMessage="Nenhum material calculado."
              responsiveLayout="scroll"
              selectionMode={null}
            >
              <Column field="nome" header="Material" />
              <Column header="Consumo / un. (m)" body={(row) => formatNumber(row.consumoPorUnidade, 2)} />
              <Column header="Consumo total (m)" body={(row) => formatNumber(row.consumoTotal, 2)} />
              <Column header="Total c/ perda (m)" body={(row) => formatNumber(row.totalComPerda, 2)} />
              <Column header="Tamanho (m)" body={(row) => formatNumber(row.tamanho, 2)} />
              <Column
                header="Comprar"
                body={(row) => <InfoBadge>{row.quantidadeBarras ?? "-"} un.</InfoBadge>}
              />
              <Column header="Sobra (m)" body={(row) => formatNumber(row.sobraEstimada, 2)} />
              <Column header="Custo estimado" body={(row) => formatMoney(row.custoEstimado)} />
            </DataTableStyled>
          </FormSection>
        ) : (
          <EmptyState>
            Preencha as informações e clique em <strong>Calcular Produção</strong>.
          </EmptyState>
        )
      )}

      <ButtonContainer>
        <ButtonStyled
          label="Voltar"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={voltarLista}
        />
        <ButtonStyled
          label="Limpar"
          icon="pi pi-eraser"
          className="p-button-text"
          onClick={limparTudo}
        />
        {formPadronizado ? (
          <ButtonStyled
            label={editandoId ? "Atualizar modelo" : "Salvar modelo"}
            icon="pi pi-save"
            className="p-button-success"
            loading={salvando}
            onClick={salvar}
          />
        ) : (
          <>
            <ButtonStyled
              label={editandoId ? "Atualizar simulação" : "Salvar simulação"}
              icon="pi pi-save"
              className="p-button-success"
              loading={salvando}
              onClick={salvar}
              disabled={!resultado}
            />
            <ButtonStyled
              label="Calcular Produção"
              icon="pi pi-calculator"
              loading={carregandoCalc}
              onClick={calcular}
            />
          </>
        )}
      </ButtonContainer>
    </ContainerPage>
  );
};

export default SimulacaoProducao;

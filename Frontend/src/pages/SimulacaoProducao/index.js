import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
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
  ButtonStyled,
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

  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [simulacaoEditandoId, setSimulacaoEditandoId] = useState(null);

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

  const carregarHistorico = useCallback(async () => {
    setCarregandoHistorico(true);
    const result = await simulacaoService.listarHistorico();
    setCarregandoHistorico(false);
    if (result.success) {
      setHistorico(result.data || []);
    } else if (toast.current) {
      toast.current.show(result.message);
    }
  }, [simulacaoService]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const adicionarMaterialNaLista = () => {
    if (!materialPicker.materialId) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione um material.",
        life: 3000,
      });
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
    setSimulacaoEditandoId(null);
  };

  const validarFormulario = () => {
    const errors = {};
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

  const montarPayload = () => ({
    nomeTrabalho: nomeTrabalho?.trim() || null,
    quantidade,
    percentualPerda,
    percentualInsumos: percentualInsumos ?? 0,
    valorFrete: valorFrete ?? 0,
    itens: itens
      .filter((i) => i.material?.id && i.consumoPorUnidade > 0)
      .map((i) => ({
        materialDisponivelId: i.material.id,
        consumoPorUnidade: i.consumoPorUnidade,
      })),
  });

  const calcular = async () => {
    setSubmitted(true);
    if (!validarFormulario()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Corrija os campos inválidos.",
        life: 3000,
      });
      return;
    }
    setCarregandoCalc(true);
    const result = await simulacaoService.calcular(montarPayload());
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

  const salvarSimulacao = async () => {
    if (!resultado) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Calcule a simulação antes de salvar.",
        life: 3000,
      });
      return;
    }
    setSalvando(true);
    const result = simulacaoEditandoId
      ? await simulacaoService.atualizar(simulacaoEditandoId, montarPayload())
      : await simulacaoService.salvar(montarPayload());
    setSalvando(false);

    if (result.success) {
      toast.current?.show(result.message);
      if (result.data?.id) {
        setSimulacaoEditandoId(result.data.id);
      }
      carregarHistorico();
    } else {
      toast.current?.show(result.message);
    }
  };

  const carregarSimulacao = async (id) => {
    const result = await simulacaoService.obterHistorico(id);
    if (!result.success) {
      toast.current?.show(result.message);
      return;
    }
    const sim = result.data;
    setSimulacaoEditandoId(sim.id);
    setNomeTrabalho(sim.nomeTrabalho || "");
    setQuantidade(sim.quantidade || 1);
    setPercentualPerda(Number(sim.percentualPerda ?? 20));
    setPercentualInsumos(Number(sim.percentualInsumos ?? 15));
    setValorFrete(Number(sim.valorFrete ?? 0));

    const itensRestaurados = (sim.materiais || []).map((m) => ({
      uid: `${m.materialId}-${Math.random().toString(36).slice(2, 7)}`,
      material: {
        id: m.materialId,
        descricao: m.nome,
        tamanho: m.tamanho,
        precoUnitario: m.precoUnitario,
      },
      consumoPorUnidade: Number(m.consumoPorUnidade),
    }));
    setItens(itensRestaurados);
    setResultado(null);
    setSubmitted(false);
    setFormErrors({});

    toast.current?.show({
      severity: "info",
      summary: "Carregado",
      detail: "Simulação carregada. Recalcule para ver o resultado.",
      life: 2500,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gerarOrcamento = async (id) => {
    const result = await simulacaoService.obterHistorico(id);
    if (!result.success) {
      toast.current?.show(result.message);
      return;
    }
    const sim = result.data;

    const materiaisPreenchidos = (sim.materiais || []).map((m) => ({
      materialDisponivelId: m.materialId,
      descricao: m.nome,
      tamanho: m.tamanho,
      precoUnitario: m.precoUnitario,
      quantidadeBarras: m.quantidadeBarras,
      distribuidoraNome: m.distribuidoraNome,
    }));

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
        materiais: materiaisPreenchidos,
      },
    });
  };

  const excluirSimulacao = (id) => {
    confirmDialog({
      message: "Confirma a exclusão desta simulação do histórico?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Excluir",
      rejectLabel: "Cancelar",
      acceptClassName: "custom-accept-button",
      rejectClassName: "custom-reject-button",
      accept: async () => {
        const result = await simulacaoService.excluirHistorico(id);
        toast.current?.show(result.message);
        if (result.success) carregarHistorico();
      },
    });
  };

  const totalBarras = useMemo(() => {
    if (!resultado?.materiais) return 0;
    return resultado.materiais.reduce((acc, m) => acc + (m.quantidadeBarras || 0), 0);
  }, [resultado]);

  return (
    <ContainerPage>
      <GlobalStyle />
      <ConfirmDialog />
      <Toast ref={toast} />

      <Title>Simulação de Produção e Cálculo de Materiais</Title>

      <FormSection>
        <FormTitle>Informações do Trabalho</FormTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="nomeTrabalho">Nome do Trabalho (opcional)</Label>
            <InputTextStyled
              id="nomeTrabalho"
              value={nomeTrabalho}
              onChange={(e) => setNomeTrabalho(e.target.value)}
              placeholder="Ex.: Portão social cliente Maria"
              maxLength={120}
            />
          </FormGroup>
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
        </FormRow>
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
      </FormSection>

      <FormSection>
        <SubTitle>Materiais Utilizados</SubTitle>

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
        >
          <Column
            field="material.descricao"
            header="Material"
            style={{ minWidth: 280 }}
          />
          <Column
            header="Tamanho do Material"
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

      {resultado ? (
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
          >
            <Column field="nome" header="Material" />
            <Column
              header="Consumo / un. (m)"
              body={(row) => formatNumber(row.consumoPorUnidade, 2)}
            />
            <Column
              header="Consumo total (m)"
              body={(row) => formatNumber(row.consumoTotal, 2)}
            />
            <Column
              header="Total c/ perda (m)"
              body={(row) => formatNumber(row.totalComPerda, 2)}
            />
            <Column
              header="Tamanho (m)"
              body={(row) => formatNumber(row.tamanho, 2)}
            />
            <Column
              header="Comprar"
              body={(row) => (
                <InfoBadge>{row.quantidadeBarras ?? "-"} un.</InfoBadge>
              )}
            />
            <Column
              header="Sobra (m)"
              body={(row) => formatNumber(row.sobraEstimada, 2)}
            />
            <Column
              header="Custo estimado"
              body={(row) => formatMoney(row.custoEstimado)}
            />
          </DataTableStyled>
        </FormSection>
      ) : (
        <EmptyState>
          Preencha as informações acima e clique em <strong>Calcular Produção</strong> para
          ver o detalhamento dos materiais necessários.
        </EmptyState>
      )}

      <ButtonContainer>
        <ButtonStyled
          label="Limpar"
          icon="pi pi-eraser"
          className="p-button-text"
          onClick={limparTudo}
        />
        <ButtonStyled
          label={simulacaoEditandoId ? "Atualizar no Histórico" : "Salvar no Histórico"}
          icon="pi pi-save"
          className="p-button-success"
          loading={salvando}
          onClick={salvarSimulacao}
          disabled={!resultado}
        />
        <ButtonStyled
          label="Calcular Produção"
          icon="pi pi-calculator"
          loading={carregandoCalc}
          onClick={calcular}
        />
      </ButtonContainer>

      <FormSection style={{ marginTop: "2rem" }}>
        <SectionHeader>
          <SubTitle>Histórico de Simulações</SubTitle>
          <ButtonStyled
            label="Atualizar"
            icon="pi pi-refresh"
            className="p-button-text"
            loading={carregandoHistorico}
            onClick={carregarHistorico}
          />
        </SectionHeader>

        <DataTableStyled
          value={historico}
          emptyMessage="Nenhuma simulação salva no histórico."
          responsiveLayout="scroll"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
        >
          <Column
            header="Data"
            body={(row) => formatDate(row.dataCriacao)}
            style={{ width: 180 }}
          />
          <Column
            header="Trabalho"
            body={(row) => row.nomeTrabalho || "Sem identificação"}
          />
          <Column
            header="Quantidade"
            body={(row) => row.quantidade}
            style={{ width: 110 }}
          />
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
          <Column
            header="Ações"
            style={{ width: 220 }}
            body={(row) => (
              <ActionCell>
                <RemoveItemButton
                  icon="pi pi-file-edit"
                  tooltip="Gerar orçamento desta simulação"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => gerarOrcamento(row.id)}
                  style={{ backgroundColor: "#28a745" }}
                />
                <RemoveItemButton
                  icon="pi pi-folder-open"
                  tooltip="Carregar simulação"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => carregarSimulacao(row.id)}
                  style={{ backgroundColor: "#1A1A2E" }}
                />
                <RemoveItemButton
                  icon="pi pi-trash"
                  tooltip="Excluir"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => excluirSimulacao(row.id)}
                  style={{ backgroundColor: "#dc3545" }}
                />
              </ActionCell>
            )}
          />
        </DataTableStyled>
      </FormSection>
    </ContainerPage>
  );
};

export default SimulacaoProducao;

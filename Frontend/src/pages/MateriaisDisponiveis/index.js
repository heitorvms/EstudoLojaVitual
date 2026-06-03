import React, { useState, useRef, useEffect, useMemo } from "react";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { classNames } from "primereact/utils";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import { MaterialPrecoService } from "../../services/MaterialPrecoService";
import { DistribuidoraService } from "../../services/DistribuidoraService";
import {
  ContainerPage,
  TitlePage,
  FormSection,
  FormTitle,
  FormRow,
  FormGroup,
  Label,
  ErrorMessage,
  ButtonContainer,
  ButtonStyled,
  IconButton,
  InputTextStyled,
  SearchBar,
  DataTableStyled,
  ActionCell,
  GlobalStyle,
} from "./styled";

const INITIAL_STATE = {
  descricao: "",
  tamanho: null,
};

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

const MateriaisDisponiveis = () => {
  const toast = useRef(null);
  const materialService = useRef(new MaterialDisponivelService()).current;
  const precoService = useRef(new MaterialPrecoService()).current;
  const distribuidoraService = useRef(new DistribuidoraService()).current;

  const [materiais, setMateriais] = useState([]);
  const [form, setForm] = useState(INITIAL_STATE);
  const [editingId, setEditingId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [filter, setFilter] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState([]);
  const [stats, setStats] = useState(null);
  const [carregandoPreview, setCarregandoPreview] = useState(false);
  const [importando, setImportando] = useState(false);
  const [distribuidoraImport, setDistribuidoraImport] = useState(null);
  const fileInputRef = useRef(null);

  const [precoDialogOpen, setPrecoDialogOpen] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [precosVigentes, setPrecosVigentes] = useState([]);
  const [carregandoPrecos, setCarregandoPrecos] = useState(false);
  const [distribuidorasDisponiveis, setDistribuidorasDisponiveis] = useState([]);
  const [novoPreco, setNovoPreco] = useState({
    distribuidoraId: null,
    precoUnitario: null,
    prazoEntregaDias: null,
    observacao: "",
  });
  const [salvandoPreco, setSalvandoPreco] = useState(false);

  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [historicoDados, setHistoricoDados] = useState([]);
  const [historicoTitulo, setHistoricoTitulo] = useState("");
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const fetchMateriais = async () => {
    const result = await materialService.getFunction();
    if (result.success) {
      setMateriais(result.data || []);
    } else {
      toast.current?.show(result.message);
    }
  };

  useEffect(() => {
    fetchMateriais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (formErrors[campo]) setFormErrors((prev) => ({ ...prev, [campo]: null }));
  };

  const limparForm = () => {
    setForm(INITIAL_STATE);
    setEditingId(null);
    setSubmitted(false);
    setFormErrors({});
  };

  const validar = () => {
    const errors = {};
    if (!form.descricao?.trim()) errors.descricao = "Descrição é obrigatória.";
    if (form.tamanho == null || form.tamanho <= 0)
      errors.tamanho = "Tamanho em metros é obrigatório e deve ser maior que zero.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const salvar = async () => {
    setSubmitted(true);
    if (!validar()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Corrija os campos inválidos.",
        life: 3000,
      });
      return;
    }
    setSalvando(true);
    const payload = {
      descricao: form.descricao.trim(),
      tamanho: form.tamanho,
    };

    const result = editingId
      ? await materialService.putRequest(editingId, payload)
      : await materialService.postRequest(payload);

    setSalvando(false);
    toast.current?.show(result.message);

    if (result.success) {
      limparForm();
      fetchMateriais();
    }
  };

  const editar = (material) => {
    setEditingId(material.id);
    setForm({
      descricao: material.descricao || "",
      tamanho: material.tamanho != null ? Number(material.tamanho) : null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const excluir = (id) => {
    confirmDialog({
      message: "Confirma a exclusão deste material?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Excluir",
      rejectLabel: "Cancelar",
      acceptClassName: "custom-accept-button",
      rejectClassName: "custom-reject-button",
      accept: async () => {
        const result = await materialService.deleteRequest(id);
        toast.current?.show(result.message);
        if (result.success) {
          if (editingId === id) limparForm();
          fetchMateriais();
        }
      },
    });
  };

  const abrirImport = async () => {
    setArquivo(null);
    setPreview([]);
    setStats(null);
    setDistribuidoraImport(null);
    setImportDialogOpen(true);
    if (distribuidorasDisponiveis.length === 0) {
      await carregarDistribuidoras();
    }
  };

  const fecharImport = () => {
    setImportDialogOpen(false);
    setArquivo(null);
    setPreview([]);
    setStats(null);
    setDistribuidoraImport(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onArquivoSelecionado = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nome = file.name.toLowerCase();
    if (!nome.endsWith(".csv") && !nome.endsWith(".xlsx") && !nome.endsWith(".xls")) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione um arquivo .csv ou .xlsx.",
        life: 3000,
      });
      return;
    }
    setArquivo(file);
    setPreview([]);
    setStats(null);
  };

  const lerPlanilha = async () => {
    if (!distribuidoraImport) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione a distribuidora antes de ler a planilha.",
        life: 3000,
      });
      return;
    }
    if (!arquivo) return;
    setCarregandoPreview(true);
    const result = await materialService.previewPlanilha(arquivo, distribuidoraImport);
    setCarregandoPreview(false);

    if (!result.success) {
      toast.current?.show(result.message);
      return;
    }

    const itens = (result.data?.materiais || []).map((m, idx) => ({
      ...m,
      uid: `lin-${idx}`,
      selecionado: m.valido,
    }));
    setPreview(itens);
    setStats({
      totalLinhas: result.data?.totalLinhas ?? 0,
      validos: result.data?.validos ?? 0,
      comErro: result.data?.comErro ?? 0,
      novosMateriais: result.data?.novosMateriais ?? 0,
      materiaisExistentes: result.data?.materiaisExistentes ?? 0,
    });

    if (itens.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Planilha vazia",
        detail: "Nenhuma linha encontrada.",
        life: 3000,
      });
    }
  };

  const baixarTemplate = async () => {
    const result = await materialService.baixarTemplate();
    if (!result.success && result.message) toast.current?.show(result.message);
  };

  const atualizarPreview = (uid, campo, valor) => {
    setPreview((prev) =>
      prev.map((it) => (it.uid === uid ? { ...it, [campo]: valor } : it))
    );
  };

  const removerDoPreview = (uid) => {
    setPreview((prev) => prev.filter((it) => it.uid !== uid));
  };

  const marcarTodos = (selecionado) => {
    setPreview((prev) => prev.map((it) => ({ ...it, selecionado })));
  };

  const importarSelecionados = async () => {
    if (!distribuidoraImport) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione a distribuidora antes de importar.",
        life: 3000,
      });
      return;
    }

    const selecionados = preview.filter(
      (it) =>
        it.selecionado &&
        it.descricao?.trim() &&
        it.tamanho != null &&
        Number(it.tamanho) > 0 &&
        it.precoUnitario != null &&
        Number(it.precoUnitario) >= 0
    );

    if (selecionados.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione ao menos um item válido (com preço).",
        life: 3000,
      });
      return;
    }

    setImportando(true);
    const payload = {
      distribuidoraId: distribuidoraImport,
      itens: selecionados.map((it) => ({
        descricao: it.descricao.trim(),
        dimensao: it.dimensao?.trim() || null,
        tamanho: Number(it.tamanho),
        precoUnitario: Number(it.precoUnitario),
        materialMatchId: it.materialMatchId || null,
      })),
    };
    const result = await materialService.importarBatch(payload);
    setImportando(false);

    toast.current?.show(result.message);
    if (result.success) {
      fecharImport();
      fetchMateriais();
    }
  };

  const todosMarcados = useMemo(
    () => preview.length > 0 && preview.every((i) => i.selecionado),
    [preview]
  );

  const abrirPrecos = async (material) => {
    setMaterialSelecionado(material);
    setPrecoDialogOpen(true);
    setNovoPreco({
      distribuidoraId: null,
      precoUnitario: null,
      prazoEntregaDias: null,
      observacao: "",
    });
    await Promise.all([
      carregarPrecosVigentes(material.id),
      carregarDistribuidoras(),
    ]);
  };

  const fecharPrecos = () => {
    setPrecoDialogOpen(false);
    setMaterialSelecionado(null);
    setPrecosVigentes([]);
  };

  const carregarPrecosVigentes = async (materialId) => {
    setCarregandoPrecos(true);
    const result = await precoService.vigentesPorMaterial(materialId);
    setCarregandoPrecos(false);
    if (result.success) setPrecosVigentes(result.data || []);
    else toast.current?.show(result.message);
  };

  const carregarDistribuidoras = async () => {
    const result = await distribuidoraService.getPaginado(0, 200, "");
    if (result.success) {
      const content = result.data?.content || result.data || [];
      setDistribuidorasDisponiveis(content);
    }
  };

  const salvarNovoPreco = async () => {
    if (!novoPreco.distribuidoraId) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione a distribuidora.",
        life: 3000,
      });
      return;
    }
    if (novoPreco.precoUnitario == null || novoPreco.precoUnitario < 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Informe um preço válido.",
        life: 3000,
      });
      return;
    }
    setSalvandoPreco(true);
    const result = await precoService.registrar({
      materialDisponivelId: materialSelecionado.id,
      distribuidoraId: novoPreco.distribuidoraId,
      precoUnitario: novoPreco.precoUnitario,
      prazoEntregaDias: novoPreco.prazoEntregaDias,
      observacao: novoPreco.observacao?.trim() || null,
      origem: "MANUAL",
    });
    setSalvandoPreco(false);
    toast.current?.show(result.message);
    if (result.success) {
      setNovoPreco({
        distribuidoraId: null,
        precoUnitario: null,
        prazoEntregaDias: null,
        observacao: "",
      });
      carregarPrecosVigentes(materialSelecionado.id);
    }
  };

  const abrirHistorico = async (precoVigente) => {
    setHistoricoTitulo(
      `${materialSelecionado?.descricao} - ${precoVigente.distribuidoraNome}`
    );
    setHistoricoDialogOpen(true);
    setCarregandoHistorico(true);
    const result = await precoService.historico(
      materialSelecionado.id,
      precoVigente.distribuidoraId
    );
    setCarregandoHistorico(false);
    if (result.success) setHistoricoDados(result.data || []);
    else toast.current?.show(result.message);
  };

  const fecharHistorico = () => {
    setHistoricoDialogOpen(false);
    setHistoricoDados([]);
    setHistoricoTitulo("");
  };

  const distribuidorasParaSelect = useMemo(() => {
    const jaCadastradas = new Set(precosVigentes.map((p) => p.distribuidoraId));
    return distribuidorasDisponiveis
      .filter((d) => !jaCadastradas.has(d.id))
      .map((d) => ({ label: d.nome, value: d.id }));
  }, [distribuidorasDisponiveis, precosVigentes]);

  const filtrados = useMemo(() => {
    const termo = filter.trim().toLowerCase();
    if (!termo) return materiais;
    return materiais.filter((m) => (m.descricao || "").toLowerCase().includes(termo));
  }, [materiais, filter]);

  return (
    <ContainerPage>
      <GlobalStyle />
      <ConfirmDialog />
      <Toast ref={toast} />

      <TitlePage>Cadastro de Materiais Disponíveis</TitlePage>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <ButtonStyled
          label="Importar Planilha"
          icon="pi pi-file-excel"
          onClick={abrirImport}
        />
      </div>

      <FormSection>
        <FormTitle>
          {editingId ? "Editar Material" : "Novo Material"}
        </FormTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="descricao">Descrição</Label>
            <InputTextStyled
              id="descricao"
              value={form.descricao}
              onChange={(e) => onChange("descricao", e.target.value)}
              placeholder="Ex.: Tubo retangular 30x20"
              className={classNames({ "p-invalid": submitted && formErrors.descricao })}
            />
            {submitted && formErrors.descricao && (
              <ErrorMessage>{formErrors.descricao}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tamanho">Tamanho (metros)</Label>
            <InputNumber
              id="tamanho"
              value={form.tamanho}
              onValueChange={(e) => onChange("tamanho", e.value)}
              min={0}
              minFractionDigits={2}
              maxFractionDigits={4}
              suffix=" m"
              placeholder="Ex.: 9,30"
              inputClassName={classNames({
                "p-invalid": submitted && formErrors.tamanho,
              })}
            />
            {submitted && formErrors.tamanho && (
              <ErrorMessage>{formErrors.tamanho}</ErrorMessage>
            )}
          </FormGroup>

        </FormRow>

        <ButtonContainer>
          {editingId && (
            <ButtonStyled
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={limparForm}
            />
          )}
          <ButtonStyled
            label={editingId ? "Salvar Alterações" : "Adicionar Material"}
            icon={editingId ? "pi pi-check" : "pi pi-plus"}
            loading={salvando}
            onClick={salvar}
          />
        </ButtonContainer>
      </FormSection>

      <FormSection>
        <FormTitle>Materiais Cadastrados</FormTitle>

        <SearchBar>
          <InputTextStyled
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por descrição..."
          />
        </SearchBar>

        <DataTableStyled
          value={filtrados}
          emptyMessage="Nenhum material cadastrado."
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="scroll"
        >
          <Column field="descricao" header="Descrição" sortable />
          <Column
            header="Tamanho"
            body={(row) =>
              row.tamanho != null ? `${formatNumber(row.tamanho, 2)} m` : "-"
            }
            style={{ width: 160 }}
            sortable
            sortField="tamanho"
          />
          <Column
            header="Ações"
            style={{ width: 180 }}
            body={(row) => (
              <ActionCell>
                <IconButton
                  icon="pi pi-dollar"
                  className="p-button-success"
                  tooltip="Preços por distribuidora"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => abrirPrecos(row)}
                />
                <IconButton
                  icon="pi pi-pencil"
                  className="p-button-warning"
                  tooltip="Editar"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => editar(row)}
                />
                <IconButton
                  icon="pi pi-trash"
                  className="p-button-danger"
                  tooltip="Excluir"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => excluir(row.id)}
                />
              </ActionCell>
            )}
          />
        </DataTableStyled>
      </FormSection>

      <Dialog
        header="Importar Preços por Planilha"
        visible={importDialogOpen}
        style={{ width: "92vw", maxWidth: 1250 }}
        modal
        onHide={fecharImport}
        closable
        dismissableMask={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "#e7f3ff",
              border: "1px solid #1A1A2E",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#1A1A2E",
              fontSize: 14,
            }}
          >
            <i className="pi pi-info-circle" style={{ marginRight: 8 }} />
            Os preços importados serão associados à <strong>distribuidora selecionada abaixo</strong>.
            Materiais não cadastrados serão criados automaticamente.
            Colunas: <strong>descricao</strong>, <strong>dimensao</strong>, <strong>tamanho</strong> (m), <strong>preco</strong>.
          </div>

          <FormSection style={{ margin: 0 }}>
            <FormRow>
              <FormGroup>
                <Label>Distribuidora (obrigatório)</Label>
                <Dropdown
                  value={distribuidoraImport}
                  options={distribuidorasDisponiveis.map((d) => ({
                    label: d.nome,
                    value: d.id,
                  }))}
                  onChange={(e) => setDistribuidoraImport(e.value)}
                  placeholder="De qual distribuidora é esta planilha?"
                  filter
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <div
            style={{
              background: "#f8f9fa",
              border: "1px dashed #ced4da",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onArquivoSelecionado}
              style={{ flex: 1, minWidth: 200 }}
            />
            <ButtonStyled
              label="Baixar Template"
              icon="pi pi-download"
              className="p-button-secondary"
              onClick={baixarTemplate}
            />
            <ButtonStyled
              label="Ler Planilha"
              icon="pi pi-search"
              loading={carregandoPreview}
              disabled={!arquivo}
              onClick={lerPlanilha}
            />
          </div>

          {stats && (
            <div
              style={{
                background: "#eef2ff",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#1A1A2E",
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <span>Linhas: <strong>{stats.totalLinhas}</strong></span>
              <span style={{ color: "#1f7a3a" }}>Válidas: <strong>{stats.validos}</strong></span>
              <span style={{ color: "#b3261e" }}>Com erro: <strong>{stats.comErro}</strong></span>
              <span style={{ color: "#1A1A2E" }}>Materiais existentes: <strong>{stats.materiaisExistentes}</strong></span>
              <span style={{ color: "#9c5d00" }}>Novos materiais: <strong>{stats.novosMateriais}</strong></span>
            </div>
          )}

          {preview.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <strong style={{ color: "#1A1A2E" }}>
                  Revise antes de importar (linhas com erro ficam desmarcadas)
                </strong>
                <ButtonStyled
                  label={todosMarcados ? "Desmarcar todos" : "Marcar todos"}
                  icon={todosMarcados ? "pi pi-times" : "pi pi-check"}
                  className="p-button-text"
                  onClick={() => marcarTodos(!todosMarcados)}
                />
              </div>

              <DataTableStyled
                value={preview}
                dataKey="uid"
                emptyMessage="Sem itens."
                responsiveLayout="scroll"
                paginator
                rows={10}
              >
                <Column
                  header=""
                  style={{ width: 50 }}
                  body={(row) => (
                    <Checkbox
                      checked={row.selecionado}
                      onChange={(e) => atualizarPreview(row.uid, "selecionado", e.checked)}
                    />
                  )}
                />
                <Column
                  header="Linha"
                  style={{ width: 70 }}
                  body={(row) => row.linha}
                />
                <Column
                  header="Status"
                  style={{ width: 170 }}
                  body={(row) => {
                    if (!row.valido) return <Tag severity="danger" value={row.erro || "Erro"} />;
                    if (row.statusMatch === "APELIDO_CONHECIDO")
                      return <Tag severity="success" value="APELIDO" />;
                    if (row.statusMatch === "MATERIAL_EXISTENTE")
                      return <Tag severity="info" value="EXISTENTE" />;
                    if (row.statusMatch === "AMBIGUO")
                      return <Tag severity="warning" value="AMBÍGUO" />;
                    if (row.statusMatch === "NOVO_MATERIAL")
                      return <Tag severity="warning" value="NOVO" />;
                    return <Tag severity="success" value="OK" />;
                  }}
                />
                <Column
                  header="Casado com / Sugestões"
                  style={{ width: 320 }}
                  body={(row) => {
                    if (row.statusMatch === "AMBIGUO") {
                      const opts = [
                        ...(row.candidatos || []).map((c) => ({
                          label: `${c.descricao} (${Math.round((c.similaridade || 0) * 100)}%)`,
                          value: c.id,
                        })),
                        { label: "── Criar novo material ──", value: "__novo__" },
                      ];
                      return (
                        <Dropdown
                          value={row.materialMatchId ?? "__novo__"}
                          options={opts}
                          onChange={(e) => {
                            const novoId = e.value === "__novo__" ? null : e.value;
                            const descCasada =
                              (row.candidatos || []).find((c) => c.id === novoId)?.descricao || null;
                            setPreview((prev) =>
                              prev.map((it) =>
                                it.uid === row.uid
                                  ? {
                                      ...it,
                                      materialMatchId: novoId,
                                      materialMatchDescricao: descCasada,
                                      gravarApelido: novoId != null,
                                    }
                                  : it
                              )
                            );
                          }}
                          placeholder="Escolha..."
                          style={{ width: "100%", fontSize: 12 }}
                        />
                      );
                    }
                    if (row.materialMatchDescricao) {
                      return (
                        <span style={{ fontSize: 12, color: "#666" }}>
                          {row.materialMatchDescricao}
                        </span>
                      );
                    }
                    return (
                      <span style={{ fontSize: 12, color: "#9c5d00" }}>
                        (será criado)
                      </span>
                    );
                  }}
                />
                <Column
                  header="Descrição"
                  body={(row) => (
                    <InputText
                      value={row.descricao || ""}
                      onChange={(e) => atualizarPreview(row.uid, "descricao", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  )}
                />
                <Column
                  header="Dimensão"
                  style={{ width: 130 }}
                  body={(row) => (
                    <InputText
                      value={row.dimensao || ""}
                      onChange={(e) => atualizarPreview(row.uid, "dimensao", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  )}
                />
                <Column
                  header="Tamanho (m)"
                  style={{ width: 160 }}
                  body={(row) => (
                    <InputNumber
                      value={row.tamanho != null ? Number(row.tamanho) : null}
                      onValueChange={(e) => atualizarPreview(row.uid, "tamanho", e.value)}
                      min={0}
                      minFractionDigits={2}
                      maxFractionDigits={4}
                      suffix=" m"
                    />
                  )}
                />
                <Column
                  header="Preço (opc.)"
                  style={{ width: 170 }}
                  body={(row) => (
                    <InputNumber
                      value={row.precoUnitario != null ? Number(row.precoUnitario) : null}
                      onValueChange={(e) =>
                        atualizarPreview(row.uid, "precoUnitario", e.value)
                      }
                      mode="currency"
                      currency="BRL"
                      locale="pt-BR"
                      min={0}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
                <Column
                  header=""
                  style={{ width: 60 }}
                  body={(row) => (
                    <IconButton
                      icon="pi pi-trash"
                      className="p-button-danger"
                      tooltip="Remover desta importação"
                      tooltipOptions={{ position: "top" }}
                      onClick={() => removerDoPreview(row.uid)}
                    />
                  )}
                />
              </DataTableStyled>
            </>
          )}

          <ButtonContainer>
            <ButtonStyled
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={fecharImport}
            />
            <ButtonStyled
              label="Importar Selecionados"
              icon="pi pi-check"
              loading={importando}
              onClick={importarSelecionados}
              disabled={preview.length === 0}
            />
          </ButtonContainer>
        </div>
      </Dialog>

      <Dialog
        header={
          materialSelecionado
            ? `Preços por Distribuidora - ${materialSelecionado.descricao}`
            : "Preços por Distribuidora"
        }
        visible={precoDialogOpen}
        style={{ width: "90vw", maxWidth: 1100 }}
        modal
        onHide={fecharPrecos}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormSection style={{ margin: 0 }}>
            <FormTitle>Adicionar / Atualizar Preço</FormTitle>
            <FormRow>
              <FormGroup>
                <Label>Distribuidora</Label>
                <Dropdown
                  value={novoPreco.distribuidoraId}
                  options={distribuidorasParaSelect}
                  onChange={(e) =>
                    setNovoPreco((p) => ({ ...p, distribuidoraId: e.value }))
                  }
                  placeholder="Selecione..."
                  filter
                  emptyMessage="Todas as distribuidoras já têm preço cadastrado"
                />
              </FormGroup>
              <FormGroup>
                <Label>Preço Unitário</Label>
                <InputNumber
                  value={novoPreco.precoUnitario}
                  onValueChange={(e) =>
                    setNovoPreco((p) => ({ ...p, precoUnitario: e.value }))
                  }
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  min={0}
                  placeholder="R$ 0,00"
                />
              </FormGroup>
              <FormGroup>
                <Label>Prazo (dias)</Label>
                <InputNumber
                  value={novoPreco.prazoEntregaDias}
                  onValueChange={(e) =>
                    setNovoPreco((p) => ({ ...p, prazoEntregaDias: e.value }))
                  }
                  min={0}
                  placeholder="Ex.: 3"
                />
              </FormGroup>
              <FormGroup>
                <Label>Observação</Label>
                <InputText
                  value={novoPreco.observacao}
                  onChange={(e) =>
                    setNovoPreco((p) => ({ ...p, observacao: e.target.value }))
                  }
                  placeholder="Opcional"
                />
              </FormGroup>
            </FormRow>
            <ButtonContainer>
              <ButtonStyled
                label="Registrar Preço"
                icon="pi pi-check"
                loading={salvandoPreco}
                onClick={salvarNovoPreco}
              />
            </ButtonContainer>
          </FormSection>

          <FormSection style={{ margin: 0 }}>
            <FormTitle>Preços Vigentes</FormTitle>
            <DataTableStyled
              value={precosVigentes}
              loading={carregandoPrecos}
              emptyMessage="Nenhum preço cadastrado para este material."
              responsiveLayout="scroll"
            >
              <Column field="distribuidoraNome" header="Distribuidora" sortable />
              <Column
                header="Preço"
                style={{ width: 140 }}
                body={(row) => formatMoney(row.precoUnitario)}
                sortable
                sortField="precoUnitario"
              />
              <Column
                header="Prazo (dias)"
                style={{ width: 130 }}
                body={(row) => (row.prazoEntregaDias != null ? row.prazoEntregaDias : "-")}
              />
              <Column field="observacao" header="Observação" />
              <Column
                header="Origem"
                style={{ width: 120 }}
                body={(row) => (
                  <Tag
                    severity={
                      row.origem === "COTACAO"
                        ? "info"
                        : row.origem === "IMPORTACAO"
                        ? "warning"
                        : "success"
                    }
                    value={row.origem}
                  />
                )}
              />
              <Column
                header="Atualizado em"
                style={{ width: 160 }}
                body={(row) =>
                  row.dataInicio
                    ? new Date(row.dataInicio).toLocaleString("pt-BR")
                    : "-"
                }
              />
              <Column
                header=""
                style={{ width: 80 }}
                body={(row) => (
                  <IconButton
                    icon="pi pi-history"
                    className="p-button-info"
                    tooltip="Histórico"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => abrirHistorico(row)}
                  />
                )}
              />
            </DataTableStyled>
          </FormSection>
        </div>
      </Dialog>

      <Dialog
        header={`Histórico de Preço - ${historicoTitulo}`}
        visible={historicoDialogOpen}
        style={{ width: "80vw", maxWidth: 900 }}
        modal
        onHide={fecharHistorico}
      >
        <DataTableStyled
          value={historicoDados}
          loading={carregandoHistorico}
          emptyMessage="Sem histórico."
          responsiveLayout="scroll"
        >
          <Column
            header="Preço"
            body={(row) => formatMoney(row.precoUnitario)}
            style={{ width: 140 }}
          />
          <Column
            header="Início"
            body={(row) =>
              row.dataInicio
                ? new Date(row.dataInicio).toLocaleString("pt-BR")
                : "-"
            }
          />
          <Column
            header="Fim"
            body={(row) =>
              row.dataFim ? (
                new Date(row.dataFim).toLocaleString("pt-BR")
              ) : (
                <Tag severity="success" value="VIGENTE" />
              )
            }
          />
          <Column
            header="Origem"
            body={(row) => (
              <Tag
                severity={
                  row.origem === "COTACAO"
                    ? "info"
                    : row.origem === "IMPORTACAO"
                    ? "warning"
                    : "success"
                }
                value={row.origem}
              />
            )}
            style={{ width: 130 }}
          />
          <Column field="observacao" header="Observação" />
        </DataTableStyled>
      </Dialog>
    </ContainerPage>
  );
};

export default MateriaisDisponiveis;

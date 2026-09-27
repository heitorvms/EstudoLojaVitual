import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { CompraEstoqueService } from "../../services/CompraEstoqueService";
import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import { DistribuidoraService } from "../../services/DistribuidoraService";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  HeaderActions,
  ButtonPrimary,
  ButtonSecondary,
  PanelCard,
  PanelTitle,
  FormGrid,
  ToolbarRow,
  DataTableStyled,
  CostTotal,
} from "../../styles/oficinaLayout";

const emptyItem = () => ({
  materialDisponivelId: null,
  barras: null,
  metros: null,
  quantidadeKg: null,
  valorKg: null,
});

export default function FormularioCompraLote() {
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useRef(null);
  const service = useRef(new CompraEstoqueService()).current;
  const matService = useRef(new MaterialDisponivelService()).current;
  const distService = useRef(new DistribuidoraService()).current;

  const [materiais, setMateriais] = useState([]);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [origemSimulacao, setOrigemSimulacao] = useState(null);
  const [form, setForm] = useState({
    dataCompra: new Date(),
    numeroNota: "",
    observacao: "",
    distribuidoraId: null,
    itens: [],
  });
  const [item, setItem] = useState(emptyItem());

  useEffect(() => {
    (async () => {
      let listaDists = [];
      try {
        const res = await matService.getFunction();
        if (res.success) setMateriais(Array.isArray(res.data) ? res.data : []);
      } catch { /* ignore */ }
      try {
        const dist = await distService.getPaginado(0, 200);
        if (dist.success) {
          listaDists = dist.data.content || [];
          setDistribuidoras(listaDists);
        }
      } catch { /* ignore */ }

      const st = location.state;
      if (!isEdit && (st?.origem === "simulacao" || st?.origem === "cotacao") && Array.isArray(st.itens) && st.itens.length) {
        const distNome = st.itens.find((i) => i.distribuidoraNome)?.distribuidoraNome;
        const distMatch = distNome
          ? listaDists.find((d) => d.nome?.toLowerCase() === distNome.toLowerCase())
          : null;
        const rotuloOrigem = st.origem === "cotacao"
          ? `cotação #${st.cotacaoId}`
          : `simulação #${st.simulacaoId}`;
        setOrigemSimulacao({
          simulacaoId: st.simulacaoId || st.cotacaoId,
          nomeTrabalho: st.nomeTrabalho,
          origem: st.origem,
        });
        setForm((f) => ({
          ...f,
          observacao: st.nomeTrabalho
            ? `Compra gerada da ${rotuloOrigem} — ${st.nomeTrabalho}`
            : `Compra gerada da ${rotuloOrigem}`,
          distribuidoraId: distMatch?.id || null,
          itens: st.itens.map((i) => ({
            materialDisponivelId: i.materialDisponivelId,
            materialLabel: i.materialLabel,
            barras: i.barras,
            metros: i.metros,
            quantidadeKg: i.quantidadeKg,
            valorKg: i.valorKg,
          })),
        }));
        toast.current?.show({
          severity: "info",
          summary: "Itens carregados",
          detail: `${st.itens.length} material(is) da ${st.origem === "cotacao" ? "cotação" : "simulação"}. Confira e salve.`,
          life: 3500,
        });
        window.history.replaceState({}, document.title);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const c = await service.buscarCompra(id);
        if (c.status === "CANCELADA") {
          toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Compra cancelada não pode ser editada", life: 3000 });
          navigate("/compras-lote");
          return;
        }
        setForm({
          dataCompra: c.dataCompra ? new Date(c.dataCompra) : new Date(),
          numeroNota: c.numeroNota || "",
          observacao: c.observacao || "",
          distribuidoraId: c.distribuidora?.id || null,
          itens: (c.itens || []).map((i) => ({
            materialDisponivelId: i.materialDisponivel?.id,
            materialLabel: i.materialDisponivel?.descricao,
            barras: i.barras,
            metros: i.metros,
            quantidadeKg: i.quantidadeKg,
            valorKg: i.valorKg,
            valorTotal: i.valorTotal,
          })),
        });
      } catch {
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Compra não encontrada", life: 3000 });
        navigate("/compras-lote");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const addItem = () => {
    if (!item.materialDisponivelId) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Selecione o material", life: 2500 });
      return;
    }
    if (!item.barras && !item.metros && !item.quantidadeKg) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Informe barras, metros ou kg", life: 2500 });
      return;
    }
    const mat = materiais.find((m) => m.id === item.materialDisponivelId);
    setForm((f) => ({
      ...f,
      itens: [
        ...f.itens,
        {
          ...item,
          materialLabel: mat?.descricao || `#${item.materialDisponivelId}`,
          valorTotal:
            item.valorKg && item.quantidadeKg
              ? Number(item.valorKg) * Number(item.quantidadeKg)
              : null,
        },
      ],
    }));
    setItem(emptyItem());
  };

  const removeItem = (idx) => {
    setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }));
  };

  const totalGeral = form.itens.reduce((acc, i) => {
    if (i.valorTotal != null) return acc + Number(i.valorTotal);
    if (i.valorKg && i.quantidadeKg) return acc + Number(i.valorKg) * Number(i.quantidadeKg);
    return acc;
  }, 0);

  const salvar = async () => {
    if (!form.itens.length) {
      toast.current?.show({ severity: "warn", summary: "Atenção", detail: "Adicione ao menos um item", life: 2500 });
      return;
    }
    setSaving(true);
    const body = {
      dataCompra: form.dataCompra,
      numeroNota: form.numeroNota,
      observacao: form.observacao,
      distribuidora: form.distribuidoraId ? { id: form.distribuidoraId } : null,
      itens: form.itens.map((i) => ({
        materialDisponivel: { id: i.materialDisponivelId },
        barras: i.barras || 0,
        metros: i.metros || 0,
        quantidadeKg: i.quantidadeKg || 0,
        valorKg: i.valorKg || 0,
      })),
    };
    try {
      if (isEdit) await service.atualizarCompra(id, body);
      else await service.criarCompra(body);
      toast.current?.show({ severity: "success", summary: "OK", detail: isEdit ? "Compra atualizada" : "Compra registrada", life: 2500 });
      navigate("/compras-lote");
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || "Falha ao salvar",
        life: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell className="oficina-page">
        <ContainerPage><p style={{ color: "#666" }}>Carregando...</p></ContainerPage>
      </PageShell>
    );
  }

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <PageHeader>
          <HeaderText>
            <h1>{isEdit ? `Editar compra #${id}` : "Nova compra de material"}</h1>
            <p>Informe nota, fornecedor e os itens do lote</p>
          </HeaderText>
          <HeaderActions>
            <ButtonSecondary label="Voltar" icon="pi pi-arrow-left" onClick={() => navigate("/compras-lote")} />
          </HeaderActions>
        </PageHeader>

        {origemSimulacao && (
          <PanelCard>
            <Tag
              value={
                origemSimulacao.origem === "cotacao"
                  ? `Cotação #${origemSimulacao.simulacaoId}`
                  : `Simulação #${origemSimulacao.simulacaoId}`
              }
              severity="info"
            />
            <span style={{ marginLeft: 10, color: "#444", fontSize: 14 }}>
              {origemSimulacao.nomeTrabalho || "Itens pré-preenchidos — confira barras/metros e R$/kg antes de salvar."}
            </span>
          </PanelCard>
        )}

        <PanelCard>
          <PanelTitle>Dados da compra</PanelTitle>
          <FormGrid>
            <div>
              <label>Data da compra</label>
              <Calendar
                value={form.dataCompra}
                onChange={(e) => setForm({ ...form, dataCompra: e.value })}
                dateFormat="dd/mm/yy"
                showIcon
              />
            </div>
            <div>
              <label>Número da nota</label>
              <InputText
                value={form.numeroNota}
                onChange={(e) => setForm({ ...form, numeroNota: e.target.value })}
                placeholder="Ex: NF-12345"
              />
            </div>
            <div>
              <label>Distribuidora</label>
              <Dropdown
                placeholder="Selecione (opcional)"
                options={distribuidoras.map((d) => ({ label: d.nome, value: d.id }))}
                value={form.distribuidoraId}
                onChange={(e) => setForm({ ...form, distribuidoraId: e.value })}
                showClear
                filter
              />
            </div>
            <div>
              <label>Observação</label>
              <InputText
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                placeholder="Opcional"
              />
            </div>
          </FormGrid>
        </PanelCard>

        <PanelCard>
          <PanelTitle>Itens do lote</PanelTitle>
          <FormGrid>
            <div>
              <label>Material</label>
              <Dropdown
                placeholder="Selecione"
                filter
                options={materiais.map((m) => ({ label: m.descricao, value: m.id }))}
                value={item.materialDisponivelId}
                onChange={(e) => setItem({ ...item, materialDisponivelId: e.value })}
              />
            </div>
            <div>
              <label>Barras</label>
              <InputNumber value={item.barras} onValueChange={(e) => setItem({ ...item, barras: e.value })} min={0} />
            </div>
            <div>
              <label>Metros</label>
              <InputNumber value={item.metros} onValueChange={(e) => setItem({ ...item, metros: e.value })} min={0} maxFractionDigits={3} />
            </div>
            <div>
              <label>Kg</label>
              <InputNumber value={item.quantidadeKg} onValueChange={(e) => setItem({ ...item, quantidadeKg: e.value })} min={0} maxFractionDigits={3} />
            </div>
            <div>
              <label>R$ / kg</label>
              <InputNumber
                value={item.valorKg}
                onValueChange={(e) => setItem({ ...item, valorKg: e.value })}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                min={0}
              />
            </div>
          </FormGrid>
          <ToolbarRow>
            <ButtonSecondary label="Incluir item" icon="pi pi-plus" onClick={addItem} />
          </ToolbarRow>

          <DataTableStyled value={form.itens} emptyMessage="Nenhum item incluído">
            <Column header="Material" body={(r) => r.materialLabel || "-"} />
            <Column field="barras" header="Barras" body={(r) => r.barras ?? "-"} />
            <Column field="metros" header="Metros" body={(r) => (r.metros != null ? Number(r.metros).toFixed(3) : "-")} />
            <Column field="quantidadeKg" header="Kg" body={(r) => (r.quantidadeKg != null ? Number(r.quantidadeKg).toFixed(3) : "-")} />
            <Column field="valorKg" header="R$/kg" body={(r) => (r.valorKg != null ? Number(r.valorKg).toFixed(2) : "-")} />
            <Column
              header=""
              style={{ width: 70 }}
              body={(_, { rowIndex }) => (
                <ButtonSecondary
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-text p-button-danger"
                  onClick={() => removeItem(rowIndex)}
                />
              )}
            />
          </DataTableStyled>

          <CostTotal>
            <strong>Total estimado</strong>
            <span>R$ {totalGeral.toFixed(2)}</span>
          </CostTotal>

          <HeaderActions style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <ButtonPrimary
              label={isEdit ? "Salvar alterações" : "Registrar compra"}
              icon="pi pi-save"
              loading={saving}
              onClick={salvar}
            />
            <ButtonSecondary label="Cancelar" onClick={() => navigate("/compras-lote")} />
          </HeaderActions>
        </PanelCard>
      </ContainerPage>
    </PageShell>
  );
}

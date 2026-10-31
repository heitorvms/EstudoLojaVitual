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
import { MaterialPrecoService } from "../../services/MaterialPrecoService";
import { moeda } from "../../utils/moeda";
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

const emptyItem = (distribuidoraId = null) => ({
  materialDisponivelId: null,
  distribuidoraId,
  barras: null,
  valorBarra: null,
});

const totalItem = (i) => Number(i.barras || 0) * Number(i.valorBarra || 0);

const dataLocal = (valor) =>
  typeof valor === "string" && valor.length === 10 ? new Date(`${valor}T00:00:00`) : new Date(valor);

const distribuidoraEmComum = (itens) => {
  const ids = [...new Set(itens.map((i) => i.distribuidoraId))];
  return ids.length === 1 ? ids[0] : null;
};

export default function FormularioCompraLote() {
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useRef(null);
  const service = useRef(new CompraEstoqueService()).current;
  const matService = useRef(new MaterialDisponivelService()).current;
  const distService = useRef(new DistribuidoraService()).current;
  const precoService = useRef(new MaterialPrecoService()).current;
  const precosVigentesCache = useRef(new Map());

  const [materiais, setMateriais] = useState([]);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [origemSimulacao, setOrigemSimulacao] = useState(null);
  const [form, setForm] = useState({
    dataCompra: new Date(),
    numeroNota: "",
    observacao: "",
    cotacaoId: null,
    itens: [],
  });
  const [item, setItem] = useState(emptyItem());

  const precosVigentes = (distribuidoraId) => {
    const cache = precosVigentesCache.current;
    if (!cache.has(distribuidoraId)) {
      cache.set(
        distribuidoraId,
        precoService.vigentesPorDistribuidora(distribuidoraId).then((res) =>
          new Map((res.success ? res.data : []).map((p) => [p.materialDisponivelId, Number(p.precoUnitario)]))
        )
      );
    }
    return cache.get(distribuidoraId);
  };

  /** Prioriza o preço orçado na cotação; sem ele, usa o preço vigente da distribuidora. */
  const precoSugerido = async (materialDisponivelId, distribuidoraId, precosCotacao = []) => {
    if (!materialDisponivelId || !distribuidoraId) return null;
    const daCotacao = precosCotacao.find((p) => p.distribuidoraId === distribuidoraId);
    if (daCotacao) return daCotacao.preco;
    return (await precosVigentes(distribuidoraId)).get(materialDisponivelId) ?? null;
  };

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
        const resolverDistribuidoraId = (i) =>
          i.distribuidoraId ??
          (i.distribuidoraNome
            ? listaDists.find((d) => d.nome?.toLowerCase() === i.distribuidoraNome.toLowerCase())?.id
            : null) ??
          null;
        const itensOrigem = st.itens.map((i) => ({
          materialDisponivelId: i.materialDisponivelId,
          materialLabel: i.materialLabel,
          barras: i.barras,
          valorBarra: i.valorBarra,
          distribuidoraId: resolverDistribuidoraId(i),
          precosCotacao: i.precosCotacao || [],
        }));
        const semDistribuidora = itensOrigem.filter((i) => !i.distribuidoraId).length;
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
          cotacaoId: st.origem === "cotacao" ? st.cotacaoId : null,
          itens: itensOrigem,
        }));
        setItem(emptyItem(distribuidoraEmComum(itensOrigem)));
        toast.current?.show({
          severity: semDistribuidora ? "warn" : "info",
          summary: "Itens carregados",
          detail: semDistribuidora
            ? `${semDistribuidora} item(ns) sem distribuidora definida. Selecione antes de salvar.`
            : `${st.itens.length} material(is) da ${st.origem === "cotacao" ? "cotação" : "simulação"} com a distribuidora escolhida. Confira e salve.`,
          life: 4000,
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
        const itensCompra = (c.itens || []).map((i) => ({
          materialDisponivelId: i.materialDisponivel?.id,
          materialLabel: i.materialDisponivel?.descricao,
          barras: i.barras,
          valorBarra: i.valorBarra,
          distribuidoraId: i.distribuidora?.id ?? c.distribuidora?.id ?? null,
        }));
        setForm({
          dataCompra: c.dataCompra ? dataLocal(c.dataCompra) : new Date(),
          numeroNota: c.numeroNota || "",
          observacao: c.observacao || "",
          cotacaoId: c.cotacaoId ?? null,
          itens: itensCompra,
        });
        setItem(emptyItem(distribuidoraEmComum(itensCompra)));
      } catch {
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Compra não encontrada", life: 3000 });
        navigate("/compras-lote");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const avisar = (detail) =>
    toast.current?.show({ severity: "warn", summary: "Atenção", detail, life: 3000 });

  const atualizarItemNovo = async (patch) => {
    const proximo = { ...item, ...patch };
    setItem(proximo);
    const valorBarra = await precoSugerido(proximo.materialDisponivelId, proximo.distribuidoraId);
    if (valorBarra != null) setItem((it) => ({ ...it, valorBarra }));
  };

  const addItem = () => {
    if (!item.materialDisponivelId) return avisar("Selecione o material");
    if (!item.distribuidoraId) return avisar("Selecione a distribuidora");
    if (!item.barras) return avisar("Informe a quantidade de barras");
    if (!(Number(item.valorBarra) > 0)) return avisar("Informe o valor por barra");
    const mat = materiais.find((m) => m.id === item.materialDisponivelId);
    setForm((f) => ({
      ...f,
      itens: [...f.itens, { ...item, materialLabel: mat?.descricao || `#${item.materialDisponivelId}` }],
    }));
    setItem(emptyItem(item.distribuidoraId));
  };

  const atualizarItem = (idx, patch) => {
    setForm((f) => ({ ...f, itens: f.itens.map((i, n) => (n === idx ? { ...i, ...patch } : i)) }));
  };

  const trocarDistribuidoraItem = async (idx, distribuidoraId) => {
    const alvo = form.itens[idx];
    const valorBarra = await precoSugerido(alvo.materialDisponivelId, distribuidoraId, alvo.precosCotacao);
    atualizarItem(idx, { distribuidoraId, valorBarra });
  };

  const aplicarDistribuidoraEmTodos = async (distribuidoraId) => {
    const itens = await Promise.all(
      form.itens.map(async (i) => ({
        ...i,
        distribuidoraId,
        valorBarra: await precoSugerido(i.materialDisponivelId, distribuidoraId, i.precosCotacao),
      }))
    );
    setForm((f) => ({ ...f, itens }));
    atualizarItemNovo({ distribuidoraId });
  };

  const removeItem = (idx) => {
    setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }));
  };

  const opcoesDistribuidora = distribuidoras.map((d) => ({ label: d.nome, value: d.id }));
  const distribuidoraGeral = distribuidoraEmComum(form.itens);
  const distribuidorasMistas = form.itens.length > 0 && distribuidoraGeral == null
    && form.itens.some((i) => i.distribuidoraId);
  const totalGeral = form.itens.reduce((acc, i) => acc + totalItem(i), 0);

  const salvar = async () => {
    if (!form.itens.length) return avisar("Adicione ao menos um item");
    const semDistribuidora = form.itens.find((i) => !i.distribuidoraId);
    if (semDistribuidora) return avisar(`Selecione a distribuidora de ${semDistribuidora.materialLabel}`);
    const semValor = form.itens.find((i) => !(Number(i.valorBarra) > 0));
    if (semValor) return avisar(`Informe o valor por barra de ${semValor.materialLabel}`);

    setSaving(true);
    const body = {
      dataCompra: form.dataCompra,
      numeroNota: form.numeroNota,
      observacao: form.observacao,
      cotacaoId: form.cotacaoId,
      itens: form.itens.map((i) => ({
        materialDisponivel: { id: i.materialDisponivelId },
        distribuidora: { id: i.distribuidoraId },
        barras: i.barras || 0,
        valorBarra: i.valorBarra,
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
              {origemSimulacao.nomeTrabalho || "Itens pré-preenchidos — confira barras e R$/barra antes de salvar."}
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
              <label>Distribuidora *</label>
              <Dropdown
                placeholder={distribuidorasMistas ? "Várias — definida por item" : "Selecione"}
                options={opcoesDistribuidora}
                value={distribuidorasMistas ? null : distribuidoraGeral ?? item.distribuidoraId}
                onChange={(e) => aplicarDistribuidoraEmTodos(e.value)}
                filter
              />
              <small style={{ color: "#666" }}>Ao trocar aqui, aplica a todos os itens.</small>
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
                onChange={(e) => atualizarItemNovo({ materialDisponivelId: e.value })}
              />
            </div>
            <div>
              <label>Distribuidora</label>
              <Dropdown
                placeholder="Selecione"
                filter
                options={opcoesDistribuidora}
                value={item.distribuidoraId}
                onChange={(e) => atualizarItemNovo({ distribuidoraId: e.value })}
              />
            </div>
            <div>
              <label>Barras</label>
              <InputNumber value={item.barras} onValueChange={(e) => setItem({ ...item, barras: e.value })} min={0} />
            </div>
            <div>
              <label>R$ / barra</label>
              <InputNumber
                value={item.valorBarra}
                onValueChange={(e) => setItem({ ...item, valorBarra: e.value })}
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
            <Column
              header="Distribuidora"
              style={{ minWidth: 200 }}
              body={(r, { rowIndex }) => (
                <Dropdown
                  placeholder="Selecione"
                  options={opcoesDistribuidora}
                  value={r.distribuidoraId}
                  onChange={(e) => trocarDistribuidoraItem(rowIndex, e.value)}
                  className={r.distribuidoraId ? undefined : "p-invalid"}
                  style={{ width: "100%" }}
                />
              )}
            />
            <Column field="barras" header="Barras" body={(r) => r.barras ?? "-"} />
            <Column
              header="R$/barra"
              style={{ minWidth: 150 }}
              body={(r, { rowIndex }) => (
                <InputNumber
                  value={r.valorBarra}
                  onValueChange={(e) => atualizarItem(rowIndex, { valorBarra: e.value })}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  min={0}
                  className={Number(r.valorBarra) > 0 ? undefined : "p-invalid"}
                  inputStyle={{ width: "100%" }}
                />
              )}
            />
            <Column header="Total" body={(r) => moeda(totalItem(r))} />
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
            <span>{moeda(totalGeral)}</span>
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

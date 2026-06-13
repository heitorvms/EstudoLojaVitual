import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Tooltip } from "primereact/tooltip";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { FinanceiroService } from "../../services/FinanceiroService";
import { LoginService } from "../../services/LoginService";
import {
  FinanceiroGlobalStyle,
  ContainerPage,
  PageHeader,
  HeaderText,
  HeaderActions,
  ResumoGrid,
  ResumoCard,
  PanelCard,
  PanelTitle,
  FilterRow,
  FilterField,
  TableCard,
  DataTableStyled,
  TipoBadge,
  MoneyCell,
  ActionsWrap,
  DialogForm,
  MessagePreview,
  HistoricoList,
  LoteList,
  EmptyHint,
} from "./styled";

const TIPOS = [
  { label: "Todos os tipos", value: null },
  { label: "A receber", value: "RECEBER" },
  { label: "A pagar", value: "PAGAR" },
];

const STATUS_OPTS = [
  { label: "Todos os status", value: null },
  { label: "Pendente", value: "PENDENTE" },
  { label: "Parcial", value: "PARCIAL" },
  { label: "Vencida", value: "VENCIDA" },
  { label: "Paga", value: "PAGA" },
  { label: "Cancelada", value: "CANCELADA" },
];

const FORMAS = [
  { label: "À vista", value: "A_VISTA" },
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "DINHEIRO" },
  { label: "Cartão crédito", value: "CARTAO_CREDITO" },
  { label: "Cartão débito", value: "CARTAO_DEBITO" },
  { label: "Boleto", value: "BOLETO" },
  { label: "Transferência", value: "TRANSFERENCIA" },
  { label: "Outro", value: "OUTRO" },
];

const STATUS_LABEL = {
  PENDENTE: "Pendente",
  PARCIAL: "Parcial",
  VENCIDA: "Vencida",
  PAGA: "Paga",
  CANCELADA: "Cancelada",
};

const formatMoney = (v) =>
  v == null ? "-" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (v) => (v ? new Date(v).toLocaleDateString("pt-BR") : "-");

const statusSeverity = (s) => {
  if (s === "PAGA") return "success";
  if (s === "PENDENTE") return "warning";
  if (s === "PARCIAL") return "info";
  if (s === "VENCIDA") return "danger";
  if (s === "CANCELADA") return "secondary";
  return null;
};

const Financeiro = () => {
  const toast = useRef(null);
  const service = useMemo(() => new FinanceiroService(), []);
  const loginService = useMemo(() => new LoginService(), []);
  const [contas, setContas] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [tipo, setTipo] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [baixaDialog, setBaixaDialog] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [valorPago, setValorPago] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("A_VISTA");
  const [dataPagamento, setDataPagamento] = useState(new Date());
  const [salvando, setSalvando] = useState(false);
  const [waDialog, setWaDialog] = useState(false);
  const [waPreview, setWaPreview] = useState(null);
  const [waLoading, setWaLoading] = useState(false);
  const [resumo, setResumo] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [historicoDialog, setHistoricoDialog] = useState(false);
  const [loteDialog, setLoteDialog] = useState(false);
  const [lotePreviews, setLotePreviews] = useState([]);

  const carregarResumo = useCallback(async () => {
    try {
      setResumo(await service.obterResumo());
    } catch {
      setResumo(null);
    }
  }, [service]);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.listar({ tipo, status, page, size });
      setContas(data.content || []);
      setTotal(data.totalElements ?? 0);
      await carregarResumo();
    } catch (e) {
      if (e.response?.status === 401) {
        toast.current?.show({
          severity: "warn",
          summary: "Sessão expirada",
          detail: "Faça login novamente.",
          life: 4000,
        });
        loginService.sair();
        return;
      }
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || "Falha ao carregar contas",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [service, tipo, status, page, size, carregarResumo, loginService]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirBaixa = (row) => {
    setContaSelecionada(row);
    setValorPago(Number(row.valorPendente ?? row.valor));
    setFormaPagamento(row.formaPagamento || "A_VISTA");
    setDataPagamento(new Date());
    setBaixaDialog(true);
  };

  const confirmarBaixa = async () => {
    if (!contaSelecionada) return;
    setSalvando(true);
    try {
      await service.registrarBaixa(contaSelecionada.id, {
        valorPago,
        formaPagamento,
        dataPagamento,
      });
      toast.current?.show({ severity: "success", summary: "Baixa registrada", life: 3000 });
      setBaixaDialog(false);
      carregar();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || e.message,
        life: 4000,
      });
    } finally {
      setSalvando(false);
    }
  };

  const abrirHistorico = async (row) => {
    try {
      setHistorico(await service.historicoCobranca(row.id));
      setHistoricoDialog(true);
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao carregar histórico", life: 3000 });
    }
  };

  const abrirLoteVencidas = async () => {
    setWaLoading(true);
    try {
      setLotePreviews((await service.previewsVencidas()) || []);
      setLoteDialog(true);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || e.message,
        life: 4000,
      });
    } finally {
      setWaLoading(false);
    }
  };

  const registrarLoteHistorico = async () => {
    setWaLoading(true);
    try {
      await service.registrarLoteVencidas();
      toast.current?.show({ severity: "success", summary: "Lote registrado no histórico", life: 3000 });
      setLoteDialog(false);
      carregar();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || e.message,
        life: 4000,
      });
    } finally {
      setWaLoading(false);
    }
  };

  const abrirWhatsapp = async (row) => {
    setWaLoading(true);
    try {
      setWaPreview(await service.previewWhatsappCobranca(row.id));
      setWaDialog(true);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || e.message,
        life: 4000,
      });
    } finally {
      setWaLoading(false);
    }
  };

  const abrirWhatsappLink = async () => {
    if (!waPreview?.contaId) return;
    try {
      await service.registrarCobranca(waPreview.contaId, "ABERTURA_WHATSAPP");
    } catch {
      /* opcional */
    }
    if (waPreview?.linkWhatsapp) window.open(waPreview.linkWhatsapp, "_blank");
  };

  const copiarMensagem = () => {
    if (waPreview?.mensagem) {
      navigator.clipboard.writeText(waPreview.mensagem);
      toast.current?.show({ severity: "info", summary: "Mensagem copiada", life: 2000 });
    }
  };

  const tipoBody = (r) => (
    <TipoBadge $receber={r.tipo === "RECEBER"}>
      <i className={r.tipo === "RECEBER" ? "pi pi-arrow-down-left" : "pi pi-arrow-up-right"} />
      {r.tipo === "RECEBER" ? "A receber" : "A pagar"}
    </TipoBadge>
  );

  const statusBody = (r) => (
    <Tag value={STATUS_LABEL[r.status] || r.status} severity={statusSeverity(r.status)} rounded />
  );

  const parcelaBody = (r) =>
    r.totalParcelas > 1 ? (
      <span style={{ fontWeight: 600, color: "#4a00e0" }}>
        {r.numeroParcela}/{r.totalParcelas}
      </span>
    ) : (
      <span style={{ color: "#cbd5e1" }}>—</span>
    );

  const acoesBody = (row) => {
    if (row.status === "PAGA" || row.status === "CANCELADA") {
      return <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</span>;
    }
    return (
      <ActionsWrap>
        <Button
          icon="pi pi-check"
          rounded
          outlined
          severity="help"
          size="small"
          data-pr-tooltip="Registrar baixa"
          onClick={() => abrirBaixa(row)}
        />
        {row.tipo === "RECEBER" && (
          <>
            <Button
              icon="pi pi-whatsapp"
              rounded
              outlined
              severity="success"
              size="small"
              data-pr-tooltip="Cobrar via WhatsApp"
              onClick={() => abrirWhatsapp(row)}
            />
            <Button
              icon="pi pi-history"
              rounded
              text
              severity="secondary"
              size="small"
              data-pr-tooltip="Histórico"
              onClick={() => abrirHistorico(row)}
            />
          </>
        )}
      </ActionsWrap>
    );
  };

  return (
    <ContainerPage className="financeiro-page">
      <FinanceiroGlobalStyle />
      <Tooltip target="[data-pr-tooltip]" />
      <Toast ref={toast} />

      <PageHeader>
        <HeaderText>
          <h1>Financeiro</h1>
          <p>Controle de contas a receber e a pagar geradas pelos orçamentos, com cobrança e baixas.</p>
        </HeaderText>
        <HeaderActions>
          <Button
            icon="pi pi-refresh"
            label="Atualizar"
            outlined
            onClick={carregar}
            loading={loading}
          />
          <Button
            icon="pi pi-whatsapp"
            label="Cobrança em lote"
            severity="warning"
            loading={waLoading}
            onClick={abrirLoteVencidas}
          />
        </HeaderActions>
      </PageHeader>

      {resumo && (
        <ResumoGrid>
          <ResumoCard $accent="#10b981" $iconBg="rgba(16, 185, 129, 0.12)">
            <div className="icon-wrap">
              <i className="pi pi-wallet" />
            </div>
            <div className="meta">
              <strong>A receber</strong>
              <span>{formatMoney(resumo.totalReceberPendente)}</span>
              <small>Pendente de clientes</small>
            </div>
          </ResumoCard>
          <ResumoCard $accent="#f59e0b" $iconBg="rgba(245, 158, 11, 0.12)">
            <div className="icon-wrap">
              <i className="pi pi-credit-card" />
            </div>
            <div className="meta">
              <strong>A pagar</strong>
              <span>{formatMoney(resumo.totalPagarPendente)}</span>
              <small>Custos e fornecedores</small>
            </div>
          </ResumoCard>
          <ResumoCard $accent="#ef4444" $iconBg="rgba(239, 68, 68, 0.12)">
            <div className="icon-wrap">
              <i className="pi pi-exclamation-triangle" />
            </div>
            <div className="meta">
              <strong>Vencido</strong>
              <span>{formatMoney(resumo.totalVencidoReceber)}</span>
              <small>Recebimentos em atraso</small>
            </div>
          </ResumoCard>
          <ResumoCard $accent="#4a00e0" $iconBg="rgba(74, 0, 224, 0.1)">
            <div className="icon-wrap">
              <i className="pi pi-calendar-times" />
            </div>
            <div className="meta">
              <strong>Vencidas</strong>
              <span>{resumo.quantidadeContasVencidas}</span>
              <small>{resumo.quantidadeContasPendentes} contas em aberto</small>
            </div>
          </ResumoCard>
        </ResumoGrid>
      )}

      <PanelCard>
        <PanelTitle>
          <i className="pi pi-filter" /> Filtros
        </PanelTitle>
        <FilterRow>
          <FilterField>
            <label>Tipo</label>
            <Dropdown
              value={tipo}
              options={TIPOS}
              onChange={(e) => {
                setTipo(e.value);
                setPage(0);
              }}
              placeholder="Tipo"
            />
          </FilterField>
          <FilterField>
            <label>Status</label>
            <Dropdown
              value={status}
              options={STATUS_OPTS}
              onChange={(e) => {
                setStatus(e.value);
                setPage(0);
              }}
              placeholder="Status"
            />
          </FilterField>
        </FilterRow>
      </PanelCard>

      <TableCard>
        <div className="table-toolbar">
          <div>
            <h3>Contas financeiras</h3>
            <span>{total} registro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="table-inner">
          <DataTableStyled
            value={contas}
            loading={loading}
            paginator
            rows={size}
            totalRecords={total}
            lazy
            first={page * size}
            onPage={(e) => setPage(e.page)}
            emptyMessage="Nenhuma conta encontrada. Gere o financeiro em uma cotação."
            rowHover
            stripedRows
            size="small"
          >
            <Column header="Tipo" body={tipoBody} style={{ width: "120px" }} />
            <Column header="Status" body={statusBody} style={{ width: "110px" }} />
            <Column header="Parcela" body={parcelaBody} style={{ width: "80px" }} />
            <Column field="descricao" header="Descrição" style={{ minWidth: "200px" }} />
            <Column
              field="cotacaoId"
              header="Orç."
              body={(r) => (
                <span style={{ fontWeight: 600, color: "#4a00e0" }}>#{r.cotacaoId}</span>
              )}
              style={{ width: "72px" }}
            />
            <Column field="clienteNomeSnapshot" header="Cliente" style={{ minWidth: "140px" }} />
            <Column
              header="Valor"
              body={(r) => <MoneyCell $highlight>{formatMoney(r.valor)}</MoneyCell>}
              style={{ width: "120px" }}
            />
            <Column
              header="Pendente"
              body={(r) => (
                <MoneyCell $highlight={r.valorPendente > 0}>{formatMoney(r.valorPendente)}</MoneyCell>
              )}
              style={{ width: "120px" }}
            />
            <Column
              header="Vencimento"
              body={(r) => formatDate(r.dataVencimento)}
              style={{ width: "105px" }}
            />
            <Column header="" body={acoesBody} style={{ width: "130px" }} />
          </DataTableStyled>
        </div>
      </TableCard>

      <Dialog
        header="Cobrança WhatsApp"
        visible={waDialog}
        style={{ width: "min(520px, 95vw)" }}
        onHide={() => setWaDialog(false)}
        draggable={false}
        footer={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button label="Copiar texto" icon="pi pi-copy" outlined onClick={copiarMensagem} />
            {waPreview?.linkWhatsapp && (
              <Button
                label="Abrir WhatsApp"
                icon="pi pi-whatsapp"
                severity="success"
                onClick={abrirWhatsappLink}
              />
            )}
          </div>
        }
      >
        <MessagePreview>{waPreview?.mensagem}</MessagePreview>
        {!waPreview?.linkWhatsapp && (
          <EmptyHint style={{ padding: "1rem 0 0", fontSize: "0.85rem" }}>
            Telefone inválido — ajuste na cotação ou copie a mensagem manualmente.
          </EmptyHint>
        )}
      </Dialog>

      <Dialog
        header="Histórico de cobranças"
        visible={historicoDialog}
        style={{ width: "min(480px, 95vw)" }}
        onHide={() => setHistoricoDialog(false)}
        draggable={false}
      >
        {historico.length === 0 ? (
          <EmptyHint>Nenhum disparo registrado para esta conta.</EmptyHint>
        ) : (
          <HistoricoList>
            {historico.map((h) => (
              <li key={h.id}>
                <span className="dot" />
                <div className="content">
                  <strong>{new Date(h.dataDisparo).toLocaleString("pt-BR")}</strong>
                  <span>{h.tipo?.replace(/_/g, " ")}</span>
                </div>
              </li>
            ))}
          </HistoricoList>
        )}
      </Dialog>

      <Dialog
        header="Contas vencidas"
        visible={loteDialog}
        style={{ width: "min(560px, 95vw)" }}
        onHide={() => setLoteDialog(false)}
        draggable={false}
        footer={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button label="Fechar" outlined onClick={() => setLoteDialog(false)} />
            <Button
              label="Registrar no histórico"
              icon="pi pi-save"
              loading={waLoading}
              onClick={registrarLoteHistorico}
            />
          </div>
        }
      >
        {lotePreviews.length === 0 ? (
          <EmptyHint>Nenhuma conta vencida a receber no momento.</EmptyHint>
        ) : (
          <LoteList>
            {lotePreviews.map((p) => (
              <li key={p.contaId}>
                <span>
                  <strong>#{p.contaId}</strong> — {p.telefone || "sem telefone"}
                </span>
                {p.linkWhatsapp && (
                  <Button
                    icon="pi pi-whatsapp"
                    rounded
                    text
                    severity="success"
                    onClick={() => window.open(p.linkWhatsapp, "_blank")}
                  />
                )}
              </li>
            ))}
          </LoteList>
        )}
      </Dialog>

      <Dialog
        header="Registrar baixa"
        visible={baixaDialog}
        style={{ width: "min(420px, 95vw)" }}
        onHide={() => setBaixaDialog(false)}
        draggable={false}
        footer={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button label="Cancelar" outlined onClick={() => setBaixaDialog(false)} />
            <Button label="Confirmar baixa" icon="pi pi-check" loading={salvando} onClick={confirmarBaixa} />
          </div>
        }
      >
        <DialogForm>
          <p className="conta-ref">{contaSelecionada?.descricao}</p>
          <div className="p-field">
            <label>Valor pago</label>
            <InputNumber
              value={valorPago}
              onValueChange={(e) => setValorPago(e.value)}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label>Forma de pagamento</label>
            <Dropdown
              value={formaPagamento}
              options={FORMAS}
              onChange={(e) => setFormaPagamento(e.value)}
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label>Data do pagamento</label>
            <Calendar
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.value)}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
            />
          </div>
        </DialogForm>
      </Dialog>
    </ContainerPage>
  );
};

export default Financeiro;

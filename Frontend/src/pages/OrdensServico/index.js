import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { OrdemServicoService } from "../../services/OrdemServicoService";
import { FuncionarioOficinaService } from "../../services/FuncionarioOficinaService";
import LancamentoHorasForm, { novoLancamento, lancamentoValido } from "./LancamentoHorasForm";
import CancelarOsDialog from "./CancelarOsDialog";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  PanelCard,
  DataTableStyled,
  ActionBar,
  IconActionButton,
  ButtonPrimary,
  ButtonSecondary,
  FooterActions,
} from "../../styles/oficinaLayout";
import { statusLabel, statusSeverity } from "./statusOrdemServico";

const TAMANHO_PAGINA = 10;

const pagamentoTag = (os, pago) => {
  if (!os.possuiFinanceiro) return <Tag value="Sem financeiro" severity="secondary" />;
  return <Tag value={pago ? "Pago" : "Pendente"} severity={pago ? "success" : "warning"} />;
};

const formatarData = (data) => (data ? new Date(data).toLocaleDateString("pt-BR") : "-");

export default function OrdensServico({ setCustomContent }) {
  const toast = useRef(null);
  const navigate = useNavigate();
  const service = useRef(new OrdemServicoService()).current;
  const funcService = useRef(new FuncionarioOficinaService()).current;
  const [funcionarios, setFuncionarios] = useState([]);
  const [lancamento, setLancamento] = useState(null);
  const [salvandoHoras, setSalvandoHoras] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [dialogCancelar, setDialogCancelar] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selecionada, setSelecionada] = useState(null);

  const load = useCallback(async (p, termo) => {
    setLoading(true);
    const res = await service.listar(p, TAMANHO_PAGINA, termo);
    setLoading(false);
    if (res.success) {
      setRows(res.data.content || []);
      setTotal(res.data.totalElements || 0);
      setPage(p);
      setSelecionada((atual) => (atual ? (res.data.content || []).find((r) => r.id === atual.id) || null : null));
    } else {
      toast.current?.show(res.message);
    }
  }, [service]);

  useEffect(() => {
    load(0, "");
    funcService.listar(true).then(setFuncionarios).catch(() => {});
  }, [load, funcService]);

  useEffect(() => {
    setCustomContent({
      searchTerm: query,
      setSearchTerm: setQuery,
      handleSearch: () => load(0, query),
      isLoading: loading,
      placeholder: "Serviço ou cliente",
    });
    return () => setCustomContent(null);
  }, [query, loading, load, setCustomContent]);

  const executarNaSelecionada = async (acao, mensagem) => {
    try {
      const atualizada = await acao(selecionada.id);
      setSelecionada(atualizada);
      setRows((lista) => lista.map((r) => (r.id === atualizada.id ? atualizada : r)));
      toast.current.show({ severity: "success", summary: "OK", detail: mensagem, life: 2500 });
      return true;
    } catch (e) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || "Falha ao atualizar OS",
        life: 4000,
      });
      return false;
    }
  };

  const atualizarSelecionada = (alteracao, mensagem) =>
    executarNaSelecionada((id) => service.atualizar(id, alteracao), mensagem);

  const salvarHoras = async () => {
    if (!lancamentoValido(lancamento)) {
      toast.current.show({ severity: "warn", summary: "Atenção", detail: "Informe funcionário, data e horas", life: 3000 });
      return;
    }
    setSalvandoHoras(true);
    const ok = await executarNaSelecionada(
      (id) => service.adicionarMaoDeObra(id, lancamento),
      "Horas lançadas"
    );
    setSalvandoHoras(false);
    if (ok) setLancamento(null);
  };

  const confirmarStatus = (status, mensagem, pergunta) => {
    confirmDialog({
      header: `OS #${selecionada.id}`,
      message: pergunta,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      accept: () => atualizarSelecionada({ status }, mensagem),
    });
  };

  const alternarPagamento = (categoria, campo, rotulo) => {
    const pago = !selecionada[campo];
    executarNaSelecionada(
      (id) => service.alterarPagamento(id, categoria, pago),
      `${rotulo} ${pago ? "marcado como pago" : "marcado como pendente"}`
    );
  };

  const cancelarSelecionada = async (devolverEstoque) => {
    setCancelando(true);
    const ok = await atualizarSelecionada({ status: "CANCELADO", devolverEstoque }, "Serviço cancelado");
    setCancelando(false);
    if (ok) setDialogCancelar(false);
  };

  const status = selecionada?.status;
  const finalizada = status === "CONCLUIDO" || status === "CANCELADO";
  const semFinanceiro = !selecionada?.possuiFinanceiro || status === "CANCELADO";
  const dicaSemFinanceiro = " — OS sem financeiro gerado";

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <ConfirmDialog />
        <PageHeader>
          <HeaderText>
            <h1>Ordens de Serviço</h1>
            <p>Selecione uma OS na lista para liberar, registrar pagamentos ou finalizar</p>
          </HeaderText>
        </PageHeader>

        <PanelCard>
          <DataTableStyled
            value={rows}
            paginator
            rows={TAMANHO_PAGINA}
            totalRecords={total}
            lazy
            first={page * TAMANHO_PAGINA}
            onPage={(e) => load(e.page, query)}
            loading={loading}
            selectionMode="single"
            selection={selecionada}
            onSelectionChange={(e) => setSelecionada(e.value)}
            onRowDoubleClick={(e) => navigate(`/ordens-servico/${e.data.id}`)}
            dataKey="id"
            emptyMessage="Nenhuma ordem de serviço"
          >
            <Column field="id" header="Nº" style={{ width: 80 }} />
            <Column field="nome" header="Serviço" />
            <Column field="clienteNome" header="Cliente" />
            <Column header="Data" body={(r) => formatarData(r.dataCriacao)} />
            <Column header="Status" body={(r) => <Tag value={statusLabel(r.status)} severity={statusSeverity(r.status)} />} />
            <Column header="Material" body={(r) => pagamentoTag(r, r.materialPago)} />
            <Column header="Mão de obra" body={(r) => pagamentoTag(r, r.maoDeObraPago)} />
          </DataTableStyled>

          <ActionBar>
            <IconActionButton
              icon="pi pi-eye"
              className="btn-info"
              tooltip="Visualizar OS"
              tooltipOptions={{ position: "top" }}
              disabled={!selecionada}
              onClick={() => navigate(`/ordens-servico/${selecionada.id}`)}
            />
            <IconActionButton
              icon="pi pi-play"
              className="btn-warning"
              tooltip="Liberado para produção"
              tooltipOptions={{ position: "top" }}
              disabled={status !== "ABERTO"}
              onClick={() =>
                confirmarStatus(
                  "EM_PRODUCAO",
                  "OS liberada para produção",
                  "Liberar para produção? Os materiais serão baixados do estoque."
                )
              }
            />
            <IconActionButton
              icon="pi pi-clock"
              tooltip="Lançar horas trabalhadas"
              tooltipOptions={{ position: "top" }}
              disabled={!selecionada || status === "CANCELADO"}
              onClick={() => setLancamento(novoLancamento())}
            />
            <IconActionButton
              icon="pi pi-box"
              className={selecionada?.materialPago ? "btn-success" : undefined}
              tooltip={
                (selecionada?.materialPago ? "Material pago (clique para desfazer)" : "Material pago")
                + (selecionada && !selecionada.possuiFinanceiro ? dicaSemFinanceiro : "")
              }
              tooltipOptions={{ position: "top", showOnDisabled: true }}
              disabled={semFinanceiro}
              onClick={() => alternarPagamento("MATERIAL", "materialPago", "Material")}
            />
            <IconActionButton
              icon="pi pi-users"
              className={selecionada?.maoDeObraPago ? "btn-success" : undefined}
              tooltip={
                (selecionada?.maoDeObraPago ? "Mão de obra paga (clique para desfazer)" : "Mão de obra paga")
                + (selecionada && !selecionada.possuiFinanceiro ? dicaSemFinanceiro : "")
              }
              tooltipOptions={{ position: "top", showOnDisabled: true }}
              disabled={semFinanceiro}
              onClick={() => alternarPagamento("MAO_DE_OBRA", "maoDeObraPago", "Mão de obra")}
            />
            <IconActionButton
              icon="pi pi-check-circle"
              className="btn-create"
              tooltip="Serviço concluído"
              tooltipOptions={{ position: "top" }}
              disabled={!selecionada || finalizada}
              onClick={() =>
                confirmarStatus(
                  "CONCLUIDO",
                  "Serviço concluído",
                  status === "ABERTO"
                    ? "Marcar o serviço como concluído? Os materiais serão baixados do estoque."
                    : "Marcar o serviço como concluído?"
                )
              }
            />
            <IconActionButton
              icon="pi pi-times-circle"
              className="btn-delete"
              tooltip="Serviço cancelado"
              tooltipOptions={{ position: "top" }}
              disabled={!selecionada || finalizada}
              onClick={() => setDialogCancelar(true)}
            />
          </ActionBar>
        </PanelCard>

        <CancelarOsDialog
          os={selecionada}
          visible={dialogCancelar}
          loading={cancelando}
          onConfirm={cancelarSelecionada}
          onHide={() => setDialogCancelar(false)}
        />

        <Dialog
          header={selecionada ? `Lançar horas — OS #${selecionada.id}` : ""}
          visible={Boolean(lancamento)}
          onHide={() => setLancamento(null)}
          style={{ width: "min(720px, 95vw)" }}
        >
          {lancamento && (
            <>
              <LancamentoHorasForm funcionarios={funcionarios} lancamento={lancamento} onChange={setLancamento} />
              <FooterActions>
                <ButtonSecondary label="Cancelar" icon="pi pi-times" onClick={() => setLancamento(null)} />
                <ButtonPrimary label="Salvar" icon="pi pi-check" loading={salvandoHoras} onClick={salvarHoras} />
              </FooterActions>
            </>
          )}
        </Dialog>
      </ContainerPage>
    </PageShell>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { OrdemServicoService } from "../../services/OrdemServicoService";
import { FuncionarioOficinaService } from "../../services/FuncionarioOficinaService";
import { FinanceiroService } from "../../services/FinanceiroService";
import { STATUS_OS, statusInfo } from "../OrdensServico/statusOrdemServico";
import LancamentoHorasForm, { novoLancamento, lancamentoValido } from "../OrdensServico/LancamentoHorasForm";
import CancelarOsDialog from "../OrdensServico/CancelarOsDialog";
import FinanceiroOsPanel, { exibeContas, opcoesFinanceiroPadrao } from "./FinanceiroOsPanel";
import { formatarDataIso } from "../../utils/datas";
import {
  OficinaGlobalStyle,
  PageShell,
  ContainerPage,
  PageHeader,
  HeaderText,
  HeaderActions,
  ButtonPrimary,
  ButtonSecondary,
  SummaryCard,
  SummaryTitle,
  SummaryMeta,
  InfoGrid,
  InfoItem,
  PanelCard,
  PanelTitle,
  DataTableStyled,
  CostTotal,
  FooterActions,
} from "../../styles/oficinaLayout";

const moeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

const opcaoStatus = (opcao) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, color: opcao.cor }}>
    <i className={opcao.icon} />
    {opcao.label}
  </span>
);

const tagPagamento = (rotulo, pago) => (
  <Tag value={`${rotulo} ${pago ? "pago" : "pendente"}`} severity={pago ? "success" : "warning"} />
);

export default function VisualizarOrdemServico() {
  const { id, cotacaoId } = useParams();
  const ehNova = Boolean(cotacaoId);
  const navigate = useNavigate();
  const toast = useRef(null);
  const osService = useRef(new OrdemServicoService()).current;
  const funcService = useRef(new FuncionarioOficinaService()).current;
  const financeiroService = useRef(new FinanceiroService()).current;
  const [os, setOs] = useState(null);
  const [status, setStatus] = useState("ABERTO");
  const [observacoes, setObservacoes] = useState("");
  const [maoDeObra, setMaoDeObra] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [lancamento, setLancamento] = useState(novoLancamento);
  const [opcoesFinanceiro, setOpcoesFinanceiro] = useState(opcoesFinanceiroPadrao);
  const [contas, setContas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [gerandoFinanceiro, setGerandoFinanceiro] = useState(false);
  const [dialogCancelar, setDialogCancelar] = useState(false);

  const mostrarErro = (e, padrao) =>
    toast.current?.show({ severity: "error", summary: "Erro", detail: e.response?.data?.message || padrao, life: 4000 });

  const aplicarOs = (dados) => {
    setOs(dados);
    setStatus(dados.status || "ABERTO");
    setObservacoes(dados.observacoes || "");
    setMaoDeObra(dados.maoDeObra || []);
    if (exibeContas(dados) && dados.cotacaoId) {
      financeiroService
        .listarPorCotacao(dados.cotacaoId)
        .then((lista) => setContas((lista || []).filter((c) => c.categoria)))
        .catch(() => setContas([]));
    }
  };

  const voltar = () => navigate(ehNova ? `/cotacoes/${cotacaoId}` : "/ordens-servico");

  useEffect(() => {
    const carregar = ehNova ? osService.rascunhoDeCotacao(cotacaoId) : osService.getById(id);
    carregar.then(aplicarOs).catch((e) => mostrarErro(e, "Falha ao carregar OS"));
    funcService.listar(true).then(setFuncionarios).catch(() => {});
  }, [id, cotacaoId]);

  if (!os) {
    return (
      <PageShell className="oficina-page">
        <ContainerPage>
          <Toast ref={toast} />
          <p style={{ color: "#666" }}>Carregando...</p>
        </ContainerPage>
      </PageShell>
    );
  }

  const adicionarLancamento = () => {
    const funcionario = funcionarios.find((f) => f.id === lancamento.funcionarioId);
    if (!funcionario || !lancamentoValido(lancamento)) {
      toast.current.show({ severity: "warn", summary: "Atenção", detail: "Informe funcionário, data e horas", life: 3000 });
      return;
    }
    const valorHora = Number(lancamento.valorHora || 0);
    setMaoDeObra((lista) => [
      ...lista,
      {
        ...lancamento,
        funcionarioNome: funcionario.nome,
        valorHora,
        valorTotal: Number(lancamento.horas) * valorHora,
      },
    ]);
    setLancamento(novoLancamento());
  };

  const removerLancamento = (index) => {
    setMaoDeObra((lista) => lista.filter((_, i) => i !== index));
  };

  const salvar = async (devolverEstoque = false) => {
    const payload = {
      status,
      observacoes,
      devolverEstoque,
      maoDeObra: maoDeObra.map((m) => ({
        id: m.id,
        funcionarioId: m.funcionarioId,
        noturno: Boolean(m.noturno),
        dataTrabalho: m.dataTrabalho,
        horas: m.horas,
        valorHora: m.valorHora,
        observacao: m.observacao,
      })),
    };
    setSalvando(true);
    try {
      if (ehNova) {
        const criada = await osService.criarDeCotacao(cotacaoId, { ...payload, financeiro: opcoesFinanceiro });
        toast.current.show({ severity: "success", summary: "OK", detail: `OS #${criada.id} criada`, life: 2500 });
        navigate(`/ordens-servico/${criada.id}`, { replace: true });
      } else {
        aplicarOs(await osService.atualizar(id, payload));
        setDialogCancelar(false);
        toast.current.show({ severity: "success", summary: "OK", detail: "OS salva", life: 2500 });
      }
    } catch (e) {
      mostrarErro(e, "Falha ao salvar OS");
    } finally {
      setSalvando(false);
    }
  };

  const vaiCancelar = !ehNova && status === "CANCELADO" && os.status !== "CANCELADO";
  const aoSalvar = () => (vaiCancelar ? setDialogCancelar(true) : salvar());

  const gerarFinanceiro = async () => {
    setGerandoFinanceiro(true);
    try {
      aplicarOs(await osService.gerarFinanceiro(id, opcoesFinanceiro));
      toast.current.show({ severity: "success", summary: "OK", detail: "Financeiro gerado", life: 2500 });
    } catch (e) {
      mostrarErro(e, "Falha ao gerar financeiro");
    } finally {
      setGerandoFinanceiro(false);
    }
  };

  const totalMaoDeObra = maoDeObra.reduce((soma, m) => soma + Number(m.valorTotal || 0), 0);
  const vaiBaixarEstoque = !os.estoqueBaixado && (status === "EM_PRODUCAO" || status === "CONCLUIDO");
  const statusAtual = statusInfo(status);

  return (
    <PageShell className="oficina-page">
      <OficinaGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />
        <PageHeader>
          <HeaderText>
            <h1>{ehNova ? "Nova OS" : `OS #${os.id}`}</h1>
            <p>{os.nome}</p>
          </HeaderText>
          <HeaderActions style={{ alignItems: "center" }}>
            {os.cotacaoId && !ehNova && (
              <ButtonSecondary label="Ver cotação" icon="pi pi-file" onClick={() => navigate(`/cotacoes/${os.cotacaoId}`)} />
            )}
            <Dropdown
              value={status}
              options={STATUS_OS}
              onChange={(e) => setStatus(e.value)}
              valueTemplate={(opcao) => opcaoStatus(opcao || statusAtual)}
              itemTemplate={opcaoStatus}
              style={{
                minWidth: 220,
                borderRadius: 24,
                border: `2px solid ${statusAtual.cor}`,
                background: `${statusAtual.cor}14`,
              }}
            />
          </HeaderActions>
        </PageHeader>

        <SummaryCard>
          <SummaryTitle>{os.clienteNome || "Cliente"}</SummaryTitle>
          {os.possuiFinanceiro && (
            <SummaryMeta style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tagPagamento("Material", os.materialPago)}
              {tagPagamento("Mão de obra", os.maoDeObraPago)}
            </SummaryMeta>
          )}
          <InfoGrid>
            <InfoItem>
              <strong>Telefone</strong>
              <span>{os.telefone || "-"}</span>
            </InfoItem>
            <InfoItem>
              <strong>Endereço</strong>
              <span>{os.endereco || "-"}</span>
            </InfoItem>
            <InfoItem>
              <strong>Qtd</strong>
              <span>{os.quantidadeProduto || 1}</span>
            </InfoItem>
            <InfoItem>
              <strong>Valor do orçamento</strong>
              <span>{moeda(os.valorOrcamento)}</span>
            </InfoItem>
          </InfoGrid>
          {vaiBaixarEstoque && (
            <p style={{ margin: "16px 0 0", color: "#b45309", fontWeight: 600 }}>
              <i className="pi pi-exclamation-triangle" style={{ marginRight: 6 }} />
              Ao salvar, os materiais desta OS serão baixados do estoque.
            </p>
          )}
          <div style={{ marginTop: 16 }}>
            <label>Observações</label>
            <InputTextarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              autoResize
              style={{ width: "100%" }}
            />
          </div>
        </SummaryCard>

        <FinanceiroOsPanel
          os={os}
          contas={contas}
          opcoes={opcoesFinanceiro}
          onChange={setOpcoesFinanceiro}
          acao={
            !ehNova && (
              <ButtonPrimary
                label="Gerar financeiro"
                icon="pi pi-wallet"
                loading={gerandoFinanceiro}
                onClick={gerarFinanceiro}
              />
            )
          }
        />

        <PanelCard>
          <PanelTitle>Materiais utilizados</PanelTitle>
          <DataTableStyled value={os.materiais || []} emptyMessage="Orçamento sem materiais">
            <Column field="descricao" header="Material" />
            <Column field="quantidade" header="Barras" />
            <Column
              header="Tamanho da barra"
              body={(r) => (r.comprimentoBarraMm ? `${(r.comprimentoBarraMm / 1000).toLocaleString("pt-BR")} m` : "-")}
            />
          </DataTableStyled>
        </PanelCard>

        <PanelCard>
          <PanelTitle>Mão de obra</PanelTitle>
          <LancamentoHorasForm funcionarios={funcionarios} lancamento={lancamento} onChange={setLancamento} />
          <ButtonSecondary label="Adicionar lançamento" icon="pi pi-plus" onClick={adicionarLancamento} />
          <div style={{ marginTop: 16 }}>
            <DataTableStyled value={maoDeObra} emptyMessage="Sem lançamentos">
              <Column header="Data" body={(r) => formatarDataIso(r.dataTrabalho)} />
              <Column field="funcionarioNome" header="Funcionário" />
              <Column header="Turno" body={(r) => (r.noturno ? <Tag value="Noturno" severity="warning" /> : "Diurno")} />
              <Column field="horas" header="Horas" />
              <Column header="R$/h" body={(r) => moeda(r.valorHora)} />
              <Column header="Total" body={(r) => moeda(r.valorTotal)} />
              <Column
                header="Funcionário pago"
                body={(r) => (r.pagoFuncionario ? <Tag value="Pago" severity="success" /> : "-")}
              />
              <Column
                style={{ width: 70 }}
                body={(r, { rowIndex }) => (
                  <ButtonSecondary
                    icon="pi pi-trash"
                    className="p-button-rounded"
                    disabled={r.pagoFuncionario}
                    tooltip={r.pagoFuncionario ? "Lançamento já pago ao funcionário" : undefined}
                    tooltipOptions={{ showOnDisabled: true }}
                    onClick={() => removerLancamento(rowIndex)}
                  />
                )}
              />
            </DataTableStyled>
          </div>
          <CostTotal>
            <strong>Total mão de obra</strong>
            <span>{moeda(totalMaoDeObra)}</span>
          </CostTotal>
        </PanelCard>

        <FooterActions>
          <ButtonSecondary label="Voltar" icon="pi pi-arrow-left" onClick={voltar} />
          <ButtonPrimary label="Salvar" icon="pi pi-check" loading={salvando} onClick={aoSalvar} />
        </FooterActions>

        <CancelarOsDialog
          os={os}
          visible={dialogCancelar}
          loading={salvando}
          onConfirm={salvar}
          onHide={() => setDialogCancelar(false)}
        />
      </ContainerPage>
    </PageShell>
  );
}

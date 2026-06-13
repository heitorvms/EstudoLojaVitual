import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { CotacaoService } from "../../services/CotacaoService";
import { FinanceiroService } from "../../services/FinanceiroService";
import {
  VisualizarGlobalStyle,
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
  CostGrid,
  CostItem,
  CostTotal,
  AnalysisItem,
  AnalysisItemTitle,
  BadgeRow,
  BadgeContainer,
  BadgeLabel,
  BadgeValue,
  DistName,
  PriceValue,
  ChoiceList,
  ChoiceText,
  DialogForm,
  DialogWarning,
  LoadingWrap,
} from "./styled";

const VisualizarCotacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [cotacao, setCotacao] = useState(null);
  const [analise, setAnalise] = useState(null);
  const cotacaoService = useMemo(() => new CotacaoService(), []);
  const financeiroService = useMemo(() => new FinanceiroService(), []);
  const [contasFinanceiras, setContasFinanceiras] = useState([]);
  const [gerandoFinanceiro, setGerandoFinanceiro] = useState(false);
  const [gerarDialog, setGerarDialog] = useState(false);
  const [opcoesGerar, setOpcoesGerar] = useState({
    quantidadeParcelasReceber: 1,
    intervaloDiasParcelas: 30,
    diasPrimeiraParcela: 30,
    diasVencimentoPagar: 15,
    formaPagamentoReceber: "A_VISTA",
    formaPagamentoPagar: "A_VISTA",
  });

  const FORMAS_PAG = [
    { label: "À vista", value: "A_VISTA" },
    { label: "PIX", value: "PIX" },
    { label: "Boleto", value: "BOLETO" },
    { label: "Cartão crédito", value: "CARTAO_CREDITO" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const dto = await cotacaoService.getById(id);
        setCotacao(dto);
        if (dto?.analiseEscolhaJson) {
          try {
            const parsed = typeof dto.analiseEscolhaJson === "string"
              ? JSON.parse(dto.analiseEscolhaJson)
              : dto.analiseEscolhaJson;
            setAnalise(parsed);
          } catch (e) {
            console.error("Falha ao analisar analiseEscolhaJson", e);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar cotação:", error.response?.data || error.message);
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Não foi possível carregar a cotação", life: 3000 });
      }
    };
    load();
  }, [id, cotacaoService]);

  const carregarFinanceiro = async () => {
    try {
      const lista = await financeiroService.listarPorCotacao(id);
      setContasFinanceiras(lista || []);
    } catch {
      setContasFinanceiras([]);
    }
  };

  useEffect(() => {
    if (id) carregarFinanceiro();
  }, [id]);

  const confirmarGerarFinanceiro = async () => {
    setGerandoFinanceiro(true);
    try {
      await financeiroService.gerar(id, contasFinanceiras.length > 0, opcoesGerar);
      await carregarFinanceiro();
      setGerarDialog(false);
      toast.current?.show({ severity: "success", summary: "Contas geradas", life: 3000 });
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e.response?.data?.message || e.message,
        life: 4000,
      });
    } finally {
      setGerandoFinanceiro(false);
    }
  };

  const distribuidoras = cotacao?.distribuidoras || [];
  const materiais = cotacao?.materiais || [];
  const tipoAnalise = (analise?.resumoEscolha?.tipo) || analise?.tipoEscolhido || null;

  const formatPhoneNumber = (value) => {
    const cleaned = ("" + value).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `(${match[1]})${match[2]}${match[3] ? `-${match[3]}` : ""}`;
    }
    return cleaned;
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "R$ 0,00";
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  };

  const analisarMaterial = (mat) => {
    const materialId = mat?.materialDisponivel?.id;
    const analiseMat = analise?.analiseMateriais?.find(
      (a) =>
        a.materialId === materialId ||
        a.materialId === mat?.id ||
        a.nome === mat?.materialDisponivel?.descricao
    );
    let precios = [];
    if (analiseMat?.diferencas?.length) {
      precios = analiseMat.diferencas.map((d) => ({ distribuidora: d.distribuidora, preco: d.preco }));
    } else if (Array.isArray(mat?.precos)) {
      precios = mat.precos.map((p) => ({ distribuidora: p.distribuidora?.nome, preco: p.preco }));
    }
    const sorted = [...precios].filter(p => p.preco != null).sort((a, b) => a.preco - b.preco);
    const cheapest = sorted[0] || null;
    const mostExpensive = sorted[sorted.length - 1] || null;
    const middle = sorted.length >= 3 ? sorted[Math.floor(sorted.length / 2)] : null;
    const escolhaUsuario = analiseMat?.distribuidoraSelecionada || null;
    return { cheapest, middle, mostExpensive, escolhaUsuario };
  };

  const valorTotalOrcamento =
    cotacao?.valorTotalOrcamento ??
    (cotacao
      ? Number(cotacao.totalCustoMateriais || 0) +
        Number(cotacao.valorInsumos || 0) +
        Number(cotacao.valorFrete || 0) +
        Number(cotacao.valorLucro || 0)
      : 0);

  const statusFinanceiroSeverity = (status) => {
    if (status === "PAGA") return "success";
    if (status === "VENCIDA") return "danger";
    if (status === "PARCIAL") return "warning";
    if (status === "CANCELADA") return "secondary";
    return "info";
  };

  if (!cotacao) {
    return (
      <PageShell className="visualizar-cotacao-page">
        <VisualizarGlobalStyle />
        <ContainerPage>
          <Toast ref={toast} />
          <LoadingWrap>
            <ProgressSpinner />
            <span>Carregando orçamento...</span>
          </LoadingWrap>
        </ContainerPage>
      </PageShell>
    );
  }

  return (
    <PageShell className="visualizar-cotacao-page">
      <VisualizarGlobalStyle />
      <ContainerPage>
        <Toast ref={toast} />

        <PageHeader>
          <HeaderText>
            <h1>Visualizar Cotação</h1>
          </HeaderText>
          <HeaderActions>
            <ButtonPrimary
              label={contasFinanceiras.length ? "Regerar financeiro" : "Gerar financeiro"}
              icon="pi pi-wallet"
              onClick={() => setGerarDialog(true)}
            />
            {contasFinanceiras.length > 0 && (
              <ButtonSecondary
                label="Financeiro"
                icon="pi pi-external-link"
                onClick={() => navigate("/financeiro")}
              />
            )}
            <ButtonSecondary label="Voltar" icon="pi pi-arrow-left" onClick={() => navigate(-1)} />
          </HeaderActions>
        </PageHeader>

        <SummaryCard>
          <SummaryTitle>{cotacao.nome}</SummaryTitle>
          <SummaryMeta>
            Cotação #{cotacao.id}
            {cotacao.dataCriacao && ` · ${new Date(cotacao.dataCriacao).toLocaleString("pt-BR")}`}
          </SummaryMeta>
          <InfoGrid>
            <InfoItem>
              <strong>Cliente</strong>
              <span>{cotacao.clienteNome || "-"}</span>
            </InfoItem>
            <InfoItem>
              <strong>Telefone</strong>
              <span>{formatPhoneNumber(cotacao.telefone)}</span>
            </InfoItem>
            <InfoItem>
              <strong>Quantidade</strong>
              <span>{cotacao.quantidadeProduto || "-"}</span>
            </InfoItem>
            {cotacao.endereco && (
              <InfoItem>
                <strong>Endereço</strong>
                <span>{cotacao.endereco}</span>
              </InfoItem>
            )}
            <InfoItem className="total">
              <strong>Total</strong>
              <span>{formatCurrency(valorTotalOrcamento)}</span>
            </InfoItem>
          </InfoGrid>
        </SummaryCard>

      {contasFinanceiras.length > 0 && (
        <PanelCard>
          <PanelTitle>Financeiro</PanelTitle>
          <DataTableStyled value={contasFinanceiras} responsiveLayout="scroll" stripedRows>
            <Column field="tipo" header="Tipo" body={(r) => (r.tipo === "RECEBER" ? "A receber" : "A pagar")} />
            <Column
              header="Parcela"
              body={(r) => (r.totalParcelas > 1 ? `${r.numeroParcela}/${r.totalParcelas}` : "-")}
            />
            <Column
              field="status"
              header="Status"
              body={(r) => <Tag value={r.status} severity={statusFinanceiroSeverity(r.status)} rounded />}
            />
            <Column field="descricao" header="Descrição" />
            <Column field="valor" header="Valor" body={(r) => formatCurrency(r.valor)} />
            <Column field="valorPendente" header="Pendente" body={(r) => formatCurrency(r.valorPendente)} />
            <Column
              field="dataVencimento"
              header="Vencimento"
              body={(r) => (r.dataVencimento ? new Date(r.dataVencimento).toLocaleDateString("pt-BR") : "-")}
            />
          </DataTableStyled>
        </PanelCard>
      )}

      <Dialog
        header="Gerar contas financeiras"
        visible={gerarDialog}
        style={{ width: 420 }}
        onHide={() => setGerarDialog(false)}
        footer={
          <>
            <Button label="Cancelar" text onClick={() => setGerarDialog(false)} />
            <ButtonPrimary label="Gerar" loading={gerandoFinanceiro} onClick={confirmarGerarFinanceiro} />
          </>
        }
      >
        <DialogForm>
          <div>
            <label>Parcelas (a receber)</label>
            <InputNumber
              value={opcoesGerar.quantidadeParcelasReceber}
              onValueChange={(e) => setOpcoesGerar((o) => ({ ...o, quantidadeParcelasReceber: e.value || 1 }))}
              min={1}
              max={24}
            />
          </div>
          <div>
            <label>Intervalo entre parcelas (dias)</label>
            <InputNumber
              value={opcoesGerar.intervaloDiasParcelas}
              onValueChange={(e) => setOpcoesGerar((o) => ({ ...o, intervaloDiasParcelas: e.value || 30 }))}
              min={1}
            />
          </div>
          <div>
            <label>1ª parcela vence em (dias)</label>
            <InputNumber
              value={opcoesGerar.diasPrimeiraParcela}
              onValueChange={(e) => setOpcoesGerar((o) => ({ ...o, diasPrimeiraParcela: e.value ?? 30 }))}
              min={0}
            />
          </div>
          <div>
            <label>Vencimento custos (dias)</label>
            <InputNumber
              value={opcoesGerar.diasVencimentoPagar}
              onValueChange={(e) => setOpcoesGerar((o) => ({ ...o, diasVencimentoPagar: e.value || 15 }))}
              min={1}
            />
          </div>
          <div>
            <label>Forma pagamento (receber)</label>
            <Dropdown
              value={opcoesGerar.formaPagamentoReceber}
              options={FORMAS_PAG}
              onChange={(e) => setOpcoesGerar((o) => ({ ...o, formaPagamentoReceber: e.value }))}
              className="w-full"
            />
          </div>
          {contasFinanceiras.length > 0 && (
            <DialogWarning>Já existem contas: regerar só se nenhuma tiver baixa.</DialogWarning>
          )}
        </DialogForm>
      </Dialog>

      <PanelCard>
        <PanelTitle>Valores por distribuidora</PanelTitle>
        <DataTableStyled value={materialsWithDistribuidoras(materiais, distribuidoras)} responsiveLayout="scroll" stripedRows>
          <Column field="material" header="Material" />
          <Column field="quantidade" header="Quantidade" />
          {distribuidoras.map((dist) => (
            <Column key={dist.nome} header={dist.nome} body={(row) => formatCurrency(row.precos[dist.nome] || null)} />
          ))}
        </DataTableStyled>
      </PanelCard>

      {(cotacao.totalCustoMateriais != null ||
        cotacao.valorInsumos != null ||
        (cotacao.valorFrete != null && Number(cotacao.valorFrete) > 0) ||
        cotacao.valorLucro != null) && (
        <PanelCard>
          <PanelTitle>Composição de custos</PanelTitle>
          <CostGrid>
            <CostItem>
              <strong>Materiais</strong>
              <span>{formatCurrency(cotacao.totalCustoMateriais)}</span>
            </CostItem>
            <CostItem>
              <strong>Insumos ({Number(cotacao.percentualInsumos ?? 0).toFixed(0)}%)</strong>
              <span>{formatCurrency(cotacao.valorInsumos)}</span>
            </CostItem>
            <CostItem>
              <strong>Frete</strong>
              <span>{formatCurrency(cotacao.valorFrete)}</span>
            </CostItem>
            <CostItem>
              <strong>Subtotal custos</strong>
              <span>
                {formatCurrency(
                  Number(cotacao.totalCustoMateriais || 0) +
                    Number(cotacao.valorInsumos || 0) +
                    Number(cotacao.valorFrete || 0)
                )}
              </span>
            </CostItem>
            <CostItem>
              <strong>Lucro ({Number(cotacao.percentualLucro ?? 10).toFixed(0)}%)</strong>
              <span>{formatCurrency(cotacao.valorLucro)}</span>
            </CostItem>
          </CostGrid>
          <CostTotal>
            <strong>Total do orçamento</strong>
            <span>{formatCurrency(valorTotalOrcamento)}</span>
          </CostTotal>
        </PanelCard>
      )}

      {analise && (
        <PanelCard>
          <PanelTitle>Escolha do usuário</PanelTitle>
          {(() => {
            const resumo = analise?.resumoEscolha || null;
            const tipo = resumo?.tipo || analise?.tipoEscolhido || null;
            if (tipo === "distribuidoras") {
              const distEscolhida = resumo?.distribuidora || analise?.escolhas?.valorTotal?.distribuidora || null;
              const valorTotal = (resumo?.valorTotal != null ? resumo.valorTotal : analise?.escolhas?.valorTotal?.valorTotal) || null;
              const status = analise?.escolhas?.valorTotal?.status || (distEscolhida ? (analise?.analiseDistribuidoras || []).find(d => d.distribuidora === distEscolhida)?.status : null);
              const badgeStatus = status === 'maisBarato' ? 'cheapest' : status === 'maisCaro' ? 'most' : status ? 'medium' : undefined;
              return (
                <>
                  <ChoiceText><strong>Tipo:</strong> Análise de Valor Total por Distribuidora</ChoiceText>
                  <div style={{ marginTop: 8, marginBottom: 8 }}>
                    <Badge
                      label="Distribuidora selecionada"
                      value={{ distribuidora: distEscolhida || "-", preco: valorTotal != null ? valorTotal : null }}
                      formatCurrency={formatCurrency}
                      status={badgeStatus}
                    />
                  </div>
                  {Array.isArray(resumo?.materiais) && resumo.materiais.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <ChoiceText><strong>Materiais:</strong></ChoiceText>
                      <ChoiceList>
                        {resumo.materiais.map((m, idx) => (
                          <li key={idx}>{m.nome}: {formatCurrency(m.valor)}</li>
                        ))}
                      </ChoiceList>
                    </div>
                  )}
                  <ChoiceText><strong>Valor Total:</strong> {formatCurrency(valorTotal)}</ChoiceText>
                </>
              );
            }
            if (tipo === "materiais") {
              const mats = Array.isArray(resumo?.materiais) && resumo.materiais.length > 0
                ? resumo.materiais
                : (analise?.escolhas?.materiais || []).map(m => ({ nome: m.nome, distribuidora: m.distribuidoraSelecionada, valor: m.valorSelecionado }));
              const valorTotal = resumo?.valorTotal != null ? resumo.valorTotal : mats.reduce((acc, m) => acc + (Number(m.valor) || 0), 0);
              return (
                <>
                  <ChoiceText><strong>Tipo:</strong> Análise de Materiais por Distribuidora</ChoiceText>
                  <ChoiceText><strong>Distribuidoras Selecionadas:</strong> {Array.from(new Set(mats.map(m => m.distribuidora))).filter(Boolean).join(", ") || "-"}</ChoiceText>
                  <div>
                    <ChoiceText><strong>Materiais e escolhas:</strong></ChoiceText>
                    <ChoiceList>
                      {mats.map((m, idx) => {
                        const analiseMat = (analise?.analiseMateriais || []).find(a => a.nome === m.nome);
                        let status = null;
                        if (analiseMat) {
                          const diffs = (analiseMat.diferencas || []).filter(d => d.preco != null).sort((a,b) => a.preco - b.preco);
                          const cheapest = diffs[0]?.distribuidora;
                          const most = diffs[diffs.length - 1]?.distribuidora;
                          if (m.distribuidora === cheapest) status = 'maisBarato';
                          else if (m.distribuidora === most) status = 'maisCaro';
                          else if (m.distribuidora) status = 'medio';
                        }
                        const color = status === 'maisBarato' ? '#2e7d32' : status === 'medio' ? '#e65100' : status === 'maisCaro' ? '#c62828' : '#444';
                        return (
                          <li key={idx} style={{ color }}>
                            {m.nome} - {m.distribuidora || "-"}: {formatCurrency(m.valor)}
                          </li>
                        );
                      })}
                    </ChoiceList>
                  </div>
                  <ChoiceText><strong>Valor Total:</strong> {formatCurrency(valorTotal)}</ChoiceText>
                </>
              );
            }
            return <ChoiceText>Tipo de análise não informado. Nenhuma escolha registrada.</ChoiceText>;
          })()}
        </PanelCard>
      )}

      <PanelCard>
        <PanelTitle>Análise dos materiais</PanelTitle>
        {materiais.map((mat) => {
          const a = analisarMaterial(mat);
          const userStatus = a?.escolhaUsuario
            ? (a.escolhaUsuario === a.cheapest?.distribuidora
                ? 'cheapest'
                : a.escolhaUsuario === a.mostExpensive?.distribuidora
                  ? 'most'
                  : 'medium')
            : undefined;
          return (
            <AnalysisItem key={mat.id || mat.materialDisponivel?.descricao}>
              <AnalysisItemTitle>
                {mat.materialDisponivel?.descricao || mat.nome}
              </AnalysisItemTitle>
              <BadgeRow>
                <Badge label="Mais barato" value={a.cheapest} formatCurrency={formatCurrency} status="cheapest" />
                <Badge label="Médio" value={a.middle} formatCurrency={formatCurrency} status="medium" />
                <Badge label="Mais caro" value={a.mostExpensive} formatCurrency={formatCurrency} status="most" />
                {tipoAnalise === 'materiais' && (
                  <Badge
                    label="Escolha do usuário"
                    value={a.escolhaUsuario ? {
                      distribuidora: a.escolhaUsuario,
                      preco: (analise?.analiseMateriais?.find(m => (m.materialId === mat.id || m.nome === mat.materialDisponivel?.descricao))?.diferencas?.find(d => d.distribuidora === a.escolhaUsuario)?.preco)
                    } : null}
                    formatCurrency={formatCurrency}
                    status={userStatus}
                  />
                )}
              </BadgeRow>
            </AnalysisItem>
          );
        })}
      </PanelCard>
      </ContainerPage>
    </PageShell>
  );
};

function materialsWithDistribuidoras(materiais, distribuidoras) {
  return materiais.map((m) => {
    const precos = {};
    (m.precos || []).forEach((p) => {
      const nome = p.distribuidora?.nome;
      if (nome) precos[nome] = p.preco;
    });
    return {
      material: m.materialDisponivel?.descricao,
      quantidade: m.quantidade,
      precos,
    };
  });
}

const badgeTheme = {
  cheapest: { color: "#2e7d32", bg: "#f1f8f1", border: "#c8e6c9" },
  medium: { color: "#e65100", bg: "#fff8f0", border: "#ffe0b2" },
  most: { color: "#c62828", bg: "#fff5f5", border: "#ffcdd2" },
  default: { color: "#1a1a2e", bg: "#fafafa", border: "#e0e0e0" },
};

const Badge = ({ label, value, formatCurrency, status }) => {
  const has = value && value.distribuidora && (value.preco != null);
  const theme = badgeTheme[status] || badgeTheme.default;
  return (
    <BadgeContainer $bg={theme.bg} $border={theme.border}>
      <BadgeLabel>{label}</BadgeLabel>
      <BadgeValue>
        {has ? (
          <>
            <DistName style={{ color: theme.color }}>{value.distribuidora}</DistName>
            <PriceValue style={{ color: theme.color }}>{formatCurrency(value.preco)}</PriceValue>
          </>
        ) : (
          <span style={{ color: "#94a3b8" }}>N/A</span>
        )}
      </BadgeValue>
    </BadgeContainer>
  );
};

export default VisualizarCotacao;

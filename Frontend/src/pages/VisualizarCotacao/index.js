import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { CotacaoService } from "../../services/CotacaoService";
import {
  ContainerPage,
  TopBar,
  Title,
  ButtonGroup,
  SectionCard,
  SectionTitle,
  MetaInfo,
  AnalysisItem,
  AnalysisItemTitle,
  BadgeRow,
  BadgeContainer,
  BadgeLabel,
  BadgeValue,
  DistName,
  PriceValue,
} from "./styled";

const VisualizarCotacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [cotacao, setCotacao] = useState(null);
  const [analise, setAnalise] = useState(null);
  const cotacaoService = useMemo(() => new CotacaoService(), []);

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
    const analiseMat = analise?.analiseMateriais?.find((a) => a.materialId === mat?.id || a.nome === mat?.materialDisponivel?.descricao);
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

  if (!cotacao) {
    return (
      <ContainerPage>
        <Toast ref={toast} />
        <p>Carregando...</p>
      </ContainerPage>
    );
  }

  return (
    <ContainerPage>
      <Toast ref={toast} />
      <TopBar>
        <Title>Visualizar Cotação</Title>
        <ButtonGroup>
          <Button label="Voltar" icon="pi pi-arrow-left" onClick={() => navigate(-1)} />
        </ButtonGroup>
      </TopBar>

      <SectionCard>
        <SectionTitle>{cotacao.nome}</SectionTitle>
        <p><strong>Cliente:</strong> {cotacao.clienteNome}</p>
        <p><strong>Telefone:</strong> {formatPhoneNumber(cotacao.telefone)}</p>
        <p><strong>Quantidade do Produto:</strong> {cotacao.quantidadeProduto}</p>
        {cotacao.dataCriacao && (
          <MetaInfo><strong>Criado em:</strong> {new Date(cotacao.dataCriacao).toLocaleString()}</MetaInfo>
        )}
      </SectionCard>

      <SectionCard>
        <SectionTitle>Valores por Distribuidora</SectionTitle>
        <DataTable value={materialsWithDistribuidoras(materiais, distribuidoras)} responsiveLayout="scroll">
          <Column field="material" header="Material" />
          <Column field="quantidade" header="Quantidade" />
          {distribuidoras.map((dist) => (
            <Column key={dist.nome} header={dist.nome} body={(row) => formatCurrency(row.precos[dist.nome] || null)} />
          ))}
        </DataTable>
      </SectionCard>

      {analise && (
        <SectionCard>
          <SectionTitle>Escolha do Usuário</SectionTitle>
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
                  <p><strong>Tipo:</strong> Análise de Valor Total por Distribuidora</p>
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
                      <p><strong>Materiais:</strong></p>
                      <ul>
                        {resumo.materiais.map((m, idx) => (
                          <li key={idx}>{m.nome}: {formatCurrency(m.valor)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p><strong>Valor Total:</strong> {formatCurrency(valorTotal)}</p>
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
                  <p><strong>Tipo:</strong> Análise de Materiais por Distribuidora</p>
                  <p><strong>Distribuidoras Selecionadas:</strong> {Array.from(new Set(mats.map(m => m.distribuidora))).filter(Boolean).join(", ") || "-"}</p>
                  <div>
                    <p><strong>Materiais e escolhas:</strong></p>
                    <ul>
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
                        const color = status === 'maisBarato' ? '#28a745' : status === 'medio' ? '#ff9800' : status === 'maisCaro' ? '#dc3545' : '#333';
                        return (
                          <li key={idx} style={{ color }}>
                            {m.nome} - {m.distribuidora || "-"}: {formatCurrency(m.valor)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <p><strong>Valor Total:</strong> {formatCurrency(valorTotal)}</p>
                </>
              );
            }
            return <p>Tipo de análise não informado. Nenhuma escolha registrada.</p>;
          })()}
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle>Análise dos Materiais</SectionTitle>
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
      </SectionCard>
    </ContainerPage>
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

const Badge = ({ label, value, formatCurrency, status }) => {
  const has = value && value.distribuidora && (value.preco != null);
  const color = status === 'cheapest' ? '#28a745' : status === 'medium' ? '#ff9800' : status === 'most' ? '#dc3545' : undefined;
  return (
    <BadgeContainer>
      <BadgeLabel>{label}</BadgeLabel>
      <BadgeValue>
        {has ? (
          <>
            <DistName style={color ? { color } : undefined}>{value.distribuidora}</DistName>
            <PriceValue style={color ? { color } : undefined}>{formatCurrency(value.preco)}</PriceValue>
          </>
        ) : (
          <span style={{ color: "#999" }}>N/A</span>
        )}
      </BadgeValue>
    </BadgeContainer>
  );
};

export default VisualizarCotacao;

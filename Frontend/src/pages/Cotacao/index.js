import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { CotacaoService } from "../../services/CotacaoService";
import { RelatorioService } from "../../services/RelatorioService";
import debounce from "lodash/debounce";
  import {
  ContainerPage,
  CardStyled,
  DataTableStyled,
  ButtonStyled,
  CardsContainer,
  CardTitle,
  GlobalStyle,
  ExpandedContainer,
  LoadingContainer,
  FiltrosBar,
} from "./styled";

const OPCOES_SITUACAO = [
  { label: "Em aberto", value: "ABERTAS" },
  { label: "Viraram OS", value: "COM_OS" },
  { label: "Todas", value: "TODAS" },
];

const OPCOES_ORDEM = [
  { label: "Mais recentes primeiro", value: "recent-desc" },
  { label: "Mais antigos primeiro", value: "recent-asc" },
];

const OPCOES_PERIODO = [
  { label: "Todos", value: "all" },
  { label: "Hoje", value: "today" },
  { label: "Últimos 7 dias", value: "7" },
  { label: "Últimos 30 dias", value: "30" },
];

const MARGEM_ROLAGEM = 16;

const lerAnaliseEscolha = (cot) => {
  const bruto = cot?.analiseEscolhaJson;
  if (!bruto) return null;
  if (typeof bruto !== "string") return bruto;
  try {
    return JSON.parse(bruto);
  } catch {
    return null;
  }
};

/** Retorna (materialDisponivelId) => nome da distribuidora escolhida na análise da cotação. */
const distribuidoraEscolhidaPorMaterial = (cot) => {
  const analise = lerAnaliseEscolha(cot);
  if (analise?.tipoEscolhido === "distribuidoras") {
    const nome =
      analise.resumoEscolha?.distribuidora || analise.escolhas?.valorTotal?.distribuidora || null;
    return () => nome;
  }
  const porMaterial = new Map(
    (analise?.escolhas?.materiais || []).map((e) => [
      Number(e.materialId),
      e.distribuidoraSelecionada,
    ])
  );
  return (materialDisponivelId) => porMaterial.get(Number(materialDisponivelId)) || null;
};

const Cotacoes = ({ setCustomContent }) => {
  const [listaCotacoes, setListaCotacoes] = useState([]);
  const [sortOrder, setSortOrder] = useState("recent-desc");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [situacao, setSituacao] = useState("ABERTAS");
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedCotacao, setExpandedCotacao] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchedTerm, setLastSearchedTerm] = useState("");
  const [showCardLoading, setShowCardLoading] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [enviandoWhatsapp, setEnviandoWhatsapp] = useState(false);


  const toast = useRef(null);
  const cotacaoService = useRef(new CotacaoService()).current;
  const relatorioService = useRef(new RelatorioService()).current;
  const scrollPositionRef = useRef(null);
  const expandedRef = useRef(null);

  const navigate = useNavigate();
  
  const openNew = () => {
    navigate('/criar-cotacao');
  };

  const fetchCotacoes = useCallback(async (page = 0, searchQuery = "", isManualSearch = false) => {
    setIsLoading(true);
    if (isManualSearch) {
      setShowCardLoading(true);
    }
    try {
      if (periodFilter !== "all") {
        let allItems = [];
        if (searchQuery) {
          allItems = await cotacaoService.getAllSearch(searchQuery, rowsPerPage, situacao);
        } else {
          allItems = await cotacaoService.getAll(situacao);
        }
        setListaCotacoes(Array.isArray(allItems) ? allItems : []);
        setLastSearchedTerm(searchQuery.trim());
      } else {
        const direcao = sortOrder === "recent-asc" ? "asc" : "desc";
        let response;
        if (searchQuery) {
          response = await cotacaoService.search(searchQuery, page, rowsPerPage, direcao, situacao);
        } else {
          response = await cotacaoService.getPaginado(page, rowsPerPage, direcao, situacao);
        }
        setListaCotacoes(response.content || []);
        setTotalRecords(response.totalElements || 0);
        setTotalPages(Math.ceil(response.totalElements / rowsPerPage) || 1);
        setLastSearchedTerm(searchQuery.trim());
      }
    } catch (error) {
      setListaCotacoes([]);
      setTotalRecords(0);
      setTotalPages(1);
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar cotações",
        life: 3000,
      });
    } finally {
      setIsLoading(false);
      setShowCardLoading(false);
    }
  }, [rowsPerPage, periodFilter, sortOrder, situacao, cotacaoService]);

  useEffect(() => {
    fetchCotacoes(currentPage, lastSearchedTerm);
  }, [fetchCotacoes, currentPage, lastSearchedTerm]);

  
  useEffect(() => {
    setCurrentPage(0);
    fetchCotacoes(0, lastSearchedTerm);
  }, [periodFilter, sortOrder, situacao]);

  const handleSearch = () => {
    if (isLoading) return;
    if (searchTerm.trim().length < 3) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Digite pelo menos 3 caracteres para buscar",
        life: 3000,
      });
      return;
    }
    if (searchTerm.trim() === lastSearchedTerm) {
      toast.current.show({
        severity: "info",
        summary: "Informação",
        detail: "Altere o termo de busca para realizar uma nova pesquisa",
        life: 3000,
      });
      return;
    }
    setIsSearching(true);
    setCurrentPage(0);
    fetchCotacoes(0, searchTerm, true);
  };

  const resetSearch = useCallback(
    debounce(() => {
      if (!searchTerm.trim() && lastSearchedTerm) {
        setIsSearching(false);
        setLastSearchedTerm("");
        setCurrentPage(0);
        fetchCotacoes(0, "", false);
        toast.current.show({
          severity: "info",
          summary: "Pesquisa limpa",
          detail: "Lista de cotações restaurada",
          life: 3000,
        });
      }
    }, 1000),
    [searchTerm, lastSearchedTerm, fetchCotacoes]
  );

  useEffect(() => {
    resetSearch();
    return () => resetSearch.cancel();
  }, [searchTerm, resetSearch]);

  useEffect(() => {
    setCustomContent({
      openNew,
      searchTerm,
      setSearchTerm,
      handleSearch,
      isSearching,
      isLoading,
    });
    return () => setCustomContent(null);
  }, [searchTerm, isSearching, isLoading, setCustomContent]);

  const hasDate = useMemo(() =>
    Array.isArray(listaCotacoes) && listaCotacoes.some(c => c?.dataCriacao),
    [listaCotacoes]
  );

  const isGlobalFilter = useMemo(() => hasDate && periodFilter !== "all", [hasDate, periodFilter]);

  const displayCotacoes = useMemo(() => {
    let arr = Array.isArray(listaCotacoes) ? [...listaCotacoes] : [];

    
    if (isGlobalFilter) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      arr = arr.filter(c => {
        if (!c?.dataCriacao) return false;
        const created = new Date(c.dataCriacao);
        switch (periodFilter) {
          case "today":
            return created >= startOfToday;
          case "7": {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return created >= sevenDaysAgo;
          }
          case "30": {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return created >= thirtyDaysAgo;
          }
          default:
            return true;
        }
      });
    }

    arr.sort((a, b) => {
      if (hasDate) {
        const da = a?.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
        const db = b?.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;
        return sortOrder === "recent-desc" ? db - da : da - db;
      }
      const ia = Number(a?.id || 0);
      const ib = Number(b?.id || 0);
      return sortOrder === "recent-desc" ? ib - ia : ia - ib;
    });

    return arr;
  }, [listaCotacoes, sortOrder, periodFilter, hasDate, isGlobalFilter]);

  const uiTotalPages = useMemo(() => {
    return isGlobalFilter
      ? Math.max(1, Math.ceil(displayCotacoes.length / rowsPerPage))
      : totalPages;
  }, [isGlobalFilter, displayCotacoes.length, rowsPerPage, totalPages]);

  const visibleCotacoes = useMemo(() => {
    if (!isGlobalFilter) return displayCotacoes;
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    return displayCotacoes.slice(start, end);
  }, [isGlobalFilter, displayCotacoes, currentPage, rowsPerPage]);



  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < uiTotalPages) {
      setCurrentPage(newPage);
      if (!isGlobalFilter) {
        fetchCotacoes(newPage, lastSearchedTerm);
      }
    }
  };

  const toggleExpand = (cot) => {
    if (expandedCotacao && expandedCotacao.id === cot.id) {
      setExpandedCotacao(null);
      return;
    }
    if (!expandedCotacao) {
      scrollPositionRef.current = window.scrollY;
    }
    setExpandedCotacao(cot);
  };

  useEffect(() => {
    if (expandedCotacao) {
      const topo = expandedRef.current?.getBoundingClientRect().top ?? 0;
      window.scrollTo({ top: topo + window.scrollY - MARGEM_ROLAGEM, behavior: "smooth" });
    } else if (scrollPositionRef.current != null) {
      window.scrollTo({ top: scrollPositionRef.current, behavior: "smooth" });
      scrollPositionRef.current = null;
    }
  }, [expandedCotacao]);

  const formatPhoneNumber = (value) => {
    const cleaned = ("" + value).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `(${match[1]})${match[2]}${match[3] ? `-${match[3]}` : ""}`;
    }
    return cleaned;
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "R$ 0,00";
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  };

  const deleteCotacao = (id) => {
    confirmDialog({
      message: "Tem certeza que deseja excluir esta cotação?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      acceptClassName: "custom-accept-button",
      rejectClassName: "custom-reject-button",
      accept: async () => {
        try {
          await cotacaoService.deleteRequest(id);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Cotação excluída com sucesso",
            life: 3000,
          });
          fetchCotacoes(currentPage);
          if (expandedCotacao && expandedCotacao.id === id) setExpandedCotacao(null);
        } catch (error) {
          console.error("Erro ao excluir cotação:", error.response?.data || error.message);
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao excluir cotação",
            life: 3000,
          });
        }
      },
    });
  };

  const handleComprarMaterial = (cot) => {
    const materiais = cot?.materiais || [];
    if (!materiais.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Esta cotação não tem materiais para comprar.",
        life: 3000,
      });
      return;
    }

    const distribuidoraDoMaterial = distribuidoraEscolhidaPorMaterial(cot);

    navigate("/compras-lote/nova", {
      state: {
        origem: "cotacao",
        cotacaoId: cot.id,
        nomeTrabalho: cot.nome || `Cotação #${cot.id}`,
        itens: materiais.map((m) => {
          const materialDisponivelId = m.materialDisponivel?.id;
          const distribuidoraNome = distribuidoraDoMaterial(materialDisponivelId);
          const precoEscolhido = (m.precos || []).find(
            (p) => p.distribuidora?.nome === distribuidoraNome
          );
          return {
            materialDisponivelId,
            materialLabel: m.materialDisponivel?.descricao,
            barras: m.quantidade != null && m.quantidade !== "" ? Number(m.quantidade) : null,
            metros: m.metros != null ? Number(m.metros) : null,
            valorBarra: precoEscolhido?.preco ?? null,
            distribuidoraId: precoEscolhido?.distribuidora?.id ?? null,
            distribuidoraNome,
            precosCotacao: (m.precos || [])
              .filter((p) => p.distribuidora?.id != null && p.preco != null)
              .map((p) => ({ distribuidoraId: p.distribuidora.id, preco: Number(p.preco) })),
          };
        }).filter((i) => i.materialDisponivelId),
      },
    });
  };

  const handleEnviarWhatsapp = async (cotacaoId) => {
    setEnviandoWhatsapp(true);
    try {
      const res = await cotacaoService.enviarWhatsappOrcamento(cotacaoId);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: res.mensagem || "Orçamento enviado via WhatsApp.",
        life: 4000,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Falha ao enviar orçamento pelo WhatsApp.";
      toast.current?.show({ severity: "error", summary: "Erro", detail: msg, life: 5000 });
    } finally {
      setEnviandoWhatsapp(false);
    }
  };

  const handleGerarRelatorio = async (cotacaoId) => {
    setLoadingRelatorio(true);

    try {
      
  await relatorioService.downloadPdf("RelatorioCotacaoSimples", `relatorio_cotacao_${cotacaoId}.pdf`, { id_cotacao: cotacaoId });

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Relatório gerado com sucesso",
        life: 3000,
      });
    } catch (err) {
      console.error("Erro ao gerar relatório de cotação:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao gerar o relatório. Verifique se o backend está funcionando.",
        life: 3000,
      });
    } finally {
      setLoadingRelatorio(false);
    }
  };


  return (
    <ContainerPage>
      <GlobalStyle />
      <ConfirmDialog />
      <FiltrosBar>
        <h1>Cotações</h1>
        <div className="filtro">
          <label htmlFor="filtro-situacao">Situação</label>
          <Dropdown inputId="filtro-situacao" value={situacao} options={OPCOES_SITUACAO} onChange={(e) => setSituacao(e.value)} />
        </div>
        <div className="filtro">
          <label htmlFor="filtro-ordem">Ordenar</label>
          <Dropdown inputId="filtro-ordem" value={sortOrder} options={OPCOES_ORDEM} onChange={(e) => setSortOrder(e.value)} />
        </div>
        <div className="filtro">
          <label htmlFor="filtro-periodo">Período</label>
          <Dropdown
            inputId="filtro-periodo"
            value={periodFilter}
            options={OPCOES_PERIODO}
            onChange={(e) => setPeriodFilter(e.value)}
            disabled={!hasDate}
            tooltip={!hasDate ? "Filtro por data indisponível (servidor não envia dataCriacao)" : undefined}
          />
        </div>
        {!hasDate && (
          <span className="dica">Ordenando por ID como aproximação de "recentes" (o servidor não retorna data de criação).</span>
        )}
      </FiltrosBar>
      {expandedCotacao && (
        <ExpandedContainer ref={expandedRef}>
          <CardStyled className="expanded">
            <div style={{ position: "relative" }}>
              <ButtonStyled
                icon="pi pi-times"
                className="close-button"
                onClick={() => toggleExpand(expandedCotacao)}
              />
              <CardTitle className="expanded">{expandedCotacao.nome}</CardTitle>
              <p><strong>Cliente:</strong> {expandedCotacao.clienteNome}</p>
              <p><strong>Telefone:</strong> {formatPhoneNumber(expandedCotacao.telefone)}</p>
              <p><strong>Quantidade do Produto:</strong> {expandedCotacao.quantidadeProduto}</p>
              <DataTableStyled value={expandedCotacao.materiais}>
                <Column field="materialDisponivel.descricao" header="Material" />
                <Column field="quantidade" header="Quantidade" />
                {expandedCotacao.distribuidoras.map((dist) => (
                  <Column
                    key={dist.nome}
                    header={dist.nome}
                    body={(rowData) =>
                      formatCurrency(rowData.precos.find((p) => p.distribuidora?.nome === dist.nome)?.preco || "")
                    }
                  />
                ))}
              </DataTableStyled>
              <ButtonStyled
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCotacao(expandedCotacao.id);
                }}
                label="Excluir"
                style={{ marginTop: "10px" }}
              />
              <ButtonStyled
                icon="pi pi-eye"
                className="p-button-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/cotacoes/${expandedCotacao.id}`);
                }}
                label="Visualizar"
                style={{ marginTop: "10px", marginLeft: 8 }}
              />
              {expandedCotacao.ordemServicoId && (
                <ButtonStyled
                  icon="pi pi-clipboard"
                  className="p-button-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ordens-servico/${expandedCotacao.ordemServicoId}`);
                  }}
                  label={`Ver OS #${expandedCotacao.ordemServicoId}`}
                  style={{ marginTop: "10px", marginLeft: 8 }}
                />
              )}
              <ButtonStyled
                icon="pi pi-file-pdf"
                className="p-button-info"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGerarRelatorio(expandedCotacao.id);
                }}
                label={loadingRelatorio ? "Gerando..." : "Gerar Relatório PDF"}
                disabled={loadingRelatorio}
                style={{ marginTop: "10px", marginLeft: 8 }}
              />
              <ButtonStyled
                icon="pi pi-whatsapp"
                className="p-button-success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnviarWhatsapp(expandedCotacao.id);
                }}
                label={enviandoWhatsapp ? "Enviando..." : "Enviar WhatsApp"}
                disabled={enviandoWhatsapp}
                style={{ marginTop: "10px", marginLeft: 8 }}
              />
              <ButtonStyled
                icon="pi pi-shopping-cart"
                className="p-button-help"
                onClick={(e) => {
                  e.stopPropagation();
                  handleComprarMaterial(expandedCotacao);
                }}
                label="Comprar material"
                style={{ marginTop: "10px", marginLeft: 8, backgroundColor: "#0d6efd", border: "none" }}
              />
            </div>
          </CardStyled>
        </ExpandedContainer>
      )}
      {showCardLoading ? (
        <LoadingContainer aria-label="Carregando cotações">
          <ProgressSpinner />
        </LoadingContainer>
      ) : (
        <>
        <CardsContainer>
          {displayCotacoes.map((cot) => (
            <CardStyled
              key={cot.id}
              className={cot.id === expandedCotacao?.id ? "hidden" : ""}
              onClick={() => toggleExpand(cot)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <CardTitle>{cot.nome}</CardTitle>
                  <p><strong>Cliente:</strong> {cot.clienteNome}</p>
                  <p><strong>Telefone:</strong> {formatPhoneNumber(cot.telefone)}</p>
                  {cot.dataCriacao && (
                    <p style={{ fontSize: 12, color: "#666" }}>
                      Criado em: {new Date(cot.dataCriacao).toLocaleString()}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {cot.ordemServicoId && (
                    <Tag severity="info" value={`OS #${cot.ordemServicoId}`} style={{ whiteSpace: "nowrap" }} />
                  )}
                  <i
                    className={
                      expandedCotacao && expandedCotacao.id === cot.id ? "pi pi-chevron-up" : "pi pi-chevron-down"
                    }
                  />
                </div>
              </div>
            </CardStyled>
          ))}
        </CardsContainer>
        </>
      )}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <ButtonStyled
          icon="pi pi-angle-left"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        />
        <span style={{ margin: "0 10px", alignSelf: "center" }}>
          Página {currentPage + 1} de {totalPages}
        </span>
        <ButtonStyled
          icon="pi pi-angle-right"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
        />
      </div>
      <Toast ref={toast} />
    </ContainerPage>
  );
};

export default Cotacoes;
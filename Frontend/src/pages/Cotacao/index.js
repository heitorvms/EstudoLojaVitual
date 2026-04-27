import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { CotacaoService } from "../../services/CotacaoService";
import { RelatorioService } from "../../services/RelatorioService";
import debounce from "lodash/debounce";
  import {
  ContainerPage,
  Title,
  CardStyled,
  DataTableStyled,
  ButtonStyled,
  CardsContainer,
  CardTitle,
  GlobalStyle,
  ExpandedContainer,
  LoadingContainer,
} from "./styled";const Cotacoes = ({ setCustomContent }) => {
  const [listaCotacoes, setListaCotacoes] = useState([]);
  const [sortOrder, setSortOrder] = useState("recent-desc");
  const [periodFilter, setPeriodFilter] = useState("all");
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


  const toast = useRef(null);
  const cotacaoService = useRef(new CotacaoService()).current;
  const relatorioService = useRef(new RelatorioService()).current;
  const scrollPositionRef = useRef(null);
  const cardRefs = useRef({});

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
          allItems = await cotacaoService.getAllSearch(searchQuery, rowsPerPage);
        } else {
          allItems = await cotacaoService.getAll();
        }
        setListaCotacoes(Array.isArray(allItems) ? allItems : []);
        setLastSearchedTerm(searchQuery.trim());
      } else {
        let response;
        if (searchQuery) {
          response = await cotacaoService.search(searchQuery, page, rowsPerPage);
        } else {
          response = await cotacaoService.getPaginado(page, rowsPerPage);
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
  }, [rowsPerPage, periodFilter, cotacaoService]);

  useEffect(() => {
    fetchCotacoes(currentPage, lastSearchedTerm);
  }, [fetchCotacoes, currentPage, lastSearchedTerm]);

  
  useEffect(() => {
    setCurrentPage(0);
    fetchCotacoes(0, lastSearchedTerm);
  }, [periodFilter]);

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
      if (!searchTerm.trim()) {
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
    [searchTerm, fetchCotacoes]
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
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "smooth",
        });
      }, 0);
    } else {
      const cardElement = cardRefs.current[cot.id];
      if (cardElement) {
        scrollPositionRef.current = cardElement.getBoundingClientRect().top + window.scrollY;
      } else {
        scrollPositionRef.current = window.scrollY;
      }
      setExpandedCotacao(cot);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      <Title>Lista de Cotações</Title>
      {expandedCotacao && (
        <ExpandedContainer>
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
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "flex-end",
            margin: "8px 0 16px 0"
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: "#555" }}>Ordenar:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd" }}
              >
                <option value="recent-desc">Mais recentes primeiro</option>
                <option value="recent-asc">Mais antigos primeiro</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: "#555" }}>Período:</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd" }}
                disabled={!hasDate}
                title={!hasDate ? "Filtro por data indisponível (servidor não envia dataCriacao)" : undefined}
              >
                <option value="all">Todos</option>
                <option value="today">Hoje</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
              </select>
            </div>
          </div>
          {!hasDate && (
            <div style={{ fontSize: 12, color: "#777", textAlign: "right", marginBottom: 8 }}>
              Dica: ordenando por ID como aproximação de "recentes" (o servidor não retorna data de criação).
            </div>
          )}
        <CardsContainer>
          {displayCotacoes.map((cot) => (
            <CardStyled
              key={cot.id}
              className={cot.id === expandedCotacao?.id ? "hidden" : ""}
              onClick={() => toggleExpand(cot)}
              ref={(el) => (cardRefs.current[cot.id] = el)}
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
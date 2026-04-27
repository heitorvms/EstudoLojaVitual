import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { CidadeService } from "../../services/CidadeService";
import { EstadoService } from "../../services/EstadoService";
import { RelatorioService } from "../../services/RelatorioService";
import {
  ContainerPage,
  TitlePage,
  FormRow,
  InputTextStyled,
  DropdownStyled,
  ButtonStyled,
  DataTableStyled,
} from "./styled";

const Cidade = () => {
  const [nome, setNome] = useState("");
  const [estadoId, setEstadoId] = useState(null);
  const [cidades, setCidades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [editingCidade, setEditingCidade] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [rowsPerPage] = useState(5);
  const toast = useRef(null);
  const cidadeService = useRef(new CidadeService()).current;
  const estadoService = useRef(new EstadoService()).current;
  const relatorioService = useRef(new RelatorioService()).current;

  const fetchCidades = async (page = 0) => {
    try {
      const response = await cidadeService.getPaginado(page, rowsPerPage);
      setCidades(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalRecords(response.totalElements || 0);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar cidades",
        life: 3000,
      });
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await estadoService.getPaginado(0, 100);
      setEstados(response.content || []);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar estados",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchEstados();
    fetchCidades(currentPage);
  }, [currentPage]);

  const saveCidade = async () => {
    if (!nome.trim() || !estadoId) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Nome e Estado são obrigatórios",
        life: 3000,
      });
      return;
    }

    try {
      const cidadeData = {
        nome,
        estado: { id: estadoId },
      };

      if (editingCidade) {
        await cidadeService.putRequest({ ...cidadeData, id: editingCidade.id });
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Cidade atualizada com sucesso",
          life: 3000,
        });
      } else {
        await cidadeService.postRequest(cidadeData);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Cidade adicionada com sucesso",
          life: 3000,
        });
      }
      setNome("");
      setEstadoId(null);
      setEditingCidade(null);
      fetchCidades(currentPage);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao salvar cidade",
        life: 3000,
      });
    }
  };

  const removeCidade = async (id) => {
    try {
      await cidadeService.deleteRequest(id);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Cidade removida com sucesso",
        life: 3000,
      });
      fetchCidades(currentPage);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao remover cidade",
        life: 3000,
      });
    }
  };

  const startEditing = (cidade) => {
    setNome(cidade.nome);
    setEstadoId(cidade.estado?.id || null);
    setEditingCidade(cidade);
  };

  const cancelEdit = () => {
    setNome("");
    setEstadoId(null);
    setEditingCidade(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <>
        <ButtonStyled
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => startEditing(rowData)}
          title="Editar"
        />
        <ButtonStyled
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => removeCidade(rowData.id)}
          title="Excluir"
        />
      </>
    );
  };

  const handleGerarRelatorio = async () => {
      setLoadingRelatorio(true);
  
      try {
        await relatorioService.downloadPdf("RelatorioCidade", "relatorio_cidades.pdf");
  
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Relatório gerado com sucesso",
          life: 3000,
        });
      } catch (err) {
        console.error("Erro ao gerar relatório de cidades:", err);
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
      <TitlePage>Cadastro de Cidades</TitlePage>
      <FormRow>
        <InputTextStyled
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da cidade"
        />
        <DropdownStyled
          value={estadoId}
          options={estados}
          onChange={(e) => setEstadoId(e.value)}
          optionLabel="nome"
          optionValue="id"
          placeholder="Selecione o estado"
          filter
        />
        <ButtonStyled
          label={editingCidade ? "Salvar" : "Adicionar"}
          icon="pi pi-plus"
          onClick={saveCidade}
        />
        {editingCidade && (
          <ButtonStyled
            label="Cancelar"
            icon="pi pi-times"
            onClick={cancelEdit}
            className="p-button-secondary"
          />
        )}
        <ButtonStyled
          label={loadingRelatorio ? "Gerando..." : "Gerar Relatório PDF"}
          icon="pi pi-file-pdf"
          onClick={handleGerarRelatorio}
          disabled={loadingRelatorio}
          className="p-button-info"
        />
      </FormRow>
      <DataTableStyled value={cidades} emptyMessage="Nenhuma cidade encontrada">
        <Column field="nome" header="Nome" />
        <Column
          field="estado.nome"
          header="Estado"
          body={(rowData) => rowData.estado?.nome || "-"}
        />
        <Column header="Ações" body={actionsBodyTemplate} />
      </DataTableStyled>
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

export default Cidade;
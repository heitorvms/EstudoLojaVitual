import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";
import { RelatorioService } from "../../services/RelatorioService";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { EstadoService } from "../../services/EstadoService";
import {
  ContainerPage,
  TitlePage,
  FormRow,
  InputTextStyled,
  ButtonStyled,
  DataTableStyled,
} from "./styled";

const Estado = () => {
  const [nome, setNome] = useState("");
  const [sigla, setSigla] = useState("");
  const [estados, setEstados] = useState([]);
  const [editingEstado, setEditingEstado] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(5);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const toast = useRef(null);
  const estadoService = useRef(new EstadoService()).current;
  const relatorioService = useRef(new RelatorioService()).current;

  const fetchEstados = async (page = 0) => {
    try {
      const response = await estadoService.getPaginado(page, rowsPerPage);
      setEstados(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalRecords(response.totalElements || 0);
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
    fetchEstados(currentPage);
  }, [currentPage]);

  const saveEstado = async () => {
    if (!nome.trim() || !sigla.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Nome e Sigla são obrigatórios",
        life: 3000,
      });
      return;
    }

    try {
      const estadoData = { nome, sigla };

      if (editingEstado) {
        await estadoService.putRequest({ ...estadoData, id: editingEstado.id });
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Estado atualizado com sucesso",
          life: 3000,
        });
      } else {
        await estadoService.postRequest(estadoData);
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Estado adicionado com sucesso",
          life: 3000,
        });
      }
      setNome("");
      setSigla("");
      setEditingEstado(null);
      fetchEstados(currentPage);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao salvar estado",
        life: 3000,
      });
    }
  };

  const removeEstado = async (id) => {
    try {
      await estadoService.deleteRequest(id);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Estado removido com sucesso",
        life: 3000,
      });
      fetchEstados(currentPage);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao remover estado",
        life: 3000,
      });
    }
  };

  const startEditing = (estado) => {
    setNome(estado.nome);
    setSigla(estado.sigla);
    setEditingEstado(estado);
  };

  const cancelEdit = () => {
    setNome("");
    setSigla("");
    setEditingEstado(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleGerarRelatorio = async () => {
    setLoadingRelatorio(true);

    try {
      await relatorioService.downloadPdf("RelatorioEstadoo", "relatorio_estados.pdf");

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Relatório gerado com sucesso",
        life: 3000,
      });
    } catch (err) {
      console.error("Erro ao gerar relatório de estados:", err);
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
          onClick={() => removeEstado(rowData.id)}
          title="Excluir"
        />
      </>
    );
  };

  return (
    <ContainerPage>
      <TitlePage>Cadastro de Estados</TitlePage>
      <FormRow>
        <InputTextStyled
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do estado"
        />
        <InputTextStyled
          value={sigla}
          onChange={(e) => setSigla(e.target.value.toUpperCase())}
          placeholder="Sigla (UF)"
          maxLength={2}
          style={{ width: "150px" }}
        />
        <ButtonStyled
          label={editingEstado ? "Salvar" : "Adicionar"}
          icon="pi pi-plus"
          onClick={saveEstado}
        />
        {editingEstado && (
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
      <DataTableStyled value={estados} emptyMessage="Nenhum estado encontrado">
        <Column field="nome" header="Nome" />
        <Column field="sigla" header="Sigla" />
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

export default Estado;
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { DistribuidoraService } from "../../services/DistribuidoraService";
import {
  ContainerPage,
  TitlePage,
  ButtonStyled,
  InputTextStyled,
  DataTableStyled,
} from "./styled";

const Distribuidoras = () => {
  const [nome, setNome] = useState("");
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [editingDistribuidora, setEditingDistribuidora] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(5);
  const toast = useRef(null);
  const distribuidoraService = useRef(new DistribuidoraService()).current;

  const fetchDistribuidoras = async (page = 0) => {
    const result = await distribuidoraService.getPaginado(page, rowsPerPage);
    if (result.success) {
      setDistribuidoras(result.data.content || []);
      setTotalRecords(result.data.totalElements || 0);
      setTotalPages(Math.ceil(result.data.totalElements / rowsPerPage) || 1);
    } else {
      toast.current.show(result.message);
      setDistribuidoras([]);
      setTotalRecords(0);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchDistribuidoras(currentPage);
  }, [currentPage]);

  const saveDistribuidora = async () => {
    if (editingDistribuidora) {
      const result = await distribuidoraService.putRequest(editingDistribuidora.id, { nome });
      if (result.success) {
        setEditingDistribuidora(null);
        setNome("");
        fetchDistribuidoras(currentPage);
      }
      toast.current.show(result.message);
    } else {
      const result = await distribuidoraService.postRequest({ nome });
      if (result.success) {
        setNome("");
        fetchDistribuidoras(currentPage);
      }
      toast.current.show(result.message);
    }
  };

  const removeDistribuidora = async (id) => {
    const result = await distribuidoraService.deleteRequest(id);
    if (result.success) {
      fetchDistribuidoras(currentPage);
    }
    toast.current.show(result.message);
  };

  const startEditing = (distribuidora) => {
    setEditingDistribuidora(distribuidora);
    setNome(distribuidora.nome);
  };

  const cancelEdit = () => {
    setEditingDistribuidora(null);
    setNome("");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const actionsBodyTemplate = (rowData) => {
    if (editingDistribuidora && editingDistribuidora.id === rowData.id) {
      return (
        <>
          <ButtonStyled
            icon="pi pi-check"
            className="p-button-rounded p-button-success"
            onClick={() => saveDistribuidora()}
          />
          <ButtonStyled
            icon="pi pi-times"
            className="p-button-rounded p-button-secondary"
            onClick={cancelEdit}
          />
        </>
      );
    }
    return (
      <>
        <ButtonStyled
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning"
          onClick={() => startEditing(rowData)}
        />
        <ButtonStyled
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => removeDistribuidora(rowData.id)}
        />
      </>
    );
  };

  return (
    <ContainerPage>
      <TitlePage>Cadastro de Distribuidoras</TitlePage>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <InputTextStyled
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da distribuidora"
        />
        <ButtonStyled label={editingDistribuidora ? "Salvar" : "Adicionar"} icon="pi pi-plus" onClick={saveDistribuidora} />
      </div>
      <DataTableStyled value={distribuidoras} emptyMessage="Nenhuma distribuidora encontrada">
        <Column field="nome" header="Nome" />
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

export default Distribuidoras;
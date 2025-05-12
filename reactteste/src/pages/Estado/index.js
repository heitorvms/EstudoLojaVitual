import React, { useState, useEffect, useRef, useCallback } from "react";
import { ContainerPage } from "../Estado/styled";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { EstadoService } from "../../services/EstadoService";

const INITIAL_STATE = {
  nome: "",
  sigla: "",
};

const Estado = () => {
  const [objeto, setObjeto] = useState(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [objetoDialog, setObjetoDialog] = useState(false);
  const [listaEstados, setListaEstados] = useState([]);
  const [erro, setErro] = useState(null);
  const [pagination, setPagination] = useState({
    first: 0,
    rows: 5,
    totalRecords: 0,
    page: 0,
  });

  const toast = useRef(null);
  const objetoService = useRef(new EstadoService()).current;

  const fetchEstados = useCallback(async (page = 0, size = pagination.rows) => {
    try {
      const response = await objetoService.getPaginado(page, size);
      console.log("Dados retornados:", response);
      setListaEstados(response.content || []);
      setPagination(prev => ({
        ...prev,
        totalRecords: response.totalElements || 0,
        page: page,
      }));
    } catch (error) {
      setErro(error);
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar estados",
        life: 3000,
      });
    }
  }, [pagination.rows]);

  useEffect(() => {
    fetchEstados(0);
  }, [fetchEstados]);

  const openNew = () => {
    setObjeto(INITIAL_STATE);
    setSubmitted(false);
    setObjetoDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setObjetoDialog(false);
  };

  const saveObjeto = async () => {
    setSubmitted(true);
    if (!objeto.nome.trim() || !objeto.sigla.trim()) return;

    try {
      const serviceCall = objeto.id
        ? objetoService.putRequest(objeto)
        : objetoService.postRequest(objeto);

      await serviceCall;
      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: objeto.id ? "Alterado com Sucesso" : "Inserido com Sucesso",
        life: 3000,
      });

      setObjetoDialog(false);
      setObjeto(INITIAL_STATE);
      fetchEstados(pagination.page);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao salvar estado",
        life: 3000,
      });
    }
  };

  const handlePageChange = (e) => {
    const newPage = e.page;
    setPagination(prev => ({
      ...prev,
      first: e.first,
      rows: e.rows,
      page: newPage,
    }));
    fetchEstados(newPage, e.rows);
  };

  const onInputChange = (e, name) => {
    setObjeto(prev => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  const editObjeto = (rowData) => {
    setObjeto({ ...rowData });
    setObjetoDialog(true);
  };

  const actionBodyTemplate = useCallback(
    (rowData) => (
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning"
        onClick={() => editObjeto(rowData)}
        title="Editar"
      />
    ),
    []
  );

  const leftToolbarTemplate = () => (
    <Button
      label="Novo Estado"
      icon="pi pi-plus"
      className="p-button-success"
      onClick={openNew}
    />
  );

  const objetoDialogFooter = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button
        label="Salvar"
        icon="pi pi-check"
        className="p-button-text"
        onClick={saveObjeto}
      />
    </>
  );

  return (
    <ContainerPage>
      <div className="p-4 bg-white shadow-2 border-round">
        <h2 className="mb-4 font-bold">Lista de Estados</h2>
        <DataTable
          value={listaEstados}
          paginator
          rows={pagination.rows}
          first={pagination.first}
          totalRecords={pagination.totalRecords}
          rowsPerPageOptions={[5, 10, 20]}
          onPage={handlePageChange}
          emptyMessage="Nenhum estado encontrado"
          lazy
        >
          <Column field="nome" header="Nome" sortable />
          <Column field="sigla" header="Sigla" sortable />
          <Column body={actionBodyTemplate} header="Ações" />
        </DataTable>
      </div>

      <Toast ref={toast} />
      <Toolbar className="mb-4" left={leftToolbarTemplate} />

      <Dialog
        visible={objetoDialog}
        style={{ width: "450px" }}
        header={objeto.id ? "Editar Estado" : "Novo Estado"}
        modal
        className="p-fluid"
        footer={objetoDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="nome">Nome</label>
          <InputText
            id="nome"
            value={objeto.nome}
            onChange={(e) => onInputChange(e, "nome")}
            required
            autoFocus
            className={classNames({ "p-invalid": submitted && !objeto.nome })}
          />
          {submitted && !objeto.nome && (
            <small className="p-invalid">Nome é obrigatório</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="sigla">Sigla</label>
          <InputText
            id="sigla"
            value={objeto.sigla}
            onChange={(e) => onInputChange(e, "sigla")}
            required
            maxLength={2}
            className={classNames({ "p-invalid": submitted && !objeto.sigla })}
          />
          {submitted && !objeto.sigla && (
            <small className="p-invalid">Sigla é obrigatória</small>
          )}
        </div>
      </Dialog>
    </ContainerPage>
  );
};

export default Estado;
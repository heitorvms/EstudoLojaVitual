import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import {
  ContainerPage,
  TitlePage,
  ButtonStyled,
  InputTextStyled,
  DataTableStyled,
} from "./styled";

const MateriaisDisponiveis = () => {
  const [descricao, setDescricao] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [filter, setFilter] = useState("");
  const toast = useRef(null);
  const materialService = useRef(new MaterialDisponivelService()).current;

  const fetchMateriais = async () => {
    const result = await materialService.getFunction();
    if (result.success) {
      setMateriais(result.data);
    } else {
      toast.current.show(result.message);
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  const saveMaterial = async () => {
    if (editingMaterial) {
      const result = await materialService.putRequest(editingMaterial.id, { descricao });
      if (result.success) {
        setEditingMaterial(null);
        setDescricao("");
        fetchMateriais();
      }
      toast.current.show(result.message);
    } else {
      const result = await materialService.postRequest({ descricao });
      if (result.success) {
        setDescricao("");
        fetchMateriais();
      }
      toast.current.show(result.message);
    }
  };

  const removeMaterial = async (id) => {
    const result = await materialService.deleteRequest(id);
    if (result.success) {
      fetchMateriais();
    }
    toast.current.show(result.message);
  };

  const cancelEdit = () => {
    setEditingMaterial(null);
    setDescricao("");
  };

  const startEditing = (material) => {
    setEditingMaterial(material);
    setDescricao(material.descricao);
  };

  const saveInlineEdit = async (material) => {
    const result = await materialService.putRequest(material.id, { descricao: material.descricao });
    if (result.success) {
      setEditingMaterial(null);
      fetchMateriais();
    }
    toast.current.show(result.message);
  };

  const descricaoBodyTemplate = (rowData) => {
    if (editingMaterial && editingMaterial.id === rowData.id) {
      return (
        <InputText
          value={rowData.descricao}
          onChange={(e) => {
            const updatedMateriais = materiais.map((m) =>
              m.id === rowData.id ? { ...m, descricao: e.target.value } : m
            );
            setMateriais(updatedMateriais);
          }}
          onBlur={() => saveInlineEdit(rowData)}
          autoFocus
        />
      );
    }
    return rowData.descricao;
  };

  const actionsBodyTemplate = (rowData) => {
    if (editingMaterial && editingMaterial.id === rowData.id) {
      return (
        <>
          <ButtonStyled
            icon="pi pi-check"
            className="p-button-rounded p-button-success"
            onClick={() => saveInlineEdit(rowData)}
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
          onClick={() => removeMaterial(rowData.id)}
        />
      </>
    );
  };

  const filteredMateriais = materiais.filter((material) =>
    material.descricao.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ContainerPage>
      <TitlePage>Cadastro de Materiais Disponíveis</TitlePage>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <InputTextStyled
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do material"
        />
        <ButtonStyled label={editingMaterial ? "Salvar" : "Adicionar"} icon="pi pi-plus" onClick={saveMaterial} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <InputText
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por descrição"
          style={{ width: "300px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <DataTableStyled value={filteredMateriais}>
        <Column field="descricao" header="Descrição" body={descricaoBodyTemplate} />
        <Column header="Ações" body={actionsBodyTemplate} />
      </DataTableStyled>
      <Toast ref={toast} />
    </ContainerPage>
  );
};

export default MateriaisDisponiveis;
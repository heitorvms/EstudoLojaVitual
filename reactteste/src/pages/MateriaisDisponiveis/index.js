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
    const result = await materialService.postRequest({ descricao });
    if (result.success) {
      setDescricao("");
      fetchMateriais();
    }
    toast.current.show(result.message);
  };

  const removeMaterial = async (id) => {
    const result = await materialService.deleteRequest(id);
    if (result.success) {
      fetchMateriais();
    }
    toast.current.show(result.message);
  };

  return (
    <ContainerPage>
      <TitlePage>Cadastro de Materiais Disponíveis</TitlePage>
      <div style={{ marginBottom: "20px" }}>
        <InputTextStyled
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do material"
        />
        <ButtonStyled label="Adicionar" icon="pi pi-plus" onClick={saveMaterial} />
      </div>
      <DataTableStyled value={materiais}>
        <Column field="descricao" header="Descrição" />
        <Column
          header="Ações"
          body={(rowData) => (
            <ButtonStyled
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => removeMaterial(rowData.id)}
            />
          )}
        />
      </DataTableStyled>
      <Toast ref={toast} />
    </ContainerPage>
  );
};

export default MateriaisDisponiveis;
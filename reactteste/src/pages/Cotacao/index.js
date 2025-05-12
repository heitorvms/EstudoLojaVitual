import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { AutoComplete } from "primereact/autocomplete";
import { classNames } from "primereact/utils";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { CotacaoService } from "../../services/CotacaoService";
import { MaterialDisponivelService } from "../../services/MaterialDisponivelService";
import debounce from 'lodash/debounce';
import {
  ContainerPage,
  Title,
  CardStyled,
  DataTableStyled,
  ButtonStyled,
  DialogStyled,
  InputTextStyled,
  ToolbarStyled,
  AddDistribuidorButton,
  RemoveDistribuidorButton,
  RemoveMaterialButton,
  CardsContainer,
  ExpandedContent,
  CardTitle,
  GlobalStyle,
} from "./styled";

const INITIAL_STATE = {
  nome: "",
  clienteNome: "",
  telefone: "",
  quantidadeProduto: "",
  materiais: [],
};

const Cotacoes = () => {
  const [cotacao, setCotacao] = useState(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [cotacaoDialog, setCotacaoDialog] = useState(false);
  const [listaCotacoes, setListaCotacoes] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [material, setMaterial] = useState({ selectedMaterials: [], quantidade: "", precos: [] });
  const [distribuidores, setDistribuidores] = useState(["Distribuidor 1", "Distribuidor 2"]);
  const [suggestions, setSuggestions] = useState([]);
  const toast = useRef(null);
  const dialogRef = useRef(null);
  const cotacaoService = useRef(new CotacaoService()).current;
  const materialService = useRef(new MaterialDisponivelService()).current;

  const fetchCotacoes = useCallback(async (page = 0) => {
    try {
      const response = await cotacaoService.getPaginado(page, rowsPerPage);
      setListaCotacoes(response.content || []);
      setTotalRecords(response.totalElements || 0);
      setTotalPages(Math.ceil(response.totalElements / rowsPerPage) || 1);
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
    }
  }, [rowsPerPage]);

  useEffect(() => {
    fetchCotacoes(currentPage);
  }, [fetchCotacoes, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openNew = () => {
    setCotacao(INITIAL_STATE);
    setSubmitted(false);
    setCotacaoDialog(true);
    setMaterial({ selectedMaterials: [], quantidade: "", precos: [] });
  };

  const hideDialog = () => {
    setSubmitted(false);
    setCotacaoDialog(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      return !match[2] ? match[1] : `(${match[1]})${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return cleaned;
  };

  const debouncedSearchMateriais = useCallback(
    debounce(async (query) => {
      if (query.length >= 3) {
        try {
          const response = await materialService.getMateriais(query);
          if (response.success) {
            setSuggestions(response.data);
          } else {
            toast.current.show(response.message);
            setSuggestions([]);
          }
        } catch (error) {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao buscar materiais",
            life: 3000,
          });
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 100),
    []
  );

  const searchMateriais = (event) => {
    debouncedSearchMateriais(event.query);
  };

  const itemTemplate = (suggestion) => {
    return <div>{suggestion.descricao}</div>;
  };

  const addMaterial = () => {
    if (!material.selectedMaterials.length || !material.quantidade.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Pelo menos um material e a quantidade são obrigatórios",
        life: 3000,
      });
      return;
    }
    if (isNaN(material.quantidade) || Number(material.quantidade) <= 0 || !Number.isInteger(Number(material.quantidade))) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Quantidade deve ser um número inteiro positivo",
        life: 3000,
      });
      return;
    }
    const precoInvalid = material.precos.some(p => p.preco && (isNaN(p.preco) || Number(p.preco) < 0));
    if (precoInvalid) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Preços devem ser números não negativos",
        life: 3000,
      });
      return;
    }
    material.selectedMaterials.forEach(selected => {
      setCotacao(prev => ({
        ...prev,
        materiais: [...prev.materiais, { materialDisponivel: selected, quantidade: Number(material.quantidade), precos: [...material.precos] }],
      }));
    });
    setMaterial({ selectedMaterials: [], quantidade: "", precos: [] });
  };

  const removeMaterial = (index) => {
    setCotacao(prev => ({
      ...prev,
      materiais: prev.materiais.filter((_, i) => i !== index),
    }));
  };

  const saveCotacao = async () => {
    setSubmitted(true);
    const cleanedPhone = cotacao.telefone.replace(/\D/g, '');
    if (
      !cotacao.nome.trim() ||
      !cotacao.clienteNome.trim() ||
      !cotacao.telefone.trim() ||
      cleanedPhone.length !== 11 ||
      !cotacao.quantidadeProduto ||
      isNaN(cotacao.quantidadeProduto) ||
      Number(cotacao.quantidadeProduto) <= 0 ||
      !Number.isInteger(Number(cotacao.quantidadeProduto)) ||
      cotacao.materiais.length === 0
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: cleanedPhone.length !== 11
          ? "Telefone deve ter 11 dígitos (ex: 18997248311)"
          : "Todos os campos são obrigatórios, incluindo pelo menos um material e quantidades inteiras positivas",
        life: 3000,
      });
      return;
    }

    try {
      const cotacaoToSave = {
        nome: cotacao.nome,
        clienteNome: cotacao.clienteNome,
        telefone: cleanedPhone,
        quantidadeProduto: Number(cotacao.quantidadeProduto),
        materiais: cotacao.materiais.map(m => ({
          materialDisponivelId: m.materialDisponivel.id,
          quantidade: Number(m.quantidade),
        })),
        distribuidoras: distribuidores.map(nome => ({ nome })),
        precosMateriais: cotacao.materiais.flatMap(m =>
          m.precos.map(p => {
            const precoValue = p.preco ? parseFloat(p.preco).toFixed(2) : "0.00";
            return {
              materialId: m.materialDisponivel.id,
              distribuidoraNome: p.fornecedor,
              preco: parseFloat(precoValue),
            };
          })
        ),
      };

      await cotacaoService.postRequest(cotacaoToSave);
      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Cotação inserida com sucesso",
        life: 3000,
      });
      setCotacaoDialog(false);
      setCotacao(INITIAL_STATE);
      fetchCotacoes(currentPage);
    } catch (error) {
      console.error("Erro ao salvar cotação:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Erro ao salvar cotação";
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: errorMessage,
        life: 3000,
      });
    }
  };

  const deleteCotacao = (id) => {
    confirmDialog({
      message: 'Tem certeza que deseja excluir esta cotação?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptClassName: 'custom-accept-button',
      rejectClassName: 'custom-reject-button',
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
      reject: () => {
      }
    });
  };

  const onInputChange = (e, name) => {
    let value = e.target.value;
    if (name === "quantidadeProduto") {
      value = value.replace(/\D/g, '');
    } else if (name === "telefone") {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      value = formatPhoneNumber(cleaned);
    }
    setCotacao(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const onMaterialChange = (e, name) => {
    let value = name === "selectedMaterials" ? e.value : e.target.value;
    if (name === "quantidade") {
      value = value.replace(/\D/g, '');
    }
    setMaterial(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const onPrecoChange = (e, distribuidor) => {
    let value = e.target.value.replace(",", ".");
    setMaterial(prev => {
      const newPrecos = [...prev.precos];
      const index = newPrecos.findIndex(p => p.fornecedor === distribuidor);
      if (index !== -1) {
        newPrecos[index].preco = value;
      } else {
        newPrecos.push({ fornecedor: distribuidor, preco: value });
      }
      return { ...prev, precos: newPrecos };
    });
  };

  const addDistribuidor = () => {
    setDistribuidores(prev => [...prev, `Distribuidor ${prev.length + 1}`]);
  };

  const removeDistribuidor = (distribuidor) => {
    if (distribuidores.length <= 1) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Deve haver pelo menos um distribuidor",
        life: 3000,
      });
      return;
    }
    setDistribuidores(prev => prev.filter(d => d !== distribuidor));
    setMaterial(prev => ({
      ...prev,
      precos: prev.precos.filter(p => p.fornecedor !== distribuidor),
    }));
    setCotacao(prev => ({
      ...prev,
      materiais: prev.materiais.map(m => ({
        ...m,
        precos: m.precos.filter(p => p.fornecedor !== distribuidor),
      }))
    }));
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "R$ 0,00";
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  };

  const dialogFooter = (
    <>
      <ButtonStyled label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <ButtonStyled label="Salvar" icon="pi pi-check" className="p-button-text" onClick={saveCotacao} />
    </>
  );

  return (
    <ContainerPage>
      <GlobalStyle />
      <ConfirmDialog />
      <ToolbarStyled className="mb-4" left={() => (
        <ButtonStyled label="Nova Cotação" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
      )} />
      <Title>Lista de Cotações</Title>
      <CardsContainer>
        {listaCotacoes.map(cot => {
          const isExpanded = cot.id === expandedId;
          return (
            <CardStyled key={cot.id} className={isExpanded ? 'expanded' : ''}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => toggleExpand(cot.id)}>
                <div>
                  <CardTitle className={isExpanded ? 'expanded' : ''}>{cot.nome}</CardTitle>
                  <p><strong>Cliente:</strong> {cot.clienteNome}</p>
                  <p><strong>Telefone:</strong> {formatPhoneNumber(cot.telefone)}</p>
                </div>
                <div>
                  <i className={isExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"} />
                </div>
              </div>
              <ExpandedContent className={isExpanded ? 'expanded' : ''}>
                {isExpanded && (
                  <div>
                    <p><strong>Quantidade do Produto:</strong> {cot.quantidadeProduto}</p>
                    <DataTableStyled value={cot.materiais}>
                      <Column field="materialDisponivel.descricao" header="Material" />
                      <Column field="quantidade" header="Quantidade" />
                      {distribuidores.map(distribuidor => (
                        <Column
                          key={distribuidor}
                          header={distribuidor}
                          body={(rowData) => formatCurrency(rowData.precos.find(p => p.distribuidora?.nome === distribuidor)?.preco || "")}
                        />
                      ))}
                    </DataTableStyled>
                    <ButtonStyled
                      icon="pi pi-trash"
                      className="p-button-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCotacao(cot.id);
                      }}
                      label="Excluir"
                      style={{ marginTop: "10px" }}
                    />
                  </div>
                )}
              </ExpandedContent>
            </CardStyled>
          );
        })}
      </CardsContainer>
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
      <DialogStyled
        ref={dialogRef}
        visible={cotacaoDialog}
        header="Nova Cotação"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="nome">Nome do Orçamento</label>
          <InputTextStyled
            id="nome"
            value={cotacao.nome}
            onChange={(e) => onInputChange(e, "nome")}
            required
            className={classNames({ "p-invalid": submitted && !cotacao.nome })}
          />
        </div>
        <div className="field">
          <label htmlFor="clienteNome">Nome do Cliente</label>
          <InputTextStyled
            id="clienteNome"
            value={cotacao.clienteNome}
            onChange={(e) => onInputChange(e, "clienteNome")}
            required
            className={classNames({ "p-invalid": submitted && !cotacao.clienteNome })}
          />
        </div>
        <div className="field">
          <label htmlFor="telefone">Telefone</label>
          <InputTextStyled
            id="telefone"
            value={cotacao.telefone}
            onChange={(e) => onInputChange(e, "telefone")}
            required
            type="text"
            placeholder="(XX) XXXXX-XXXX"
            className={classNames({ "p-invalid": submitted && cotacao.telefone.replace(/\D/g, '').length !== 11 })}
          />
        </div>
        <div className="field">
          <label htmlFor="quantidadeProduto">Quantidade do Produto</label>
          <InputTextStyled
            id="quantidadeProduto"
            value={cotacao.quantidadeProduto}
            onChange={(e) => onInputChange(e, "quantidadeProduto")}
            required
            type="text"
            className={classNames({ "p-invalid": submitted && (!cotacao.quantidadeProduto || isNaN(cotacao.quantidadeProduto) || Number(cotacao.quantidadeProduto) <= 0 || !Number.isInteger(Number(cotacao.quantidadeProduto))) })}
          />
        </div>
        <h3>Adicionar Materiais</h3>
        <div className="field">
          <label htmlFor="materialDisponivel">Materiais</label>
          <AutoComplete
            inputId="materialDisponivel"
            value={material.selectedMaterials}
            suggestions={suggestions}
            completeMethod={searchMateriais}
            field="descricao"
            itemTemplate={itemTemplate}
            onChange={(e) => onMaterialChange(e, "selectedMaterials")}
            minLength={3}
            multiple
            forceSelection={false}
            appendTo={dialogRef.current?.element || document.body}
            panelStyle={{ zIndex: 6 }}
          />
        </div>
        <div className="field">
          <label htmlFor="quantidadeMaterial">Quantidade</label>
          <InputTextStyled
            id="quantidadeMaterial"
            value={material.quantidade}
            onChange={(e) => onMaterialChange(e, "quantidade")}
            type="text"
            className={classNames({ "p-invalid": submitted && (!material.quantidade || isNaN(material.quantidade) || Number(material.quantidade) <= 0 || !Number.isInteger(Number(material.quantidade))) })}
          />
        </div>
        {distribuidores.map((distribuidor, index) => (
          <div className="field distribuidor-field" key={index}>
            <label htmlFor={`preco-${index}`}>{distribuidor}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <InputTextStyled
                id={`preco-${index}`}
                value={material.precos.find(p => p.fornecedor === distribuidor)?.preco || ""}
                onChange={(e) => onPrecoChange(e, distribuidor)}
              />
              {index === distribuidores.length - 1 && (
                <>
                  <AddDistribuidorButton
                    icon="pi pi-plus"
                    onClick={addDistribuidor}
                  />
                  <RemoveDistribuidorButton
                    icon="pi pi-minus"
                    onClick={() => removeDistribuidor(distribuidor)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
        <ButtonStyled label="Adicionar Materiais" onClick={addMaterial} className="mb-3" />
        <DataTableStyled value={cotacao.materiais} className="mb-3">
          <Column field="materialDisponivel.descricao" header="Material" />
          <Column field="quantidade" header="Quantidade" />
          {distribuidores.map(distribuidor => (
            <Column
              key={distribuidor}
              header={distribuidor}
              body={(rowData) => formatCurrency(rowData.precos.find(p => p.fornecedor === distribuidor)?.preco || "")}
            />
          ))}
          <Column
            header="Ações"
            body={(rowData, { rowIndex }) => (
              <RemoveMaterialButton
                icon="pi pi-trash"
                onClick={() => removeMaterial(rowIndex)}
                className="p-button-rounded p-button-danger"
              />
            )}
          />
        </DataTableStyled>
      </DialogStyled>
    </ContainerPage>
  );
};

export default Cotacoes;
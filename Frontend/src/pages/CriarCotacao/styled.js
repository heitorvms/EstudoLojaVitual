

import styled, { createGlobalStyle } from "styled-components";
import { Button, InputText, InputNumber, DataTable } from "primereact";

export {
  PageShellCentered as ContainerPage,
  PageTitle as Title,
  PanelCard as FormSection,
  PanelTitle as FormTitle,
} from "../../styles/oficinaLayout";

export const SubTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #1a1a2e;
`;

export const MateriaisSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  ${SubTitle} {
    margin-bottom: 0;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const FormRowSplit = styled(FormRow)`
  grid-template-columns: 2fr 1fr;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 2rem;
`;


export const DataTableStyled = styled(DataTable)`
  width: 100%;
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  .p-datatable-header {
    background-color: #1A1A2E;
    color: white;
    font-weight: bold;
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    background-color: #f8f9fa;
    color: #1A1A2E;
    font-weight: 600;
    padding: 1rem;
    border: none;
  }

  .p-datatable-tbody > tr {
    transition: all 0.3s ease;
    &:hover {
      background-color: #f8f9fa;
    }
  }

  .p-datatable-tbody > tr > td {
    padding: 0.75rem 1rem;
    border: none;
    border-bottom: 1px solid #dee2e6;
    vertical-align: middle;
  }
`;

export const ListaMateriaisHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin: 20px 0 12px;
  width: 100%;
`;

export const ListaMateriaisTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #1a1a2e;
  line-height: 1.3;
`;

export const ComposicaoCustosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 1.25rem;
  width: 100%;
  margin-top: 1rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const ComposicaoCustosField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .p-inputnumber,
  .p-inputnumber-input {
    width: 100%;
  }
`;

export const ComposicaoCustosCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  min-height: 24px;
`;

export const TipoMaoDeObraOpcoes = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #495057;

  label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }
`;

export const ComposicaoCustosDica = styled.small`
  color: #6c757d;
  font-size: 0.75rem;
`;

export const EscolhaCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;

  > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  small {
    font-weight: 400;
    color: #6c757d;
  }
`;

export const EscolhaCabecalhoValor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;

  > span {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1a1a2e;
  }
`;

export const ComposicaoResumoCard = styled.div`
  margin-top: 1.25rem;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: grid;
  gap: 10px;
  font-size: 14px;
`;

export const ComposicaoResumoLinha = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

export const ComposicaoResumoTotal = styled(ComposicaoResumoLinha)`
  padding-top: 10px;
  border-top: 1px solid #dee2e6;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
`;

export const PrecoStatusLegenda = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-self: center;
  gap: 14px;
  font-size: 0.7rem;
  color: #6c757d;
`;

export const LegendaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &::before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 3px;
    border: 1px solid #ced4da;
    background: ${(props) => props.$cor};
    flex-shrink: 0;
  }
`;

export const TableInputStyled = styled(InputText)`
  width: 100%;
  margin: 0;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: #1A1A2E;
  }

  &:focus {
    outline: none;
    border-color: #1A1A2E;
    box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
  }
`;

export const TablePrecoInput = styled(InputNumber)`
  width: 100%;

  .p-inputnumber-input {
    width: 100%;
    margin: 0;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    border: 1px solid #ced4da;
    font-size: 0.9rem;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .p-inputnumber-input:hover,
  .p-inputnumber-input:focus {
    border-color: #1a1a2e;
  }

  .p-inputnumber-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
  }
`;

export const ButtonStyled = styled(Button)`
  z-index: 1 !important;
  margin: 8px;
  border-radius: 25px;
  text-transform: none;
  background-color: #1A1A2E;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;

  &.p-button-text {
    background-color: transparent;
    color: #1A1A2E;
    &:hover {
      background-color: rgba(26, 26, 46, 0.1) !important;
      transform: translateY(-2px);
    }
  }

  &:hover {
    background-color: #2c2c4e !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &.p-button-danger {
    background-color: #dc3545;
    &:hover {
      background-color: #c82333 !important;
    }
  }

  &:disabled {
    background-color: #6c757d;
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const InputTextStyled = styled(InputText)`
  width: 100%;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    border-color: #1A1A2E;
  }

  &:focus {
    outline: none;
    border-color: #1A1A2E;
    box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.2);
  }

  &.p-invalid {
    border-color: #dc3545;
    &:focus {
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
    }
  }
`;

export const RemoveDistribuidorButton = styled(Button)`
  width: 30px;
  height: 30px;
  margin-left: 8px;
  background-color: #FF0000;
  border: none;
  .p-button-icon {
    font-size: 1rem;
  }
  &:hover {
    background-color: #CC0000 !important;
  }
  &:hover::after {
    content: "Remover distribuidor";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1A1A2E;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
`;

export const RemoveMaterialButton = styled(Button)`
  width: 30px;
  height: 30px;
  background-color: #1A1A2E;
  border: none;
  .p-button-icon {
    font-size: 1rem;
  }
  &:hover {
    background-color: #2c2c4e !important;
  }
  &:hover::after {
    content: "Remover material";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1A1A2E;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
`;

export const DistribuidoresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

export const DistribuidorItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #1A1A2E 0%, #2d2d4a 100%);
  color: #fff;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(26, 26, 46, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 26, 46, 0.28);
  }

  span {
    line-height: 1.2;
  }

  .p-button {
    width: 1.65rem !important;
    height: 1.65rem !important;
    padding: 0 !important;
    background: rgba(255, 255, 255, 0.15) !important;
    border: none !important;
    color: #fff !important;

    &:hover {
      background: rgba(255, 255, 255, 0.28) !important;
    }
  }
`;

export const DistribuidoraPickerBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(26, 26, 46, 0.06);
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const DistribuidoraPickerField = styled.div`
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;

  &.picker-field-compact {
    flex: 0 0 140px;
    min-width: 120px;
  }

  label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #1A1A2E;
    margin-bottom: 8px;
    display: block;
    line-height: 1.25;
    min-height: 1.125rem;
  }

  .p-dropdown,
  .p-inputtext,
  .p-inputnumber {
    width: 100%;
    box-sizing: border-box;
  }

  &.picker-field-consumo {
    flex: 0 0 200px;
    min-width: 160px;
  }

  .p-inputnumber {
    margin: 0;

    .p-inputnumber-input {
      margin: 0;
      padding: 0.7rem 0.9rem;
      font-size: 0.95rem;
      border-radius: 8px;
      border: 1px solid #ced4da;
      background: #fafbfc;
      min-height: 44px;
      width: 100%;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: #1A1A2E;
      }

      &:focus {
        border-color: #1A1A2E;
        box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
      }
    }
  }

  .p-inputtext {
    margin: 0;
    padding: 0.7rem 0.9rem;
    font-size: 0.95rem;
    border-radius: 8px;
    border: 1px solid #ced4da;
    background: #fafbfc;
    min-height: 44px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: #1A1A2E;
    }

    &:focus {
      border-color: #1A1A2E;
      box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
    }
  }

  .p-dropdown {
    border-radius: 8px;
    border: 1px solid #ced4da;
    background: #fafbfc;
    min-height: 44px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:not(.p-disabled):hover {
      border-color: #1A1A2E;
    }

    &.p-focus {
      border-color: #1A1A2E;
      box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
    }

    .p-dropdown-label {
      padding: 0.7rem 0.9rem;
      font-size: 0.95rem;
      color: #1A1A2E;
    }

    .p-dropdown-label.p-placeholder {
      color: #6c757d;
    }

    .p-dropdown-trigger {
      width: 2.75rem;
      color: #1A1A2E;
    }
  }

  .p-dropdown-panel {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 8px 24px rgba(26, 26, 46, 0.12);

    .p-dropdown-filter {
      padding: 0.55rem 0.75rem;
    }

    .p-dropdown-items .p-dropdown-item {
      padding: 0.65rem 0.9rem;

      &.p-highlight {
        background: #1A1A2E;
      }
    }
  }
`;

export const DistribuidoraAddButton = styled(ButtonStyled)`
  margin: 0 !important;
  align-self: flex-end;
  min-height: 44px;
  height: 44px;
  padding-left: 1.25rem !important;
  padding-right: 1.25rem !important;
  border-radius: 8px !important;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    align-self: stretch;
  }
`;

export const DistribuidorasSelecionadasLabel = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #495057;
  display: block;
`;

export const ErrorMessage = styled.small`
  color: #dc3545;
  font-size: 0.875rem;
  display: block;
`;

export const GlobalStyle = createGlobalStyle`
  .p-toast {
    z-index: 1000 !important;
  }

  .p-autocomplete {
    width: 100%;

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid #ced4da;
      transition: all 0.3s ease;
      font-size: 1rem;

      &:hover {
        border-color: #1A1A2E;
      }

      &:focus {
        outline: none;
        border-color: #1A1A2E;
        box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.2);
      }
    }
  }

  .p-autocomplete-panel {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .p-autocomplete-items {
      padding: 0.5rem 0;

      .p-autocomplete-item {
        padding: 0.75rem 1rem;
        color: #495057;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(26, 26, 46, 0.1);
          color: #1A1A2E;
        }
      }
    }
  }
`;
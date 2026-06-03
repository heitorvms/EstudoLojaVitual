import styled, { createGlobalStyle } from "styled-components";
import { Button, InputText, DataTable } from "primereact";

export const ContainerPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const TitlePage = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a2e;
`;

export const FormSection = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const FormTitle = styled.div`
  color: #1a1a2e;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #1a1a2e;
  width: 100%;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
`;

export const ErrorMessage = styled.small`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

export const InputTextStyled = styled(InputText)`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    border-color: #1a1a2e;
  }

  &:focus {
    outline: none;
    border-color: #1a1a2e;
    box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.2);
  }

  &.p-invalid {
    border-color: #dc3545;
    &:focus {
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
    }
  }
`;

export const ButtonStyled = styled(Button)`
  z-index: 1 !important;
  margin: 8px 4px;
  border-radius: 25px;
  text-transform: none;
  background-color: #1a1a2e;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;

  &.p-button-text {
    background-color: transparent;
    color: #1a1a2e;
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

  &.p-button-warning {
    background-color: #ffc107;
    color: #1a1a2e;
    &:hover {
      background-color: #e0a800 !important;
    }
  }

  &:disabled {
    background-color: #6c757d;
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const IconButton = styled(Button)`
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 0 4px;
  background-color: #1a1a2e;
  border: none;
  border-radius: 50%;

  .p-button-icon {
    font-size: 0.95rem;
  }

  &:hover {
    background-color: #2c2c4e !important;
  }

  &.p-button-warning {
    background-color: #ffc107;
    color: #1a1a2e;
    &:hover {
      background-color: #e0a800 !important;
    }
  }

  &.p-button-danger {
    background-color: #dc3545;
    &:hover {
      background-color: #c82333 !important;
    }
  }

  &.p-button-success {
    background-color: #28a745;
    &:hover {
      background-color: #218838 !important;
    }
  }

  &.p-button-secondary {
    background-color: #6c757d;
    &:hover {
      background-color: #5a6268 !important;
    }
  }
`;

export const SearchBar = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1.5rem;
  gap: 0.75rem;
  align-items: center;
`;

export const DataTableStyled = styled(DataTable)`
  width: 100%;
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  .p-datatable-thead > tr > th {
    background-color: #f8f9fa;
    color: #1a1a2e;
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
    padding: 1rem;
    border: none;
    border-bottom: 1px solid #dee2e6;
    vertical-align: middle;
  }
`;

export const ActionCell = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

export const GlobalStyle = createGlobalStyle`
  .p-toast {
    z-index: 1000 !important;
  }

  .p-inputnumber {
    width: 100%;

    .p-inputnumber-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid #ced4da;
      transition: all 0.3s ease;
      font-size: 1rem;

      &:hover {
        border-color: #1a1a2e;
      }

      &:focus {
        outline: none;
        border-color: #1a1a2e;
        box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.2);
      }

      &.p-invalid {
        border-color: #dc3545;
      }
    }
  }

  .p-confirm-dialog .p-button.custom-accept-button {
    background-color: #1a1a2e;
    color: white;
    border-radius: 20px;
    border: none;
    padding: 8px 16px;
    &:hover { background-color: #2c2c4e; }
  }

  .p-confirm-dialog .p-button.custom-reject-button {
    background-color: #dc3545;
    color: white;
    border-radius: 20px;
    border: none;
    padding: 8px 16px;
    &:hover { background-color: #c82333; }
  }
`;

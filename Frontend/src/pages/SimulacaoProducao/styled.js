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

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: bold;
  color: #1A1A2E;
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
  color: #1A1A2E;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #1A1A2E;
  width: 100%;
`;

export const SubTitle = styled.h3`
  color: #1A1A2E;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
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

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
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

  &.p-button-success {
    background-color: #28a745;
    &:hover {
      background-color: #218838 !important;
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
  margin-top: 5px;
  margin-bottom: 10px;
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

  .p-inputnumber {
    width: 100%;
    margin: 0;

    .p-inputnumber-input {
      width: 100%;
      margin: 0;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #ced4da;
      font-size: 0.9rem;
    }
  }
`;

export const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ResumoCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }

  .label {
    font-size: 0.8rem;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1A1A2E;
    margin-top: 4px;
    word-break: break-word;

    &.value-compact {
      font-size: 1.05rem;
      line-height: 1.35;
    }
  }

  &.highlight {
    background: #1A1A2E;
    border-color: #1A1A2E;
    .label {
      color: rgba(255, 255, 255, 0.7);
    }
    .value {
      color: #ffffff;
    }
  }
`;

export const EmptyState = styled.div`
  width: 100%;
  text-align: center;
  color: #6c757d;
  font-size: 1rem;
  padding: 3rem 1rem;
  background: #ffffff;
  border: 1px dashed #ced4da;
  border-radius: 12px;
  margin-bottom: 2rem;

  strong {
    color: #1A1A2E;
  }
`;

export const RemoveItemButton = styled(Button)`
  width: 36px;
  height: 36px;
  background-color: #1A1A2E;
  border: none;
  padding: 0;

  .p-button-icon {
    font-size: 0.95rem;
  }

  &:hover {
    background-color: #2c2c4e !important;
  }

  &:disabled {
    background-color: #6c757d;
    opacity: 0.6;
  }
`;

export const ActionCell = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const InfoBadge = styled.span`
  display: inline-block;
  background: #e9ecef;
  color: #1A1A2E;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
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
        border-color: #1A1A2E;
      }

      &:focus {
        outline: none;
        border-color: #1A1A2E;
        box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.2);
      }
    }
  }

  .p-confirm-dialog .p-button.custom-accept-button {
    background-color: #1A1A2E;
    color: white;
    border-radius: 20px;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    &:hover {
      background-color: #2c2c4e;
    }
  }

  .p-confirm-dialog .p-button.custom-reject-button {
    background-color: #dc3545;
    color: white;
    border-radius: 20px;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    &:hover {
      background-color: #c82333;
    }
  }
`;

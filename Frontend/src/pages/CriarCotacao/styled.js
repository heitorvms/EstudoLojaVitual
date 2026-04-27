

import styled, { createGlobalStyle } from "styled-components";
import { Button, InputText, DataTable, Card } from "primereact";

export const CardStyled = styled(Card)`
  width: 100%;
  max-width: 450px;
  min-height: 150px;
  margin-bottom: 16px;
  padding: 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #dee2e6;
  background-color: #ffffff;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;

  &.selected {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  }

  .valor {
    font-size: 1.1rem;
    color: #333;
  }

  .economia {
    color: #28a745;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const AnaliseConfirmarButtonContainer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
`;
export const AnaliseDistribuidoraSelecionadaAviso = styled.div`
  margin-top: 8px;
  color: #007bff;
  font-weight: 500;
`;
export const AnaliseDistribuidoraStatus = styled.div`
  margin-top: 8px;
  font-weight: 500;
  color: ${({ status }) =>
    status === 'maisBarato' ? '#28a745' :
    status === 'maisCaro' ? '#dc3545' :
    status === 'medio' ? '#ff9800' : '#333'};
`;
export const AnaliseValorTotal = styled.div`
  font-weight: 600;
  font-size: 18px;
`;
export const ResumoAnaliseTitle = styled.h4`
  margin-bottom: 18px;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 1.6rem;
  text-align: center;
  letter-spacing: 1px;
`;
export const ResumoAnaliseSection = styled.div`
  margin-bottom: 12px;
  font-size: 1.1rem;
  color: #1A1A2E;
  width: 100%;
  text-align: left;
`;
export const ResumoAnaliseList = styled.ul`
  margin: 0;
  padding-left: 24px;
  width: 100%;
  color: #1A1A2E;
  font-size: 1.05rem;
`;
export const ResumoAnaliseValorTotal = styled.div`
  background: #1A1A2E;
  border-radius: 10px;
  padding: 18px 0;
  margin-top: 18px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 1px;
  box-shadow: 0 1.5px 4px rgba(26,26,46,0.10);
`;
export const ResumoAnaliseContainer = styled.div`
  margin-top: 32px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 16px rgba(26,26,46,0.10), 0 1.5px 4px rgba(26,26,46,0.08);
  border: 2px solid #1A1A2E;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const ResumoAnaliseMaterialNome = styled.span`
  color: #007bff;
  font-weight: 600;
`;
export const ResumoAnaliseMaterialDist = styled.span`
  margin-left: 8px;
  color: #ff9800;
  font-weight: 600;
`;
export const ResumoAnaliseMaterialValor = styled.span`
  margin-left: 8px;
  color: #28a745;
  font-weight: 700;
`;
export const AnaliseDistribuidoraCard = styled(CardStyled)`
  margin-bottom: 16px;
  cursor: pointer;
  border-color: ${({ status }) =>
    status === 'maisBarato' ? '#28a745' : 
    status === 'maisCaro' ? '#dc3545' : 
    status === 'medio' ? '#ff9800' : '#dee2e6'};
  background-color: ${({ status }) => 
    status === 'maisBarato' ? '#eafaf1' : 
    status === 'maisCaro' ? '#faeaea' : 
    status === 'medio' ? '#fff7e6' : '#fff'};
  box-shadow: ${({ selecionada }) => 
    selecionada ? '0 0 0 3px #007bff33' : undefined};
`;
export const AnaliseStatusDescricao = styled.div`
  color: #888;
  font-size: 13px;
`;
export const AnaliseSelectDistribuidora = styled.select`
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
`;
export const AnaliseCardMargin = styled.div`
  margin-bottom: 8px;
`;

export const AnaliseDiferencaVerde = styled.div`
  color: #28a745;
`;
export const AnaliseRadioInput = styled.input`
  margin-right: 8px;
`;

export const AnaliseRadioLabel = styled.label`
  cursor: pointer;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;
export const AnaliseColumnContainer = styled.div`
  flex: 1;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;
export const AnaliseFlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
`;
export const ResumoEscolhaContainer = styled.div`
  margin-top: 32px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 16px rgba(26,26,46,0.10), 0 1.5px 4px rgba(26,26,46,0.08);
  border: 2px solid #1A1A2E;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ResumoEscolhaTitle = styled.h2`
  margin-bottom: 18px;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 1.6rem;
  text-align: center;
  letter-spacing: 1px;
`;

export const ResumoEscolhaBox = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px 24px;
  margin-bottom: 12px;
  box-shadow: 0 1.5px 4px rgba(26,26,46,0.07);
  border: 1.5px solid #1A1A2E;
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const ResumoEscolhaLabel = styled.strong`
  color: #1A1A2E;
  margin-right: 8px;
`;

export const ResumoEscolhaValorTotal = styled.div`
  background: #1A1A2E;
  border-radius: 10px;
  padding: 18px 0;
  margin-top: 8px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 1px;
  box-shadow: 0 1.5px 4px rgba(26,26,46,0.10);
`;

export const ResumoEscolhaMaterialNome = styled.span`
  color: #007bff;
  font-weight: 600;
`;

export const ResumoEscolhaMaterialDist = styled.span`
  margin-left: 8px;
  color: #ff9800;
  font-weight: 600;
`;

export const ResumoEscolhaMaterialValor = styled.span`
  margin-left: 8px;
  color: #28a745;
  font-weight: 700;
`;

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
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;


export const CardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 8px;
  text-transform: none;
`;

export const AnaliseSection = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const AnaliseContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

export const AnaliseTitle = styled.h4`
  font-size: 1.25rem;
  color: #1A1A2E;
  margin-bottom: 1rem;
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
    padding: 1rem;
    border: none;
    border-bottom: 1px solid #dee2e6;
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
  gap: 8px;
`;

export const DistribuidorItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 20px;
  margin: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #dee2e6;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  span {
    margin-right: 8px;
    font-weight: 500;
    color: #1A1A2E;
  }
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

export const FormTitle = styled.div`
  color: #1A1A2E;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #1A1A2E;
  width: 100%;
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
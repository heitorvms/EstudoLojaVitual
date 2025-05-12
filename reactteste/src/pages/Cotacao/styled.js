import styled, { createGlobalStyle } from "styled-components";
import { Button, Card, DataTable, Dialog, InputText, Toolbar } from "primereact";


export const ContainerPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

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

export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  justify-items: center;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CardStyled = styled(Card)`
  width: 100%;
  max-width: 450px;
  min-height: 200px;
  margin-bottom: 16px;
  padding: 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #ffffff;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  }

  &.expanded {
    grid-column: span 2;
    max-width: 100%;
  }
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 8px;
  &.expanded {
    font-size: 1.5rem;
  }
`;

export const ExpandedContent = styled.div`
  overflow: hidden;
  height: auto;
  transition: transform 0.6s ease-in-out, opacity 0.6s ease-in-out;
  opacity: 0;
  transform: scaleY(0);
  transform-origin: top;

  &.expanded {
    opacity: 1;
    transform: scaleY(1);
  }
`;

export const DataTableStyled = styled(DataTable)`
  width: 100%;
  margin-top: 16px;
`;

export const ButtonStyled = styled(Button)`
  margin: 8px;
  border-radius: 20px;
  text-transform: none;
  background-color: #1A1A2E;
  border: none;
  &.p-button-text {
    background-color: transparent;
    color: #1A1A2E;
    &:hover {
      background-color: transparent !important;
    }
  }
  &:hover {
    background-color: #2c2c4e !important;
  }
`;

export const DialogStyled = styled(Dialog)`
  width: 90vw;
  max-width: 1200px;
  z-index: 6;
  .p-dialog-header {
    background-color: #1A1A2E;
    color: white;
    font-size: 1.5rem;
  }
  .p-dialog-content {
    padding: 20px;
  }
`;

export const InputTextStyled = styled(InputText)`
  width: 100%;
  margin-top: 8px;
`;

export const ToolbarStyled = styled(Toolbar)`
  margin-bottom: 16px;
  width: 80%;
  background-color: #1A1A2E;
  .p-toolbar-group-left {
    .p-button {
      background-color: #1A1A2E;
      border: none;
      &:hover {
        background-color: #2c2c4e;
      }
    }
  }
`;

export const AddDistribuidorButton = styled(Button)`
  width: 30px;
  height: 30px;
  margin-left: 8px;
  background-color: #008000;
  border: none;
  .p-button-icon {
    font-size: 1rem;
  }
  &:hover {
    background-color: #006400 !important;
  }
  &:hover::after {
    content: "Adicionar um distribuidor";
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
`;

export const GlobalStyle = createGlobalStyle`
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
    background-color: #FF0000;
    color: white;
    border-radius: 20px;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    &:hover {
      background-color: #CC0000;
    }
  }
`;
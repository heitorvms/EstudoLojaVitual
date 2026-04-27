import styled, { createGlobalStyle } from "styled-components";
import { Button, Card, DataTable, Dialog, InputText } from "primereact";

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
    width: 100%;
    max-width: none;
    min-height: 400px;
    animation: fadeIn 0.5s ease-in-out;
  }

  &.hidden {
    display: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    &.expanded {
      grid-column: span 1;
      min-height: 400px;
    }
  }
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 8px;
  text-transform: none;
  &.expanded {
    font-size: 1.5rem;
  }
`;

export const ExpandedContent = styled.div`
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.6s ease-in-out, opacity 0.6s ease-in-out;

  &.expanded {
    max-height: 1000px;
    opacity: 1;
  }
`;

export const ExpandedContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

export const DataTableStyled = styled(DataTable)`
  width: 100%;
  margin-top: 16px;
`;

export const ButtonStyled = styled(Button)`
  z-index: 1 !important;
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

  &.close-button {
    position: absolute;
    top: -40px;
    right: 10px;
    background: none !important;
    border: none !important;
    color: #1A1A2E !important;
    font-size: 1.2rem;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease, transform 0.3s ease;

    &:hover {
      color: #4A4A6A !important;
      transform: scale(1.1);
    }
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
  margin-top: 5px;
  margin-bottom: 10px;
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
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  min-height: 200px;
  margin: 0 auto;
  grid-column: span 2;

  .p-progress-spinner {
    width: 50px;
    height: 50px;
  }

  @media (max-width: 768px) {
    grid-column: span 1;
    .p-progress-spinner {
      width: 40px;
      height: 40px;
    }
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

  body.modal-open {
    overflow: hidden;
  }

  .p-toast {
    z-index: 1000 !important;
  }
`;
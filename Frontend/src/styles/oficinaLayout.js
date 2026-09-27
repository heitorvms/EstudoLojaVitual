import styled, { createGlobalStyle } from "styled-components";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";

/** Layout compartilhado no padrão da tela de cotação (#1a1a2e). */
export const OficinaGlobalStyle = createGlobalStyle`
  .oficina-page .p-datatable {
    border: none;
    font-size: 0.9rem;
  }

  .oficina-page .p-datatable .p-datatable-thead > tr > th {
    background: #f5f5f5;
    color: #1a1a2e;
    font-weight: 600;
    font-size: 0.8rem;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.75rem 1rem;
  }

  .oficina-page .p-datatable .p-datatable-tbody > tr > td {
    border-color: #eee;
    padding: 0.75rem 1rem;
    color: #333;
  }

  .oficina-page .p-datatable .p-datatable-tbody > tr:hover {
    background: #fafafa !important;
  }

  .oficina-page .p-datatable-selectable .p-datatable-tbody > tr {
    cursor: pointer;
  }

  .oficina-page .p-datatable .p-datatable-tbody > tr.p-highlight {
    background: rgba(26, 26, 46, 0.08) !important;
    color: #1a1a2e;
  }

  .oficina-page .p-inputtext,
  .oficina-page .p-dropdown,
  .oficina-page .p-inputnumber,
  .oficina-page .p-calendar,
  .oficina-page .p-inputtextarea {
    border-radius: 6px;
  }

  .oficina-page .p-tabview .p-tabview-nav {
    border: none;
    background: transparent;
  }

  .oficina-page .p-tabview .p-tabview-nav li .p-tabview-nav-link {
    color: #666;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
  }

  .oficina-page .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
    color: #1a1a2e;
    border-bottom-color: #1a1a2e;
  }

  .oficina-page .p-tag {
    border-radius: 999px;
  }
`;

export const PageShell = styled.div`
  width: 100%;
  min-height: calc(100vh - 80px);
  background: #f0f0f2;
  padding: 32px 24px 48px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px 12px 32px;
  }
`;

export const ContainerPage = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 24px;
`;

export const HeaderText = styled.div`
  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #1a1a2e;
  }

  p {
    margin: 6px 0 0;
    font-size: 14px;
    color: #666;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ButtonPrimary = styled(Button)`
  background-color: #1a1a2e !important;
  border: none !important;
  border-radius: 20px;
  color: #fff !important;

  &:hover {
    background-color: #2c2c4e !important;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const ButtonSecondary = styled(Button)`
  background-color: #fff !important;
  color: #1a1a2e !important;
  border: 1px solid #1a1a2e !important;
  border-radius: 20px;

  &:hover {
    background-color: #f5f5f5 !important;
  }
`;

export const PanelCard = styled.section`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

export const PanelTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #1a1a2e;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 14px;
  text-align: left;

  label {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .p-inputtext,
  .p-dropdown,
  .p-inputnumber,
  .p-calendar,
  .p-inputtextarea {
    width: 100%;
  }
`;

export const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 12px;
`;

export const DataTableStyled = styled(DataTable)`
  .p-datatable-wrapper {
    border-radius: 4px;
    overflow: hidden;
  }
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

export const InfoItem = styled.div`
  strong {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 500;
  }

  span {
    font-size: 15px;
    color: #1a1a2e;
    font-weight: 600;
    word-break: break-word;
  }
`;

export const SummaryCard = styled.section`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: left;
`;

export const SummaryTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a2e;
`;

export const SummaryMeta = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  color: #666;
`;

export const CostTotal = styled.div`
  margin-top: 16px;
  padding: 14px 16px;
  background: #1a1a2e;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;

  strong {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  span {
    font-size: 1.25rem;
    font-weight: bold;
    color: #fff;
  }
`;

export const FooterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

export const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
`;

export const IconActionButton = styled(Button)`
  width: 2.5rem !important;
  height: 2.5rem !important;
  padding: 0 !important;
  border-radius: 50% !important;
  border: none !important;
  background-color: #1a1a2e !important;
  color: #fff !important;

  .p-button-icon {
    font-size: 0.95rem;
    margin: 0;
  }

  &:hover:not(:disabled) {
    background-color: #2c2c4e !important;
    transform: translateY(-1px);
  }

  &.btn-create {
    background-color: #28a745 !important;
    &:hover:not(:disabled) {
      background-color: #218838 !important;
    }
  }

  &.btn-delete {
    background-color: #dc3545 !important;
    &:hover:not(:disabled) {
      background-color: #c82333 !important;
    }
  }

  &.btn-info {
    background-color: #0d6efd !important;
    &:hover:not(:disabled) {
      background-color: #0b5ed7 !important;
    }
  }

  &.btn-success {
    background-color: #198754 !important;
    &:hover:not(:disabled) {
      background-color: #157347 !important;
    }
  }

  &.btn-warning {
    background-color: #f59e0b !important;
    &:hover:not(:disabled) {
      background-color: #d97706 !important;
    }
  }

  &:disabled {
    background-color: #adb5bd !important;
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

export const DialogForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  label {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .p-inputtextarea {
    width: 100%;
  }
`;

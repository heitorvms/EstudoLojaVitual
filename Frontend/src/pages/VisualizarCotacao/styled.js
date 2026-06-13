import styled, { createGlobalStyle } from "styled-components";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";

export const VisualizarGlobalStyle = createGlobalStyle`
  .visualizar-cotacao-page .p-datatable {
    border: none;
    font-size: 0.9rem;
  }

  .visualizar-cotacao-page .p-datatable .p-datatable-thead > tr > th {
    background: #f5f5f5;
    color: #1a1a2e;
    font-weight: 600;
    font-size: 0.8rem;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.75rem 1rem;
  }

  .visualizar-cotacao-page .p-datatable .p-datatable-tbody > tr > td {
    border-color: #eee;
    padding: 0.75rem 1rem;
    color: #333;
  }

  .visualizar-cotacao-page .p-datatable .p-datatable-tbody > tr:hover {
    background: #fafafa !important;
  }

  .visualizar-cotacao-page .p-dialog .p-dialog-header {
    background: #1a1a2e;
    color: #fff;
    padding: 1rem 1.25rem;
  }

  .visualizar-cotacao-page .p-dialog .p-dialog-header .p-dialog-title,
  .visualizar-cotacao-page .p-dialog .p-dialog-header-icon {
    color: #fff;
  }

  .visualizar-cotacao-page .p-dialog .p-dialog-content {
    padding: 1.25rem;
  }

  .visualizar-cotacao-page .p-dialog .p-dialog-footer {
    padding: 0.75rem 1.25rem 1.25rem;
    gap: 0.5rem;
  }

  .visualizar-cotacao-page .p-dialog .p-dialog-footer .p-button:not(.p-button-text) {
    background: #1a1a2e;
    border-color: #1a1a2e;
  }

  .visualizar-cotacao-page .p-dialog .p-dialog-footer .p-button:not(.p-button-text):hover {
    background: #2c2c4e;
    border-color: #2c2c4e;
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

export const SummaryCard = styled.section`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

  &.total span {
    font-size: 1.15rem;
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

export const DataTableStyled = styled(DataTable)`
  .p-datatable-wrapper {
    border-radius: 4px;
    overflow: hidden;
  }
`;

export const CostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

export const CostItem = styled.div`
  padding: 12px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;

  strong {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 500;
  }

  span {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a2e;
  }
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

export const AnalysisItem = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const AnalysisItemTitle = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  color: #1a1a2e;
  font-size: 0.95rem;
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const BadgeContainer = styled.div`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid ${(p) => p.$border || "#e0e0e0"};
  background: ${(p) => p.$bg || "#fff"};
  min-width: 130px;
  flex: 1;
`;

export const BadgeLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
`;

export const BadgeValue = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a2e;
`;

export const DistName = styled.span`
  color: #1a1a2e;
  font-weight: 600;
`;

export const PriceValue = styled.span`
  margin-left: 6px;
  color: #333;
  font-weight: 600;
`;

export const ChoiceList = styled.ul`
  margin: 8px 0 0;
  padding-left: 20px;
  color: #444;
  line-height: 1.6;
`;

export const ChoiceText = styled.p`
  margin: 6px 0;
  color: #444;
  font-size: 14px;

  strong {
    color: #1a1a2e;
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

  .p-inputnumber,
  .p-dropdown {
    width: 100%;
  }
`;

export const DialogWarning = styled.small`
  color: #c62828;
  font-size: 13px;
`;

export const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 1rem;
  color: #666;
`;

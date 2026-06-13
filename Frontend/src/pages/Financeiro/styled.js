import styled, { createGlobalStyle } from "styled-components";
import { DataTable } from "primereact/datatable";

export const FinanceiroGlobalStyle = createGlobalStyle`
  .financeiro-page .p-datatable {
    border: none;
    font-size: 0.9rem;
  }

  .financeiro-page .p-datatable .p-datatable-header {
    background: transparent;
    border: none;
    padding: 0;
  }

  .financeiro-page .p-datatable .p-datatable-thead > tr > th {
    background: #f1f3f9;
    color: #1a1a2e;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: none;
    padding: 0.85rem 1rem;
  }

  .financeiro-page .p-datatable .p-datatable-tbody > tr {
    transition: background 0.15s ease;
  }

  .financeiro-page .p-datatable .p-datatable-tbody > tr > td {
    border-color: #eef1f6;
    padding: 0.9rem 1rem;
    color: #334155;
  }

  .financeiro-page .p-datatable .p-datatable-tbody > tr:hover {
    background: #f8f9ff !important;
  }

  .financeiro-page .p-paginator {
    background: transparent;
    border: none;
    padding: 1rem 0 0;
  }

  .financeiro-page .p-dialog .p-dialog-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #4a00e0 100%);
    color: #fff;
    border-radius: 12px 12px 0 0;
    padding: 1.1rem 1.25rem;
  }

  .financeiro-page .p-dialog .p-dialog-header .p-dialog-title {
    font-weight: 600;
  }

  .financeiro-page .p-dialog .p-dialog-header-icon {
    color: #fff;
  }

  .financeiro-page .p-dialog .p-dialog-content {
    padding: 1.25rem;
  }

  .financeiro-page .p-dialog .p-dialog-footer {
    padding: 0.75rem 1.25rem 1.25rem;
    gap: 0.5rem;
  }
`;

export const ContainerPage = styled.div`
  min-height: calc(100vh - 64px);
  padding: 1.75rem 2rem 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(160deg, #f0f2f8 0%, #e8ecf4 45%, #f5f6fa 100%);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
`;

export const HeaderText = styled.div`
  h1 {
    margin: 0 0 0.35rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
    max-width: 520px;
    line-height: 1.5;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const ResumoCard = styled.div`
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 14px;
  padding: 1.15rem 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 26, 46, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${(p) => p.$accent || "#4a00e0"};
    border-radius: 14px 0 0 14px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(26, 26, 46, 0.1);
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => p.$iconBg || "rgba(74, 0, 224, 0.1)"};
    color: ${(p) => p.$accent || "#4a00e0"};
    font-size: 1.15rem;
    flex-shrink: 0;
  }

  .meta {
    flex: 1;
    min-width: 0;
  }

  strong {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    margin-bottom: 0.35rem;
  }

  span {
    font-size: 1.35rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.02em;
  }

  small {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.78rem;
    color: #94a3b8;
  }
`;

export const PanelCard = styled.section`
  background: #fff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 24px rgba(26, 26, 46, 0.07);
  margin-bottom: 1.25rem;
  border: 1px solid #eef1f6;
`;

export const PanelTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: #4a00e0;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
`;

export const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 160px;

  label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .p-dropdown {
    min-width: 180px;
    border-radius: 10px;
  }
`;

export const TableCard = styled(PanelCard)`
  padding: 0;
  overflow: hidden;

  .table-toolbar {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eef1f6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .table-toolbar h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a2e;
  }

  .table-toolbar span {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .table-inner {
    padding: 0 0.5rem 1rem;
  }
`;

export const DataTableStyled = styled(DataTable)`
  width: 100%;

  .p-datatable-wrapper {
    border-radius: 0 0 12px 12px;
  }
`;

export const TipoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: ${(p) => (p.$receber ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)")};
  color: ${(p) => (p.$receber ? "#059669" : "#d97706")};
`;

export const MoneyCell = styled.span`
  font-weight: 600;
  color: ${(p) => (p.$highlight ? "#1a1a2e" : "#475569")};
  font-variant-numeric: tabular-nums;
`;

export const ActionsWrap = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

export const DialogForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .conta-ref {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #f8f9ff;
    border-radius: 10px;
    border-left: 3px solid #4a00e0;
    font-size: 0.9rem;
    color: #475569;
  }

  .p-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }
  }
`;

export const MessagePreview = styled.div`
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #334155;
  max-height: 280px;
  overflow-y: auto;
`;

export const HistoricoList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid #eef1f6;

    &:last-child {
      border-bottom: none;
    }
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4a00e0;
    margin-top: 0.45rem;
    flex-shrink: 0;
  }

  .content strong {
    display: block;
    color: #1a1a2e;
    font-size: 0.9rem;
  }

  .content span {
    font-size: 0.8rem;
    color: #94a3b8;
  }
`;

export const LoteList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 320px;
  overflow-y: auto;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    background: #f8f9ff;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #334155;
  }
`;

export const EmptyHint = styled.p`
  text-align: center;
  color: #94a3b8;
  padding: 2rem 1rem;
  margin: 0;
`;

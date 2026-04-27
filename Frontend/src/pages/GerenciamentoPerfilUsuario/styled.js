import styled from 'styled-components';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';

export const ContainerPage = styled.div`
  padding: 24px;
`;

export const TitlePage = styled.h2`
  margin-bottom: 16px;
`;

export const DataTableStyled = styled(DataTable)`
  .p-datatable-thead > tr > th {
    background: #f4f4f9;
  }
`;

export const DropdownStyled = styled(Dropdown)`
  width: 180px;
`;

export const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
`;

export default ContainerPage;

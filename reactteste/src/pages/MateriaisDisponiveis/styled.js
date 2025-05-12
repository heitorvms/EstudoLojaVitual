import styled from 'styled-components';
import { Button, InputText, DataTable } from 'primereact';

export const ContainerPage = styled.div`
    padding: 20px;
    text-align: center;
`;

export const TitlePage = styled.h1`
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
`;

export const InputTextStyled = styled(InputText)`
    width: 70%;
    margin-right: 10px;
`;

export const ButtonStyled = styled(Button)`
    margin: 8px;
    border-radius: 20px;
    background-color: #1A1A2E;
    border: none;
    &:hover {
        background-color: #2c2c4e !important;
    }
`;

export const DataTableStyled = styled(DataTable)`
    width: 80%;
    margin: 0 auto;
    .p-datatable-thead > tr > th {
        background-color: #f5f5f5;
        font-weight: bold;
        color: #424242;
    }
`;
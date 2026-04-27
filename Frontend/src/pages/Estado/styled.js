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

export const FormRow = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 20px;
`;

export const InputTextStyled = styled(InputText)`
    width: 300px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:focus {
        border-color: #1A1A2E;
        outline: none;
    }
`;

export const ButtonStyled = styled(Button)`
    margin: 8px;
    border-radius: 20px;
    background-color: #1A1A2E;
    border: none;
    color: #ffffff;
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
    .p-datatable-tbody > tr > td {
        padding: 10px;
        border-bottom: 1px solid #e0e0e0;
    }
    .p-datatable-tbody > tr:hover {
        background-color: #f0f0f0;
    }
`;
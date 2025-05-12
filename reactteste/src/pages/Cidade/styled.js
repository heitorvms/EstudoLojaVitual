import styled from "styled-components";
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TableCell,
  Alert,
} from "@mui/material";

export const ContainerPageCidade = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
`;

export const NewCityButton = styled(Button)`
  margin-bottom: 20px;
  border-radius: 20px;
  text-transform: none;
`;

export const TableContainerStyled = styled(TableContainer)`
  width: 80%;
  margin-top: 20px;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1);
  border-radius: 2px;
`;

export const TableHeadCell = styled(TableCell)`
  font-size: 1.1rem;
  font-weight: bold;
  color: #424242;
  background-color: #f5f5f5;
`;

export const TableActionButton = styled(Button)`
  margin-left: 10px;
`;

export const DialogTitleStyled = styled(DialogTitle)`
  font-size: 1.5rem;
  background-color: #1976d2;
  color: white;
`;

export const DialogContentStyled = styled(DialogContent)`
  padding: 20px;
  margin-top: 2px;
`;

export const DialogActionsStyled = styled(DialogActions)`
  padding: 10px;
`;

export const SnackbarMessage = styled(Alert)`
  font-size: 1rem;
`;

export const BoxContainer = styled(Box)`
  margin: 4px 0;
`;

export const BoxButtonContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2px;
`;
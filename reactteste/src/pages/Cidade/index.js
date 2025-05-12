import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  TablePagination,
  Box,
} from "@mui/material";
import { CidadeService } from "../../services/CidadeService";
import { EstadoService } from "../../services/EstadoService";
import {
  ContainerPageCidade,
  Title,
  NewCityButton,
  TableContainerStyled,
  TableHeadCell,
  TableActionButton,
  DialogTitleStyled,
  DialogContentStyled,
  DialogActionsStyled,
  SnackbarMessage,
} from "../Cidade/styled";

const Cidade = () => {
  const cidadeVazia = {
    nome: "",
    estadoId: null,
  };

  const [cidades, setCidades] = useState([]);
  const [totalCidades, setTotalCidades] = useState(0);
  const [cidade, setCidade] = useState(cidadeVazia);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [estados, setEstados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [estadoIdFiltro, setEstadoIdFiltro] = useState(1);

  const cidadeService = new CidadeService();
  const estadoService = new EstadoService();

  const fetchCidades = async (pageNum, size, estadoId) => {
    try {
      const filtro = `estado/${estadoId}`;
      const response = await cidadeService.getPaginado(pageNum, size, filtro);
      setCidades(response.content || []);
      setTotalCidades(response.totalElements || 0);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      setSnackbarMessage("Erro ao carregar cidades.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await estadoService.getPaginado(0, 100);
      setEstados(response.content || []);
    } catch (error) {
      console.error("Erro ao carregar estados:", error);
      setSnackbarMessage("Erro ao carregar estados.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchEstados();
      await fetchCidades(page, rowsPerPage, estadoIdFiltro);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCidades(page, rowsPerPage, estadoIdFiltro);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setCidade(cidadeVazia);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveCidade = async () => {
    if (!cidade.nome.trim() || !cidade.estadoId) {
      setSnackbarMessage("Nome e Estado são obrigatórios.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const cidadeParaSalvar = {
        ...cidade,
        estado: { id: cidade.estadoId },
      };

      if (cidade.id) {
        await cidadeService.putRequest(cidadeParaSalvar);
        setSnackbarMessage("Cidade atualizada com sucesso!");
      } else {
        await cidadeService.postRequest(cidadeParaSalvar);
        setSnackbarMessage("Cidade cadastrada com sucesso!");
      }
      setSnackbarSeverity("success");
      await fetchCidades(page, rowsPerPage, estadoIdFiltro);
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Erro ao salvar cidade:", error);
      setSnackbarMessage("Erro ao salvar cidade.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditCidade = (cidadeSelecionada) => {
    setCidade({
      ...cidadeSelecionada,
      estadoId: cidadeSelecionada.estado ? cidadeSelecionada.estado.id : null,
    });
    setOpenDialog(true);
  };

  const handleDeleteCidade = async () => {
    if (!cidade.id) {
      setSnackbarMessage("Nenhuma cidade selecionada para exclusão.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      await cidadeService.deleteRequest(cidade.id);
      setSnackbarMessage("Cidade removida com sucesso!");
      setSnackbarSeverity("success");
      await fetchCidades(page, rowsPerPage, estadoIdFiltro);
      setOpenDeleteDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Erro ao excluir cidade:", error);
      setSnackbarMessage("Erro ao excluir cidade.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <ContainerPageCidade>
        <Box>
          <Title>Lista de Cidades</Title>
          <Box>
            <NewCityButton variant="contained" color="primary" onClick={handleOpenDialog}>
              + Nova Cidade
            </NewCityButton>
          </Box>

          <TableContainerStyled component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Estado</TableHeadCell>
                  <TableHeadCell>Ações</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cidades.length > 0 ? (
                  cidades.map((cidade) => (
                    <TableRow key={cidade.id} hover>
                      <TableCell>{cidade.nome}</TableCell>
                      <TableCell>{cidade.estado?.nome || "Estado não definido"}</TableCell>
                      <TableCell>
                        <TableActionButton
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEditCidade(cidade)}
                        >
                          Editar
                        </TableActionButton>
                        <TableActionButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setCidade(cidade);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          Excluir
                        </TableActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>Nenhuma cidade encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainerStyled>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCidades}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitleStyled>{cidade.id ? "Editar Cidade" : "Nova Cidade"}</DialogTitleStyled>
            <DialogContentStyled>
              <TextField
                label="Nome"
                fullWidth
                margin="dense"
                value={cidade.nome || ""}
                onChange={(e) => setCidade({ ...cidade, nome: e.target.value })}
                variant="outlined"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={cidade.estadoId || ""}
                  onChange={(e) => setCidade({ ...cidade, estadoId: e.target.value })}
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>Selecione um estado</em>
                  </MenuItem>
                  {estados.map((estado) => (
                    <MenuItem key={estado.id} value={estado.id}>
                      {estado.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContentStyled>
            <DialogActionsStyled>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancelar
              </Button>
              <Button onClick={handleSaveCidade} color="primary" variant="contained">
                Salvar
              </Button>
            </DialogActionsStyled>
          </Dialog>

          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
            <DialogTitleStyled>Excluir Cidade</DialogTitleStyled>
            <DialogContentStyled>Tem certeza que deseja excluir esta cidade?</DialogContentStyled>
            <DialogActionsStyled>
              <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
                Cancelar
              </Button>
              <Button onClick={handleDeleteCidade} color="error" variant="contained">
                Excluir
              </Button>
            </DialogActionsStyled>
          </Dialog>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <SnackbarMessage severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
              {snackbarMessage}
            </SnackbarMessage>
          </Snackbar>
        </Box>
      </ContainerPageCidade>
    </Container>
  );
};

export default Cidade;
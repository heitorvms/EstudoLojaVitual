import React, { useEffect, useState } from 'react';
import { UserService } from '../../services/UserService';
import { useNavigate } from 'react-router-dom';
import { PessoaGerenciamentoService } from '../../services/PessoaGerenciamentoService';
import { PermissaoService } from '../../services/PermissaoService';
import { ContainerPage, TitlePage, DataTableStyled, DropdownStyled, LoadingMessage } from './styled';
import { Column } from 'primereact/column';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userService = new UserService();
  const pessoaGerenciamentoService = new PessoaGerenciamentoService();
  const permissaoService = new PermissaoService();

  useEffect(() => {
    verificarPermissao();
    buscarUsuarios();
    buscarPermissoes();
  }, []);

  const verificarPermissao = async () => {
    try {
      const usuario = await userService.getCurrentUser();
      if (!usuario || (usuario.cargo !== 'Admin' && usuario.cargo !== 'Gerente')) {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  };

  const buscarUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await pessoaGerenciamentoService.getAllUsers();
      setUsuarios(data);
    } catch (error) {
      alert('Erro ao buscar usuários: ', error);
    }
    setIsLoading(false);
  };

  const buscarPermissoes = async () => {
    setIsLoading(true);
    try {
      const data = await permissaoService.getAll();
      setPermissoes(data);
    } catch (error) {
      alert('Erro ao buscar permissões: ', error);
    }
    setIsLoading(false);
  };

  const alterarPerfil = async (id, novoPerfil) => {
    try {
      console.log(`Alterando perfil do usuário ${id} para ${novoPerfil}`);
      await pessoaGerenciamentoService.alterarPermissao(id, novoPerfil);
      buscarUsuarios();
      alert('Perfil alterado com sucesso!');
    } catch (error) {
      alert('Erro ao alterar perfil: ', error.response?.data?.message || error.message);
    }
  };

  return (
    <ContainerPage>
      <TitlePage>Gerenciamento de Usuários</TitlePage>
      {isLoading ? (
        <LoadingMessage>Carregando...</LoadingMessage>
      ) : (
        <DataTableStyled value={usuarios} responsiveLayout="scroll">
          <Column field="nome" header="Nome" />
          <Column field="email" header="Email" />
          <Column
            header="Perfil"
            body={(rowData) => (
              <DropdownStyled
                value={rowData.permissoes?.[0] || ''}
                options={permissoes.map((p) => p.nome)}
                onChange={(e) => alterarPerfil(rowData.id, e.value)}
                placeholder="Selecione"
              />
            )}
          />
          <Column header="Ações" body={() => <span /> } />
        </DataTableStyled>
      )}
    </ContainerPage>
  );
};

export default AdminUsuarios;
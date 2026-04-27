import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { PessoaGerenciamentoService } from "../../services/PessoaGerenciamentoService";
import { PermissaoService } from "../../services/PermissaoService";
import { useNavigate } from "react-router-dom";
import { UserService } from "../../services/UserService";
import { ContainerPage, TitlePage, ButtonStyled } from "./styled";

const PermissaoUsuarios = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const toast = useRef(null);
  const navigate = useNavigate();
  const pessoaGerenciamento = useRef(new PessoaGerenciamentoService()).current;
  const permissaoService = useRef(new PermissaoService()).current;
  const userService = useRef(new UserService()).current;

  useEffect(() => {
    (async () => {
      try {
        const u = await userService.getCurrentUser();
        if (!u || (u.cargo !== "Admin" && u.cargo !== "Gerente")) {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await pessoaGerenciamento.getAllUsers();
        setUsers(
          (list || []).map((row) => ({
            label: row.nome,
            value: row.id,
          }))
        );
      } catch (e) {
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: e?.message || "Falha ao listar usuários",
          life: 4000,
        });
      }
      try {
        const perms = await permissaoService.getAll();
        setPermissions(
          (perms || []).map((p) => ({
            label: p.nome,
            value: p.nome,
          }))
        );
      } catch (e) {
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: e?.message || "Falha ao listar permissões",
          life: 4000,
        });
      }
    };
    load();
  }, [pessoaGerenciamento, permissaoService]);

  const savePermissions = async () => {
    if (!selectedUser) {
      toast.current?.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Selecione um usuário antes de salvar.",
        life: 3000,
      });
      return;
    }
    const first =
      selectedPermissions && selectedPermissions.length
        ? selectedPermissions[0]
        : null;
    if (!first) {
      toast.current?.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Selecione ao menos uma permissão.",
        life: 3000,
      });
      return;
    }
    try {
      await pessoaGerenciamento.alterarPermissao(selectedUser, first);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Permissão salva (primeira selecionada).",
        life: 3000,
      });
      setSelectedUser(null);
      setSelectedPermissions([]);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: e?.response?.data?.message || e?.message || "Falha ao salvar",
        life: 4000,
      });
    }
  };

  return (
    <ContainerPage>
      <TitlePage>Permissões de Usuário</TitlePage>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <Dropdown
          value={selectedUser}
          options={users}
          onChange={(e) => setSelectedUser(e.value)}
          placeholder="Selecione um usuário"
          style={{ width: "100%" }}
        />
        <MultiSelect
          value={selectedPermissions}
          options={permissions}
          onChange={(e) => setSelectedPermissions(e.value)}
          placeholder="Selecione as permissões (usa a 1.ª no salvamento)"
          style={{ width: "100%" }}
        />
        <ButtonStyled
          label="Salvar"
          icon="pi pi-check"
          onClick={savePermissions}
          disabled={!selectedUser}
        />
      </div>
      <Toast ref={toast} />
    </ContainerPage>
  );
};

export default PermissaoUsuarios;

import React, { useRef, useState } from 'react';
import styles from './styled';
import { LoginService } from '../../services/LoginService';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import Modal from '../../components/Modal/Modal';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [emailError, setEmailError] = useState(false);
  const loginService = new LoginService();
  const toast = useRef(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const realizarLogin = () => {
    (async () => {
      setIsLoading(true);
      const result = await loginService.login(email, password, rememberMe);
      setIsLoading(false);
      if (!result.success) {
        toast.current.show({ severity: 'error', summary: 'Erro ao fazer login', detail: result.message, life: 3000 });
        return;
      }
      // on success redirect
      window.location.href = '/';
    })();
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotPasswordModalOpen(true);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setCreateAccountModalOpen(true);
  };

  const handleCreateAccountSubmit = async () => {
    if (!nome || !email || !password || !cpf || !endereco || !cep) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos.',
        life: 3000,
      });
      return;
    }
    if (!emailRegex.test(email)) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, insira um email válido.',
        life: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/pessoa-gerenciamento/cadastrar', {
        nome,
        email,
        senha: password,
        cpf,
        endereco,
        cep,
      });
      setIsLoading(false);
      setCreateAccountModalOpen(false);
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Conta criada com sucesso! Faça login para continuar.',
        life: 3000,
      });
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta';
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: errorMessage,
        life: 3000,
      });
    }
  };

  const handleSendCode = async () => {
    if (!recoveryEmail || !emailRegex.test(recoveryEmail)) {
      setEmailError(true);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: !recoveryEmail ? 'Por favor, preencha o campo de email.' : 'Por favor, insira um email válido.',
        life: 3000,
      });
      return;
    }
    setEmailError(false);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/pessoa-gerenciamento/senha-codigo', {
        email: recoveryEmail,
      });
      setIsLoading(false);
      setForgotPasswordModalOpen(false);
      setResetPasswordModalOpen(true);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: response.data, life: 3000 });
    } catch (error) {
      setIsLoading(false);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: error.response?.data?.message || 'Erro ao enviar o código',
        life: 3000,
      });
    }
  };

  const handleResetPassword = async () => {
    if (!recoveryEmail || !emailRegex.test(recoveryEmail) || !recoveryCode || !newPassword) {
      setEmailError(true);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos corretamente.',
        life: 3000,
      });
      return;
    }
    setEmailError(false);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/pessoa-gerenciamento/senha-alterar', {
        email: recoveryEmail,
        senha: newPassword,
        codigoRecuperacaoSenha: recoveryCode,
      });
      setIsLoading(false);
      setResetPasswordModalOpen(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: response.data, life: 3000 });
    } catch (error) {
      setIsLoading(false);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: error.response?.data?.message || 'Erro ao alterar a senha',
        life: 3000,
      });
    }
  };

  return (
    <div style={styles.loginContainer}>
      <Toast ref={toast} />
      <div style={styles.loginCard}>
        <h2 style={styles.title}>Faça o seu login</h2>
        <div style={styles.formContainer}>
          <div style={styles.formField}>
            <label htmlFor="email" style={styles.formLabel}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Endereço de email"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="password" style={styles.formLabel}>Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.optionsContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              Lembrar de mim
            </label>
            <a href="#" style={styles.forgotPasswordLink} onClick={handleForgotPassword}>
              Esqueceu a senha?
            </a>
          </div>
          {isLoading ? (
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          ) : (
            <button
              onClick={realizarLogin}
              style={styles.loginButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.loginButtonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.loginButton.backgroundColor)}
            >
              Entrar
            </button>
          )}
          <p style={styles.createAccountText}>
            Não tem uma conta?{' '}
            <a href="#" style={styles.createAccountLink} onClick={handleCreateAccount}>
              Crie uma agora!
            </a>
          </p>
        </div>
      </div>

      {/* Modal de Criar Conta */}
      <Modal isOpen={createAccountModalOpen} onClose={() => setCreateAccountModalOpen(false)} title="Criar Conta">
        <div style={styles.formContainer}>
          <div style={styles.formField}>
            <label htmlFor="nome" style={styles.formLabel}>Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="emailCadastro" style={styles.formLabel}>Email</label>
            <input
              id="emailCadastro"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="senhaCadastro" style={styles.formLabel}>Senha</label>
            <input
              id="senhaCadastro"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="cpf" style={styles.formLabel}>CPF</label>
            <input
              id="cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Digite seu CPF"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="endereco" style={styles.formLabel}>Endereço</label>
            <input
              id="endereco"
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Digite seu endereço"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="cep" style={styles.formLabel}>CEP</label>
            <input
              id="cep"
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              placeholder="Digite seu CEP"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          ) : (
            <button
              onClick={handleCreateAccountSubmit}
              style={styles.loginButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.loginButtonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.loginButton.backgroundColor)}
            >
              Criar Conta
            </button>
          )}
        </div>
      </Modal>

      {/* Modal de Recuperar Senha */}
      <Modal isOpen={forgotPasswordModalOpen} onClose={() => setForgotPasswordModalOpen(false)} title="Recuperar Senha">
        <div style={styles.formContainer}>
          <div style={styles.formField}>
            <label htmlFor="recoveryEmail" style={styles.formLabel}>Email</label>
            <input
              id="recoveryEmail"
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="Digite seu email"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          ) : (
            <button
              onClick={handleSendCode}
              style={styles.loginButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.loginButtonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.loginButton.backgroundColor)}
            >
              Enviar Código
            </button>
          )}
        </div>
      </Modal>

      {/* Modal de Redefinir Senha */}
      <Modal isOpen={resetPasswordModalOpen} onClose={() => setResetPasswordModalOpen(false)} title="Redefinir Senha">
        <div style={styles.formContainer}>
          <div style={styles.formField}>
            <label htmlFor="resetEmail" style={styles.formLabel}>Email</label>
            <input
              id="resetEmail"
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="Digite seu email"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="recoveryCode" style={styles.formLabel}>Código de Recuperação</label>
            <input
              id="recoveryCode"
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="Digite o código recebido"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formField}>
            <label htmlFor="newPassword" style={styles.formLabel}>Nova Senha</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              style={styles.formInput}
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          ) : (
            <button
              onClick={handleResetPassword}
              style={styles.loginButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.loginButtonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.loginButton.backgroundColor)}
            >
              Alterar Senha
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Login;
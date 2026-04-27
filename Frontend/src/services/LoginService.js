import axios from "axios";
import { BaseService } from "./BaseService";

export class LoginService extends BaseService {
  CHAVE_TOKEN = "token";

  constructor() {
    super("pessoa-gerenciamento/");
  }
  async login(email, senha, rememberMe) {
    try {
      const res = await this.axiosInstance.post('login', { email, senha, rememberMe });
      const token = res.data.token;
      if (rememberMe) {
        localStorage.setItem(this.CHAVE_TOKEN, token);
      } else {
        sessionStorage.setItem(this.CHAVE_TOKEN, token);
      }
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, message };
    }
  }

  autenticado() {
    return (
      localStorage.getItem(this.CHAVE_TOKEN) != null ||
      sessionStorage.getItem(this.CHAVE_TOKEN) != null
    );
  }

  getToken() {
    return localStorage.getItem(this.CHAVE_TOKEN) || sessionStorage.getItem(this.CHAVE_TOKEN);
  }

  sair() {
    localStorage.removeItem(this.CHAVE_TOKEN);
    sessionStorage.removeItem(this.CHAVE_TOKEN);
    window.location.href = "/";
  }
}
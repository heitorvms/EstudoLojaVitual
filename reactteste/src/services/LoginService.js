import axios from "axios";
import { BaseService } from "./BaseService";

export class LoginService extends BaseService {
  CHAVE_TOKEN = "token";

  constructor() {
    super("pessoa-gerenciamento/");
  }

  login(email, senha, rememberMe, mensagemErro) {
    axios
      .post(this.url + "login", { email: email, senha: senha, rememberMe: rememberMe })
      .then((res) => {
        console.log(res);
        const token = res.data.token;
        if (rememberMe) {
          localStorage.setItem(this.CHAVE_TOKEN, token);
        } else {
          sessionStorage.setItem(this.CHAVE_TOKEN, token);
        }
        window.location.href = "/";
      })
      .catch((error) => {
        console.log(error.response?.data?.message);
        mensagemErro(error.response?.data?.message || "Erro ao fazer login");
      });
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
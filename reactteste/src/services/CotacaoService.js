import { BaseService } from "./BaseService";

export class CotacaoService extends BaseService {
  constructor() {
    super("cotacoes/");
  }

  async getPaginado(page = 0, size = 10) {
    try {
      const response = await this.axiosInstance.get(`?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      const response = await this.axiosInstance.get(this.url);
      return response.data.content;
    } catch (error) {
      console.error(
        "Erro ao buscar cotações:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async postRequest(cotacao) {
    try {
      console.log("URL da requisição:", this.url);
      console.log("Dados enviados:", JSON.stringify(cotacao, null, 2));
      console.log("Token atual:", localStorage.getItem("token") || sessionStorage.getItem("token"));
      console.log("Headers da requisição:", this.axiosInstance.defaults.headers);
      const response = await this.axiosInstance.post(this.url, cotacao);
      console.log("Resposta recebida:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar cotação:");
      console.error("Status:", error.response?.status);
      console.error("Dados do erro:", error.response?.data);
      console.error("Mensagem:", error.message);
      console.error("Headers da resposta:", error.response?.headers);
      throw error;
    }
  }

  async deleteRequest(id) {
    try {
      await this.axiosInstance.delete(`${this.url}${id}`);
    } catch (error) {
      console.error(
        "Erro ao excluir cotação:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getEmpresaMaisBarata(cotacaoId) {
    try {
      const response = await this.axiosInstance.get(
        `/${cotacaoId}/empresa-mais-barata`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar empresa mais barata:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getMateriaisMaisBaratos(cotacaoId) {
    try {
      const response = await this.axiosInstance.get(
        `/${cotacaoId}/materiais-mais-baratos`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar materiais mais baratos:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}
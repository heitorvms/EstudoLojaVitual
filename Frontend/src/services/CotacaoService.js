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
      const firstPage = await this.getPaginado(0, 10);
      const totalPages = firstPage.totalPages;
      const promises = [];
      for (let i = 1; i < totalPages; i++) {
        promises.push(this.getPaginado(i, 10));
      }
      const otherPages = await Promise.all(promises);
      return [firstPage, ...otherPages].flatMap(page => page.content);
    } catch (error) {
      console.error("Erro ao buscar todas as cotações:", error);
      throw error;
    }
  }

  async getAllSearch(query, size = 10) {
    try {
      const first = await this.search(query, 0, size);
      const totalPages = first.totalPages || 1;
      const content = [...(first.content || [])];
      const pagePromises = [];
      for (let i = 1; i < totalPages; i++) {
        pagePromises.push(
          this.axiosInstance
            .get(`/search?query=${encodeURIComponent(query)}&page=${i}&size=${size}`)
            .then((r) => r.data)
        );
      }
      const others = await Promise.all(pagePromises);
      others.forEach((p) => {
        if (p?.content?.length) content.push(...p.content);
      });
      return content;
    } catch (error) {
      console.error("Erro ao buscar todas as cotações com busca:", error.response?.data || error.message);
      throw error;
    }
  }

  async search(query, page = 0, size = 10) {
    try {
      const response = await this.axiosInstance.get(`/search?query=${query}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cotações:", error.response?.data || error.message);
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
      console.error("Erro ao excluir cotação:", error.response?.data || error.message);
      throw error;
    }
  }

  async getEmpresaMaisBarata(cotacaoId) {
    try {
      const response = await this.axiosInstance.get(`/${cotacaoId}/empresa-mais-barata`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar empresa mais barata:", error.response?.data || error.message);
      throw error;
    }
  }

  async getMateriaisMaisBaratos(cotacaoId) {
    try {
      const response = await this.axiosInstance.get(`/${cotacaoId}/materiais-mais-baratos`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar materiais mais baratos:", error.response?.data || error.message);
      throw error;
    }
  }

  async calcularValoresPorDistribuidora(cotacaoId, percentualLucro = 0) {
    try {
      const response = await this.axiosInstance.get(
        `/${cotacaoId}/calcula-valores?percentualLucro=${percentualLucro}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao calcular valores por distribuidora:", error.response?.data || error.message);
      throw error;
    }
  }

  async getDistribuidoraMaisBarata(cotacaoId, percentualLucro = 0) {
    try {
      const response = await this.axiosInstance.get(
        `/${cotacaoId}/distribuidora-mais-barata?percentualLucro=${percentualLucro}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar distribuidora mais barata:", error.response?.data || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cotação por ID:", error.response?.data || error.message);
      throw error;
    }
  }
}
import { BaseService } from "./BaseService";

export class CotacaoService extends BaseService {
  constructor() {
    super("cotacoes/");
  }

  async getPaginado(page = 0, size = 10, direcao = "desc", situacao = "ABERTAS") {
    const response = await this.axiosInstance.get(
      `?page=${page}&size=${size}&sort=id,${direcao}&situacao=${situacao}`
    );
    return response.data;
  }

  async getAll(situacao = "ABERTAS") {
    try {
      const firstPage = await this.getPaginado(0, 10, "desc", situacao);
      const totalPages = firstPage.totalPages;
      const promises = [];
      for (let i = 1; i < totalPages; i++) {
        promises.push(this.getPaginado(i, 10, "desc", situacao));
      }
      const otherPages = await Promise.all(promises);
      return [firstPage, ...otherPages].flatMap(page => page.content);
    } catch (error) {
      console.error("Erro ao buscar todas as cotações:", error);
      throw error;
    }
  }

  async getAllSearch(query, size = 10, situacao = "ABERTAS") {
    try {
      const first = await this.search(query, 0, size, "desc", situacao);
      const totalPages = first.totalPages || 1;
      const pagePromises = [];
      for (let i = 1; i < totalPages; i++) {
        pagePromises.push(this.search(query, i, size, "desc", situacao));
      }
      const others = await Promise.all(pagePromises);
      return [first, ...others].flatMap((p) => p?.content || []);
    } catch (error) {
      console.error("Erro ao buscar todas as cotações com busca:", error.response?.data || error.message);
      throw error;
    }
  }

  async search(query, page = 0, size = 10, direcao = "desc", situacao = "ABERTAS") {
    try {
      const response = await this.axiosInstance.get(
        `/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=id,${direcao}&situacao=${situacao}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cotações:", error.response?.data || error.message);
      throw error;
    }
  }

  async postRequest(cotacao) {
    try {
      const response = await this.axiosInstance.post(this.url, cotacao);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar cotação:", error.response?.data || error.message);
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

  async enviarWhatsappOrcamento(id) {
    const response = await this.axiosInstance.post(`/${id}/whatsapp/orcamento`);
    return response.data;
  }

  async enviarWhatsappCobranca(id) {
    const response = await this.axiosInstance.post(`/${id}/whatsapp/cobranca`);
    return response.data;
  }

  async listarWhatsappLogs(id) {
    const response = await this.axiosInstance.get(`/${id}/whatsapp/logs`);
    return response.data;
  }

  async atualizarDadosCobranca(id, dados) {
    const response = await this.axiosInstance.patch(`/${id}/dados-cobranca`, dados);
    return response.data;
  }
}
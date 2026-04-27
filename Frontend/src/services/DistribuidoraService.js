import { BaseService } from "./BaseService";

export class DistribuidoraService extends BaseService {
  constructor() {
    super("distribuidoras");
  }

  async getSugestoes(query, page = 0, size = 10) {
    if (!query || typeof query !== "string" || query.trim() === "") {
      return {
        success: false,
        message: {
          severity: "warn",
          summary: "Atenção",
          detail: "Termo de busca inválido",
          life: 3000,
        },
        data: { content: [], totalPages: 1, totalElements: 0 },
      };
    }
    try {
      const response = await this.axiosInstance.get("/sugestoes", {
        params: { query: query.trim(), page, size },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao buscar sugestões de distribuidoras:", error);
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail: "Erro ao buscar sugestões de distribuidoras",
          life: 3000,
        },
        data: { content: [], totalPages: 1, totalElements: 0 },
      };
    }
  }

  async getPaginado(page = 0, size = 10, query = "") {
    try {
      const params = { page, size };
      if (query) {
        params.query = query.trim();
      }
      const response = await this.axiosInstance.get("", { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao buscar distribuidoras paginadas:", error);
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail: "Erro ao buscar distribuidoras paginadas",
          life: 3000,
        },
        data: { content: [], totalPages: 0, totalElements: 0 },
      };
    }
  }

  async postRequest(data) {
    if (!data.nome?.trim()) {
      return { success: false, message: { severity: "warn", summary: "Atenção", detail: "Nome é obrigatório", life: 3000 } };
    }
    try {
      const response = await this.axiosInstance.post("", data);
      return { success: true, message: { severity: "success", summary: "Sucesso", detail: "Distribuidora adicionada", life: 3000 }, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao adicionar distribuidora", life: 3000 } };
    }
  }

  async putRequest(id, data) {
    if (!data.nome?.trim()) {
      return { success: false, message: { severity: "warn", summary: "Atenção", detail: "Nome é obrigatório", life: 3000 } };
    }
    try {
      const response = await this.axiosInstance.put(`/${id}`, data);
      return { success: true, message: { severity: "success", summary: "Sucesso", detail: "Distribuidora atualizada", life: 3000 }, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao atualizar distribuidora", life: 3000 } };
    }
  }

  async deleteRequest(id) {
    try {
      const response = await this.axiosInstance.delete(`/${id}`);
      return { success: true, message: { severity: "success", summary: "Sucesso", detail: "Distribuidora removida", life: 3000 }, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao remover distribuidora", life: 3000 } };
    }
  }
}
import { BaseService } from "./BaseService";

export class SimulacaoProducaoService extends BaseService {
  constructor() {
    super("simulacao-producao");
  }

  async calcular(payload) {
    try {
      const response = await this.axiosInstance.post("/calcular", payload);
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status;
      const detail =
        error.response?.data?.message ||
        (status === 404
          ? "Endpoint indisponível. Backend ainda não publicou /api/simulacao-producao."
          : "Erro ao calcular simulação de produção.");
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail,
          life: 4000,
        },
      };
    }
  }

  async salvar(payload) {
    try {
      const response = await this.axiosInstance.post("/historico", payload);
      return {
        success: true,
        data: response.data,
        message: {
          severity: "success",
          summary: "Sucesso",
          detail: "Simulação salva no histórico.",
          life: 2500,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail:
            error.response?.data?.message || "Erro ao salvar simulação.",
          life: 4000,
        },
      };
    }
  }

  async atualizar(id, payload) {
    try {
      const response = await this.axiosInstance.put(`/historico/${id}`, payload);
      return {
        success: true,
        data: response.data,
        message: {
          severity: "success",
          summary: "Sucesso",
          detail: "Simulação atualizada no histórico.",
          life: 2500,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail:
            error.response?.data?.message || "Erro ao atualizar simulação.",
          life: 4000,
        },
      };
    }
  }

  async listarHistorico() {
    try {
      const response = await this.axiosInstance.get("/historico");
      return { success: true, data: response.data || [] };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail:
            error.response?.data?.message ||
            "Erro ao carregar histórico de simulações.",
          life: 4000,
        },
      };
    }
  }

  async obterHistorico(id) {
    try {
      const response = await this.axiosInstance.get(`/historico/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail:
            error.response?.data?.message ||
            "Erro ao carregar simulação do histórico.",
          life: 4000,
        },
      };
    }
  }

  async excluirHistorico(id) {
    try {
      await this.axiosInstance.delete(`/historico/${id}`);
      return {
        success: true,
        message: {
          severity: "success",
          summary: "Sucesso",
          detail: "Simulação removida do histórico.",
          life: 2500,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail:
            error.response?.data?.message ||
            "Erro ao remover simulação do histórico.",
          life: 4000,
        },
      };
    }
  }
}

import { BaseService } from "./BaseService";

export class MaterialPrecoService extends BaseService {
  constructor() {
    super("material-precos");
  }

  async registrar(payload) {
    try {
      const response = await this.axiosInstance.post("", payload);
      return {
        success: true,
        data: response.data,
        message: {
          severity: "success",
          summary: "Sucesso",
          detail: "Preço registrado.",
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
            error.response?.data?.message || "Erro ao registrar preço.",
          life: 3500,
        },
      };
    }
  }

  async vigentesPorMaterial(materialId) {
    try {
      const response = await this.axiosInstance.get(`/material/${materialId}/vigentes`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: {
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar preços.",
          life: 3000,
        },
      };
    }
  }

  async vigentesPorDistribuidora(distribuidoraId) {
    try {
      const response = await this.axiosInstance.get(
        `/distribuidora/${distribuidoraId}/vigentes`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: {
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar preços.",
          life: 3000,
        },
      };
    }
  }

  async historico(materialId, distribuidoraId) {
    try {
      const response = await this.axiosInstance.get("/historico", {
        params: { materialId, distribuidoraId },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: {
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar histórico.",
          life: 3000,
        },
      };
    }
  }
}

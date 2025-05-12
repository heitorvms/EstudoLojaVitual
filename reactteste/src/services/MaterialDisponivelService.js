import axios from "axios";
import { BaseService } from "./BaseService";

export class MaterialDisponivelService extends BaseService {
  constructor() {
    super("materiais-disponiveis");
  }

  async getFunction() {
    try {
      const response = await this.axiosInstance.get("");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao carregar materiais", life: 3000 } };
    }
  }

  async postRequest(data) {
    if (!data.descricao?.trim()) {
      return { success: false, message: { severity: "warn", summary: "Atenção", detail: "Descrição é obrigatória", life: 3000 } };
    }
    try {
      const response = await this.axiosInstance.post("", data);
      return { success: true, message: { severity: "success", summary: "Sucesso", detail: "Material adicionado com sucesso", life: 3000 }, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao adicionar material", life: 3000 } };
    }
  }

  async deleteRequest(id) {
    try {
      const response = await this.axiosInstance.delete(`/${id}`);
      return { success: true, message: { severity: "success", summary: "Sucesso", detail: "Material removido com sucesso", life: 3000 }, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao remover material", life: 3000 } };
    }
  }

  async getMateriais(query) {
    try {
      const response = await this.axiosInstance.get("", { params: { query } });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: { 
          severity: "error", 
          summary: "Erro", 
          detail: "Erro ao buscar materiais", 
          life: 3000 
        } 
      };
    }
  }
}
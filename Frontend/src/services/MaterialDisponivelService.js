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

  async putRequest(id, data) {
    if (!data.descricao?.trim()) {
      return { success: false, message: { severity: "warn", summary: "Atenção", detail: "Descrição é obrigatória", life: 3000 } };
    }
    try {
      const response = await this.axiosInstance.put(`/${id}`, data);
      return { success: true, message: { severity: "success", summary: "Sucesso", detail: "Material atualizado com sucesso", life: 3000 }, data: response.data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao atualizar material", life: 3000 } };
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
      if (!query || query.trim().length < 3) {
        return { 
          success: false, 
          message: { 
            severity: "warn", 
            summary: "Atenção", 
            detail: "Digite pelo menos 3 caracteres para pesquisar", 
            life: 3000 
          } 
        };
      }

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          return {
            success: false,
            message: {
              severity: "error",
              summary: "Erro",
              detail: "Sessão expirada. Por favor, faça login novamente.",
              life: 3000
            }
          };
        }

        const response = await this.axiosInstance.get("/search", { 
          params: { 
            query: query.trim().toLowerCase() 
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

      if (!response.data || response.data.length === 0) {
        return {
          success: true,
          data: [],
          message: {
            severity: "info",
            summary: "Informação",
            detail: "Nenhum material encontrado com este termo",
            life: 3000
          }
        };
      }

      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
        if (error.response?.status === 401) {
          // Clear tokens on authentication error
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          window.location.href = "/login"; // Redirect to login page
          return {
            success: false,
            message: {
              severity: "error",
              summary: "Erro",
              detail: "Sessão expirada. Por favor, faça login novamente.",
              life: 3000
            }
          };
        } else {
          return {
            success: false,
            message: {
              severity: "error",
              summary: "Erro",
              detail: "Erro ao buscar materiais. Por favor, tente novamente.",
              life: 3000
            }
          };
        }
    }
  }
}
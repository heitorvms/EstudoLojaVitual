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
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message;

      if (status === 409) {
        return {
          success: false,
          message: {
            severity: "warn",
            summary: "Material em uso",
            detail:
              backendMsg ||
              "Este material está vinculado a simulações ou orçamentos salvos e não pode ser excluído.",
            life: 5000,
          },
        };
      }

      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail: backendMsg || "Erro ao remover material",
          life: 4000,
        },
      };
    }
  }

  async previewPlanilha(arquivo, distribuidoraId) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: { severity: "error", summary: "Sessão expirada", detail: "Faça login novamente.", life: 3000 },
        };
      }
      const form = new FormData();
      form.append("arquivo", arquivo);
      const params = {};
      if (distribuidoraId) params.distribuidoraId = distribuidoraId;
      const response = await this.axiosInstance.post("/importar-planilha", form, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail: error.response?.data?.message || "Não foi possível ler a planilha.",
          life: 4000,
        },
      };
    }
  }

  async importarBatch(payload) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: { severity: "error", summary: "Sessão expirada", detail: "Faça login novamente.", life: 3000 },
        };
      }
      const response = await this.axiosInstance.post("/importar-batch", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { materiaisCriados = 0, precosRegistrados = 0, distribuidora = "" } = response.data || {};
      return {
        success: true,
        data: response.data,
        message: {
          severity: "success",
          summary: "Importação concluída",
          detail: `${precosRegistrados} preço(s) gravado(s) para ${distribuidora}. ${materiaisCriados} material(is) novo(s) criado(s).`,
          life: 4000,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail: error.response?.data?.message || "Erro ao importar.",
          life: 4000,
        },
      };
    }
  }

  async baixarTemplate() {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: { severity: "error", summary: "Sessão expirada", detail: "Faça login novamente.", life: 3000 },
        };
      }
      const response = await this.axiosInstance.get("/template-planilha", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-materiais.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: { severity: "error", summary: "Erro", detail: "Falha ao baixar template.", life: 3000 },
      };
    }
  }

  async getOpcoes(query = "") {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: {
            severity: "error",
            summary: "Erro",
            detail: "Sessão expirada. Por favor, faça login novamente.",
            life: 3000,
          },
        };
      }

      const params = {};
      if (query?.trim()) params.query = query.trim();

      const response = await this.axiosInstance.get("/opcoes", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, data: response.data || [] };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return {
          success: false,
          message: {
            severity: "error",
            summary: "Erro",
            detail: "Sessão expirada. Por favor, faça login novamente.",
            life: 3000,
          },
        };
      }
      return {
        success: false,
        message: {
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar materiais",
          life: 3000,
        },
      };
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
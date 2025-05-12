import { BaseService } from "./BaseService";

export class DistribuidoraService extends BaseService {
  constructor() {
    super("distribuidoras/");
  }

  async getAll() {
    try {
      const response = await this.axiosInstance.get(this.url);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar distribuidoras:", error);
      throw error;
    }
  }
}
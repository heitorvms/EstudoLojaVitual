import { BaseService } from "./BaseService";

export class PermissaoService extends BaseService {
  constructor() {
    super("permissao/");
  }

   async getAll() {
    try {
      const response = await this.axiosInstance.get((''));
      return response.data;
    } catch (error) {
      console.error("Erro na requisição GET all:", error.response?.data || error.message);
      throw error;
    }
  }

}

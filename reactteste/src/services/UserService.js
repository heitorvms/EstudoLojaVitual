import { BaseService } from './BaseService';

export class UserService extends BaseService {
  constructor() {
    super('pessoa');
  }

  async getCurrentUser() {
    try {
      const response = await this.axiosInstance.get('/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error.response?.data || error.message);
      throw error;
    }
  }
}
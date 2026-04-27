import { BaseService } from './BaseService';
import axios from 'axios';


export class UserService extends BaseService {
   CHAVE_TOKEN = "token";
   
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
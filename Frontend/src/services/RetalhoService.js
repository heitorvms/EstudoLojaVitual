import { BaseService } from './BaseService';

export class RetalhoService extends BaseService {
  constructor() {
    super('retalhos');
  }

  async listar() {
    const response = await this.axiosInstance.get('');
    return response.data;
  }

  async usar(id, quantidade) {
    await this.axiosInstance.post(`/${id}/usar`, { quantidade });
  }
}

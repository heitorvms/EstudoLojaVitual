import { BaseService } from './BaseService';

export class RetalhoService extends BaseService {
  constructor() {
    super('retalhos');
  }

  async listar(page = 0, size = 15, busca = '') {
    const response = await this.axiosInstance.get('', {
      params: { page, size, busca: busca || undefined },
    });
    return response.data;
  }

  async usar(id, quantidade) {
    await this.axiosInstance.post(`/${id}/usar`, { quantidade });
  }
}

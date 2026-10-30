import { BaseService } from './BaseService';

export class ConfiguracaoProducaoService extends BaseService {
  constructor() {
    super('configuracoes/producao');
  }

  async obter() {
    const response = await this.axiosInstance.get('');
    return response.data;
  }

  async salvar(data) {
    const response = await this.axiosInstance.put('', data);
    return response.data;
  }
}

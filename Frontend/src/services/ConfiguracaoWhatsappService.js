import { BaseService } from './BaseService';

export class ConfiguracaoWhatsappService extends BaseService {
  constructor() {
    super('configuracoes/whatsapp');
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

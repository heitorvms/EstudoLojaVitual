import { BaseService } from "./BaseService";

export class WhatsappStatusService extends BaseService {
  constructor() {
    super("whatsapp");
  }

  async getStatus() {
    const response = await this.axiosInstance.get("status");
    return response.data;
  }

  async conectar() {
    const response = await this.axiosInstance.post("conectar");
    return response.data;
  }

  async desconectar() {
    const response = await this.axiosInstance.post("desconectar");
    return response.data;
  }
}

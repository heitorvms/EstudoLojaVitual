import { BaseService } from "./BaseService";

export class FinanceiroService extends BaseService {
  constructor() {
    super("financeiro/");
  }

  async listar({ tipo, status, page = 0, size = 20 } = {}) {
    const params = { page, size };
    if (tipo) params.tipo = tipo;
    if (status) params.status = status;
    const response = await this.axiosInstance.get("", { params });
    return response.data;
  }

  async obterResumo() {
    const response = await this.axiosInstance.get("resumo");
    return response.data;
  }

  async listarPorCotacao(idCotacao) {
    const response = await this.axiosInstance.get(`cotacao/${idCotacao}`);
    return response.data;
  }

  async gerar(idCotacao, substituir = false, opcoes = null) {
    const response = await this.axiosInstance.post(
      `cotacao/${idCotacao}/gerar?substituir=${substituir}`,
      opcoes || {}
    );
    return response.data;
  }

  async previewWhatsappCobranca(idConta) {
    const response = await this.axiosInstance.get(`contas/${idConta}/whatsapp-cobranca`);
    return response.data;
  }

  async historicoCobranca(idConta) {
    const response = await this.axiosInstance.get(`contas/${idConta}/historico-cobranca`);
    return response.data;
  }

  async registrarCobranca(idConta, tipo = "ABERTURA_WHATSAPP") {
    const response = await this.axiosInstance.post(`contas/${idConta}/registrar-cobranca`, { tipo });
    return response.data;
  }

  async previewsVencidas() {
    const response = await this.axiosInstance.get("cobranca/vencidas-preview");
    return response.data;
  }

  async registrarLoteVencidas() {
    const response = await this.axiosInstance.post("cobranca/lote-vencidas");
    return response.data;
  }

  async atualizarVencidas() {
    const response = await this.axiosInstance.post("atualizar-vencidas");
    return response.data;
  }

  async registrarBaixa(id, payload) {
    const response = await this.axiosInstance.patch(`contas/${id}/baixa`, payload);
    return response.data;
  }

  async cancelar(id) {
    const response = await this.axiosInstance.patch(`contas/${id}/cancelar`);
    return response.data;
  }
}

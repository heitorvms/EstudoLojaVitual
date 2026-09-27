import { BaseService } from "./BaseService";

export class OrdemServicoService extends BaseService {
  constructor() {
    super("ordens-servico");
  }

  async listar(page = 0, size = 10, query = "") {
    try {
      const params = { page, size };
      if (query) params.query = query;
      const { data } = await this.axiosInstance.get("", { params });
      return { success: true, data };
    } catch (error) {
      return { success: false, message: { severity: "error", summary: "Erro", detail: "Erro ao listar OS", life: 3000 }, data: { content: [], totalElements: 0 } };
    }
  }

  async getById(id) {
    const { data } = await this.axiosInstance.get(`/${id}`);
    return data;
  }

  async rascunhoDeCotacao(cotacaoId) {
    const { data } = await this.axiosInstance.get(`/rascunho-cotacao/${cotacaoId}`);
    return data;
  }

  async criarDeCotacao(cotacaoId, body) {
    const { data } = await this.axiosInstance.post(`/de-cotacao/${cotacaoId}`, body);
    return data;
  }

  async adicionarMaoDeObra(id, lancamento) {
    const { data } = await this.axiosInstance.post(`/${id}/mao-de-obra`, lancamento);
    return data;
  }

  async atualizar(id, body) {
    const { data } = await this.axiosInstance.put(`/${id}`, body);
    return data;
  }

  async alterarPagamento(id, categoria, pago) {
    const { data } = await this.axiosInstance.patch(`/${id}/pagamento`, null, { params: { categoria, pago } });
    return data;
  }

  async gerarFinanceiro(id, opcoes) {
    const { data } = await this.axiosInstance.post(`/${id}/financeiro`, opcoes);
    return data;
  }
}

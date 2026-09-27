import { BaseService } from "./BaseService";

export class FuncionarioOficinaService extends BaseService {
  constructor() {
    super("funcionarios-oficina");
  }

  async listar(apenasAtivos = false) {
    const { data } = await this.axiosInstance.get("", { params: { apenasAtivos } });
    return data;
  }

  async resumo(id, inicio, fim) {
    const { data } = await this.axiosInstance.get(`/${id}/resumo`, { params: { inicio, fim } });
    return data;
  }

  async registrarPagamento(id, ids, pago) {
    await this.axiosInstance.patch(`/${id}/lancamentos/pagamento`, { ids, pago });
  }

  async criar(body) {
    const { data } = await this.axiosInstance.post("", body);
    return data;
  }

  async atualizar(id, body) {
    const { data } = await this.axiosInstance.put(`/${id}`, body);
    return data;
  }

  async excluir(id) {
    const { data } = await this.axiosInstance.delete(`/${id}`);
    return data;
  }
}

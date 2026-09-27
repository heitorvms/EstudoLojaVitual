import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function client() {
  const instance = axios.create({ baseURL: API_URL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return instance;
}

export class CompraEstoqueService {
  async listarCompras(page = 0, size = 10, query = "") {
    const { data } = await client().get("/compras-lote", {
      params: { page, size, query: query || undefined },
    });
    return data;
  }

  async buscarCompra(id) {
    const { data } = await client().get(`/compras-lote/${id}`);
    return data;
  }

  async criarCompra(body) {
    const { data } = await client().post("/compras-lote", body);
    return data;
  }

  async atualizarCompra(id, body) {
    const { data } = await client().put(`/compras-lote/${id}`, body);
    return data;
  }

  async cancelarCompra(id, motivo) {
    const { data } = await client().post(`/compras-lote/${id}/cancelar`, { motivo });
    return data;
  }

  async listarEstoque() {
    const { data } = await client().get("/estoque");
    return data;
  }
}

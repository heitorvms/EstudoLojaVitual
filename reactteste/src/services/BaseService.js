import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export class BaseService {
  constructor(rota) {
    this.rota = rota;
    this.url = `${API_URL}/${this.rota}`;

    this.axiosInstance = axios.create({
      baseURL: this.url,
    });
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getPaginado(page = 0, size = 5) {
    try {
      const response = await this.axiosInstance.get(`?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição GET paginada:", error.response?.data || error.message);
      throw error;
    }
  }

  async getPorNome(nome, page = 0, size = 5) {
    try {
      const response = await this.axiosInstance.get(
        `/buscarPorNome?nome=${nome}&page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro na requisição GET por nome:", error.response?.data || error.message);
      throw error;
    }
  }

  async postRequest(data) {
    try {
      const response = await this.axiosInstance.post(`/${this.rota}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFunction() {
    try {
      const response = await this.axiosInstance.get(`/${this.rota}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async putRequest(data) {
    try {
      const response = await this.axiosInstance.put("", data);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição PUT:", error.response?.data || error.message);
      throw error;
    }
  }

  async deleteRequest(id) {
    try {
      const response = await this.axiosInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição DELETE:", error.response?.data || error.message);
      throw error;
    }
  }
}
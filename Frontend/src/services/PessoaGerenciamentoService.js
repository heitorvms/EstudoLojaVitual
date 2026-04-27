import { BaseService } from './BaseService';
import axios from 'axios';


export class PessoaGerenciamentoService extends BaseService {
   CHAVE_TOKEN = "token";
   
  constructor() {
    super('pessoa-gerenciamento');
  }

  async getAllUsers() {
    try {
      const response = await axios.get(`${this.url}/gerenciamento-usuarios`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async alterarPermissao(id, perfil) {
    await axios.post(`${this.url}/alterar-permissao`, {
      id,
      permissoes: [perfil],
    });
  }

}
class Estado{
    constructor(id, nome, sigla, dataCriacao, dataAtualizacao) {
        this.id = id;
        this.nome = nome;
        this.sigla = sigla;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
        this.cidades = [];
    }
}
import { useCallback, useEffect, useState } from "react";

const TAMANHO_PAGINA = 15;
const ATRASO_BUSCA_MS = 400;

/** Lista paginada no servidor, com busca aplicada após uma pausa na digitação. */
export default function useListaPaginada(carregarPagina, aoFalhar) {
  const [lista, setLista] = useState({ itens: [], total: 0 });
  const [pagina, setPagina] = useState({ first: 0, rows: TAMANHO_PAGINA });
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const termo = busca.trim();
    if (termo === buscaAplicada) return undefined;
    const timer = setTimeout(() => {
      setBuscaAplicada(termo);
      setPagina((atual) => ({ ...atual, first: 0 }));
    }, ATRASO_BUSCA_MS);
    return () => clearTimeout(timer);
  }, [busca, buscaAplicada]);

  const recarregar = useCallback(() => {
    setCarregando(true);
    return carregarPagina(pagina.first / pagina.rows, pagina.rows, buscaAplicada)
      .then((data) => setLista({ itens: data.content || [], total: data.totalElements || 0 }))
      .catch(aoFalhar)
      .finally(() => setCarregando(false));
  }, [carregarPagina, aoFalhar, pagina, buscaAplicada]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const tabelaProps = {
    value: lista.itens,
    loading: carregando,
    lazy: true,
    paginator: true,
    first: pagina.first,
    rows: pagina.rows,
    totalRecords: lista.total,
    rowsPerPageOptions: [15, 30, 50],
    onPage: (e) => setPagina({ first: e.first, rows: e.rows }),
  };

  return { busca, setBusca, recarregar, tabelaProps };
}

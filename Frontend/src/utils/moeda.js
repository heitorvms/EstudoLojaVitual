const formatoReal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const moeda = (valor) => formatoReal.format(Number(valor || 0));

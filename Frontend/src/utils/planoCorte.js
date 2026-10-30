export const cm = (mm) => `${(mm / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} cm`;

export const descreverCortes = (cortes) =>
  cortes
    .map((c) => `${c.quantidade}× ${c.descricao ? `${c.descricao} ` : ""}${cm(c.comprimentoMm)}`)
    .join(" + ");

export const descreverRetalho = (r) => `${r.quantidade} un × ${cm(r.comprimentoMm)}`;

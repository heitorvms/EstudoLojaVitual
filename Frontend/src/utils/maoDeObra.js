export const MAO_DE_OBRA_PERCENTUAL = "PERCENTUAL";
export const MAO_DE_OBRA_FIXA = "VALOR_FIXO";

export const OPCOES_TIPO_MAO_DE_OBRA = [
  { label: "Percentual (%)", value: MAO_DE_OBRA_PERCENTUAL },
  { label: "Valor fixo (R$)", value: MAO_DE_OBRA_FIXA },
];

export const rotuloMaoDeObra = (tipo, percentual) =>
  tipo === MAO_DE_OBRA_FIXA
    ? "Mão de obra (valor fixo)"
    : `Mão de obra (${Number(percentual ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%)`;

export const percentualDoTotal = (valor, total) =>
  Number(total) > 0 ? ((Number(valor) / Number(total)) * 100).toFixed(1).replace(".", ",") : "0";

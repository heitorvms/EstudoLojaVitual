export const FORMAS = [
  { label: "À vista", value: "A_VISTA" },
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "DINHEIRO" },
  { label: "Cartão crédito", value: "CARTAO_CREDITO" },
  { label: "Cartão débito", value: "CARTAO_DEBITO" },
  { label: "Boleto", value: "BOLETO" },
  { label: "Transferência", value: "TRANSFERENCIA" },
  { label: "Outro", value: "OUTRO" },
];

export const STATUS_LABEL = {
  PENDENTE: "Pendente",
  PARCIAL: "Parcial",
  VENCIDA: "Vencida",
  PAGA: "Paga",
  CANCELADA: "Cancelada",
};

export const CATEGORIA_LABEL = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de obra",
  INSUMOS: "Insumos",
  FRETE: "Frete",
};

export const statusSeverity = (s) => {
  if (s === "PAGA") return "success";
  if (s === "PENDENTE") return "warning";
  if (s === "PARCIAL") return "info";
  if (s === "VENCIDA") return "danger";
  if (s === "CANCELADA") return "secondary";
  return null;
};

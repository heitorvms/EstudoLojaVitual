export const STATUS_OS = [
  { label: "Aberto", value: "ABERTO", severity: "info", cor: "#0d6efd" },
  { label: "Em produção", value: "EM_PRODUCAO", severity: "warning", cor: "#d97706" },
  { label: "Concluído", value: "CONCLUIDO", severity: "success", cor: "#198754" },
  { label: "Cancelado", value: "CANCELADO", severity: "danger", cor: "#dc3545" },
];

const buscarStatus = (value) => STATUS_OS.find((s) => s.value === value);

export const statusLabel = (value) => buscarStatus(value)?.label || value;

export const statusSeverity = (value) => buscarStatus(value)?.severity || "info";

export const statusInfo = (value) => buscarStatus(value) || STATUS_OS[0];

export const STATUS_OS = [
  { label: "Aberto", value: "ABERTO", severity: "info", cor: "#0d6efd", icon: "pi pi-inbox" },
  { label: "Em produção", value: "EM_PRODUCAO", severity: "warning", cor: "#d97706", icon: "pi pi-cog" },
  { label: "Concluído", value: "CONCLUIDO", severity: "success", cor: "#198754", icon: "pi pi-check-circle" },
  { label: "Cancelado", value: "CANCELADO", severity: "danger", cor: "#dc3545", icon: "pi pi-times-circle" },
];

const buscarStatus = (value) => STATUS_OS.find((s) => s.value === value);

export const statusLabel = (value) => buscarStatus(value)?.label || value;

export const statusSeverity = (value) => buscarStatus(value)?.severity || "info";

export const statusInfo = (value) => buscarStatus(value) || STATUS_OS[0];

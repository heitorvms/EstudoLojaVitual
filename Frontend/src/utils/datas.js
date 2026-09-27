const doisDigitos = (n) => String(n).padStart(2, "0");

export const paraIsoData = (data) =>
  data ? `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}` : null;

export const deIsoData = (iso) => {
  if (!iso) return null;
  const [ano, mes, dia] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(ano, mes - 1, dia);
};

export const hojeIso = () => paraIsoData(new Date());

export const formatarDataIso = (iso) => (iso ? deIsoData(iso).toLocaleDateString("pt-BR") : "-");

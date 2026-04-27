import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export class RelatorioService {
  async downloadPdf(reportName, fileName = `${reportName}.pdf`, params = {}) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const response = await axios.get(`${API_URL}/relatorios/${reportName}`, {
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params,
    });

    const file = new Blob([response.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = fileURL;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    URL.revokeObjectURL(fileURL);
  }
}

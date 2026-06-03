import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Estado from "./pages/Estado";
import Cidade from "./pages/Cidade";
import Login from "./pages/Login";
import Cotacoes from "./pages/Cotacao";
import CriarCotacao from "./pages/CriarCotacao";
import MateriaisDisponiveis from "./pages/MateriaisDisponiveis";
import Distribuidoras from "./pages/Distribuidora";
import Configuracoes from "./pages/Configuracoes";
import VisualizarCotacao from "./pages/VisualizarCotacao";
import SimulacaoProducao from "./pages/SimulacaoProducao";
import RoleRoute from "./components/RoleRoute";

export default function AppRoutes({ toggleSidebar }) {
  const location = useLocation();
  const [customContent, setCustomContent] = useState(null);

  let title = "";
  let headerCustomContent = customContent;

  // Handle dynamic routes first
  if (location.pathname.startsWith("/cotacoes/")) {
    title = "Visualizar Cotação";
  } else switch (location.pathname) {
    case "/":
      title = "Home";
      break;
    case "/estado":
      title = "Estados";
      break;
    case "/cidade":
      title = "Cidades";
      break;
    case "/login":
      title = "Login";
      break;
    case "/cotacoes":
      break;
    case "/criar-cotacao":
      title = "Criar Nova Cotação";
      break;
    case "/materiais-disponiveis":
      title = "Materiais Disponíveis";
      break;
    case "/distribuidora":
      title = "Distribuidora";
      break;
    case "/configuracoes":
      title = "Configurações";
      break;
    case "/simulacao-producao":
      title = "Simulação de Produção";
      break;
    default:
      title = "";
  }

  return (
    <>
      <Header
        toggleSidebar={toggleSidebar}
        title={title}
        customContent={headerCustomContent}
      />
      <Routes>
        {/* Home: accessible to all authenticated roles (Funcionario, Gerente, Admin) */}
        <Route path="/" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<Home />} />} />

        {/* Estado: only Gerente and Admin */}
        <Route path="/estado" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<Estado />} />} />

        {/* Cidade: only Gerente and Admin */}
        <Route path="/cidade" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<Cidade />} />} />

        <Route path="/login" element={<Login />} />

  {/* Cotacoes: accessible to Funcionario, Gerente and Admin */}
        <Route path="/cotacoes" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<Cotacoes setCustomContent={setCustomContent} />} />} />
  {/* Visualizar Cotacao (detalhe) */}
  <Route path="/cotacoes/:id" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<VisualizarCotacao />} />} />
        
        {/* Criar Cotação: accessible to Funcionario, Gerente and Admin */}
        <Route path="/criar-cotacao" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<CriarCotacao />} />} />

        {/* Materiais Disponiveis: only Gerente and Admin */}
        <Route path="/materiais-disponiveis" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<MateriaisDisponiveis />} />} />

        {/* Distribuidora: only Gerente and Admin */}
        <Route path="/distribuidora" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<Distribuidoras />} />} />

        <Route path="/configuracoes" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<Configuracoes />} />} />
        <Route path="/gerenciamento-usuarios" element={<Navigate to="/configuracoes" replace />} />
        <Route path="/permissao-usuarios" element={<Navigate to="/configuracoes" replace />} />

        {/* Simulação de Produção: Funcionario, Gerente e Admin */}
        <Route path="/simulacao-producao" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<SimulacaoProducao />} />} />
      </Routes>
    </>
  );
}
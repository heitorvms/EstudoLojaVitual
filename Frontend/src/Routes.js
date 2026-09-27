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
import Financeiro from "./pages/Financeiro";
import OrdensServico from "./pages/OrdensServico";
import VisualizarOrdemServico from "./pages/VisualizarOrdemServico";
import FuncionariosOficina from "./pages/FuncionariosOficina";
import ComprasLote from "./pages/ComprasLote";
import FormularioCompraLote from "./pages/FormularioCompraLote";
import Estoque from "./pages/Estoque";
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
    case "/financeiro":
      title = "Financeiro";
      break;
    case "/ordens-servico":
      title = "Ordens de Serviço";
      break;
    case "/funcionarios-oficina":
      title = "Funcionários";
      break;
    case "/compras-lote":
      title = "Compra de Material";
      break;
    case "/compras-lote/nova":
      title = "Nova Compra";
      break;
    case "/estoque":
      title = "Estoque";
      break;
    default:
      title = "";
  }

  if (location.pathname.startsWith("/ordens-servico/")) {
    title = "Ordem de Serviço";
  }
  if (location.pathname.match(/^\/compras-lote\/\d+\/editar$/)) {
    title = "Editar Compra";
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

        <Route path="/financeiro" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<Financeiro />} />} />

        <Route path="/ordens-servico" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<OrdensServico setCustomContent={setCustomContent} />} />} />
        <Route path="/ordens-servico/nova/:cotacaoId" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<VisualizarOrdemServico />} />} />
        <Route path="/ordens-servico/:id" element={<RoleRoute allowedRoles={["Funcionario","Gerente","Admin"]} element={<VisualizarOrdemServico />} />} />
        <Route path="/funcionarios-oficina" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<FuncionariosOficina />} />} />
        <Route path="/compras-lote" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<ComprasLote />} />} />
        <Route path="/compras-lote/nova" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<FormularioCompraLote />} />} />
        <Route path="/compras-lote/:id/editar" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<FormularioCompraLote />} />} />
        <Route path="/estoque" element={<RoleRoute allowedRoles={["Gerente","Admin"]} element={<Estoque />} />} />
      </Routes>
    </>
  );
}
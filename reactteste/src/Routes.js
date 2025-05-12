import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Estado from "./pages/Estado";
import Cidade from "./pages/Cidade";
import Login from "./pages/Login";
import Cotacoes from "./pages/Cotacao";
import MateriaisDisponiveis from "./pages/MateriaisDisponiveis";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/estado" element={<Estado />} />
      <Route path="/cidade" element={<Cidade />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cotacoes" element={<Cotacoes />} />
      <Route path="/materiais-disponiveis" element={<MateriaisDisponiveis />} />
    </Routes>
  );
}
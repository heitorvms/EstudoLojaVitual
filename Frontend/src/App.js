import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import AppRoutes from "./Routes";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import { LoginService } from "./services/LoginService";
import '../src/App.css';

function App() {
  const loginService = new LoginService();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const autenticado = loginService.autenticado();

  return (
    <BrowserRouter>
      {!autenticado ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="page-container">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div
            className="main-content"
            style={{ marginLeft: isSidebarOpen ? '250px' : '60px' }}
          >
            <AppRoutes toggleSidebar={toggleSidebar} />
          </div>
          <div
            className="footer-wrapper"
            style={{ marginLeft: isSidebarOpen ? '250px' : '60px' }}
          >
            <Footer />
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;

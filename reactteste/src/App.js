import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Routes from "./Routes";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import { LoginService } from "./services/LoginService";
import '../src/App.css';

function App() {
  const loginService = new LoginService();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const Pagina = () => {
    return (
      <BrowserRouter>
        <div className="page-container">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div
            className="main-content"
            style={{ marginLeft: isSidebarOpen ? '250px' : '60px' }}
          >
            <Header />
            <Routes />
          </div>
          <div
            className="footer-wrapper"
            style={{ marginLeft: isSidebarOpen ? '250px' : '60px' }}
          >
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    );
  };

  return (
    <div>
      {loginService.autenticado() ? <Pagina /> : <Login />}
    </div>
  );
}

export default App;
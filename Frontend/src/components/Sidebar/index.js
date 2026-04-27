import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCity, FaMap, FaSignOutAlt, FaBars, FaUserCircle, FaShoppingCart, FaBox, FaWarehouse } from 'react-icons/fa';
import { SidebarContainer, MenuItem, IconMenu } from './styled';
import { LoginService } from '../../services/LoginService';
import { UserService } from '../../services/UserService';
import { FaUsersCog } from 'react-icons/fa';

function Sidebar({ isOpen, setIsOpen }) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Home');
  const loginService = new LoginService();
  const userService = new UserService();
  const [userData, setUserData] = useState({ nome: '', cargo: '' });

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveItem('Home');
    else if (path === '/estado') setActiveItem('Estado');
    else if (path === '/cidade') setActiveItem('Cidade');
    else if (path === '/cotacoes') setActiveItem('Cotacoes');
    else if (path === '/materiais-disponiveis') setActiveItem('MateriaisDisponiveis');
    else if (path === '/distribuidora') setActiveItem('Distribuidora');
    else if (path === '/gerenciamento-usuarios') setActiveItem('GerenciamentoUsuarios');
  }, [location]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUserData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {isVisible && (
        <SidebarContainer isOpen={isOpen}>
          <div className="logo">
            <h2>HSA Serralheria</h2>
            <button onClick={toggleSidebar} className="toggle-button">
              <FaBars />
            </button>
          </div>
          <ul>
            {/* Everyone authenticated sees Home */}
            <MenuItem active={activeItem === 'Home'} isOpen={isOpen}>
              <Link to="/" onClick={() => { setActiveItem('Home'); if (isOpen) setIsOpen(false); }}>
                <FaHome />
                {isOpen && <span>Home</span>}
              </Link>
            </MenuItem>

            {/* Role-based items: if user is Funcionario only show Cotacoes */}
            {userData.cargo === 'Funcionario' ? (
              <>
                <MenuItem active={activeItem === 'Cotacoes'} isOpen={isOpen}>
                  <Link to="/cotacoes" onClick={() => { setActiveItem('Cotacoes'); if (isOpen) setIsOpen(false); }}>
                    <FaShoppingCart />
                    {isOpen && <span>Cotações</span>}
                  </Link>
                </MenuItem>
              </>
            ) : (
              // Admin and Gerente see all menu items
              <>
                <MenuItem active={activeItem === 'Estado'} isOpen={isOpen}>
                  <Link to="/estado" onClick={() => { setActiveItem('Estado'); if (isOpen) setIsOpen(false); }}>
                    <FaMap />
                    {isOpen && <span>Estado</span>}
                  </Link>
                </MenuItem>
                <MenuItem active={activeItem === 'Cidade'} isOpen={isOpen}>
                  <Link to="/cidade" onClick={() => { setActiveItem('Cidade'); if (isOpen) setIsOpen(false); }}>
                    <FaCity />
                    {isOpen && <span>Cidade</span>}
                  </Link>
                </MenuItem>
                <MenuItem active={activeItem === 'Cotacoes'} isOpen={isOpen}>
                  <Link to="/cotacoes" onClick={() => { setActiveItem('Cotacoes'); if (isOpen) setIsOpen(false); }}>
                    <FaShoppingCart />
                    {isOpen && <span>Cotações</span>}
                  </Link>
                </MenuItem>
                <MenuItem active={activeItem === 'MateriaisDisponiveis'} isOpen={isOpen}>
                  <Link to="/materiais-disponiveis" onClick={() => { setActiveItem('MateriaisDisponiveis'); if (isOpen) setIsOpen(false); }}>
                    <FaBox />
                    {isOpen && <span>Materiais Disponíveis</span>}
                  </Link>
                </MenuItem>
                <MenuItem active={activeItem === 'Distribuidora'} isOpen={isOpen}>
                  <Link to="/distribuidora" onClick={() => { setActiveItem('Distribuidora'); if (isOpen) setIsOpen(false); }}>
                    <FaWarehouse />
                    {isOpen && <span>Distribuidora</span>}
                  </Link>
                </MenuItem>
                <MenuItem active={activeItem === 'GerenciamentoUsuarios'} isOpen={isOpen}>
                  <Link
                    to="/gerenciamento-usuarios"
                    onClick={() => { setActiveItem('GerenciamentoUsuarios'); if (isOpen) setIsOpen(false); }}
                  >
                    <FaUsersCog />
                    {isOpen && <span>Gerenciar Usuários</span>}
                  </Link>
                </MenuItem>
              </>
            )}

            <MenuItem isOpen={isOpen}>
              <button onClick={() => { loginService.sair(); if (isOpen) setIsOpen(false); }}>
                <FaSignOutAlt />
                {isOpen && <span>Sair</span>}
              </button>
            </MenuItem>
          </ul>

          {isOpen && (
            <div className="user-info">
              <FaUserCircle size={30} />
              <div className="user-text">
                <p className="user-name">{userData.nome}</p>
                <p className="user-cargo">{userData.cargo}</p>
              </div>
            </div>
          )}
        </SidebarContainer>
      )}

      {!isVisible && (
        <IconMenu>
          <button onClick={toggleSidebar} className="toggle-button">
            <FaBars />
          </button>
          <MenuItem iconOnly active={activeItem === 'Home'}>
            <Link to="/" onClick={() => setActiveItem('Home')}>
              <FaHome />
            </Link>
          </MenuItem>
          <MenuItem iconOnly active={activeItem === 'Estado'}>
            <Link to="/estado" onClick={() => setActiveItem('Estado')}>
              <FaMap />
            </Link>
          </MenuItem>
          <MenuItem iconOnly active={activeItem === 'Cidade'}>
            <Link to="/cidade" onClick={() => setActiveItem('Cidade')}>
              <FaCity />
            </Link>
          </MenuItem>
          <MenuItem iconOnly active={activeItem === 'Cotacoes'}>
            <Link to="/cotacoes" onClick={() => setActiveItem('Cotacoes')}>
              <FaShoppingCart />
            </Link>
          </MenuItem>
          <MenuItem iconOnly active={activeItem === 'MateriaisDisponiveis'}>
            <Link to="/materiais-disponiveis" onClick={() => setActiveItem('MateriaisDisponiveis')}>
              <FaBox />
            </Link>
          </MenuItem>
          <MenuItem iconOnly active={activeItem === 'Distribuidora'}>
            <Link to="/distribuidora" onClick={() => setActiveItem('Distribuidora')}>
              <FaWarehouse />
            </Link>
          </MenuItem>
            <MenuItem iconOnly active={activeItem === 'GerenciamentoUsuarios'}>
              <Link to="/gerenciamento-usuarios" onClick={() => setActiveItem('GerenciamentoUsuarios')}>
                <FaUsersCog />
              </Link>
            </MenuItem>
          <MenuItem iconOnly>
            <button onClick={() => loginService.sair()}>
              <FaSignOutAlt />
            </button>
          </MenuItem>
        </IconMenu>
      )}
    </>
  );
}

export default Sidebar;
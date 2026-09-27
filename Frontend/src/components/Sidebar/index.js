import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaCity, FaMap, FaSignOutAlt, FaBars, FaUserCircle, FaShoppingCart,
  FaBox, FaWarehouse, FaCalculator, FaCog, FaMoneyBillWave, FaClipboardList,
  FaUsers, FaTruck, FaBoxes, FaChevronDown,
} from 'react-icons/fa';
import { SidebarContainer, MenuItem, MenuGroup, IconMenu } from './styled';
import { LoginService } from '../../services/LoginService';
import { UserService } from '../../services/UserService';

const PATH_TO_ITEM = [
  { match: (p) => p === '/', id: 'Home' },
  { match: (p) => p === '/estado', id: 'Estado' },
  { match: (p) => p === '/cidade', id: 'Cidade' },
  { match: (p) => p === '/cotacoes' || p.startsWith('/cotacoes/') || p === '/criar-cotacao', id: 'Cotacoes' },
  { match: (p) => p === '/materiais-disponiveis', id: 'MateriaisDisponiveis' },
  { match: (p) => p === '/distribuidora', id: 'Distribuidora' },
  { match: (p) => p.startsWith('/configuracoes'), id: 'Configuracoes' },
  { match: (p) => p === '/simulacao-producao', id: 'SimulacaoProducao' },
  { match: (p) => p === '/financeiro', id: 'Financeiro' },
  { match: (p) => p.startsWith('/ordens-servico'), id: 'OrdensServico' },
  { match: (p) => p === '/funcionarios-oficina', id: 'Funcionarios' },
  { match: (p) => p === '/compras-lote', id: 'ComprasLote' },
  { match: (p) => p === '/estoque', id: 'Estoque' },
];

function resolveActive(path) {
  const found = PATH_TO_ITEM.find((x) => x.match(path));
  return found ? found.id : 'Home';
}

function Sidebar({ isOpen, setIsOpen }) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(() => resolveActive(location.pathname));
  const loginService = useMemo(() => new LoginService(), []);
  const userService = useMemo(() => new UserService(), []);
  const [userData, setUserData] = useState({ nome: '', cargo: '' });
  const [openGroups, setOpenGroups] = useState({});

  const isFuncionario = userData.cargo === 'Funcionario';
  const podeConfigurar = userData.cargo === 'Admin' || userData.cargo === 'Gerente';

  const groups = useMemo(() => {
    if (isFuncionario) {
      return [
        {
          id: 'comercial',
          label: 'Comercial',
          items: [
            { id: 'Cotacoes', to: '/cotacoes', label: 'Cotações', icon: FaShoppingCart },
            { id: 'SimulacaoProducao', to: '/simulacao-producao', label: 'Simulação', icon: FaCalculator },
          ],
        },
        {
          id: 'producao',
          label: 'Produção',
          items: [
            { id: 'OrdensServico', to: '/ordens-servico', label: 'Ordens de Serviço', icon: FaClipboardList },
          ],
        },
      ];
    }
    return [
      {
        id: 'cadastros',
        label: 'Cadastros',
        items: [
          { id: 'Estado', to: '/estado', label: 'Estado', icon: FaMap },
          { id: 'Cidade', to: '/cidade', label: 'Cidade', icon: FaCity },
          { id: 'MateriaisDisponiveis', to: '/materiais-disponiveis', label: 'Materiais', icon: FaBox },
          { id: 'Distribuidora', to: '/distribuidora', label: 'Distribuidora', icon: FaWarehouse },
          { id: 'Funcionarios', to: '/funcionarios-oficina', label: 'Funcionários', icon: FaUsers },
        ],
      },
      {
        id: 'comercial',
        label: 'Comercial',
        items: [
          { id: 'Cotacoes', to: '/cotacoes', label: 'Cotações', icon: FaShoppingCart },
          { id: 'SimulacaoProducao', to: '/simulacao-producao', label: 'Simulação', icon: FaCalculator },
        ],
      },
      {
        id: 'producao',
        label: 'Produção',
        items: [
          { id: 'OrdensServico', to: '/ordens-servico', label: 'Ordens de Serviço', icon: FaClipboardList },
        ],
      },
      {
        id: 'estoque',
        label: 'Estoque',
        items: [
          { id: 'Estoque', to: '/estoque', label: 'Estoque', icon: FaBoxes },
          { id: 'ComprasLote', to: '/compras-lote', label: 'Compra de Material', icon: FaTruck },
        ],
      },
      {
        id: 'financeiro',
        label: 'Financeiro',
        items: [
          { id: 'Financeiro', to: '/financeiro', label: 'Contas', icon: FaMoneyBillWave },
        ],
      },
    ];
  }, [isFuncionario]);

  useEffect(() => {
    const id = resolveActive(location.pathname);
    setActiveItem(id);
    setOpenGroups((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (g.items.some((i) => i.id === id)) next[g.id] = true;
      });
      return next;
    });
  }, [location.pathname, groups]);

  useEffect(() => {
    userService.getCurrentUser()
      .then(setUserData)
      .catch((error) => console.error('Erro ao buscar dados do usuário:', error));
  }, [userService]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const goTo = (id) => {
    setActiveItem(id);
    if (isOpen) setIsOpen(false);
  };

  const collapsedIcons = useMemo(() => {
    const icons = [{ id: 'Home', to: '/', icon: FaHome, title: 'Home' }];
    groups.forEach((g) => {
      g.items.forEach((item) => {
        icons.push({ id: item.id, to: item.to, icon: item.icon, title: item.label });
      });
    });
    return icons;
  }, [groups]);

  return (
    <>
      {isVisible && (
        <SidebarContainer isOpen={isOpen}>
          <div className="logo">
            <h2>HSA Serralheria</h2>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="toggle-button">
              <FaBars />
            </button>
          </div>

          <ul className="menu-list">
            <MenuItem active={activeItem === 'Home'} isOpen={isOpen}>
              <Link to="/" onClick={() => goTo('Home')}>
                <FaHome />
                {isOpen && <span>Home</span>}
              </Link>
            </MenuItem>

            {groups.map((group) => {
              const groupActive = group.items.some((i) => i.id === activeItem);
              const expanded = !!openGroups[group.id];
              return (
                <MenuGroup key={group.id} expanded={expanded} active={groupActive}>
                  {isOpen && (
                    <button type="button" className="group-header" onClick={() => toggleGroup(group.id)}>
                      <span className="group-label">{group.label}</span>
                      <FaChevronDown className="chevron" />
                    </button>
                  )}
                  <ul className="group-items" style={!isOpen ? { display: 'block' } : undefined}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <MenuItem
                          key={item.id}
                          active={activeItem === item.id}
                          isOpen={isOpen}
                          nested={isOpen}
                        >
                          <Link to={item.to} onClick={() => goTo(item.id)} title={item.label}>
                            <Icon />
                            {isOpen && <span>{item.label}</span>}
                          </Link>
                        </MenuItem>
                      );
                    })}
                  </ul>
                </MenuGroup>
              );
            })}

            <MenuItem isOpen={isOpen}>
              <button type="button" onClick={() => { loginService.sair(); if (isOpen) setIsOpen(false); }}>
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
              {podeConfigurar && (
                <Link
                  to="/configuracoes"
                  className="settings-link"
                  title="Configurações"
                  onClick={() => goTo('Configuracoes')}
                >
                  <FaCog size={18} />
                </Link>
              )}
            </div>
          )}

          {!isOpen && podeConfigurar && (
            <div className="sidebar-footer-collapsed">
              <Link
                to="/configuracoes"
                className="settings-link-collapsed"
                title="Configurações"
                onClick={() => setActiveItem('Configuracoes')}
              >
                <FaCog size={18} />
              </Link>
            </div>
          )}
        </SidebarContainer>
      )}

      {!isVisible && (
        <IconMenu>
          <div className="icon-menu-top">
            <button type="button" onClick={() => setIsOpen(true)} className="toggle-button">
              <FaBars />
            </button>
            {collapsedIcons.map((item) => {
              const Icon = item.icon;
              return (
                <MenuItem key={item.id} iconOnly active={activeItem === item.id}>
                  <Link to={item.to} title={item.title} onClick={() => setActiveItem(item.id)}>
                    <Icon />
                  </Link>
                </MenuItem>
              );
            })}
          </div>
          <div className="icon-menu-bottom">
            {podeConfigurar && (
              <MenuItem iconOnly active={activeItem === 'Configuracoes'}>
                <Link to="/configuracoes" title="Configurações" onClick={() => setActiveItem('Configuracoes')}>
                  <FaCog />
                </Link>
              </MenuItem>
            )}
            <MenuItem iconOnly>
              <button type="button" title="Sair" onClick={() => loginService.sair()}>
                <FaSignOutAlt />
              </button>
            </MenuItem>
          </div>
        </IconMenu>
      )}
    </>
  );
}

export default Sidebar;

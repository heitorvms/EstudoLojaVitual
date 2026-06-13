import styled from 'styled-components';

const sidebarTransientProps = ['active', 'isOpen', 'iconOnly'];

export const SidebarContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !sidebarTransientProps.includes(prop),
})`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => (props.isOpen ? '250px' : '60px')};
  height: 100%;
  background: #1A1A2E;
  color: #fff;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .logo {
    display: flex;
    align-items: center;
    margin-bottom: 30px;

    h2 {
      font-size: 20px;
      margin: 0;
      color: #fff;
      display: ${props => (props.isOpen ? 'block' : 'none')};
    }

    .toggle-button {
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
  }

  .user-info {
    margin-top: auto;
    padding: 15px;
    display: flex;
    align-items: center;
    background: #2A2A3E;
    border-radius: 5px;
    transition: background 0.3s ease;

    &:hover {
      background: #3A3A4E;
    }

    svg {
      margin-right: 10px;
      color: #f5bb00;
    }

    .user-text {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 16px;
      font-weight: bold;
      color: #fff;
      margin: 0;
    }

    .user-cargo {
      font-size: 14px;
      color: #ccc;
      margin: 0;
    }

    .settings-link {
      margin-left: auto;
      color: #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 4px;
      transition: color 0.2s ease, background 0.2s ease;
      text-decoration: none;

      &:hover {
        color: #f5bb00;
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }

  .sidebar-footer-collapsed {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px solid #2A2A3E;

    .settings-link-collapsed {
      color: #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 5px;
      transition: color 0.2s ease, background 0.2s ease;
      text-decoration: none;

      &:hover {
        color: #f5bb00;
        background: #3A3A4E;
      }
    }
  }
`;

export const MenuItem = styled.li.withConfig({
  shouldForwardProp: (prop) => !sidebarTransientProps.includes(prop),
})`
  position: relative;
  display: flex;
  align-items: center;
  padding: 15px;
  background: ${props => (props.active ? '#4A00E0' : 'transparent')};
  color: ${props => (props.active ? '#fff' : '#ccc')};
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 10px;
  transition: background 0.3s ease, color 0.3s ease;
  justify-content: ${props => (props.isOpen || props.iconOnly ? 'center' : 'flex-start')};

  &:hover {
    background: #4A00E0;
    color: #fff;
  }

  a, button {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: ${props => (props.iconOnly ? 'center' : 'flex-start')};
    text-decoration: none;
    color: inherit;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    font-weight: 500;
    padding-left: ${props => (props.isOpen ? '10px' : '0')};
  }

  svg {
    font-size: 18px;
    margin-right: ${props => (props.isOpen ? '10px' : '0')};
  }

  span {
    display: ${props => (props.isOpen ? 'inline' : 'none')};
  }
`;

export const IconMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  height: 100%;
  background: #1A1A2E;
  color: #fff;
  z-index: 999;
  padding: 20px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .icon-menu-top {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .icon-menu-bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    padding-top: 12px;
    border-top: 1px solid #2A2A3E;
  }

  .toggle-button {
    background: none;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    &:hover {
      color: #f5bb00;
    }
  }
`;
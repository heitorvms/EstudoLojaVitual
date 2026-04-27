import React from 'react';
import { AreaHeader } from './styled';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

function Header({ toggleSidebar, title, customContent }) {
  return (
    <AreaHeader>
      {customContent && (
        <>
          <div className="header-left">
            <Button
              label="Nova Cotação"
              icon="pi pi-plus"
              className="p-button-success header-button"
              onClick={customContent.openNew}
              style={{ marginLeft: '20px' }}
            />
          </div>
          <div className="header-center">
            <span className="p-input-icon-right">
              <InputText
                value={customContent.searchTerm}
                onChange={(e) => customContent.setSearchTerm(e.target.value)}
                placeholder="Nome ou Telefone"
                className="header-search"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !customContent.isLoading) {
                    customContent.handleSearch();
                  }
                }}
                disabled={customContent.isLoading}
              />
              <Button
                icon={customContent.isLoading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                className="p-button-text header-search-icon"
                onClick={customContent.handleSearch}
                disabled={customContent.isLoading}
              />
            </span>
          </div>
        </>
      )}
    </AreaHeader>
  );
}

export default Header;
import React from "react";
import { AreaFooter } from './styled';

function Footer() {
    return (
        <AreaFooter>
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Sobre Nós</h3>
                    <p>Informações.</p>
                </div>
                <div className="footer-section">
                    <h3>Links Úteis</h3>
                    <ul>
                        <li><a href="/politica-privacidade">Política de Privacidade</a></li>
                        <li><a href="/termos-uso">Termos de Uso</a></li>
                        <li><a href="/contato">Contato</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Contato</h3>
                    <p>Email: HSASerralheria@gmail.com</p>
                    <p>Telefone: (18) 99725-8311</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} HSA Serralheria. Todos os direitos reservados.</p>
            </div>
        </AreaFooter>
    );
}

export default Footer;
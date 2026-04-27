import React from "react";
import { ContainerPage, TitlePage } from "../Home/styled";
import { FaHome, FaCity, FaMap } from 'react-icons/fa';

const Page = () => {
    return (
        <ContainerPage>
            <TitlePage>Seja bem-vindo</TitlePage>
            <div className="welcome-message">
                <p>Aqui você pode gerenciar estados, cidades e muito mais!</p>
                <p>Explore as funcionalidades através do menu lateral.</p>
            </div>
            <div className="features">
                <div className="feature-item">
                    <FaHome size={40} color="#791e94" />
                    <p>Gerencie sua home page</p>
                </div>
                <div className="feature-item">
                    <FaMap size={40} color="#791e94" />
                    <p>Administre estados</p>
                </div>
                <div className="feature-item">
                    <FaCity size={40} color="#791e94" />
                    <p>Controle cidades</p>
                </div>
            </div>
        </ContainerPage>
    );
}

export default Page;
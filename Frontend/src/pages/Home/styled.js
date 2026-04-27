import styled from 'styled-components';

export const ContainerPage = styled.div`
    padding: 20px;
    text-align: center;

    .welcome-message {
        margin: 20px 0;
        font-size: 18px;
        color: #333;
    }

    .features {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin-top: 40px;
    }

    .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 16px;
        color: #333;
    }
    
`;
export const TitlePage = styled.h1`
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
`;
import styled from "styled-components";

export const AreaFooter = styled.footer`
    background-color: #1A1A2E;
    color: #fff;
    padding: 40px 20px;
    font-size: 14px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .footer-content {
        display: flex;
        justify-content: space-around;
        width: 100%;
        max-width: 1200px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

    .footer-section {
        flex: 1;
        margin: 0 20px;
        min-width: 200px;
    }

    .footer-section h3 {
        font-size: 18px;
        margin-bottom: 10px;
    }

    .footer-section p, .footer-section ul {
        font-size: 14px;
        line-height: 1.6;
    }

    .footer-section ul {
        list-style: none;
        padding: 0;
    }

    .footer-section ul li {
        margin-bottom: 8px;
    }

    .footer-section a {
        color: #f5bb00;
        text-decoration: none;
    }

    .footer-section a:hover {
        text-decoration: underline;
    }

    .footer-bottom {
        text-align: center;
        font-size: 12px;
        border-top: 1px solid #fff;
        padding-top: 10px;
        width: 100%;
        max-width: 1200px;
    }

    @media (max-width: 768px) {
        padding: 20px 10px;
        font-size: 12px;

        .footer-content {
            flex-direction: column;
            align-items: center;
        }

        .footer-section {
            margin: 10px 0;
            text-align: center;
            min-width: auto;
        }

        .footer-section h3 {
            font-size: 16px;
        }

        .footer-section p, .footer-section ul {
            font-size: 12px;
        }

        .footer-bottom {
            font-size: 10px;
        }
    }
`;
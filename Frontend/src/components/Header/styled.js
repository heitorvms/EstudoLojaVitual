import styled from 'styled-components';

export const AreaHeader = styled.div`
  height: 80px;
  background-color: #1A1A2E;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  position: relative;
  width: 100%;
  padding-right: 170px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }

  .header-left {
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      margin-bottom: 10px;
    }
  }

  .header-center {
    display: flex;
    justify-content: center;
    flex-grow: 1;
    position: relative;

    @media (max-width: 768px) {
      width: 100%;
      margin: 0 10px;
    }
  }

  .header-button {
    margin: 8px;
    border-radius: 20px;
    text-transform: none;
    background-color: #1A1A2E;
    border: none;

    &.p-button-success {
      background-color: #28a745;
      &:hover {
        background-color: #218838 !important;
      }
    }

    &:hover {
      background-color: #2c2c4e !important;
    }

    @media (max-width: 768px) {
      width: 100%;
      margin: 5px 0;
    }
  }

  .header-search {
    width: 500px;
    height: 40px;
    padding: 5px 40px 5px 10px;
    border-radius: 20px;
    border: none;
    font-size: 16px;
    background-color: #2E2E4A;
    color: #fff;
    outline: none;

    &::placeholder {
      color: #ccc;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 5px #28a745;
    }

    @media (max-width: 768px) {
      width: 90%;
      margin: 0 auto;
    }
  }

  .header-search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;

    &:hover {
      color: #fff;
    }

    @media (max-width: 768px) {
      right: 5%;
    }
  }

  .p-input-icon-right {
    position: relative;
    display: inline-flex;
    width: 100%;
    max-width: 500px;

    @media (max-width: 768px) {
      width: 90%;
    }
  }
`;
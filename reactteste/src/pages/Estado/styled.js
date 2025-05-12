import styled from "styled-components";

export const ContainerPage = styled.div`

.main-content {
  margin-left: 60px;
  padding: 20px;
}

h2{
    display: flex;
    flex-direction: column;
    align-items: center;
}

.DataTable {
  max-width: 100%;
  width: 80%;
  margin: 0 auto; 
  overflow-x: auto; 
}

@media (max-width: 768px) {
  .DataTable, .p-mb-2 {
    width: 100%;
  }
}


`;
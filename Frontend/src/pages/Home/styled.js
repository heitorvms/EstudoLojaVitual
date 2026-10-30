import styled from 'styled-components';
import { PanelCard } from '../../styles/oficinaLayout';

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

export const FeatureCard = styled(PanelCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
  text-align: center;
  color: #1a1a2e;

  p {
    margin: 0;
    font-size: 15px;
    color: #333;
  }
`;

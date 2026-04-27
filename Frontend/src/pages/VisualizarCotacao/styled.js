import styled from "styled-components";

export const ContainerPage = styled.div`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const Title = styled.h2`
  margin: 0;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const SectionCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const SectionTitle = styled.h3`
  margin-top: 0;
`;

export const MetaInfo = styled.p`
  color: #666;
  font-size: 12px;
`;

export const AnalysisItem = styled.div`
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
`;

export const AnalysisItemTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const BadgeContainer = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fafafa;
`;

export const BadgeLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

export const BadgeValue = styled.div`
  font-weight: 600;
`;

export const DistName = styled.span`
  color: #007bff;
`;

export const PriceValue = styled.span`
  margin-left: 8px;
  color: #28a745;
`;

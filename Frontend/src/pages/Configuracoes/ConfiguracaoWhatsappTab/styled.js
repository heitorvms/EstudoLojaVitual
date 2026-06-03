import styled from 'styled-components';
import { Button } from 'primereact/button';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const MessageBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
`;

export const BlockTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #1a1a2e;
`;

export const BlockHint = styled.p`
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
`;

export const PlaceholderPanel = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
`;

export const PlaceholderTitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
`;

export const PlaceholderList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const PlaceholderChip = styled.button`
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #4338ca;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #eef2ff;
    border-color: #6366f1;
  }
`;

export const PlaceholderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

export const DetailsToggle = styled.button`
  border: none;
  background: none;
  padding: 0;
  font-size: 12px;
  color: #6366f1;
  cursor: pointer;
  text-decoration: underline;
  white-space: nowrap;

  &:hover {
    color: #4338ca;
  }
`;

export const PlaceholderLegend = styled.ul`
  margin: 10px 0 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: #64748b;
  list-style: none;
  padding-left: 0;

  li {
    margin-bottom: 6px;
    line-height: 1.4;
  }

  code {
    color: #4338ca;
    font-weight: 600;
  }
`;

export const SaveButton = styled(Button)`
  align-self: flex-start;
`;

export const FutureBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
`;

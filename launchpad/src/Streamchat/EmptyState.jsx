import React from 'react';
import styled from 'styled-components';
import { FaUserFriends } from 'react-icons/fa'; // You might need to install react-icons

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 94%;
  padding: 20px;
  text-align: center;
  color: #888;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
`;

const Title = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  font-size: 14px;
  max-width: 250px;
`;

export default function EmptyState ({ title, subtitle }) {
    return(
  <EmptyStateContainer>
    <IconWrapper>
      <FaUserFriends />
    </IconWrapper>
    <Title>{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
  </EmptyStateContainer>)
}

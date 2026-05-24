import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: ${({ fullPage }) => fullPage ? '0' : '40px'};
  ${({ fullPage }) => fullPage && `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${({ theme }) => theme?.colors?.bgColor || '#0a0a0f'};
    z-index: 9999;
  `}
`;

const SpinnerRing = styled.div`
  width: ${({ size }) => size || 48}px;
  height: ${({ size }) => size || 48}px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.border.subtle};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  animation: ${spin} 0.8s linear infinite;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.primary.light};
    animation: ${spin} 1.6s linear infinite reverse;
    opacity: 0.4;
  }
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.text.light.medium};
  font-size: 14px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

export default function LoadingSpinner({ size, label, fullPage }) {
  return (
    <Wrapper fullPage={fullPage}>
      <SpinnerRing size={size} />
      {label && <Label>{label}</Label>}
    </Wrapper>
  );
}

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FiHome, FiCode } from 'react-icons/fi';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  75% { transform: translateY(10px) rotate(-2deg); }
`;

const glitch = keyframes`
  0%, 100% { text-shadow: 2px 0 #7c3aed, -2px 0 #3b82f6; }
  25% { text-shadow: -2px 0 #7c3aed, 2px 0 #3b82f6; }
  50% { text-shadow: 0 2px #7c3aed, 0 -2px #3b82f6; }
  75% { text-shadow: 2px 2px #7c3aed, -2px -2px #3b82f6; }
`;

const Container = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.metrics.paddingHorizontal};
  background: ${({ theme }) => theme.colors.bgColor};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.primary.glow} 0%, transparent 70%);
    pointer-events: none;
    opacity: 0.4;
  }
`;

const ErrorCode = styled.h1`
  font-size: 160px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text.light.pure};
  letter-spacing: -8px;
  line-height: 1;
  margin-bottom: 16px;
  animation: ${float} 6s ease-in-out infinite, ${glitch} 3s ease-in-out infinite;
  z-index: 1;
  background: ${({ theme }) => theme.colors.gradients.shine};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  position: relative;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    font-size: 100px;
  }
`;

const Message = styled.h2`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text.light.very};
  margin-bottom: 12px;
  z-index: 1;
`;

const SubMessage = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.light.little};
  margin-bottom: 40px;
  text-align: center;
  max-width: 500px;
  line-height: 1.6;
  z-index: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  z-index: 1;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-weight: 600;
  font-size: 15px;
  transition: ${({ theme }) => theme.metrics.transition.normal};

  ${({ theme, variant }) => variant === 'primary' ? `
    background: ${theme.colors.primary.gradient};
    color: ${theme.colors.text.light.pure};
    box-shadow: ${theme.metrics.shadow.glow};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.metrics.shadow.large};
      color: ${theme.colors.text.light.pure};
    }
  ` : `
    background: ${theme.colors.bgElevated};
    color: ${theme.colors.text.light.pure};
    border: 1px solid ${theme.colors.border.default};

    &:hover {
      border-color: ${theme.colors.primary.light};
      color: ${theme.colors.text.light.pure};
    }
  `}
`;

const CodeSnippet = styled.div`
  position: absolute;
  bottom: 60px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.light.faint};
  background: ${({ theme }) => theme.colors.bgSecondary};
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};

  .comment { color: ${({ theme }) => theme.colors.text.light.faint}; }
  .keyword { color: ${({ theme }) => theme.colors.primary.light}; }
  .string { color: ${({ theme }) => theme.colors.secondary.light}; }
`;

export default function NotFound() {
  return (
    <Container>
      <ErrorCode>404</ErrorCode>
      <Message>Page Not Found</Message>
      <SubMessage>
        The page you're looking for has been moved, deleted, 
        or maybe never existed. Let's get you back on track.
      </SubMessage>
      <ButtonGroup>
        <Button to="/" variant="primary">
          <FiHome /> Go Home
        </Button>
        <Button to="/editor" variant="secondary">
          <FiCode /> Open Editor
        </Button>
      </ButtonGroup>
      <CodeSnippet>
        <span className="comment">{'// Error: Route not found'}</span><br />
        <span className="keyword">throw new</span> <span className="string">PageNotFoundException</span>();
      </CodeSnippet>
    </Container>
  );
}

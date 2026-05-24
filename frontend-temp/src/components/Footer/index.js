import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FiCode, FiGithub, FiTwitter, FiHeart } from 'react-icons/fi';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: 56px 24px 28px;
  position: relative;
  transition: background 0.4s ease, border-color 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.primary.gradient};
    opacity: 0.12;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const BrandSection = styled.div`
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.light.pure};
    margin-bottom: 16px;

    svg {
      color: ${({ theme }) => theme.colors.primary.main};
      filter: drop-shadow(0 0 6px ${({ theme }) => theme.colors.primary.glow});
    }

    span {
      background: ${({ theme }) => theme.colors.primary.gradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  p {
    color: ${({ theme }) => theme.colors.text.light.little};
    font-size: 14px;
    line-height: 1.7;
    max-width: 300px;
  }
`;

const FooterColumn = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.text.light.pure};
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 20px;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  a {
    color: ${({ theme }) => theme.colors.text.light.little};
    font-size: 14px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;

    &:hover {
      color: ${({ theme }) => theme.colors.primary.light};
      transform: translateX(3px);
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;

  a {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.bgElevated};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.light.little};
    transition: all 0.25s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.primary.darkest};
      border-color: ${({ theme }) => theme.colors.primary.main};
      color: ${({ theme }) => theme.colors.primary.light};
      transform: translateY(-3px);
      box-shadow: 0 6px 20px ${({ theme }) => theme.colors.primary.glow};
    }
  }
`;

const BottomBar = styled.div`
  max-width: 1200px;
  margin: 40px auto 0;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.text.light.faint};
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    color: ${({ theme }) => theme.colors.accent.main};
    font-size: 12px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

export default function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <BrandSection>
          <div className="brand">
            <FiCode /> Code<span>Sphere</span>
          </div>
          <p>
            A powerful, isolated, and scalable online code execution platform. 
            Write and run code instantly from your browser.
          </p>
          <SocialLinks>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FiGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FiTwitter />
            </a>
          </SocialLinks>
        </BrandSection>

        <FooterColumn>
          <h4>Product</h4>
          <ul>
            <li><Link to="/editor">Code Editor</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/snippets">Snippets</Link></li>
          </ul>
        </FooterColumn>

        <FooterColumn>
          <h4>Languages</h4>
          <ul>
            <li><Link to="/editor">Python</Link></li>
            <li><Link to="/editor">JavaScript</Link></li>
            <li><Link to="/editor">C++ / Java</Link></li>
            <li><Link to="/editor">TypeScript</Link></li>
          </ul>
        </FooterColumn>

        <FooterColumn>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </FooterColumn>
      </FooterContent>

      <BottomBar>
        <Copyright>
          © {new Date().getFullYear()} CodeSphere. Built with <FiHeart /> by developers.
        </Copyright>
        <Copyright>v1.0.0</Copyright>
      </BottomBar>
    </FooterContainer>
  );
}

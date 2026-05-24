import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiCode, FiGithub, FiTwitter, FiHeart } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: 48px ${({ theme }) => theme.metrics.paddingHorizontal} 24px;
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
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
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
    transition: ${({ theme }) => theme.metrics.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primary.light};
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;

  a {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.bgElevated};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.light.little};
    transition: ${({ theme }) => theme.metrics.transition.fast};

    &:hover {
      background: ${({ theme }) => theme.colors.primary.darkest};
      border-color: ${({ theme }) => theme.colors.primary.main};
      color: ${({ theme }) => theme.colors.primary.light};
      transform: translateY(-2px);
    }
  }
`;

const Divider = styled.div`
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
            <li><Link to="/editor">C++</Link></li>
            <li><Link to="/editor">Java</Link></li>
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

      <Divider>
        <Copyright>
          © {new Date().getFullYear()} CodeSphere. Built with <FiHeart /> by developers.
        </Copyright>
        <Copyright>v1.0.0</Copyright>
      </Divider>
    </FooterContainer>
  );
}

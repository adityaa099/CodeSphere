import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.metrics.paddingHorizontal};
  background: ${({ theme }) => theme.colors.gradients.hero};
  position: relative;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.colors.bgCard};
  padding: 40px;
  border-radius: ${({ theme }) => theme.metrics.radius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  box-shadow: ${({ theme }) => theme.metrics.shadow.large};
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -2px; left: -2px; right: -2px; bottom: -2px;
    background: ${({ theme }) => theme.colors.primary.gradient};
    z-index: -1;
    border-radius: calc(${({ theme }) => theme.metrics.radius.xl} + 2px);
    opacity: 0.3;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;

  svg {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    color: ${({ theme }) => theme.colors.text.light.pure};
    margin-bottom: 8px;
  }

  p {
    color: ${({ theme }) => theme.colors.text.light.little};
    font-size: 14px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.light.little};
    font-size: 18px;
  }
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: 14px 16px 14px 48px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  color: ${({ theme }) => theme.colors.text.light.pure};
  font-size: 14px;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.bgElevated};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.glow};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light.little};
  }
`;

const Button = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: white;
  padding: 16px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  transition: ${({ theme }) => theme.metrics.transition.normal};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.metrics.shadow.glow};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: 24px;
  color: ${({ theme }) => theme.colors.text.light.medium};
  font-size: 14px;

  a {
    color: ${({ theme }) => theme.colors.primary.light};
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <AuthCard>
        <Header>
          <FiCode />
          <h2>Welcome Back</h2>
          <p>Enter your credentials to access your account</p>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <FiMail />
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <FiLock />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'} <FiArrowRight />
          </Button>
        </Form>

        <FooterText>
          Don't have an account? <Link to="/register">Create one</Link>
        </FooterText>
      </AuthCard>
    </Container>
  );
}

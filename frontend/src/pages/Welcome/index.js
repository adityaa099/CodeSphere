import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FiCode, FiZap, FiGlobe, FiShare2, FiShield, FiCpu, FiArrowRight } from 'react-icons/fi';

/* ─── Animations ──────────────────────────────────────────── */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ─── Styled Components ───────────────────────────────────── */
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Hero = styled.section`
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px ${({ theme }) => theme.metrics.paddingHorizontal};
  background: ${({ theme }) => theme.colors.bgColor};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at 30% 40%,
      ${({ theme }) => theme.colors.primary.glow} 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 70% 60%,
      ${({ theme }) => theme.colors.accent.glow} 0%,
      transparent 40%
    );
    opacity: 0.5;
    z-index: 0;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 900px;
  text-align: center;
  z-index: 1;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary.darkest};
  border: 1px solid ${({ theme }) => theme.colors.primary.dark};
  border-radius: ${({ theme }) => theme.metrics.radius.full};
  color: ${({ theme }) => theme.colors.primary.lightest};
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 28px;
  animation: ${fadeInUp} 0.6s ease-out;

  svg {
    font-size: 14px;
  }
`;

const Title = styled.h1`
  font-size: 64px;
  font-weight: 900;
  line-height: 1.08;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text.light.pure};
  letter-spacing: -2px;
  animation: ${fadeInUp} 0.7s ease-out;

  span {
    background: ${({ theme }) => theme.colors.gradients.shine};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 300% auto;
    animation: ${gradientMove} 6s ease infinite;
  }

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    font-size: 44px;
  }

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    font-size: 36px;
    letter-spacing: -1px;
  }
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text.light.medium};
  margin-bottom: 44px;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  animation: ${fadeInUp} 0.9s ease-out;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled(Link)`
  padding: 16px 36px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: white;
  box-shadow: ${({ theme }) => theme.metrics.shadow.glow};
  transition: ${({ theme }) => theme.metrics.transition.normal};

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 0 40px ${({ theme }) => theme.colors.primary.glow};
    color: white;
  }
`;

const SecondaryButton = styled(Link)`
  padding: 16px 36px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.light.pure};
  border: 1px solid ${({ theme }) => theme.colors.border.strong};
  transition: ${({ theme }) => theme.metrics.transition.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.light};
    background: rgba(124, 58, 237, 0.05);
    color: ${({ theme }) => theme.colors.text.light.pure};
  }
`;

/* ─── Code Preview ────────────────────────────────────────── */
const CodePreview = styled.div`
  max-width: 650px;
  margin: 60px auto 0;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.large};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.metrics.shadow.large};
  animation: ${fadeInUp} 1s ease-out, ${float} 6s ease-in-out infinite;
  z-index: 1;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    margin: 40px 0 0;
  }
`;

const CodeHeader = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const CodeBody = styled.pre`
  padding: 20px;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text.light.medium};
  min-height: 120px;
  overflow: hidden;

  .keyword { color: #c792ea; }
  .function { color: #82aaff; }
  .string { color: #c3e88d; }
  .comment { color: #546e7a; }
  .variable { color: #f78c6c; }
  .paren { color: #89ddff; }
`;

/* ─── Features Section ────────────────────────────────────── */
const FeaturesSection = styled.section`
  padding: 120px ${({ theme }) => theme.metrics.paddingHorizontal};
  background: ${({ theme }) => theme.colors.bgSecondary};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.gradients.shine};
    opacity: 0.3;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 64px;

  h2 {
    font-size: 40px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.light.pure};
    margin-bottom: 16px;
    letter-spacing: -1px;
  }

  p {
    font-size: 18px;
    color: ${({ theme }) => theme.colors.text.light.little};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FeatureGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.desktop}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.large};
  padding: 32px;
  transition: ${({ theme }) => theme.metrics.transition.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ gradient }) => gradient};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: ${({ theme }) => theme.metrics.shadow.cardGlow};

    &::before {
      opacity: 1;
    }
  }
`;

const FeatureIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  background: ${({ bg }) => bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    font-size: 24px;
    color: ${({ iconColor }) => iconColor};
  }
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.light.pure};
  margin-bottom: 10px;
  font-weight: 700;
`;

const FeatureDesc = styled.p`
  color: ${({ theme }) => theme.colors.text.light.little};
  line-height: 1.7;
  font-size: 14px;
`;

/* ─── Stats Section ───────────────────────────────────────── */
const StatsSection = styled.section`
  padding: 80px ${({ theme }) => theme.metrics.paddingHorizontal};
  background: ${({ theme }) => theme.colors.bgColor};
`;

const StatsGrid = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
`;

const StatItem = styled.div`
  .number {
    font-size: 42px;
    font-weight: 900;
    background: ${({ theme }) => theme.colors.primary.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
    line-height: 1;
  }

  .label {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.light.little};
    font-weight: 500;
  }
`;

/* ─── CTA Section ─────────────────────────────────────────── */
const CTASection = styled.section`
  padding: 100px ${({ theme }) => theme.metrics.paddingHorizontal};
  background: ${({ theme }) => theme.colors.bgSecondary};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary.glow} 0%,
      transparent 60%
    );
    pointer-events: none;
    opacity: 0.3;
  }
`;

const CTATitle = styled.h2`
  font-size: 40px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.light.pure};
  margin-bottom: 16px;
  z-index: 1;
  position: relative;
  letter-spacing: -1px;
`;

const CTASubtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.light.medium};
  margin-bottom: 40px;
  z-index: 1;
  position: relative;
`;

/* ─── Features Data ───────────────────────────────────────── */
const FEATURES = [
  {
    icon: <FiZap />,
    title: 'Lightning Fast',
    description: 'Code is executed instantly in pre-warmed Docker containers with sub-second cold starts.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    bg: 'rgba(245, 158, 11, 0.1)',
    iconColor: '#f59e0b',
  },
  {
    icon: <FiGlobe />,
    title: 'Multi-Language',
    description: 'Support for Python, C++, Java, Node.js, Go, and Rust with full syntax highlighting.',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    bg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3b82f6',
  },
  {
    icon: <FiShield />,
    title: 'Sandboxed & Secure',
    description: 'Every execution runs in an isolated container with resource limits and network restrictions.',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
    bg: 'rgba(16, 185, 129, 0.1)',
    iconColor: '#10b981',
  },
  {
    icon: <FiShare2 />,
    title: 'Save & Share',
    description: 'Save your code snippets, bookmark favorites, and track your execution history.',
    gradient: 'linear-gradient(135deg, #ec4899, #7c3aed)',
    bg: 'rgba(236, 72, 153, 0.1)',
    iconColor: '#ec4899',
  },
  {
    icon: <FiCpu />,
    title: 'Queue-Based Execution',
    description: 'Redis-backed job queue for reliable, scalable code execution under heavy load.',
    gradient: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    bg: 'rgba(124, 58, 237, 0.1)',
    iconColor: '#7c3aed',
  },
  {
    icon: <FiCode />,
    title: 'Monaco Editor',
    description: 'VS Code-powered editor with IntelliSense-like features, bracket matching, and themes.',
    gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
    bg: 'rgba(6, 182, 212, 0.1)',
    iconColor: '#06b6d4',
  },
];

const codeLines = [
  '<span class="keyword">def</span> <span class="function">solve</span><span class="paren">(</span>n<span class="paren">)</span>:',
  '    <span class="comment"># CodeSphere executes your code</span>',
  '    <span class="keyword">if</span> n <= <span class="variable">1</span>:',
  '        <span class="keyword">return</span> n',
  '    <span class="keyword">return</span> <span class="function">solve</span><span class="paren">(</span>n-<span class="variable">1</span><span class="paren">)</span> + <span class="function">solve</span><span class="paren">(</span>n-<span class="variable">2</span><span class="paren">)</span>',
  '',
  '<span class="function">print</span><span class="paren">(</span><span class="function">solve</span><span class="paren">(</span><span class="variable">10</span><span class="paren">)</span><span class="paren">)</span>  <span class="comment"># → 55</span>',
];

/* ─── Component ───────────────────────────────────────────── */
export default function Welcome() {
  const [typedCode, setTypedCode] = useState('');

  useEffect(() => {
    let charIdx = 0;
    let current = '';
    let inTag = false;
    
    const fullText = codeLines.join('\n');
    
    const interval = setInterval(() => {
      if (charIdx < fullText.length) {
        const char = fullText[charIdx];
        if (char === '<') inTag = true;
        if (char === '>') { inTag = false; charIdx++; current += char; setTypedCode(current); return; }
        if (inTag) { charIdx++; current += char; return; }
        
        current += char;
        charIdx++;
        setTypedCode(current);
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      {/* Hero */}
      <Hero>
        <HeroContent>
          <Badge>
            <FiZap /> Powered by Docker & Redis
          </Badge>
          <Title>
            Code in the Cloud.<br />
            <span>Execute Instantly.</span>
          </Title>
          <Subtitle>
            A powerful, isolated, and scalable online code execution platform.
            Write in Python, C++, Java, Node.js and more — directly from your browser.
          </Subtitle>
          <ButtonGroup>
            <PrimaryButton to="/editor">
              <FiCode size={18} /> Start Coding Now
            </PrimaryButton>
            <SecondaryButton to="/register">
              Create Free Account <FiArrowRight />
            </SecondaryButton>
          </ButtonGroup>

          <CodePreview>
            <CodeHeader>
              <Dot color="#ff5f57" />
              <Dot color="#febc2e" />
              <Dot color="#28c840" />
              <span style={{ marginLeft: 8, fontSize: 12, color: '#8888aa', fontFamily: "'JetBrains Mono', monospace" }}>
                main.py
              </span>
            </CodeHeader>
            <CodeBody dangerouslySetInnerHTML={{ __html: typedCode || '&nbsp;' }} />
          </CodePreview>
        </HeroContent>
      </Hero>

      {/* Stats */}
      <StatsSection>
        <StatsGrid>
          <StatItem>
            <div className="number">6+</div>
            <div className="label">Languages</div>
          </StatItem>
          <StatItem>
            <div className="number">&lt;1s</div>
            <div className="label">Execution Time</div>
          </StatItem>
          <StatItem>
            <div className="number">100%</div>
            <div className="label">Sandboxed</div>
          </StatItem>
          <StatItem>
            <div className="number">∞</div>
            <div className="label">Free Runs</div>
          </StatItem>
        </StatsGrid>
      </StatsSection>

      {/* Features */}
      <FeaturesSection>
        <SectionHeader>
          <h2>Built for developers</h2>
          <p>Everything you need to write, execute, and share code from anywhere.</p>
        </SectionHeader>
        <FeatureGrid>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} gradient={f.gradient}>
              <FeatureIcon bg={f.bg} iconColor={f.iconColor}>
                {f.icon}
              </FeatureIcon>
              <FeatureTitle>{f.title}</FeatureTitle>
              <FeatureDesc>{f.description}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeaturesSection>

      {/* CTA */}
      <CTASection>
        <CTATitle>Ready to start coding?</CTATitle>
        <CTASubtitle>
          Jump into the editor and run your first program in seconds.
        </CTASubtitle>
        <ButtonGroup>
          <PrimaryButton to="/editor">
            <FiCode /> Open Editor
          </PrimaryButton>
        </ButtonGroup>
      </CTASection>
    </Container>
  );
}

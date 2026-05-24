import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { executionsAPI } from '../../services/api';
import { 
  FiActivity, FiCode, FiClock, FiCheckCircle, FiXCircle, 
  FiTrendingUp, FiArrowRight, FiBookOpen 
} from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px ${({ theme }) => theme.metrics.paddingHorizontal};
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  animation: ${fadeIn} 0.4s ease-out;

  .info {
    h1 {
      font-size: 32px;
      color: ${({ theme }) => theme.colors.text.light.pure};
      margin-bottom: 8px;

      span {
        background: ${({ theme }) => theme.colors.primary.gradient};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
    p {
      color: ${({ theme }) => theme.colors.text.light.medium};
    }
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    display: none;
  }
`;

const QuickAction = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  color: ${({ theme }) => theme.colors.text.light.medium};
  font-size: 14px;
  font-weight: 500;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.light};
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.desktop}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: 24px;
  border-radius: ${({ theme }) => theme.metrics.radius.large};
  display: flex;
  align-items: center;
  gap: 18px;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: ${({ delay }) => delay}s;
  animation-fill-mode: both;
  transition: ${({ theme }) => theme.metrics.transition.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.focus};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.metrics.shadow.cardGlow};
  }

  .icon {
    width: 52px;
    height: 52px;
    border-radius: ${({ theme }) => theme.metrics.radius.medium};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    background: ${({ iconBg }) => iconBg};
    color: ${({ iconColor }) => iconColor};
  }

  .content {
    h3 {
      font-size: 28px;
      color: ${({ theme }) => theme.colors.text.light.pure};
      margin: 0;
      font-weight: 800;
      line-height: 1;
    }
    p {
      color: ${({ theme }) => theme.colors.text.light.little};
      font-size: 13px;
      margin: 4px 0 0;
    }
  }
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.large};
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: 0.3s;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text.light.pure};
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
  }

  a {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.primary.light};
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 14px 24px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  th {
    color: ${({ theme }) => theme.colors.text.light.little};
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    color: ${({ theme }) => theme.colors.text.light.pure};
    font-size: 14px;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: ${({ theme }) => theme.metrics.transition.fast};
    &:hover {
      background: ${({ theme }) => theme.colors.bgElevated};
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.metrics.radius.full};
  font-size: 12px;
  font-weight: 600;

  ${({ status, theme }) => status === 'success' ? `
    background: ${theme.colors.auxiliar.successGlow};
    color: ${theme.colors.auxiliar.success};
  ` : `
    background: ${theme.colors.auxiliar.dangerGlow};
    color: ${theme.colors.auxiliar.danger};
  `}
`;

const LangBadge = styled.span`
  background: ${({ theme }) => theme.colors.bgElevated};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.metrics.radius.xs};
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary.light};
`;

/* ─── Language Breakdown ──────────────────────────────────── */
const LangList = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LangItem = styled.div`
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 13px;

    .name {
      color: ${({ theme }) => theme.colors.text.light.pure};
      font-weight: 600;
    }
    .count {
      color: ${({ theme }) => theme.colors.text.light.little};
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.bgInput};
  border-radius: 3px;
  overflow: hidden;

  .fill {
    height: 100%;
    border-radius: 3px;
    background: ${({ color }) => color};
    transition: width 1s ease-out;
  }
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.light.faint};
  padding: 24px;
  text-align: center;
  font-size: 14px;
`;

const LANG_COLORS = {
  python: '#3572A5',
  javascript: '#f1e05a',
  cpp: '#f34b7d',
  java: '#b07219',
  go: '#00ADD8',
  rust: '#dea584',
};

const LANG_LABELS = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await executionsAPI.getStats();
        setStats(res.data.stats);
      } catch (err) {
        // Use empty stats on error
        setStats({
          totalExecutions: 0,
          successRate: 0,
          failedExecutions: 0,
          avgExecutionTime: 0,
          recentExecutions: [],
          languageBreakdown: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner label="Loading dashboard..." />
      </Container>
    );
  }

  const totalExec = stats?.totalExecutions || 0;
  const langBreakdown = stats?.languageBreakdown || [];
  const maxLangCount = Math.max(...langBreakdown.map(l => l.count || 0), 1);

  return (
    <Container>
      <Header>
        <div className="info">
          <h1>Welcome back, <span>{user?.username}</span></h1>
          <p>Here's an overview of your code execution activity.</p>
        </div>
        <QuickActions>
          <QuickAction to="/editor">
            <FiCode /> New Execution
          </QuickAction>
          <QuickAction to="/snippets">
            <FiBookOpen /> My Snippets
          </QuickAction>
        </QuickActions>
      </Header>

      <StatsGrid>
        <StatCard delay={0.05} iconBg="rgba(124, 58, 237, 0.15)" iconColor="#a78bfa">
          <div className="icon"><FiCode /></div>
          <div className="content">
            <h3>{totalExec}</h3>
            <p>Total Executions</p>
          </div>
        </StatCard>
        <StatCard delay={0.1} iconBg="rgba(16, 185, 129, 0.15)" iconColor="#6ee7b7">
          <div className="icon"><FiCheckCircle /></div>
          <div className="content">
            <h3>{stats?.successRate || 0}%</h3>
            <p>Success Rate</p>
          </div>
        </StatCard>
        <StatCard delay={0.15} iconBg="rgba(239, 68, 68, 0.15)" iconColor="#fca5a5">
          <div className="icon"><FiXCircle /></div>
          <div className="content">
            <h3>{stats?.failedExecutions || 0}</h3>
            <p>Failed</p>
          </div>
        </StatCard>
        <StatCard delay={0.2} iconBg="rgba(59, 130, 246, 0.15)" iconColor="#93c5fd">
          <div className="icon"><FiClock /></div>
          <div className="content">
            <h3>{stats?.avgExecutionTime ? `${Math.round(stats.avgExecutionTime)}ms` : '—'}</h3>
            <p>Avg. Exec Time</p>
          </div>
        </StatCard>
      </StatsGrid>

      <GridRow>
        <Section>
          <SectionHeader>
            <h2><FiActivity /> Recent Executions</h2>
            <Link to="/history">View All <FiArrowRight /></Link>
          </SectionHeader>
          {stats?.recentExecutions?.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentExecutions.slice(0, 7).map(exec => (
                  <tr key={exec._id}>
                    <td><LangBadge>{exec.language}</LangBadge></td>
                    <td>
                      <StatusBadge status={exec.status}>
                        {exec.status === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                        {exec.status}
                      </StatusBadge>
                    </td>
                    <td>{exec.executionTime ? `${exec.executionTime}ms` : '—'}</td>
                    <td style={{ color: '#8888aa', fontSize: 13 }}>
                      {new Date(exec.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyMessage>No executions yet. Go write some code!</EmptyMessage>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <h2><FiTrendingUp /> Languages</h2>
          </SectionHeader>
          {langBreakdown.length > 0 ? (
            <LangList>
              {langBreakdown.map((lang, i) => (
                <LangItem key={lang._id || lang.language || i}>
                  <div className="header">
                    <span className="name">
                      {LANG_LABELS[lang._id || lang.language] || lang._id || lang.language}
                    </span>
                    <span className="count">{lang.count} runs</span>
                  </div>
                  <ProgressBar color={LANG_COLORS[lang._id || lang.language] || '#7c3aed'}>
                    <div className="fill" style={{ width: `${(lang.count / maxLangCount) * 100}%` }} />
                  </ProgressBar>
                </LangItem>
              ))}
            </LangList>
          ) : (
            <EmptyMessage>Run some code to see language stats</EmptyMessage>
          )}
        </Section>
      </GridRow>
    </Container>
  );
}

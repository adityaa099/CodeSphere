import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { executionsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiActivity, FiCheckCircle, FiXCircle, FiClock, FiChevronLeft, 
  FiChevronRight, FiCode, FiEye, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px ${({ theme }) => theme.metrics.paddingHorizontal};
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.text.light.pure};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      color: ${({ theme }) => theme.colors.primary.light};
    }
  }

  p {
    color: ${({ theme }) => theme.colors.text.light.medium};
  }
`;

const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.large};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px 20px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  th {
    color: ${({ theme }) => theme.colors.text.light.medium};
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${({ theme }) => theme.colors.bgSecondary};
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
    cursor: pointer;

    &:hover {
      background: ${({ theme }) => theme.colors.bgElevated};
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
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

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  color: ${({ theme }) => theme.colors.text.light.medium};
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-size: 12px;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.bgSecondary};
`;

const PageInfo = styled.span`
  color: ${({ theme }) => theme.colors.text.light.little};
  font-size: 13px;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  background: ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.bgCard};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.text.light.medium};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.light};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Detail modal overlay
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const DetailPanel = styled.div`
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.xl};
  animation: ${slideIn} 0.3s ease-out;
`;

const DetailHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 20px;
    color: ${({ theme }) => theme.colors.text.light.pure};
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    color: ${({ theme }) => theme.colors.text.light.little};
    font-size: 20px;
    padding: 4px;
    transition: ${({ theme }) => theme.metrics.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.text.light.pure};
    }
  }
`;

const DetailBody = styled.div`
  padding: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const DetailItem = styled.div`
  flex: 1;
  min-width: 120px;

  .label {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.light.faint};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .value {
    font-size: 15px;
    color: ${({ theme }) => theme.colors.text.light.pure};
    font-weight: 500;
  }
`;

const CodeBlock = styled.div`
  margin-top: 20px;

  .label {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.light.faint};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  pre {
    background: ${({ theme }) => theme.colors.bgInput};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.metrics.radius.medium};
    padding: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.light.medium};
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const OutputBlock = styled(CodeBlock)`
  pre {
    color: ${({ isError, theme }) => 
      isError ? theme.colors.auxiliar.danger : theme.colors.secondary.light};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;

  svg {
    font-size: 64px;
    color: ${({ theme }) => theme.colors.text.light.faint};
    margin-bottom: 20px;
  }

  h3 {
    font-size: 20px;
    color: ${({ theme }) => theme.colors.text.light.very};
    margin-bottom: 8px;
  }

  p {
    color: ${({ theme }) => theme.colors.text.light.little};
  }
`;

export default function History() {
  const { isAuthenticated } = useAuth();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedExec, setSelectedExec] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await executionsAPI.getHistory({ page, limit: 15 });
      setExecutions(res.data.executions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load execution history');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchExecutions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchExecutions]);

  const handleViewDetail = async (exec) => {
    setDetailLoading(true);
    setSelectedExec(exec);
    try {
      const res = await executionsAPI.getOne(exec._id);
      setSelectedExec(res.data.execution || res.data);
    } catch (err) {
      // Use what we already have
    } finally {
      setDetailLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <EmptyState>
          <FiActivity />
          <h3>Sign in to view execution history</h3>
          <p>Your code execution history will appear here after you sign in.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1><FiActivity /> Execution History</h1>
        <p>View all your past code executions with detailed output and metrics.</p>
      </Header>

      {loading ? (
        <LoadingSpinner label="Loading history..." />
      ) : executions.length === 0 ? (
        <EmptyState>
          <FiCode />
          <h3>No executions yet</h3>
          <p>Head to the editor and run some code to see your history here.</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Language</th>
                <th>Status</th>
                <th>Exec Time</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {executions.map(exec => (
                <tr key={exec._id} onClick={() => handleViewDetail(exec)}>
                  <td><LangBadge>{exec.language}</LangBadge></td>
                  <td>
                    <StatusBadge status={exec.status}>
                      {exec.status === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                      {exec.status}
                    </StatusBadge>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiClock style={{ fontSize: 14, opacity: 0.5 }} />
                      {exec.executionTime ? `${exec.executionTime}ms` : '—'}
                    </span>
                  </td>
                  <td style={{ color: '#8888aa' }}>
                    {new Date(exec.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <ViewButton onClick={(e) => { e.stopPropagation(); handleViewDetail(exec); }}>
                      <FiEye /> View
                    </ViewButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            <PageInfo>
              Page {page} of {totalPages}
            </PageInfo>
            <PageButtons>
              <PageButton 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                <FiChevronLeft />
              </PageButton>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <PageButton key={p} active={p === page} onClick={() => setPage(p)}>
                    {p}
                  </PageButton>
                );
              })}
              <PageButton 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                <FiChevronRight />
              </PageButton>
            </PageButtons>
          </Pagination>
        </TableContainer>
      )}

      {/* Detail Modal */}
      {selectedExec && (
        <Overlay onClick={() => setSelectedExec(null)}>
          <DetailPanel onClick={e => e.stopPropagation()}>
            <DetailHeader>
              <h2><FiCode /> Execution Details</h2>
              <button onClick={() => setSelectedExec(null)}><FiX /></button>
            </DetailHeader>
            <DetailBody>
              {detailLoading ? (
                <LoadingSpinner label="Loading details..." />
              ) : (
                <>
                  <DetailRow>
                    <DetailItem>
                      <div className="label">Language</div>
                      <div className="value">{selectedExec.language}</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="label">Status</div>
                      <div className="value">
                        <StatusBadge status={selectedExec.status}>
                          {selectedExec.status === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                          {selectedExec.status}
                        </StatusBadge>
                      </div>
                    </DetailItem>
                    <DetailItem>
                      <div className="label">Execution Time</div>
                      <div className="value">{selectedExec.executionTime ? `${selectedExec.executionTime}ms` : '—'}</div>
                    </DetailItem>
                  </DetailRow>
                  <DetailRow>
                    <DetailItem>
                      <div className="label">Executed At</div>
                      <div className="value">{new Date(selectedExec.createdAt).toLocaleString()}</div>
                    </DetailItem>
                  </DetailRow>

                  <CodeBlock>
                    <div className="label">Source Code</div>
                    <pre>{selectedExec.code || '// No code available'}</pre>
                  </CodeBlock>

                  <OutputBlock isError={selectedExec.status === 'error'}>
                    <div className="label">Output</div>
                    <pre>{selectedExec.error || selectedExec.output || 'Process exited with no output.'}</pre>
                  </OutputBlock>
                </>
              )}
            </DetailBody>
          </DetailPanel>
        </Overlay>
      )}
    </Container>
  );
}

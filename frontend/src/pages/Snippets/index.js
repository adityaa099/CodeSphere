import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { snippetsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiSearch, FiBookmark, FiTrash2, FiEdit2, FiCode, 
  FiClock, FiPlus, FiCopy, FiCheck 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px ${({ theme }) => theme.metrics.paddingHorizontal};
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;

  .info {
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
  }
`;

const NewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: white;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-weight: 600;
  font-size: 14px;
  transition: ${({ theme }) => theme.metrics.transition.normal};
  box-shadow: ${({ theme }) => theme.metrics.shadow.glow};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.metrics.shadow.large};
  }
`;

const ToolbarRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 280px;
  position: relative;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.light.little};
  }

  input {
    width: 100%;
    background: ${({ theme }) => theme.colors.bgCard};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    color: ${({ theme }) => theme.colors.text.light.pure};
    padding: 12px 16px 12px 42px;
    border-radius: ${({ theme }) => theme.metrics.radius.medium};
    font-size: 14px;
    transition: ${({ theme }) => theme.metrics.transition.fast};

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.glow};
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.light.faint};
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${({ theme, active }) => active ? theme.colors.primary.darkest : theme.colors.bgCard};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.border.subtle};
  color: ${({ theme, active }) => active ? theme.colors.primary.light : theme.colors.text.light.medium};
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-size: 14px;
  font-weight: 500;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const SnippetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const SnippetCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.large};
  overflow: hidden;
  transition: ${({ theme }) => theme.metrics.transition.normal};
  animation: ${fadeIn} 0.4s ease-out;
  animation-fill-mode: both;
  animation-delay: ${({ index }) => index * 0.05}s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: ${({ theme }) => theme.metrics.shadow.cardGlow};
    transform: translateY(-3px);
  }
`;

const CardHeader = styled.div`
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.light.pure};
    margin-bottom: 4px;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.light.faint};

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const LangBadge = styled.span`
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.metrics.radius.full};
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary.light};
  font-weight: 600;
`;

const CardCode = styled.pre`
  margin: 16px 20px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.bgInput};
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.light.medium};
  max-height: 120px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(transparent, ${({ theme }) => theme.colors.bgInput});
  }
`;

const CardActions = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.light.little};
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.text.light.pure};
  }

  &.bookmark {
    color: ${({ active, theme }) => active ? theme.colors.accent.main : theme.colors.text.light.little};
    &:hover {
      color: ${({ theme }) => theme.colors.accent.main};
    }
  }

  &.delete:hover {
    color: ${({ theme }) => theme.colors.auxiliar.danger};
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
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
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LANG_LABELS = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
};

export default function Snippets() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchSnippets = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (showBookmarked) params.bookmarked = true;
      const res = await snippetsAPI.getAll(params);
      setSnippets(res.data.snippets || []);
    } catch (err) {
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  }, [search, showBookmarked]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSnippets();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchSnippets]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await snippetsAPI.delete(id);
      setSnippets(prev => prev.filter(s => s._id !== id));
      toast.success('Snippet deleted');
    } catch (err) {
      toast.error('Failed to delete snippet');
    }
  };

  const handleBookmark = async (id) => {
    try {
      const res = await snippetsAPI.toggleBookmark(id);
      setSnippets(prev => prev.map(s => 
        s._id === id ? { ...s, isBookmarked: res.data.isBookmarked } : s
      ));
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInEditor = (snippet) => {
    // Pass snippet data via navigation state
    navigate('/editor', { state: { code: snippet.code, language: snippet.language } });
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <EmptyState>
          <FiCode />
          <h3>Sign in to view your snippets</h3>
          <p>Create an account to save, organize, and share your code snippets.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div className="info">
          <h1><FiCode /> My Snippets</h1>
          <p>Save, organize, and quickly access your code snippets.</p>
        </div>
        <NewButton onClick={() => navigate('/editor')}>
          <FiPlus /> New Snippet
        </NewButton>
      </Header>

      <ToolbarRow>
        <SearchBox>
          <FiSearch />
          <input
            type="text"
            placeholder="Search snippets by title, language, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBox>
        <FilterButton
          active={showBookmarked}
          onClick={() => setShowBookmarked(!showBookmarked)}
        >
          <FiBookmark /> Bookmarked
        </FilterButton>
      </ToolbarRow>

      {loading ? (
        <LoadingSpinner label="Loading snippets..." />
      ) : (
        <SnippetGrid>
          {snippets.length === 0 ? (
            <EmptyState>
              <FiCode />
              <h3>{search || showBookmarked ? 'No matching snippets' : 'No snippets yet'}</h3>
              <p>
                {search || showBookmarked
                  ? 'Try adjusting your search or filters.'
                  : 'Head over to the editor, write some code, and save it as a snippet!'}
              </p>
            </EmptyState>
          ) : (
            snippets.map((snippet, i) => (
              <SnippetCard key={snippet._id} index={i}>
                <CardHeader>
                  <div>
                    <div className="title">{snippet.title || 'Untitled Snippet'}</div>
                    <div className="meta">
                      <span><FiClock /> {new Date(snippet.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <LangBadge>{LANG_LABELS[snippet.language] || snippet.language}</LangBadge>
                </CardHeader>

                <CardCode>
                  {snippet.code?.substring(0, 300) || '// Empty snippet'}
                </CardCode>

                <CardActions>
                  <ActionGroup>
                    <ActionButton onClick={() => handleOpenInEditor(snippet)} title="Open in Editor">
                      <FiEdit2 /> Edit
                    </ActionButton>
                    <ActionButton onClick={() => handleCopy(snippet.code, snippet._id)} title="Copy Code">
                      {copiedId === snippet._id ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                    </ActionButton>
                  </ActionGroup>
                  <ActionGroup>
                    <ActionButton
                      className="bookmark"
                      active={snippet.isBookmarked}
                      onClick={() => handleBookmark(snippet._id)}
                      title="Toggle Bookmark"
                    >
                      <FiBookmark />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      onClick={() => handleDelete(snippet._id)}
                      title="Delete Snippet"
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </ActionGroup>
                </CardActions>
              </SnippetCard>
            ))
          )}
        </SnippetGrid>
      )}
    </Container>
  );
}

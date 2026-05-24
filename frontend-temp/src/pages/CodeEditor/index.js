import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Editor } from '@monaco-editor/react';
import { useLocation } from 'react-router-dom';
import { codeAPI, snippetsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiPlay, FiSave, FiTerminal, FiClock, FiCheckCircle, 
  FiXCircle, FiChevronDown, FiChevronUp, FiCommand, FiCopy, FiCheck 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

/* ─── Animations ──────────────────────────────────────────── */
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ───────────────────────────────────── */
const Container = styled.div`
  display: flex;
  height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.bgColor};
`;

const Sidebar = styled.div`
  width: 260px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    display: none;
  }
`;

const SidebarSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};

  h3 {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.light.faint};
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
    font-weight: 600;
  }
`;

const Select = styled.select`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.light.pure};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  option {
    background: ${({ theme }) => theme.colors.bgInput};
  }
`;

const StdinToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: ${({ theme, active }) => active ? theme.colors.bgElevated : theme.colors.bgInput};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.primary.main : theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.light.medium};
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-size: 13px;
  transition: ${({ theme }) => theme.metrics.transition.fast};
  margin-bottom: ${({ active }) => active ? '12px' : '0'};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const StdinArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.light.pure};
  padding: 12px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  resize: vertical;
  outline: none;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light.faint};
  }
`;

const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Shortcut = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.light.little};

  .keys {
    display: flex;
    gap: 4px;
  }
`;

const KeyBadge = styled.kbd`
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.light.medium};
`;

const MainSpace = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const EditorHeader = styled.div`
  height: 48px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const FileName = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.light.little};
  display: flex;
  align-items: center;
  gap: 8px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.auxiliar.success};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  font-size: 13px;
  font-weight: 600;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &.run {
    background: ${({ theme }) => theme.colors.auxiliar.success};
    color: white;

    &:hover:not(:disabled) {
      filter: brightness(1.15);
      box-shadow: 0 0 20px ${({ theme }) => theme.colors.auxiliar.successGlow};
    }

    &.running {
      animation: ${pulse} 1.5s ease infinite;
    }
  }

  &.save {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.text.light.pure};
    border: 1px solid ${({ theme }) => theme.colors.border.default};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.primary.main};
      color: ${({ theme }) => theme.colors.primary.light};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  position: relative;
  min-height: 200px;
`;

const OutputPanel = styled.div`
  height: ${({ height }) => height}px;
  min-height: 100px;
  max-height: 500px;
  background: ${({ theme }) => theme.colors.bgTertiary};
  border-top: 2px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  flex-direction: column;
  transition: height 0.2s ease;
`;

const OutputHeader = styled.div`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OutputTabs = styled.div`
  display: flex;
  gap: 4px;
`;

const OutputTab = styled.button`
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.metrics.radius.xs};
  color: ${({ theme, active }) => active ? theme.colors.text.light.pure : theme.colors.text.light.little};
  background: ${({ theme, active }) => active ? theme.colors.bgElevated : 'transparent'};
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.light.pure};
  }
`;

const OutputMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.light.little};

  .item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .success { color: ${({ theme }) => theme.colors.auxiliar.success}; }
  .error { color: ${({ theme }) => theme.colors.auxiliar.danger}; }
`;

const OutputContent = styled.pre`
  flex: 1;
  padding: 16px 20px;
  margin: 0;
  overflow: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme, isError }) => isError ? theme.colors.auxiliar.danger : theme.colors.text.light.pure};
  white-space: pre-wrap;
  word-break: break-word;
  animation: ${slideUp} 0.3s ease-out;

  &.empty {
    color: ${({ theme }) => theme.colors.text.light.faint};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    gap: 8px;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.light.little};
  padding: 3px 8px;
  border-radius: 4px;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.text.light.pure};
  }
`;

/* ─── Save Snippet Modal ──────────────────────────────────── */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 440px;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.metrics.radius.xl};
  padding: 32px;
  animation: ${slideUp} 0.3s ease-out;

  h3 {
    font-size: 20px;
    color: ${({ theme }) => theme.colors.text.light.pure};
    margin-bottom: 24px;
  }
`;

const ModalInput = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.light.pure};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-size: 14px;
  margin-bottom: 16px;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.glow};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light.faint};
  }
`;

const ModalDescription = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.light.pure};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-size: 14px;
  margin-bottom: 24px;
  resize: vertical;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.glow};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light.faint};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ModalButton = styled.button`
  padding: 10px 24px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-weight: 600;
  font-size: 14px;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  ${({ theme, variant }) => variant === 'primary' ? `
    background: ${theme.colors.primary.gradient};
    color: white;
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: ${theme.metrics.shadow.glow};
    }
  ` : `
    background: ${theme.colors.bgElevated};
    color: ${theme.colors.text.light.medium};
    border: 1px solid ${theme.colors.border.default};
    &:hover {
      border-color: ${theme.colors.text.light.little};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* ─── Constants ───────────────────────────────────────────── */
const DEFAULT_CODE = {
  python: '# Write your Python code here\nprint("Hello, CodeSphere!")',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, CodeSphere!");',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeSphere!" << endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSphere!");\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CodeSphere!")\n}',
  rust: 'fn main() {\n    println!("Hello, CodeSphere!");\n}',
  csharp: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, CodeSphere!");\n    }\n}',
  php: '<?php\necho "Hello, CodeSphere!\\n";\n?>',
  ruby: '# Write your Ruby code here\nputs "Hello, CodeSphere!"',
  swift: 'import Foundation\nprint("Hello, CodeSphere!")',
  typescript: '// Write your TypeScript code here\nconst greeting: string = "Hello, CodeSphere!";\nconsole.log(greeting);',
};

const MONACO_LANG_MAP = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
  java: 'java',
  go: 'go',
  rust: 'rust',
  csharp: 'csharp',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  typescript: 'typescript',
};

const FILE_EXTENSIONS = {
  python: 'py',
  javascript: 'js',
  cpp: 'cpp',
  java: 'java',
  go: 'go',
  rust: 'rs',
  csharp: 'cs',
  php: 'php',
  ruby: 'rb',
  swift: 'swift',
  typescript: 'ts',
};

/* ─── Component ───────────────────────────────────────────── */
export default function CodeEditor() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const codeRef = useRef(code);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState(null);
  const [outputHeight] = useState(250);
  const [copied, setCopied] = useState(false);
  
  // Save snippet modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetDesc, setSnippetDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load from navigation state (e.g., from Snippets page)
  useEffect(() => {
    if (location.state?.code) {
      setCode(location.state.code);
      codeRef.current = location.state.code;
    }
    if (location.state?.language) {
      setSelectedLang(location.state.language);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await codeAPI.getLanguages();
        setLanguages(res.data.languages);
        if (res.data.languages.length > 0 && !location.state?.language) {
          setSelectedLang(res.data.languages[0].id);
          const defaultCode = DEFAULT_CODE[res.data.languages[0].id] || '';
          setCode(defaultCode);
          codeRef.current = defaultCode;
        }
      } catch (err) {
        // Use defaults if API is unavailable
        setLanguages([
          { id: 'python', name: 'Python', version: '3.11' },
          { id: 'javascript', name: 'JavaScript', version: '20' },
          { id: 'cpp', name: 'C++', version: '13' },
          { id: 'java', name: 'Java', version: '17' },
          { id: 'go', name: 'Go', version: '1.21' },
          { id: 'rust', name: 'Rust', version: '1.74' },
          { id: 'csharp', name: 'C#', version: '8.0' },
          { id: 'php', name: 'PHP', version: '8.2' },
          { id: 'ruby', name: 'Ruby', version: '3.2' },
          { id: 'swift', name: 'Swift', version: '5.9' },
          { id: 'typescript', name: 'TypeScript', version: '5.x' },
        ]);
      }
    };
    fetchLanguages();
  }, [location.state]);

  const handleLangChange = (e) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    if (!location.state?.code) {
      const defaultCode = DEFAULT_CODE[lang] || '';
      setCode(defaultCode);
      codeRef.current = defaultCode;
    }
  };

  const handleRun = useCallback(async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setOutput(null);
    try {
      const currentCode = codeRef.current;
      const payload = { code: currentCode, language: selectedLang };
      if (stdin.trim()) payload.input = stdin;
      const res = await codeAPI.execute(payload);
      setOutput(res.data.execution);
    } catch (err) {
      toast.error('Execution failed');
      setOutput({
        error: err.response?.data?.error || 'An error occurred during execution.',
        status: 'error',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [selectedLang, stdin, isExecuting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isAuthenticated) {
          setShowSaveModal(true);
        } else {
          toast.error('Sign in to save snippets');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, isAuthenticated]);

  const handleSaveSnippet = async () => {
    if (!snippetTitle.trim()) {
      return toast.error('Please enter a title');
    }
    setIsSaving(true);
    try {
      await snippetsAPI.create({
        title: snippetTitle.trim(),
        description: snippetDesc.trim(),
        code,
        language: selectedLang,
      });
      toast.success('Snippet saved!');
      setShowSaveModal(false);
      setSnippetTitle('');
      setSnippetDesc('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save snippet');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyOutput = () => {
    const text = output?.error || output?.output || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container>
      <Sidebar>
        <SidebarSection>
          <h3>Language</h3>
          <Select value={selectedLang} onChange={handleLangChange}>
            {languages.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.version})</option>
            ))}
          </Select>
        </SidebarSection>

        <SidebarSection>
          <h3>Standard Input</h3>
          <StdinToggle
            active={showStdin}
            onClick={() => setShowStdin(!showStdin)}
          >
            <span><FiTerminal style={{ marginRight: 6 }} /> Stdin</span>
            {showStdin ? <FiChevronUp /> : <FiChevronDown />}
          </StdinToggle>
          {showStdin && (
            <StdinArea
              placeholder="Enter input for your program..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          )}
        </SidebarSection>

        <SidebarSection>
          <h3>Shortcuts</h3>
          <ShortcutList>
            <Shortcut>
              <span>Run Code</span>
              <div className="keys">
                <KeyBadge>Ctrl</KeyBadge>
                <KeyBadge>↵</KeyBadge>
              </div>
            </Shortcut>
            <Shortcut>
              <span>Save Snippet</span>
              <div className="keys">
                <KeyBadge>Ctrl</KeyBadge>
                <KeyBadge>S</KeyBadge>
              </div>
            </Shortcut>
          </ShortcutList>
        </SidebarSection>
      </Sidebar>

      <MainSpace>
        <EditorHeader>
          <FileName>
            <div className="dot" />
            main.{FILE_EXTENSIONS[selectedLang] || selectedLang}
          </FileName>
          <Actions>
            {isAuthenticated && (
              <Button className="save" onClick={() => setShowSaveModal(true)}>
                <FiSave /> Save
              </Button>
            )}
            <Button
              className={`run ${isExecuting ? 'running' : ''}`}
              onClick={handleRun}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>Executing...</>
              ) : (
                <><FiPlay /> Run</>
              )}
            </Button>
          </Actions>
        </EditorHeader>

        <EditorWrapper>
          <Editor
            height="100%"
            language={MONACO_LANG_MAP[selectedLang] || 'plaintext'}
            theme="vs-dark"
            value={code}
            onChange={(val) => { const v = val || ''; setCode(v); codeRef.current = v; }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              padding: { top: 20, bottom: 20 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              lineHeight: 1.7,
              tabSize: 4,
              bracketPairColorization: { enabled: true },
              guides: {
                indentation: true,
                bracketPairs: true,
              },
            }}
            loading={<LoadingSpinner label="Loading editor..." />}
          />
        </EditorWrapper>

        <OutputPanel height={outputHeight}>
          <OutputHeader>
            <OutputTabs>
              <OutputTab active>
                <FiTerminal style={{ marginRight: 6, fontSize: 13 }} />
                Output
              </OutputTab>
            </OutputTabs>
            <OutputMeta>
              {output && (
                <>
                  <CopyButton onClick={handleCopyOutput}>
                    {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                  </CopyButton>
                  {output.executionTime && (
                    <span className="item">
                      <FiClock /> {output.executionTime}ms
                    </span>
                  )}
                  <span className={`item ${output.status === 'success' ? 'success' : 'error'}`}>
                    {output.status === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                    {output.status}
                  </span>
                </>
              )}
            </OutputMeta>
          </OutputHeader>
          {isExecuting ? (
            <OutputContent className="empty">
              <LoadingSpinner size={24} /> Executing...
            </OutputContent>
          ) : output ? (
            <OutputContent isError={output.status === 'error'}>
              {output.error || output.output || 'Process exited successfully with no output.'}
            </OutputContent>
          ) : (
            <OutputContent className="empty">
              <FiCommand style={{ opacity: 0.5 }} />
              Press Ctrl+Enter or click Run to execute
            </OutputContent>
          )}
        </OutputPanel>
      </MainSpace>

      {/* Save Snippet Modal */}
      {showSaveModal && (
        <ModalOverlay onClick={() => setShowSaveModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <h3>💾 Save Snippet</h3>
            <ModalInput
              type="text"
              placeholder="Snippet title"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              autoFocus
            />
            <ModalDescription
              placeholder="Description (optional)"
              value={snippetDesc}
              onChange={(e) => setSnippetDesc(e.target.value)}
            />
            <ModalActions>
              <ModalButton onClick={() => setShowSaveModal(false)}>Cancel</ModalButton>
              <ModalButton
                variant="primary"
                onClick={handleSaveSnippet}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Snippet'}
              </ModalButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}

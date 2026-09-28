import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  GitPullRequest, 
  Sliders, 
  Check, 
  FileCode,
  ShieldAlert,
  Cpu,
  Bot,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { testOllamaConnection } from '../services/aiService';

export function ConfigModal({
  isOpen,
  onClose,
  mcpConfig,
  setMcpConfig,
  rubricConfig,
  setRubricConfig,
  aiConfig,
  setAiConfig
}) {
  const [activeTab, setActiveTab] = useState('mcp');
  const [tempMcp, setTempMcp] = useState({ ...mcpConfig });
  const [tempRubric, setTempRubric] = useState({ ...rubricConfig });
  const [tempAi, setTempAi] = useState({ ...aiConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);

  if (!isOpen) return null;

  const handleTestOllama = async () => {
    setIsTestingOllama(true);
    setOllamaStatus(null);
    const res = await testOllamaConnection(tempAi.ollamaHost);
    setOllamaStatus(res);
    setIsTestingOllama(false);
  };

  const handleSave = () => {
    setMcpConfig(tempMcp);
    setRubricConfig(tempRubric);
    if (setAiConfig) setAiConfig(tempAi);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings size={20} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Agent, AI & MCP Configuration</h3>
          </div>
          <button 
            className="btn-icon-copy" 
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal navigation tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <button
            className={`tab-btn ${activeTab === 'mcp' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcp')}
          >
            <Database size={14} />
            <span>MCP Tool Connectors</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Bot size={14} />
            <span>AI Engine (Ollama / Local AI)</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'rubric' ? 'active' : ''}`}
            onClick={() => setActiveTab('rubric')}
          >
            <ShieldAlert size={14} />
            <span>Triage Rubric Rules</span>
          </button>
        </div>

        <div className="modal-body">
          {/* TAB 1: MCP CONNECTORS */}
          {activeTab === 'mcp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* JIRA MCP SECTION */}
              <div style={{ 
                background: 'rgba(0,0,0,0.25)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={16} style={{ color: '#60a5fa' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Jira MCP Connector</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={tempMcp.jiraEnabled}
                      onChange={(e) => setTempMcp({ ...tempMcp, jiraEnabled: e.target.checked })}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Jira Host URL</label>
                    <input 
                      type="text" 
                      value={tempMcp.jiraHost || ''} 
                      onChange={(e) => setTempMcp({ ...tempMcp, jiraHost: e.target.value })}
                      placeholder="e.g. https://company.atlassian.net"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Key</label>
                    <input 
                      type="text" 
                      value={tempMcp.jiraProject || ''} 
                      onChange={(e) => setTempMcp({ ...tempMcp, jiraProject: e.target.value })}
                      placeholder="e.g. CORE, PAY, AUTH"
                    />
                  </div>
                </div>

                <div className="form-row-2" style={{ marginTop: '0.6rem' }}>
                  <div className="form-group">
                    <label className="form-label">User Email</label>
                    <input 
                      type="text" 
                      value={tempMcp.jiraEmail || ''} 
                      onChange={(e) => setTempMcp({ ...tempMcp, jiraEmail: e.target.value })}
                      placeholder="devops@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">API Token</label>
                    <input 
                      type="password" 
                      value={tempMcp.jiraToken || ''} 
                      onChange={(e) => setTempMcp({ ...tempMcp, jiraToken: e.target.value })}
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                  💡 Leave blank to use built-in Enterprise Mock Jira bug database and duplicate classifier.
                </div>
              </div>

              {/* GITHUB MCP SECTION */}
              <div style={{ 
                background: 'rgba(0,0,0,0.25)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GitPullRequest size={16} style={{ color: '#818cf8' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>GitHub MCP Connector</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={tempMcp.githubEnabled}
                      onChange={(e) => setTempMcp({ ...tempMcp, githubEnabled: e.target.checked })}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Target Repository</label>
                    <input 
                      type="text" 
                      value={tempMcp.githubRepo || ''} 
                      onChange={(e) => setTempMcp({ ...tempMcp, githubRepo: e.target.value })}
                      placeholder="e.g. company/payment-service"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch</label>
                    <input 
                      type="text" 
                      value={tempMcp.githubBranch || 'main'} 
                      onChange={(e) => setTempMcp({ ...tempMcp, githubBranch: e.target.value })}
                      placeholder="main"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.6rem' }}>
                  <label className="form-label">GitHub Personal Access Token (PAT)</label>
                  <input 
                    type="password" 
                    value={tempMcp.githubToken || ''} 
                    onChange={(e) => setTempMcp({ ...tempMcp, githubToken: e.target.value })}
                    placeholder="ghp_••••••••••••••••••••"
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                  💡 Leave blank to use built-in Git commit history & blame diff analyzer.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI ENGINE (OLLAMA / LOCAL AI) */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#e0e7ff', marginBottom: '0.35rem' }}>
                  🦙 Ollama Local AI & Dynamic Intelligence
                </div>
                <p style={{ fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.5 }}>
                  Connect your local Ollama instance to analyze <strong>any custom Bug Objective</strong> and generate contextual defect reports, root cause diagnostics, and fix plans.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">AI Engine Provider</label>
                <select
                  value={tempAi.provider}
                  onChange={(e) => setTempAi({ ...tempAi, provider: e.target.value })}
                >
                  <option value="ollama">🦙 Ollama (Local AI Server)</option>
                  <option value="dynamic">🧠 Built-in Dynamic AI Engine (Instant)</option>
                </select>
              </div>

              {tempAi.provider === 'ollama' && (
                <>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Ollama Host URL</label>
                      <input 
                        type="text" 
                        value={tempAi.ollamaHost}
                        onChange={(e) => setTempAi({ ...tempAi, ollamaHost: e.target.value })}
                        placeholder="http://localhost:11434"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model Name</label>
                      <input 
                        type="text" 
                        value={tempAi.model}
                        onChange={(e) => setTempAi({ ...tempAi, model: e.target.value })}
                        placeholder="e.g. llama3, mistral, deepseek-r1"
                      />
                    </div>
                  </div>

                  {/* Ping test button */}
                  <div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleTestOllama}
                      disabled={isTestingOllama}
                      style={{ fontSize: '0.82rem' }}
                    >
                      {isTestingOllama ? (
                        <>
                          <RefreshCw size={13} className="pulsing" />
                          <span>Testing Ollama Connection...</span>
                        </>
                      ) : (
                        <>
                          <Cpu size={14} style={{ color: '#818cf8' }} />
                          <span>Test Ollama Connection</span>
                        </>
                      )}
                    </button>

                    {ollamaStatus && (
                      <div style={{ 
                        marginTop: '0.65rem',
                        padding: '0.65rem 0.85rem', 
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        background: ollamaStatus.connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        border: ollamaStatus.connected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                        color: ollamaStatus.connected ? '#6ee7b7' : '#fcd34d'
                      }}>
                        {ollamaStatus.connected ? (
                          <>
                            <strong>✅ Ollama is Online!</strong> Installed models: {ollamaStatus.models.join(', ')}
                          </>
                        ) : (
                          <>
                            <strong>⚠️ Ollama Not Detected Locally:</strong>
                            <br />
                            Run <code>ollama serve</code> or <code>ollama run {tempAi.model}</code> in your terminal to start Ollama.
                            <br />
                            <em>Note: The Built-in Dynamic AI Engine will seamlessly analyze your custom Bug Objectives while Ollama is offline.</em>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: TRIAGE RUBRIC */}
          {activeTab === 'rubric' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Fine-tune the Triage Rubric Skill criteria, SLA deadlines, and escalation triggers.
              </div>

              {/* SLA Deadlines */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">P0 (Blocker) SLA Max Hours</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="24"
                    value={tempRubric.p0Criteria.slaHours}
                    onChange={(e) => setTempRubric({
                      ...tempRubric,
                      p0Criteria: { ...tempRubric.p0Criteria, slaHours: parseInt(e.target.value, 10) || 1 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">P1 (Critical) SLA Max Hours</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="48"
                    value={tempRubric.p1Criteria.slaHours}
                    onChange={(e) => setTempRubric({
                      ...tempRubric,
                      p1Criteria: { ...tempRubric.p1Criteria, slaHours: parseInt(e.target.value, 10) || 4 }
                    })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">P2 (Major) SLA Max Hours</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="96"
                    value={tempRubric.p2Criteria.slaHours}
                    onChange={(e) => setTempRubric({
                      ...tempRubric,
                      p2Criteria: { ...tempRubric.p2Criteria, slaHours: parseInt(e.target.value, 10) || 24 }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">P3 (Minor) SLA Max Hours</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="168"
                    value={tempRubric.p3Criteria.slaHours}
                    onChange={(e) => setTempRubric({
                      ...tempRubric,
                      p3Criteria: { ...tempRubric.p3Criteria, slaHours: parseInt(e.target.value, 10) || 72 }
                    })}
                  />
                </div>
              </div>

              {/* P0 Escalation Keywords */}
              <div className="form-group">
                <label className="form-label">P0 Escalation Keywords (comma-separated)</label>
                <input 
                  type="text" 
                  value={tempRubric.p0Criteria.escalationKeywords.join(', ')}
                  onChange={(e) => setTempRubric({
                    ...tempRubric,
                    p0Criteria: {
                      ...tempRubric.p0Criteria,
                      escalationKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {savedSuccess ? (
              <>
                <Check size={16} />
                <span>Configuration Saved!</span>
              </>
            ) : (
              <span>Save & Apply Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  GitPullRequest, 
  Sliders, 
  Check, 
  FileCode,
  ShieldAlert
} from 'lucide-react';

export function ConfigModal({
  isOpen,
  onClose,
  mcpConfig,
  setMcpConfig,
  rubricConfig,
  setRubricConfig
}) {
  const [activeTab, setActiveTab] = useState('mcp');
  const [tempMcp, setTempMcp] = useState({ ...mcpConfig });
  const [tempRubric, setTempRubric] = useState({ ...rubricConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setMcpConfig(tempMcp);
    setRubricConfig(tempRubric);
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Agent & MCP Tool Configuration</h3>
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
            className={`tab-btn ${activeTab === 'rubric' ? 'active' : ''}`}
            onClick={() => setActiveTab('rubric')}
          >
            <ShieldAlert size={14} />
            <span>Triage Rubric Rules</span>
          </button>
        </div>

        <div className="modal-body">
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

              {/* Log Reader Rules */}
              <div className="form-group">
                <label className="form-label">Log-Reading Application Code Prefix Filter</label>
                <input 
                  type="text" 
                  defaultValue="com.company"
                  placeholder="e.g. com.company, @org/, src/app/"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  Isolates your business logic stack trace frames from 3rd-party framework frames (Spring, Node internals, etc).
                </span>
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

import React from 'react';
import { ShieldAlert, Settings, Sparkles, CheckCircle2, GitPullRequest, Database } from 'lucide-react';

export function Navbar({ onOpenConfig, mcpConfig, isAnalyzing }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon-wrapper">
          <ShieldAlert size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className="brand-title">SentinX</h1>
            <span className="brand-badge">Agentic Triage</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Autonomous Bug Triage • Root Cause Diagnosis • Next Steps
          </p>
        </div>
      </div>

      <div className="status-pills-group">
        <div className="status-pill" title="Jira MCP Connected">
          <Database size={13} style={{ color: '#818cf8' }} />
          <span>Jira MCP:</span>
          <span style={{ color: '#c7d2fe', fontWeight: 600 }}>
            {mcpConfig.jiraEnabled ? (mcpConfig.jiraHost ? 'Live' : 'Mock DB') : 'Offline'}
          </span>
          <span className="status-dot active-mcp"></span>
        </div>

        <div className="status-pill" title="GitHub MCP Connected">
          <GitPullRequest size={13} style={{ color: '#818cf8' }} />
          <span>GitHub MCP:</span>
          <span style={{ color: '#c7d2fe', fontWeight: 600 }}>
            {mcpConfig.githubEnabled ? (mcpConfig.githubRepo ? 'Linked' : 'Mock Repo') : 'Offline'}
          </span>
          <span className="status-dot active-mcp"></span>
        </div>

        <div className="status-pill" title="Log Reader & Rubric Skills Enabled">
          <Sparkles size={13} style={{ color: '#10b981' }} />
          <span>Skills:</span>
          <span style={{ color: '#6ee7b7', fontWeight: 600 }}>Rubric + Log Guide</span>
          <span className="status-dot"></span>
        </div>
      </div>

      <div className="header-actions">
        <button 
          id="btn-open-config"
          className="btn-secondary"
          onClick={onOpenConfig}
          title="Configure Rubric, MCP Credentials & Thresholds"
        >
          <Settings size={15} />
          <span>Configuration</span>
        </button>
      </div>
    </header>
  );
}

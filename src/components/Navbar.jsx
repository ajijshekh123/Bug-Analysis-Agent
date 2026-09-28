import React from 'react';
import { ShieldAlert, Settings, BookOpen, GitPullRequest, Database, Sun, Moon } from 'lucide-react';

export function Navbar({ onOpenConfig, onOpenMcpGuide, mcpConfig, theme, onToggleTheme, isAnalyzing }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon-wrapper">
          <ShieldAlert size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className="brand-title">SentinX</h1>
            <span className="brand-badge">Bug Analysis Agent</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Objective-Driven Triage • Jira MCP Auto-Creation • Root Cause & Fix
          </p>
        </div>
      </div>

      <div className="status-pills-group">
        <div className="status-pill" title="Jira MCP Status">
          <Database size={13} style={{ color: '#818cf8' }} />
          <span>Jira MCP:</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            {mcpConfig.jiraEnabled ? (mcpConfig.jiraHost ? 'Live' : 'Connected') : 'Off'}
          </span>
          <span className="status-dot active-mcp"></span>
        </div>

        <div className="status-pill" title="GitHub MCP Status">
          <GitPullRequest size={13} style={{ color: '#818cf8' }} />
          <span>GitHub MCP:</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            {mcpConfig.githubEnabled ? (mcpConfig.githubRepo ? 'Linked' : 'Connected') : 'Off'}
          </span>
          <span className="status-dot active-mcp"></span>
        </div>
      </div>

      <div className="header-actions">
        {/* Theme Toggle (Light / Dark) */}
        <button
          id="btn-toggle-theme"
          className="btn-secondary"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ padding: '0.45rem 0.75rem' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '0.8rem' }}>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '0.8rem' }}>Dark Mode</span>
            </>
          )}
        </button>

        <button 
          id="btn-open-mcp-guide"
          className="btn-secondary"
          style={{ background: 'rgba(99, 102, 241, 0.12)', borderColor: 'rgba(99, 102, 241, 0.35)' }}
          onClick={onOpenMcpGuide}
          title="Learn how to connect Jira & GitHub MCP Tools"
        >
          <BookOpen size={15} style={{ color: '#818cf8' }} />
          <span>MCP Setup Guide</span>
        </button>

        <button 
          id="btn-open-config"
          className="btn-secondary"
          onClick={onOpenConfig}
          title="Configure API Tokens & Settings"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}

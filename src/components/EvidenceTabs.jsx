import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Database, 
  Terminal, 
  FileCode, 
  Clock, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Filter
} from 'lucide-react';

export function EvidenceTabs({ analysis }) {
  const [activeTab, setActiveTab] = useState('github');
  const [logFilter, setLogFilter] = useState('ALL');

  if (!analysis) return null;

  const { githubEvidence, logAnalysis, duplicateCandidates } = analysis;

  const filteredLogLines = (logAnalysis?.lines || []).filter(line => {
    if (logFilter === 'ALL') return true;
    if (logFilter === 'ERROR') return line.level === 'ERROR' || line.level === 'FATAL';
    if (logFilter === 'WARN') return line.level === 'WARN';
    return true;
  });

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          <GitPullRequest size={15} />
          <span>GitHub MCP Evidence ({githubEvidence?.commits?.length || 0} commits)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'jira' ? 'active' : ''}`}
          onClick={() => setActiveTab('jira')}
        >
          <Database size={15} />
          <span>Jira MCP Database ({duplicateCandidates?.length || 0} matches)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Terminal size={15} />
          <span>Log-Reading Skill Insights ({logAnalysis?.errorCount || 0} errors)</span>
        </button>
      </div>

      <div className="tab-content">
        {/* GITHUB EVIDENCE TAB */}
        {activeTab === 'github' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Searched repository: <strong style={{ color: '#818cf8' }}>{githubEvidence?.searchedRepo}</strong> (branch: <code>{githubEvidence?.branch}</code>)
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Sorted by most recent deployment
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {githubEvidence?.commits?.map((commit) => (
                <div 
                  key={commit.sha}
                  style={{
                    background: commit.isSuspectCulprit ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.25)',
                    border: commit.isSuspectCulprit ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                        {commit.sha}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f3f4f6' }}>
                        {commit.message}
                      </span>
                      {commit.isSuspectCulprit && (
                        <span style={{ fontSize: '0.68rem', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                          HIGH PROBABILITY REGRESSION
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {new Date(commit.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                    Author: {commit.author} • PR #{commit.prNumber}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {commit.filesChanged.map((file, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px', color: '#93c5fd' }}>
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JIRA MCP TAB */}
        {activeTab === 'jira' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Connected Jira Project: <strong style={{ color: '#60a5fa' }}>CORE-INCIDENTS</strong> • Historical Knowledge Base
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {duplicateCandidates?.map((ticket) => (
                <div 
                  key={ticket.key}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.82rem' }}>
                        {ticket.key}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f3f4f6' }}>
                        {ticket.summary}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
                      {ticket.resolution || ticket.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                    {ticket.description}
                  </p>

                  {ticket.rootCause && (
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <strong style={{ color: '#f59e0b' }}>Recorded Root Cause:</strong> {ticket.rootCause}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOG READING GUIDE TAB */}
        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Insights pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {logAnalysis?.insights?.map((insight, i) => (
                <div key={i} style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#c7d2fe', padding: '3px 8px', borderRadius: '6px' }}>
                  {insight}
                </div>
              ))}
            </div>

            {/* Log filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={13} style={{ color: 'var(--text-dim)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filter Level:</span>
                {['ALL', 'ERROR', 'WARN'].map((lvl) => (
                  <button
                    key={lvl}
                    className={`scenario-chip ${logFilter === lvl ? 'active' : ''}`}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                    onClick={() => setLogFilter(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Showing {filteredLogLines.length} lines
              </span>
            </div>

            {/* Filtered Log Viewer */}
            <div style={{ 
              background: '#07090e', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              maxHeight: '260px', 
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '0.5rem 0'
            }}>
              {filteredLogLines.map((l) => {
                let color = '#9ca3af';
                if (l.level === 'ERROR' || l.level === 'FATAL') color = '#f87171';
                else if (l.level === 'WARN') color = '#fbbf24';
                else if (l.level === 'DEBUG') color = '#6b7280';

                return (
                  <div 
                    key={l.lineNo}
                    style={{ 
                      padding: '0.15rem 0.85rem', 
                      display: 'flex', 
                      gap: '0.75rem',
                      background: l.level === 'ERROR' ? 'rgba(239, 68, 68, 0.05)' : undefined 
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)', minWidth: '24px', userSelect: 'none' }}>{l.lineNo}</span>
                    <span style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{l.content}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

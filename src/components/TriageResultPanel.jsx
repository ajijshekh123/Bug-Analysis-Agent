import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  GitCommit, 
  Copy, 
  Check, 
  Link2, 
  Code2, 
  Terminal, 
  Flame,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export function TriageResultPanel({
  analysis,
  onLinkDuplicate,
  linkedBugs = {}
}) {
  const [copiedId, setCopiedId] = useState(null);

  if (!analysis) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '380px' }}>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            borderRadius: '50%', 
            background: 'rgba(99, 102, 241, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(99, 102, 241, 0.25)' 
          }}>
            <Sparkles size={26} style={{ color: '#818cf8' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Agent Standing By</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Provide a bug report and application logs on the left, then click <strong>Run Autonomous Bug Analysis</strong>.
            The agent will apply the Triage Rubric, parse the logs, query GitHub & Jira, and identify the root cause.
          </p>
        </div>
      </div>
    );
  }

  const { triageEvaluation, likelyRootCause, nextSteps, duplicateCandidates, githubEvidence } = analysis;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. SEVERITY & TRIAGE RUBRIC CARD */}
      <div className={`glass-panel triage-highlight-card ${triageEvaluation.badgeColor}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className={`severity-badge ${triageEvaluation.badgeColor}`}>
                <ShieldAlert size={14} />
                {triageEvaluation.severityLabel}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Evaluated by <strong>Triage Rubric Skill</strong>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 500 }}>
              Priority: <strong style={{ color: '#fff' }}>{triageEvaluation.priority}</strong>
            </p>
          </div>

          <div className="meta-box" style={{ minWidth: '150px' }}>
            <div className="meta-box-label">SLA Target Resolution</div>
            <div className="meta-box-val" style={{ color: triageEvaluation.severity === 'P0' ? '#ef4444' : '#f59e0b' }}>
              <Clock size={16} />
              <span>&lt; {triageEvaluation.slaHours} {triageEvaluation.slaHours === 1 ? 'Hour' : 'Hours'}</span>
            </div>
          </div>
        </div>

        {/* Meta Stats Grid */}
        <div className="triage-meta-grid">
          <div className="meta-box">
            <div className="meta-box-label">Confidence</div>
            <div className="meta-box-val">{triageEvaluation.confidenceScore}%</div>
          </div>
          <div className="meta-box">
            <div className="meta-box-label">Blast Radius</div>
            <div className="meta-box-val">{triageEvaluation.rubricBreakdown.blastRadius}</div>
          </div>
          <div className="meta-box">
            <div className="meta-box-label">Financial Risk</div>
            <div className="meta-box-val" style={{ color: triageEvaluation.rubricBreakdown.revenueImpact ? '#ef4444' : '#10b981' }}>
              {triageEvaluation.rubricBreakdown.revenueImpact ? 'Critical' : 'Nominal'}
            </div>
          </div>
          <div className="meta-box">
            <div className="meta-box-label">Workaround</div>
            <div className="meta-box-val" style={{ color: triageEvaluation.rubricBreakdown.workaroundAvailable ? '#10b981' : '#ef4444' }}>
              {triageEvaluation.rubricBreakdown.workaroundAvailable ? 'Available' : 'None'}
            </div>
          </div>
        </div>

        {/* Rubric Breakdown List */}
        {triageEvaluation.rubricBreakdown.matchedFactors.length > 0 && (
          <div style={{ marginTop: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Rubric Decision Signals
            </div>
            <div className="rubric-factors-list">
              {triageEvaluation.rubricBreakdown.matchedFactors.map((factor, idx) => (
                <div key={idx} className="rubric-factor-item active">
                  <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. LIKELY ROOT CAUSE CARD */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <Flame size={18} style={{ color: '#ef4444' }} />
            <h3 className="panel-title">Likely Root Cause Diagnosis</h3>
          </div>
          {likelyRootCause.suspectFile && (
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#818cf8', background: 'rgba(99, 102, 241, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
              {likelyRootCause.suspectFile}:{likelyRootCause.suspectLine}
            </span>
          )}
        </div>

        <div className="panel-body">
          <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f9fafb' }}>
            {likelyRootCause.summary}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {likelyRootCause.technicalDetails}
          </p>

          {/* Culprit commit alert if matched by GitHub MCP */}
          {likelyRootCause.suspectCommit && (
            <div className="culprit-commit-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitCommit size={16} style={{ color: '#818cf8' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#e0e7ff' }}>
                    Culprit Commit: {likelyRootCause.suspectCommit.sha} (PR #{likelyRootCause.suspectCommit.prNumber})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    by {likelyRootCause.suspectCommit.author} • {likelyRootCause.suspectCommit.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Diff Snippet */}
          {likelyRootCause.diffSnippet && (
            <div className="diff-container">
              <div className="diff-header">
                <span>Suspect Regression Diff ({likelyRootCause.suspectFile || 'code'})</span>
                <span>GitHub MCP blame match</span>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                {likelyRootCause.diffSnippet.split('\n').map((line, idx) => {
                  let lineClass = "diff-line";
                  if (line.startsWith('+') && !line.startsWith('+++')) lineClass += " add";
                  else if (line.startsWith('-') && !line.startsWith('---')) lineClass += " del";
                  else if (line.startsWith('@@') || line.startsWith('diff')) lineClass += " meta";
                  return (
                    <div key={idx} className={lineClass}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. STRETCH GOAL: DUPLICATE BUGS & LINKING */}
      {duplicateCandidates && duplicateCandidates.length > 0 && (
        <div className="duplicates-banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link2 size={18} style={{ color: '#f59e0b' }} />
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fef3c7' }}>
                  Stretch Goal: Duplicate Bug Candidates Detected in Jira
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Evaluated similarity across historical Jira tickets for related resolutions
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '3px 9px', borderRadius: '12px', fontWeight: 600 }}>
              {duplicateCandidates.length} Found
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {duplicateCandidates.map((dup) => {
              const isLinked = linkedBugs[dup.key];
              return (
                <div key={dup.key} className="duplicate-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.85rem' }}>
                        {dup.key}
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>
                        {dup.status}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#f3f4f6' }}>
                        {dup.summary}
                      </span>
                    </div>

                    <button
                      className={isLinked ? "btn-secondary" : "btn-primary"}
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        fontSize: '0.75rem', 
                        background: isLinked ? 'rgba(16, 185, 129, 0.2)' : undefined,
                        borderColor: isLinked ? '#10b981' : undefined,
                        color: isLinked ? '#6ee7b7' : undefined 
                      }}
                      onClick={() => onLinkDuplicate(dup.key)}
                      disabled={isLinked}
                    >
                      {isLinked ? (
                        <>
                          <Check size={13} />
                          <span>Linked in Jira</span>
                        </>
                      ) : (
                        <>
                          <Link2 size={13} />
                          <span>Link as Duplicate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Similarity meter */}
                  <div className="similarity-bar-wrapper">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '85px' }}>
                      Similarity: <strong style={{ color: dup.similarityScore > 75 ? '#ef4444' : '#f59e0b' }}>{dup.similarityScore}%</strong>
                    </span>
                    <div className="similarity-bar">
                      <div className="similarity-bar-fill" style={{ width: `${dup.similarityScore}%` }} />
                    </div>
                  </div>

                  {dup.solution && (
                    <div style={{ fontSize: '0.75rem', color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.08)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <strong>Known Resolution:</strong> {dup.solution}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ACTIONABLE NEXT STEPS CARD */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <CheckCircle size={18} style={{ color: '#10b981' }} />
            <h3 className="panel-title">Actionable Next Steps & Remediation</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Sequential Playbook
          </span>
        </div>

        <div className="panel-body">
          <div className="next-steps-list">
            {nextSteps.map((step, idx) => (
              <div key={step.id} className="step-card">
                <div className="step-header">
                  <div className="step-title">
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: 'rgba(99, 102, 241, 0.2)', 
                      color: '#a5b4fc', 
                      fontSize: '0.72rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <span className="step-category-pill">{step.category}</span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.75rem' }}>
                  {step.detail}
                </p>

                {step.command && (
                  <div style={{ paddingLeft: '1.75rem' }}>
                    <div className="step-command-box">
                      <code>{step.command}</code>
                      <button
                        className="btn-icon-copy"
                        onClick={() => handleCopy(step.command, step.id)}
                        title="Copy command to clipboard"
                      >
                        {copiedId === step.id ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

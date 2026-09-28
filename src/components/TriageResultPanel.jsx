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
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square,
  HelpCircle,
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';

export function TriageResultPanel({
  analysis,
  onLinkDuplicate,
  linkedBugs = {}
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [showTechnicalDiff, setShowTechnicalDiff] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!analysis) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '420px' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <div style={{ 
            width: '58px', 
            height: '58px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(99, 102, 241, 0.3)' 
          }}>
            <Sparkles size={28} style={{ color: '#a5b4fc' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f3f4f6' }}>
            Ready to Triage
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Enter your bug report and logs on the left (or pick an example above), then click 
            <strong style={{ color: '#c7d2fe' }}> "Analyze Bug & Get Solution"</strong>.
          </p>
        </div>
      </div>
    );
  }

  const { triageEvaluation, likelyRootCause, nextSteps, duplicateCandidates } = analysis;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStepDone = (id) => {
    setCompletedSteps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Friendly severity badge labels
  const severityDisplayMap = {
    P0: { label: "Critical Outage (P0)", color: "p0", icon: "🚨", time: "Fix within 1 hour", desc: "Core functionality is completely blocked. Immediate action needed!" },
    P1: { label: "High Priority (P1)", color: "p1", icon: "⚠️", time: "Fix within 4 hours", desc: "Major feature broken for a large group of users." },
    P2: { label: "Medium Priority (P2)", color: "p2", icon: "⚡", time: "Fix within 24 hours", desc: "System performance is degraded or a secondary feature is failing." },
    P3: { label: "Low Priority (P3)", color: "p3", icon: "🎨", time: "Fix within 72 hours", desc: "Minor visual glitch or cosmetic issue with no data loss." }
  };

  const sevInfo = severityDisplayMap[triageEvaluation.severity] || severityDisplayMap.P2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. SEVERITY & IMPACT CARD (EASY FOR NORMAL USERS) */}
      <div className={`glass-panel triage-highlight-card ${sevInfo.color}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className={`severity-badge ${sevInfo.color}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.95rem' }}>
                <span style={{ fontSize: '1rem' }}>{sevInfo.icon}</span>
                <span>{sevInfo.label}</span>
              </span>
              <span style={{ fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 600 }}>
                {triageEvaluation.confidenceScore}% Confidence
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#e5e7eb', marginTop: '0.3rem' }}>
              {sevInfo.desc}
            </p>
          </div>

          <div className="meta-box" style={{ minWidth: '160px', background: 'rgba(0,0,0,0.5)' }}>
            <div className="meta-box-label">Target Resolution Time</div>
            <div className="meta-box-val" style={{ color: triageEvaluation.severity === 'P0' ? '#ef4444' : '#f59e0b', fontSize: '1.05rem' }}>
              <Clock size={17} />
              <span>{sevInfo.time}</span>
            </div>
          </div>
        </div>

        {/* Plain English Summary Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.75rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Scope: </span>
            <strong style={{ color: '#fff' }}>{triageEvaluation.rubricBreakdown.blastRadius}</strong>
          </div>

          <div style={{ fontSize: '0.78rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.75rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Revenue / Financial Risk: </span>
            <strong style={{ color: triageEvaluation.rubricBreakdown.revenueImpact ? '#ef4444' : '#10b981' }}>
              {triageEvaluation.rubricBreakdown.revenueImpact ? 'Yes (Loss Detected)' : 'No'}
            </strong>
          </div>

          <div style={{ fontSize: '0.78rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.75rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Workaround: </span>
            <strong style={{ color: triageEvaluation.rubricBreakdown.workaroundAvailable ? '#10b981' : '#ef4444' }}>
              {triageEvaluation.rubricBreakdown.workaroundAvailable ? 'Temporary fix available' : 'None available'}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. LIKELY ROOT CAUSE (PLAIN ENGLISH + OPTIONAL TECH DETAILS) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              2
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                Likely Root Cause (Why Did This Happen?)
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Identified by correlating server logs with recent code deployments
              </p>
            </div>
          </div>
        </div>

        <div className="panel-body">
          {/* Friendly Summary Box */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem' 
          }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#e0e7ff', marginBottom: '0.35rem' }}>
              {likelyRootCause.summary}
            </div>
            <p style={{ fontSize: '0.86rem', color: '#c7d2fe', lineHeight: 1.6 }}>
              {likelyRootCause.technicalDetails}
            </p>
          </div>

          {/* Culprit Commit Badge */}
          {likelyRootCause.suspectCommit && (
            <div className="culprit-commit-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitCommit size={16} style={{ color: '#818cf8' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#e0e7ff', fontSize: '0.82rem' }}>
                    Triggered by recent change: Commit <code>{likelyRootCause.suspectCommit.sha}</code> (PR #{likelyRootCause.suspectCommit.prNumber})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Author: {likelyRootCause.suspectCommit.author}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle for Technical Code Diff */}
          {likelyRootCause.diffSnippet && (
            <div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => setShowTechnicalDiff(!showTechnicalDiff)}
              >
                <span>{showTechnicalDiff ? 'Hide Code Diff' : '🔍 View Problematic Code Line & Diff'}</span>
                {showTechnicalDiff ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showTechnicalDiff && (
                <div className="diff-container" style={{ marginTop: '0.75rem' }}>
                  <div className="diff-header">
                    <span>File: {likelyRootCause.suspectFile || 'code'}</span>
                    <span>Highlighted Code Change</span>
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
          )}
        </div>
      </div>

      {/* 3. SIMILAR / DUPLICATE BUG FOUND (STRETCH GOAL) */}
      {duplicateCandidates && duplicateCandidates.length > 0 && (
        <div className="duplicates-banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link2 size={18} style={{ color: '#f59e0b' }} />
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fef3c7' }}>
                  🤝 Similar Past Bug Found in Jira!
                </h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  A similar issue was solved before. You can link it or reuse the solution!
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {duplicateCandidates[0].similarityScore}% Match
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {duplicateCandidates.slice(0, 2).map((dup) => {
              const isLinked = linkedBugs[dup.key];
              return (
                <div key={dup.key} className="duplicate-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.85rem' }}>
                        {dup.key}
                      </span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', color: '#f3f4f6' }}>
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
                          <span>Linked in Jira ✅</span>
                        </>
                      ) : (
                        <>
                          <Link2 size={13} />
                          <span>Link as Duplicate</span>
                        </>
                      )}
                    </button>
                  </div>

                  {dup.solution && (
                    <div style={{ fontSize: '0.78rem', color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.08)', padding: '0.45rem 0.65rem', borderRadius: '4px' }}>
                      <strong>Previous Fix Used:</strong> {dup.solution}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. RECOMMENDED NEXT STEPS (ACTIONABLE CHECKLIST) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              3
            </div>
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                Next Steps (Action Plan to Fix)
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Follow this sequential checklist to mitigate and permanently resolve the bug
              </p>
            </div>
          </div>
        </div>

        <div className="panel-body">
          <div className="next-steps-list">
            {nextSteps.map((step, idx) => {
              const isDone = Boolean(completedSteps[step.id]);
              return (
                <div 
                  key={step.id} 
                  className="step-card"
                  style={{ 
                    opacity: isDone ? 0.65 : 1,
                    borderLeft: isDone ? '3px solid #10b981' : '3px solid #6366f1'
                  }}
                >
                  <div className="step-header">
                    <div 
                      className="step-title" 
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                      onClick={() => toggleStepDone(step.id)}
                    >
                      {isDone ? (
                        <CheckSquare size={18} style={{ color: '#10b981' }} />
                      ) : (
                        <Square size={18} style={{ color: 'var(--text-dim)' }} />
                      )}
                      <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                        {step.title}
                      </span>
                    </div>
                    <span className="step-category-pill">{step.category}</span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.75rem' }}>
                    {step.detail}
                  </p>

                  {step.command && (
                    <div style={{ paddingLeft: '1.75rem' }}>
                      <div className="step-command-box">
                        <code style={{ fontSize: '0.78rem' }}>{step.command}</code>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

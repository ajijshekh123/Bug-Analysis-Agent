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
  Sparkles, 
  Flame, 
  Layers, 
  Terminal, 
  ExternalLink, 
  Cpu,
  Wrench,
  Eye
} from 'lucide-react';

export function TriageResultPanel({
  analysis,
  onLinkDuplicate,
  linkedBugs = {}
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [showTechnicalDiff, setShowTechnicalDiff] = useState(false);

  if (!analysis) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '440px' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px' }}>
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Analysis Engine Ready
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Add your Bug Objective on the left, generate full details, and click 
            <strong style={{ color: 'var(--accent-primary)' }}> "Analyze Bug"</strong>. 
            The agent will analyze error logs, detect root causes, list impacted modules, evaluate outage level, and prepare an action plan.
          </p>
        </div>
      </div>
    );
  }

  const { 
    triageEvaluation = {}, 
    likelyRootCause = {}, 
    nextSteps = [], 
    impactedModules = [], 
    criticalOutageLevel = "CRITICAL OUTAGE EVALUATED", 
    logAnalysis = {}, 
    duplicateCandidates = [] 
  } = analysis || {};

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

  const isCritical = triageEvaluation.severity === "P0";
  const isHigh = triageEvaluation.severity === "P1";
  const isMedium = triageEvaluation.severity === "P2";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. CRITICAL OUTAGE & SEVERITY ASSESSMENT (Feature 4 & 5) */}
      <div className={`glass-panel triage-highlight-card ${triageEvaluation.badgeColor}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className={`severity-badge ${triageEvaluation.badgeColor}`}>
                <ShieldAlert size={15} />
                <span>{triageEvaluation.severityLabel}</span>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Priority: {triageEvaluation.priority}
              </span>
            </div>
            
            {/* Outage Level Banner */}
            <div style={{ 
              fontWeight: 700, 
              fontSize: '0.98rem', 
              color: isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#3b82f6',
              marginTop: '0.25rem'
            }}>
              {criticalOutageLevel}
            </div>
          </div>

          <div className="meta-box" style={{ minWidth: '160px' }}>
            <div className="meta-box-label">Target Resolution SLA</div>
            <div className="meta-box-val" style={{ color: isCritical ? '#ef4444' : '#f59e0b', fontSize: '1.05rem' }}>
              <Clock size={16} />
              <span>&lt; {triageEvaluation.slaHours} {triageEvaluation.slaHours === 1 ? 'Hour' : 'Hours'}</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Factors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
          <div style={{ fontSize: '0.76rem', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.65rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Confidence: </span>
            <strong style={{ color: 'var(--text-main)' }}>{triageEvaluation.confidenceScore}%</strong>
          </div>
          <div style={{ fontSize: '0.76rem', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.65rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Blast Radius: </span>
            <strong style={{ color: 'var(--text-main)' }}>{triageEvaluation.rubricBreakdown.blastRadius}</strong>
          </div>
          <div style={{ fontSize: '0.76rem', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.65rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Revenue Risk: </span>
            <strong style={{ color: triageEvaluation.rubricBreakdown.revenueImpact ? '#ef4444' : '#10b981' }}>
              {triageEvaluation.rubricBreakdown.revenueImpact ? 'Critical Financial Loss' : 'Nominal'}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. ROOT CAUSE OF BUG & CULPRIT CODE (Feature 4) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <Flame size={18} style={{ color: '#ef4444' }} />
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                Root Cause of Bug
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Identified through stack trace diagnosis & GitHub commit blame
              </p>
            </div>
          </div>
          {likelyRootCause.suspectFile && (
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
              {likelyRootCause.suspectFile}:{likelyRootCause.suspectLine}
            </span>
          )}
        </div>

        <div className="panel-body">
          {/* Summary */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem' 
          }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              {likelyRootCause.summary}
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {likelyRootCause.technicalDetails}
            </p>
          </div>

          {/* Culprit commit alert if matched by GitHub MCP */}
          {likelyRootCause.suspectCommit && (
            <div className="culprit-commit-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitCommit size={16} style={{ color: '#818cf8' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.82rem' }}>
                    Regression Commit: <code>{likelyRootCause.suspectCommit.sha}</code> (PR #{likelyRootCause.suspectCommit.prNumber})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Author: {likelyRootCause.suspectCommit.author} • {likelyRootCause.suspectCommit.message}
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

          {/* Recommended Fix Plan & Code Solution */}
          {(likelyRootCause.recommendedFix || likelyRootCause.solutionCode) && (
            <div style={{ 
              marginTop: '0.85rem', 
              background: 'rgba(16, 185, 129, 0.08)', 
              border: '1px solid rgba(16, 185, 129, 0.28)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.9rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34d399', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Wrench size={16} />
                  <span>Recommended Fix Plan</span>
                </div>
                <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  Targeted Solution
                </span>
              </div>

              {likelyRootCause.recommendedFix && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  {likelyRootCause.recommendedFix}
                </p>
              )}

              {likelyRootCause.solutionCode && (
                <div className="step-command-box" style={{ margin: 0 }}>
                  <code style={{ fontSize: '0.78rem' }}>{likelyRootCause.solutionCode}</code>
                  <button
                    className="btn-icon-copy"
                    onClick={() => handleCopy(likelyRootCause.solutionCode, 'fix-code')}
                    title="Copy solution code"
                  >
                    {copiedId === 'fix-code' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Visual Bug Evidence Verified (from uploaded screenshot or video) */}
          {likelyRootCause.visualEvidence && (
            <div style={{ 
              marginTop: '0.85rem',
              background: 'rgba(99, 102, 241, 0.08)', 
              border: '1px solid rgba(99, 102, 241, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem',
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'center'
            }}>
              {likelyRootCause.visualEvidence.dataUrl && (
                <div style={{ width: '84px', height: '64px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {likelyRootCause.visualEvidence.type?.startsWith('video/') ? (
                    <video src={likelyRootCause.visualEvidence.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={likelyRootCause.visualEvidence.dataUrl} alt="Visual Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>
                    👁️ Visual Evidence Analyzed
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {likelyRootCause.visualEvidence.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {likelyRootCause.visualEvidence.summary}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. IMPACTED MODULES (Feature 4) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title-wrapper">
            <Layers size={18} style={{ color: '#818cf8' }} />
            <div>
              <h3 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                Impacted Modules & Subsystems
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Services and components affected by this failure
              </p>
            </div>
          </div>
        </div>

        <div className="panel-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(impactedModules || []).map((mod, i) => (
              <span key={i} className="module-tag">
                <Cpu size={12} />
                <span>{mod}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ERROR & LOGS SUMMARY (Feature 4) */}
      {logAnalysis?.primaryException && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-wrapper">
              <Terminal size={18} style={{ color: '#38bdf8' }} />
              <div>
                <h3 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
                  Error & Log Signals
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Isolated root exception and correlated tracing headers
                </p>
              </div>
            </div>
          </div>

          <div className="panel-body">
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.25rem' }}>
                {logAnalysis.primaryException.type}: {logAnalysis.primaryException.message}
              </div>
              {logAnalysis.extractedTraceIds.length > 0 && (
                <div style={{ color: '#93c5fd', fontSize: '0.74rem' }}>
                  Trace ID: {logAnalysis.extractedTraceIds.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. JIRA DUPLICATE BUG DETECTION (Feature 3) */}
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
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
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

    </div>
  );
}

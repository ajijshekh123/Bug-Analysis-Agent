import React, { useRef } from 'react';
import { 
  FileText, 
  Terminal, 
  Upload, 
  Play, 
  Trash2, 
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

export function BugInputPanel({
  report,
  setReport,
  logs,
  setLogs,
  onRunAnalysis,
  isAnalyzing
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setLogs(content);
      }
    };
    reader.readAsText(file);
  };

  const handleClearLogs = () => {
    setLogs('');
  };

  const lineCount = logs ? logs.split('\n').filter(Boolean).length : 0;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <FileText size={18} style={{ color: '#818cf8' }} />
          <h2 className="panel-title">Bug Ingestion & Log Stream</h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Inputs: Bug Report + Raw Logs
        </span>
      </div>

      <div className="panel-body">
        {/* Bug Report Form */}
        <div className="form-group">
          <label className="form-label" htmlFor="bug-title">
            <span>Bug Title / Summary <span className="req">*</span></span>
          </label>
          <input
            id="bug-title"
            type="text"
            value={report.title}
            onChange={(e) => setReport({ ...report, title: e.target.value })}
            placeholder="e.g. Checkout fails with HTTP 500 when processing Stripe payments"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label" htmlFor="bug-component">
              <span>Service / Component</span>
            </label>
            <input
              id="bug-component"
              type="text"
              value={report.component}
              onChange={(e) => setReport({ ...report, component: e.target.value })}
              placeholder="e.g. payment-gateway-service"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bug-env">
              <span>Environment</span>
            </label>
            <select
              id="bug-env"
              value={report.environment}
              onChange={(e) => setReport({ ...report, environment: e.target.value })}
            >
              <option value="Production (us-east-1)">Production (us-east-1)</option>
              <option value="Production (eu-central-1)">Production (eu-central-1)</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bug-desc">
            <span>Bug Report Description & Symptoms <span className="req">*</span></span>
          </label>
          <textarea
            id="bug-desc"
            rows={4}
            value={report.description}
            onChange={(e) => setReport({ ...report, description: e.target.value })}
            placeholder="Describe what happened, customer impact, error messages visible in UI, frequency, and any known workarounds..."
          />
        </div>

        {/* Logs Ingestion */}
        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={14} style={{ color: '#38bdf8' }} />
              <span>Application Logs & Stack Traces</span>
              {lineCount > 0 && (
                <span style={{ fontSize: '0.7rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '1px 6px', borderRadius: '8px' }}>
                  {lineCount} lines
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                onClick={() => fileInputRef.current?.click()}
                title="Upload .log or .txt file"
              >
                <Upload size={12} />
                <span>Upload Log</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".log,.txt,.json"
                onChange={handleFileUpload}
              />
              {logs && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#f87171' }}
                  onClick={handleClearLogs}
                  title="Clear log contents"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <textarea
            id="bug-logs"
            className="code-editor"
            style={{ flex: 1, minHeight: '190px' }}
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste application server logs, Spring/Node.js stack traces, database queries, or HTTP 5xx responses here..."
          />
        </div>

        {/* Run Action */}
        <button
          id="btn-run-triage"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
          onClick={onRunAnalysis}
          disabled={isAnalyzing || !report.title.trim()}
        >
          {isAnalyzing ? (
            <>
              <div className="status-dot pulsing" style={{ background: '#fff' }} />
              <span>Analyzing with Skills & MCP Tools...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="white" />
              <span>Run Autonomous Bug Analysis & Triage</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

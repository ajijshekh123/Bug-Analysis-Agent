import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Terminal, 
  Upload, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Play
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            1
          </div>
          <div>
            <h2 className="panel-title" style={{ fontSize: '1.02rem', fontWeight: 700 }}>
              Input: Bug Report & Logs
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Describe what went wrong and paste the error output
            </p>
          </div>
        </div>
      </div>

      <div className="panel-body">
        {/* 1. Problem Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="bug-title">
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>
              What is the problem? <span className="req">*</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>One sentence summary</span>
          </label>
          <input
            id="bug-title"
            type="text"
            value={report.title}
            onChange={(e) => setReport({ ...report, title: e.target.value })}
            placeholder="e.g. Checkout fails with Error 500 when paying with card"
            style={{ fontSize: '0.9rem', padding: '0.75rem 0.9rem' }}
          />
        </div>

        {/* 2. Plain English Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="bug-desc">
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>
              What happened? (Symptoms & Impact) <span className="req">*</span>
            </span>
          </label>
          <textarea
            id="bug-desc"
            rows={3}
            value={report.description}
            onChange={(e) => setReport({ ...report, description: e.target.value })}
            placeholder="Describe what users saw, what broke, and how urgent it is..."
          />
        </div>

        {/* Optional Advanced Metadata Toggle */}
        <div>
          <button
            type="button"
            className="btn-secondary"
            style={{ 
              padding: '0.35rem 0.75rem', 
              fontSize: '0.75rem', 
              width: '100%', 
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>⚙️ Optional Details (Service name & Environment)</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Service / App Name</label>
                  <input
                    type="text"
                    value={report.component}
                    onChange={(e) => setReport({ ...report, component: e.target.value })}
                    placeholder="e.g. payment-gateway-service"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Environment</label>
                  <select
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
            </div>
          )}
        </div>

        {/* 3. Error Logs Ingestion */}
        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={14} style={{ color: '#38bdf8' }} />
              <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Error Logs / Server Output</span>
              {lineCount > 0 && (
                <span style={{ fontSize: '0.7rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '1px 6px', borderRadius: '8px' }}>
                  {lineCount} lines detected
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                onClick={() => fileInputRef.current?.click()}
                title="Upload log file"
              >
                <Upload size={12} />
                <span>Upload File</span>
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
                  style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#f87171' }}
                  onClick={handleClearLogs}
                  title="Clear logs"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <textarea
            id="bug-logs"
            className="code-editor"
            style={{ flex: 1, minHeight: '170px' }}
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste your error logs or stack trace here (e.g. NullPointerException, 401 Unauthorized, Connection timeout)..."
          />
        </div>

        {/* Big Action Button */}
        <button
          id="btn-run-triage"
          className="btn-primary"
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            padding: '0.85rem', 
            fontSize: '0.96rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)'
          }}
          onClick={onRunAnalysis}
          disabled={isAnalyzing || !report.title.trim()}
        >
          {isAnalyzing ? (
            <>
              <div className="status-dot pulsing" style={{ background: '#fff' }} />
              <span>Analyzing Bug & Running Diagnostics...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analyze Bug & Get Solution</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

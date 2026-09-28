import React, { useRef, useState, useEffect } from 'react';
import { 
  FileText, 
  Terminal, 
  Upload, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Target, 
  Database, 
  ExternalLink, 
  CheckCircle, 
  PlusCircle, 
  Layers, 
  Clock, 
  ShieldAlert, 
  Bot,
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
  FileCheck,
  Eye,
  X
} from 'lucide-react';
import { generateBugFromObjective } from '../services/bugGenerator';
import { aiExtractBugFromMedia } from '../services/aiService';

export function BugInputPanel({
  report,
  setReport,
  logs,
  setLogs,
  onRunAnalysis,
  onRunAnalysisWith,
  onCreateNewBug,
  onClearJiraTicket,
  isAnalyzing,
  onCreateJiraBug,
  createdJiraTicket,
  isCreatingJira,
  aiConfig
}) {
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const [objectiveInput, setObjectiveInput] = useState(report.objective || report.title || "");
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [isExtractingMedia, setIsExtractingMedia] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [mediaNotification, setMediaNotification] = useState(null);

  // Keep input in sync with loaded scenario or external report changes
  useEffect(() => {
    if (report.objective !== undefined || report.title !== undefined) {
      setObjectiveInput(report.objective || report.title || "");
    }
  }, [report.objective, report.title]);

  const handleGenerateFromObjective = async () => {
    if (!objectiveInput.trim()) return;
    setIsGeneratingDetails(true);
    try {
      const generated = await generateBugFromObjective(objectiveInput, logs, aiConfig);
      const newLogs = generated.logs || logs;
      const updatedReport = {
        ...report,
        ...generated,
        isCustom: true
      };
      setReport(updatedReport);
      if (generated.logs) {
        setLogs(newLogs);
      }
      onClearJiraTicket?.();
      if (onRunAnalysisWith) {
        onRunAnalysisWith(updatedReport, newLogs);
      }
    } catch (err) {
      console.error("Failed to generate bug from objective:", err);
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const processMediaFile = (file) => {
    if (!file) return;
    const isVideo = file.type?.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name || '');
    setIsExtractingMedia(true);
    setMediaNotification(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      const previewUrl = URL.createObjectURL(file);
      
      const extracted = await aiExtractBugFromMedia(file, dataUrl, aiConfig);
      
      const updatedReport = {
        ...report,
        ...extracted,
        attachment: {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl,
          previewUrl,
          isVideo
        },
        isCustom: true
      };

      setReport(updatedReport);
      setObjectiveInput(extracted.objective || "");
      
      const newLogs = extracted.logs || `[${new Date().toISOString()}] ERROR [${extracted.moduleName || 'Client'}] UI exception rendered on client viewport\n${extracted.component || 'web'}.ClientException: Visual defect in ${file.name}`;
      setLogs(newLogs);
      
      onClearJiraTicket?.();
      setMediaNotification(`✨ Bug details extracted from ${isVideo ? 'Video' : 'Screenshot'}: "${file.name}"`);
      setIsExtractingMedia(false);

      if (onRunAnalysisWith) {
        onRunAnalysisWith(updatedReport, newLogs);
      }
    };
    reader.onerror = () => {
      setMediaNotification("❌ Failed to read media file.");
      setIsExtractingMedia(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processMediaFile(file);
    }
  };

  const handleMediaDrop = (e) => {
    e.preventDefault();
    setIsDraggingMedia(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      processMediaFile(file);
    }
  };

  const handleRemoveMedia = () => {
    setReport(prev => {
      const updated = { ...prev };
      delete updated.attachment;
      delete updated.visualEvidence;
      return updated;
    });
    setMediaNotification(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

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

  const lineCount = logs ? logs.split('\n').filter(Boolean).length : 0;
  const hasAttachment = Boolean(report.attachment);

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
              Bug Ingestion & Jira Auto-Creation
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Add a Bug Objective or Upload Screenshot/Video &rarr; Auto-Extract Details &rarr; Push to Jira
            </p>
          </div>
        </div>

        {onCreateNewBug && (
          <button
            type="button"
            className="btn-secondary"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor: 'rgba(16, 185, 129, 0.45)',
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.12)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={onCreateNewBug}
            title="Clear and create a brand new bug"
          >
            <PlusCircle size={14} />
            <span>➕ Create New Bug</span>
          </button>
        )}
      </div>

      <div className="panel-body">
        {/* 1. UPLOAD SCREENSHOT / VIDEO SECTION */}
        <div 
          className="objective-banner" 
          style={{ 
            background: isDraggingMedia ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
            border: isDraggingMedia ? '2px dashed var(--accent-primary)' : '1px solid var(--border-subtle)',
            transition: 'all 0.2s ease',
            padding: '0.85rem'
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingMedia(true); }}
          onDragLeave={() => setIsDraggingMedia(false)}
          onDrop={handleMediaDrop}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#a5b4fc' }}>
                <ImageIcon size={15} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/</span>
                <VideoIcon size={15} />
              </div>
              <label style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                Upload Bug Screenshot / Video
              </label>
            </div>
            
            {hasAttachment && (
              <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                {report.attachment.isVideo ? '🎥 Video Attached' : '📸 Screenshot Attached'}
              </span>
            )}
          </div>

          <input
            type="file"
            ref={mediaInputRef}
            style={{ display: 'none' }}
            accept="image/*,video/*,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mov"
            onChange={handleMediaChange}
          />

          {!hasAttachment ? (
            <div 
              style={{ 
                border: '1px dashed rgba(255,255,255,0.15)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.15)'
              }}
              onClick={() => mediaInputRef.current?.click()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <UploadCloud size={20} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Click or drag & drop Screenshot (.png, .jpg) or Video (.mp4, .webm)
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                AI automatically extracts visual error details, steps to reproduce, component & severity from your media!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Media Preview Container */}
              <div style={{ 
                position: 'relative', 
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden', 
                background: '#07090e', 
                border: '1px solid var(--border-subtle)',
                maxHeight: '190px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {report.attachment.isVideo ? (
                  <video 
                    src={report.attachment.dataUrl || report.attachment.previewUrl} 
                    controls 
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} 
                  />
                ) : (
                  <img 
                    src={report.attachment.dataUrl || report.attachment.previewUrl} 
                    alt={report.attachment.name} 
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} 
                  />
                )}
              </div>

              {/* Media Details Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck size={14} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {report.attachment.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    ({Math.round(report.attachment.size / 1024)} KB)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                    onClick={() => mediaInputRef.current?.click()}
                    title="Replace media"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#f87171' }}
                    onClick={handleRemoveMedia}
                    title="Remove media"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {isExtractingMedia && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
              <div className="status-dot pulsing" style={{ background: 'var(--accent-primary)' }} />
              <span>Analyzing visual content from media & synthesizing defect details...</span>
            </div>
          )}

          {mediaNotification && !isExtractingMedia && (
            <div style={{ marginTop: '0.45rem', fontSize: '0.76rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.08)', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {mediaNotification}
            </div>
          )}
        </div>

        {/* 2. BUG OBJECTIVE GENERATOR (Feature 2) */}
        <div className="objective-banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Target size={16} style={{ color: '#818cf8' }} />
              <label style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Bug Objective
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                🤖 {aiConfig?.provider === 'ollama' ? 'Ollama AI' : 'Dynamic AI'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="e.g. Customer payment fails with 500 error on guest checkout with Stripe 3DS"
              style={{ flex: 1, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromObjective()}
            />
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.6rem 0.95rem', whiteSpace: 'nowrap', fontSize: '0.82rem' }}
              onClick={handleGenerateFromObjective}
              disabled={isGeneratingDetails || !objectiveInput.trim()}
            >
              {isGeneratingDetails ? (
                <>
                  <div className="status-dot pulsing" style={{ background: '#fff' }} />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Create Bug Details</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. STRUCTURED BUG DETAILS (Features 1 & 2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Bug Title */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ fontWeight: 600 }}>Bug Title / Summary</span>
            </label>
            <input
              type="text"
              value={report.title || ""}
              onChange={(e) => setReport(prev => ({ ...prev, title: e.target.value, isCustom: true }))}
              placeholder="e.g. Payment Gateway 500 Error: NullPointerException in TaxCalculator"
            />
          </div>

          {/* Bug Description */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ fontWeight: 600 }}>Bug Description</span>
            </label>
            <textarea
              rows={3}
              value={report.description || ""}
              onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value, isCustom: true }))}
              placeholder="Full description of the bug..."
            />
          </div>

          {/* Meta Grid: Component, Module, Priority, Severity, Impacted Sprint */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Component</label>
              <input
                type="text"
                value={report.component || ""}
                onChange={(e) => setReport(prev => ({ ...prev, component: e.target.value, isCustom: true }))}
                placeholder="e.g. payment-gateway"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Module Name</label>
              <input
                type="text"
                value={report.moduleName || ""}
                onChange={(e) => setReport(prev => ({ ...prev, moduleName: e.target.value, isCustom: true }))}
                placeholder="e.g. TaxCalculationModule"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Impacted Sprint</label>
              <input
                type="text"
                value={report.impactedSprint || "Sprint 42 (Q3-Core)"}
                onChange={(e) => setReport(prev => ({ ...prev, impactedSprint: e.target.value, isCustom: true }))}
                placeholder="e.g. Sprint 42"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={report.priority || "High"}
                onChange={(e) => {
                  const val = e.target.value;
                  setReport(prev => ({ 
                    ...prev, 
                    priority: val, 
                    severity: val === 'Critical' ? 'P0 - Blocker' : val === 'High' ? 'P1 - High' : val === 'Medium' ? 'P2 - Medium' : 'P3 - Low',
                    isCustom: true 
                  }));
                }}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select
                value={report.severity || "P0 - Blocker"}
                onChange={(e) => {
                  const val = e.target.value;
                  setReport(prev => ({ 
                    ...prev, 
                    severity: val,
                    priority: val.includes('P0') ? 'Critical' : val.includes('P1') ? 'High' : val.includes('P2') ? 'Medium' : 'Low',
                    isCustom: true 
                  }));
                }}
              >
                <option value="P0 - Blocker">P0 - Blocker (Critical Outage)</option>
                <option value="P1 - High">P1 - High (Core Degraded)</option>
                <option value="P2 - Medium">P2 - Medium (Feature Impaired)</option>
                <option value="P3 - Low">P3 - Low (Cosmetic)</option>
              </select>
            </div>
          </div>

          {/* Pre-conditions & Steps to Reproduce */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                <span>Pre-conditions</span>
              </label>
              <textarea
                rows={3}
                value={Array.isArray(report.preconditions) ? report.preconditions.join('\n') : (report.preconditions || "")}
                onChange={(e) => setReport(prev => ({ ...prev, preconditions: e.target.value.split('\n'), isCustom: true }))}
                placeholder="• User is guest&#10;• Card is 3DS enabled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Steps to be Reproduced</span>
              </label>
              <textarea
                rows={3}
                value={Array.isArray(report.stepsToReproduce) ? report.stepsToReproduce.join('\n') : (report.stepsToReproduce || "")}
                onChange={(e) => setReport(prev => ({ ...prev, stepsToReproduce: e.target.value.split('\n'), isCustom: true }))}
                placeholder="1. Add item&#10;2. Click checkout&#10;3. Authorize card"
              />
            </div>
          </div>

          {/* Actual vs Expected Result */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Actual Result</label>
              <input
                type="text"
                value={report.actualResult || ""}
                onChange={(e) => setReport(prev => ({ ...prev, actualResult: e.target.value, isCustom: true }))}
                placeholder="e.g. HTTP 500 error modal and order marked unpaid"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Result</label>
              <input
                type="text"
                value={report.expectedResult || ""}
                onChange={(e) => setReport(prev => ({ ...prev, expectedResult: e.target.value, isCustom: true }))}
                placeholder="e.g. Payment completes and order confirmation is displayed"
              />
            </div>
          </div>
        </div>

        {/* 3. ERROR LOGS INGESTION (Feature 4) */}
        <div className="form-group" style={{ marginTop: '0.25rem' }}>
          <div className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={14} style={{ color: '#38bdf8' }} />
              <span style={{ fontWeight: 600 }}>Error Logs / Server Output</span>
              {lineCount > 0 && (
                <span style={{ fontSize: '0.7rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '1px 6px', borderRadius: '8px' }}>
                  {lineCount} lines
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
                  style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#f87171' }}
                  onClick={() => setLogs('')}
                  title="Clear logs"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <textarea
            className="code-editor"
            style={{ minHeight: '130px' }}
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste stack traces, exceptions, or error lines..."
          />
        </div>

        {/* 4. JIRA MCP AUTO-CREATION (Feature 3) */}
        <div className="jira-board-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} style={{ color: '#60a5fa' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  Jira Board Integration via MCP
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Automatically push this bug and create a Jira Issue ID
                </div>
              </div>
            </div>

            <button
              type="button"
              className={createdJiraTicket ? "btn-secondary" : "btn-primary"}
              style={{ 
                padding: '0.45rem 0.85rem', 
                fontSize: '0.8rem',
                background: createdJiraTicket ? 'rgba(16, 185, 129, 0.18)' : '#2563eb',
                borderColor: createdJiraTicket ? '#10b981' : '#3b82f6',
                color: createdJiraTicket ? '#10b981' : '#fff'
              }}
              onClick={onCreateJiraBug}
              disabled={isCreatingJira || createdJiraTicket}
            >
              {isCreatingJira ? (
                <>
                  <div className="status-dot pulsing" style={{ background: '#fff' }} />
                  <span>Creating in Jira...</span>
                </>
              ) : createdJiraTicket ? (
                <>
                  <CheckCircle size={14} />
                  <span>Created in Jira ({createdJiraTicket.key})</span>
                </>
              ) : (
                <>
                  <PlusCircle size={14} />
                  <span>Auto-Create Bug in Jira Board</span>
                </>
              )}
            </button>
          </div>

          {createdJiraTicket && (
            <div style={{ 
              background: 'rgba(0,0,0,0.25)', 
              borderRadius: '6px', 
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--border-subtle)',
              marginTop: '0.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ 
                  fontWeight: 800, 
                  color: '#38bdf8', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {createdJiraTicket.key}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Status: <strong style={{ color: '#10b981' }}>{createdJiraTicket.status}</strong> • Sprint: {createdJiraTicket.impactedSprint}
                </span>
              </div>

              <a 
                href={createdJiraTicket.boardUrl || "#"} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  fontSize: '0.75rem', 
                  color: '#818cf8', 
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <span>View on Jira Board</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* 5. PRIMARY ACTION: ANALYZE BUG (Feature 4) */}
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
          disabled={isAnalyzing || !report.title?.trim()}
        >
          {isAnalyzing ? (
            <>
              <div className="status-dot pulsing" style={{ background: '#fff' }} />
              <span>Analyzing Error Logs, Root Cause & Fix Plan...</span>
            </>
          ) : (
            <>
              <Play size={18} fill="white" />
              <span>Analyze Bug (Root Cause, Outage, Fix Plan)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

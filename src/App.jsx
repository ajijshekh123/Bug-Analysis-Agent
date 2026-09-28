import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BugInputPanel } from './components/BugInputPanel';
import { TriageResultPanel } from './components/TriageResultPanel';
import { EvidenceTabs } from './components/EvidenceTabs';
import { ConfigModal } from './components/ConfigModal';
import { McpIntegrationGuideModal } from './components/McpIntegrationGuideModal';
import { MOCK_SCENARIOS } from './data/mockScenarios';
import { DEFAULT_RUBRIC_CONFIG } from './skills/triageRubric';
import { runBugAnalysisAgent } from './services/agentEngine';
import { mcpLinkBugAsDuplicate } from './mcp/jiraMcp';
import { Sparkles, Zap } from 'lucide-react';

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(MOCK_SCENARIOS[0].id);
  const [report, setReport] = useState(MOCK_SCENARIOS[0].report);
  const [logs, setLogs] = useState(MOCK_SCENARIOS[0].logs);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMcpGuideOpen, setIsMcpGuideOpen] = useState(false);
  const [linkedBugs, setLinkedBugs] = useState({});

  const [mcpConfig, setMcpConfig] = useState({
    jiraEnabled: true,
    jiraHost: '',
    jiraProject: 'CORE',
    jiraEmail: '',
    jiraToken: '',
    githubEnabled: true,
    githubRepo: 'company/core-services',
    githubBranch: 'main',
    githubToken: ''
  });

  const [rubricConfig, setRubricConfig] = useState(DEFAULT_RUBRIC_CONFIG);

  // Automatically run initial analysis for a lively first view
  useEffect(() => {
    executeAnalysis(report, logs);
  }, []);

  const executeAnalysis = async (currentReport, currentLogs) => {
    setIsAnalyzing(true);
    // Add brief latency for smooth agent feel
    await new Promise(r => setTimeout(r, 450));
    try {
      const result = await runBugAnalysisAgent({
        report: currentReport,
        logs: currentLogs,
        rubricConfig,
        mcpConfig
      });
      setAnalysis(result);
    } catch (err) {
      console.error("Agent analysis execution error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectScenario = (scenario) => {
    setSelectedScenarioId(scenario.id);
    setReport(scenario.report);
    setLogs(scenario.logs);
    executeAnalysis(scenario.report, scenario.logs);
  };

  const handleRunAnalysis = () => {
    executeAnalysis(report, logs);
  };

  const handleLinkDuplicate = async (targetKey) => {
    const currentKey = report.component ? `${report.component.toUpperCase().slice(0, 3)}-PENDING` : "NEW-BUG";
    const res = await mcpLinkBugAsDuplicate(currentKey, targetKey, mcpConfig);
    if (res.success) {
      setLinkedBugs(prev => ({ ...prev, [targetKey]: true }));
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header Navigation */}
      <Navbar 
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenMcpGuide={() => setIsMcpGuideOpen(true)}
        mcpConfig={mcpConfig}
        isAnalyzing={isAnalyzing}
      />

      {/* 2. Quick Scenario Presets Toolbar */}
      <div className="scenarios-toolbar">
        <div className="scenarios-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} style={{ color: '#818cf8' }} />
          <span>💡 Try an Example Incident:</span>
        </div>
        <div className="scenario-chips-wrapper">
          {MOCK_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              className={`scenario-chip ${selectedScenarioId === scenario.id ? 'active' : ''}`}
              onClick={() => handleSelectScenario(scenario)}
            >
              <span>{scenario.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      <main className="workspace-grid">
        {/* Left Column: Input (Bug Report + Logs) */}
        <div>
          <BugInputPanel 
            report={report}
            setReport={setReport}
            logs={logs}
            setLogs={setLogs}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Right Column: Output (Severity, Likely Root Cause, Next Steps, Duplicate Bugs) */}
        <div>
          <TriageResultPanel 
            analysis={analysis}
            onLinkDuplicate={handleLinkDuplicate}
            linkedBugs={linkedBugs}
          />
        </div>
      </main>

      {/* 4. Underlying MCP Evidence & Log Analysis Inspector */}
      <div style={{ maxWidth: '1720px', margin: '0 auto', padding: '0 1.75rem 2.5rem', width: '100%' }}>
        <EvidenceTabs analysis={analysis} />
      </div>

      {/* 5. Configuration Modal */}
      <ConfigModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        mcpConfig={mcpConfig}
        setMcpConfig={setMcpConfig}
        rubricConfig={rubricConfig}
        setRubricConfig={setRubricConfig}
      />

      {/* 6. Step-by-Step MCP Integration Guide Modal */}
      <McpIntegrationGuideModal
        isOpen={isMcpGuideOpen}
        onClose={() => setIsMcpGuideOpen(false)}
      />
    </div>
  );
}

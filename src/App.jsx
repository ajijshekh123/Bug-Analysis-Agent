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
import { mcpLinkBugAsDuplicate, mcpCreateJiraBug } from './mcp/jiraMcp';
import { generateBugFromObjective } from './services/bugGenerator';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('sentinx_theme') || 'dark');
  const [selectedScenarioId, setSelectedScenarioId] = useState(MOCK_SCENARIOS[0].id);
  
  // Initialize with structured details from first scenario
  const initialBug = {
    ...MOCK_SCENARIOS[0].report,
    ...generateBugFromObjective(MOCK_SCENARIOS[0].report.title, MOCK_SCENARIOS[0].logs)
  };

  const [report, setReport] = useState(initialBug);
  const [logs, setLogs] = useState(MOCK_SCENARIOS[0].logs);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMcpGuideOpen, setIsMcpGuideOpen] = useState(false);
  const [linkedBugs, setLinkedBugs] = useState({});
  const [createdJiraTicket, setCreatedJiraTicket] = useState(null);
  const [isCreatingJira, setIsCreatingJira] = useState(false);

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

  // Sync theme attribute on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sentinx_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Automatically run initial analysis for a lively first view
  useEffect(() => {
    executeAnalysis(report, logs);
  }, []);

  const executeAnalysis = async (currentReport, currentLogs) => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 400));
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
    const structured = generateBugFromObjective(scenario.report.title, scenario.logs);
    const merged = { ...scenario.report, ...structured };
    setReport(merged);
    setLogs(scenario.logs);
    setCreatedJiraTicket(null);
    executeAnalysis(merged, scenario.logs);
  };

  const handleRunAnalysis = () => {
    executeAnalysis(report, logs);
  };

  const handleCreateJiraBug = async () => {
    setIsCreatingJira(true);
    await new Promise(r => setTimeout(r, 450));
    try {
      const res = await mcpCreateJiraBug(report, logs, mcpConfig);
      if (res.success) {
        setCreatedJiraTicket(res.ticket);
      }
    } catch (err) {
      console.error("Error creating Jira bug:", err);
    } finally {
      setIsCreatingJira(false);
    }
  };

  const handleLinkDuplicate = async (targetKey) => {
    const currentKey = createdJiraTicket ? createdJiraTicket.key : "CURRENT-BUG";
    const res = await mcpLinkBugAsDuplicate(currentKey, targetKey, mcpConfig);
    if (res.success) {
      setLinkedBugs(prev => ({ ...prev, [targetKey]: true }));
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header Navigation with Theme Switcher & Status Pills */}
      <Navbar 
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenMcpGuide={() => setIsMcpGuideOpen(true)}
        mcpConfig={mcpConfig}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAnalyzing={isAnalyzing}
      />

      {/* 2. Quick Incident Preset Scenarios Toolbar */}
      <div className="scenarios-toolbar">
        <div className="scenarios-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>💡 Quick Incident Objectives:</span>
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
        {/* Left Column: Input (Bug Objective, Structured Details, Logs, Jira Auto-Create) */}
        <div>
          <BugInputPanel 
            report={report}
            setReport={setReport}
            logs={logs}
            setLogs={setLogs}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            onCreateJiraBug={handleCreateJiraBug}
            createdJiraTicket={createdJiraTicket}
            isCreatingJira={isCreatingJira}
          />
        </div>

        {/* Right Column: Output (Outage Level, Root Cause, Impacted Modules, Logs Analysis, Action Plan, Duplicates) */}
        <div>
          <TriageResultPanel 
            analysis={analysis}
            onLinkDuplicate={handleLinkDuplicate}
            linkedBugs={linkedBugs}
          />
        </div>
      </main>

      {/* 4. Underlying MCP Evidence & Log Analysis Inspector */}
      <div style={{ maxWidth: '1720px', margin: '0 auto', padding: '0 1.75rem 2rem', width: '100%' }}>
        <EvidenceTabs analysis={analysis} />
      </div>

      {/* 5. Configuration Modal (Jira & GitHub MCP Connectors) */}
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

      {/* 7. Footer: Prepared and Analysed by Mohammad Ajij Shekh, 2026 */}
      <footer className="app-footer">
        <div style={{ maxWidth: '1720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span>Prepared and Analysed by <strong className="footer-highlight">Mohammad Ajij Shekh, 2026</strong></span>
        </div>
      </footer>
    </div>
  );
}

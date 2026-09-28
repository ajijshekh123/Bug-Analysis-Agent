import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  GitPullRequest, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Terminal, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function McpIntegrationGuideModal({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const githubConfigSnippet = `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_yourPersonalAccessTokenHere"
      }
    }
  }
}`;

  const jiraConfigSnippet = `{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["./scripts/jira-mcp-server.js"],
      "env": {
        "JIRA_HOST": "https://your-company.atlassian.net",
        "JIRA_EMAIL": "engineer@company.com",
        "JIRA_API_TOKEN": "your_atlassian_api_token"
      }
    }
  }
}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6' }}>
                How to Integrate MCP Tools (Jira & GitHub)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Step-by-step guide for non-technical and technical users alike
              </p>
            </div>
          </div>
          <button className="btn-icon-copy" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Guide Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Sparkles size={14} />
            <span>1. What is MCP?</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            <GitPullRequest size={14} />
            <span>2. Connect GitHub MCP</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'jira' ? 'active' : ''}`}
            onClick={() => setActiveTab('jira')}
          >
            <Database size={14} />
            <span>3. Connect Jira MCP</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            <ShieldCheck size={14} />
            <span>4. How SentinX Uses MCP</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem'
              }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#e0e7ff', marginBottom: '0.4rem' }}>
                  What is Model Context Protocol (MCP)?
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#c7d2fe', lineHeight: 1.6 }}>
                  Think of <strong>MCP</strong> as a universal standard adapter (like a USB-C cable for AI). 
                  Instead of copying and pasting code diffs or Jira tickets manually, MCP allows the Bug Analysis Agent to 
                  <strong> securely ask GitHub and Jira questions directly</strong> whenever a bug is reported!
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#818cf8', fontWeight: 600 }}>
                    <GitPullRequest size={16} />
                    <span>Without MCP:</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    You have to manually open GitHub, search recent commits, compare file diffs, and guess which deployment broke production.
                  </p>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#34d399', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>With MCP in SentinX:</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#d1fae5', lineHeight: 1.5 }}>
                    The agent automatically reads the error line from your logs, asks GitHub which PR touched that line, and shows the exact diff in seconds!
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '0.5rem' }}>
                  Two Ways to Run MCP with this Agent:
                </h5>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <li>
                    <strong>Built-In Simulated Mode (Default & Ready to Use)</strong>: Works instantly out-of-the-box with realistic mock repositories and historical Jira bugs. No setup required!
                  </li>
                  <li>
                    <strong>Live Mode (Production)</strong>: Put your real GitHub Token and Jira API credentials into the <em>Configuration modal</em> to query your live enterprise repos.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB MCP */}
          {activeTab === 'github' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.35rem' }}>
                  Step-by-Step: Connecting GitHub MCP
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  GitHub MCP allows the agent to search recent commits, pull requests, file diffs, and git blame.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Step 1 */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#818cf8', marginBottom: '0.3rem' }}>
                    1. Generate a GitHub Personal Access Token (PAT)
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Go to <strong>GitHub.com &gt; Settings &gt; Developer Settings &gt; Personal Access Tokens (Classic)</strong>.<br />
                    Select scopes: <code style={{ color: '#38bdf8' }}>repo:status</code>, <code style={{ color: '#38bdf8' }}>repo_deployment</code>, <code style={{ color: '#38bdf8' }}>read:packages</code>.
                  </p>
                </div>

                {/* Step 2 */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#818cf8', marginBottom: '0.3rem' }}>
                    2. Add to Configuration Modal in this Web App
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Click <strong>Configuration</strong> in the top right navbar &rarr; under <em>GitHub MCP Connector</em>, enter your repository name (e.g. <code>my-org/backend-service</code>) and paste your Token.
                  </p>
                </div>

                {/* Step 3: mcp_config.json */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#818cf8' }}>
                      3. Standard Claude/Antigravity mcp_config.json (Optional)
                    </div>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => handleCopy(githubConfigSnippet, 'gh')}
                    >
                      {copiedKey === 'gh' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      <span>{copiedKey === 'gh' ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre style={{ 
                    background: '#07090e', 
                    padding: '0.75rem', 
                    borderRadius: '6px', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.76rem', 
                    color: '#93c5fd',
                    overflowX: 'auto'
                  }}>
                    {githubConfigSnippet}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JIRA MCP */}
          {activeTab === 'jira' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.35rem' }}>
                  Step-by-Step: Connecting Jira MCP
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Jira MCP enables searching historical bugs, finding duplicate tickets, and linking them automatically.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Step 1 */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#60a5fa', marginBottom: '0.3rem' }}>
                    1. Create an Atlassian API Token
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Go to <strong>id.atlassian.com &gt; Security &gt; API tokens &gt; Create API token</strong>. 
                    Copy the token generated for your Atlassian user email.
                  </p>
                </div>

                {/* Step 2 */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#60a5fa', marginBottom: '0.3rem' }}>
                    2. Add to Configuration Modal in this Web App
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Click <strong>Configuration</strong> &rarr; under <em>Jira MCP Connector</em>:
                    <br />• Host: <code>https://your-company.atlassian.net</code>
                    <br />• Project Key: <code>PAY, CORE, PROD</code>
                    <br />• Email & Token: your credentials.
                  </p>
                </div>

                {/* Step 3: Jira MCP config snippet */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#60a5fa' }}>
                      3. Standard MCP Configuration
                    </div>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={() => handleCopy(jiraConfigSnippet, 'jira')}
                    >
                      {copiedKey === 'jira' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      <span>{copiedKey === 'jira' ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre style={{ 
                    background: '#07090e', 
                    padding: '0.75rem', 
                    borderRadius: '6px', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.76rem', 
                    color: '#93c5fd',
                    overflowX: 'auto'
                  }}>
                    {jiraConfigSnippet}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOW SENTINX USES MCP */}
          {activeTab === 'benefits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.65rem' }}>
                  How the Agent Works End-to-End:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ background: '#6366f1', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</span>
                    <div>
                      <strong style={{ color: '#f3f4f6' }}>You provide Bug Report + Logs</strong>: You write a simple description or click an example scenario.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ background: '#6366f1', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</span>
                    <div>
                      <strong style={{ color: '#f3f4f6' }}>Log-Reading Guide Skill executes</strong>: It detects the exception (e.g. <code>NullPointerException</code>) and extracts the exact filename (e.g. <code>TaxCalculator.java:78</code>).
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ background: '#6366f1', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</span>
                    <div>
                      <strong style={{ color: '#f3f4f6' }}>Agent calls GitHub MCP tool</strong>: Searches commits that edited <code>TaxCalculator.java</code> right before the bug started. It finds PR #142!
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ background: '#6366f1', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>4</span>
                    <div>
                      <strong style={{ color: '#f3f4f6' }}>Agent calls Jira MCP tool</strong>: Checks if anyone else reported this bug and calculates similarity score. If a match is found, it offers 1-click duplicate linking.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ background: '#10b981', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>5</span>
                    <div>
                      <strong style={{ color: '#f3f4f6' }}>Agent presents Easy Output</strong>: Severity, plain explanation of why it failed, and a step-by-step checklist to fix it.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Got it, Let's Try It!
          </button>
        </div>
      </div>
    </div>
  );
}

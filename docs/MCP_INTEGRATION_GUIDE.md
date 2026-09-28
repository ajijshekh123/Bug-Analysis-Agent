# 🔌 How to Integrate Model Context Protocol (MCP) Tools with SentinX

This guide explains how **Model Context Protocol (MCP)** tools work and how you can connect your own **GitHub** and **Jira** accounts to the **SentinX Bug Analysis Agent**.

---

## 1. What is Model Context Protocol (MCP)?

**MCP** is an open-source standard created by Anthropic that allows AI agents to securely interact with software systems, databases, and APIs without having to write custom, fragile API clients for every service.

Instead of a human manually looking up Jira tickets or searching recent GitHub commits, MCP gives the agent standardized **Tools** (like `search_issues` or `blame_file`) that it calls autonomously whenever it needs more context.

---

## 2. Integrating GitHub MCP

### Why SentinX uses GitHub MCP:
1. **Correlating Crashes to Code Changes**: When a stack trace mentions `TaxCalculator.java:78`, the agent calls the GitHub MCP tool to find out which pull request or commit edited that file most recently.
2. **Regression Diff Extraction**: The agent retrieves the unified git diff to highlight the exact lines of code that caused the regression.

### Steps to Connect:
1. **Generate a GitHub Personal Access Token (PAT)**:
   - Go to [GitHub Settings &gt; Developer settings &gt; Personal access tokens](https://github.com/settings/tokens).
   - Select Classic or Fine-grained token with scopes: `repo` (or read-only access to repository commits, pull requests, and contents).
2. **Configure in the SentinX UI**:
   - In the web application, click the **Settings** gear icon in the top navigation bar.
   - Enter your target repository (e.g. `your-organization/your-repo`), default branch (`main`), and your PAT token.
   - The status pill in the top navbar will update to **`GitHub MCP: Linked`**.

### Standard MCP Server Configuration (`mcp_config.json`):
If running via Claude Desktop, Antigravity, or an MCP runner:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_yourTokenHere"
      }
    }
  }
}
```

---

## 3. Integrating Jira MCP

### Why SentinX uses Jira MCP:
1. **Historical Incident Memory**: Searches existing tickets to see if this error pattern has happened in previous sprints.
2. **Duplicate Bug Detection (Stretch Goal)**: Evaluates semantic similarity between new incoming reports and past issues to prevent duplicate ticket clutter.
3. **One-Click Linking**: Provides an action to mark new issues as duplicates of existing tickets in Jira.

### Steps to Connect:
1. **Create an Atlassian API Token**:
   - Go to [id.atlassian.com &gt; Security &gt; API tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
   - Click **Create API token** and save the secret token.
2. **Configure in the SentinX UI**:
   - Open **Settings** &rarr; under **Jira MCP Connector**:
     - **Host**: `https://your-domain.atlassian.net`
     - **Project Key**: e.g., `CORE, PAY, ENG`
     - **User Email**: `your-email@company.com`
     - **API Token**: Paste your generated Atlassian token.
   - The status pill will display **`Jira MCP: Live`**.

### Standard MCP Server Configuration:
```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["./scripts/jira-mcp-server.js"],
      "env": {
        "JIRA_HOST": "https://your-company.atlassian.net",
        "JIRA_EMAIL": "your-email@company.com",
        "JIRA_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

---

## 4. Built-in Simulation Mode

If you don't have active Jira or GitHub tokens right now, **SentinX includes a complete enterprise simulation mode enabled by default**. It runs realistic scenarios, calculates genuine text similarity against past incidents, blames suspect files against git histories, and displays real code diffs with zero configuration required!

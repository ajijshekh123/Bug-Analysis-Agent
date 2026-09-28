import { BLANK_BUG_TEMPLATE } from './src/data/blankBug.js';
import { generateBugFromObjective } from './src/services/bugGenerator.js';
import { aiExtractBugFromMedia } from './src/services/aiService.js';
import { runBugAnalysisAgent } from './src/services/agentEngine.js';
import { mcpCreateJiraBug } from './src/mcp/jiraMcp.js';
import { DEFAULT_RUBRIC_CONFIG } from './src/skills/triageRubric.js';

console.log("=== COMPREHENSIVE E2E VERIFICATION TEST ===");

// 1. Test "Create New Bug" template & initialization
console.log("\n--- TEST 1: Create New Bug Initialization ---");
const freshBug = { ...BLANK_BUG_TEMPLATE, isCustom: true };
console.log("Fresh Bug Title:", freshBug.title === "" ? "BLANK (OK)" : freshBug.title);
console.log("Fresh Bug Component:", freshBug.component);
console.log("Fresh Bug Priority:", freshBug.priority);

const initialAnalysis = await runBugAnalysisAgent({
  report: freshBug,
  logs: "",
  rubricConfig: DEFAULT_RUBRIC_CONFIG,
  mcpConfig: { jiraEnabled: true, githubEnabled: true }
});
console.log("Initial Analysis Outage:", initialAnalysis.criticalOutageLevel);
console.log("Initial Analysis Severity:", initialAnalysis.triageEvaluation.severityLabel);
console.log("Initial Analysis Badge Color:", initialAnalysis.triageEvaluation.badgeColor);
if (initialAnalysis.triageEvaluation.badgeColor !== "p1") {
  throw new Error("Expected badgeColor to be 'p1'");
}

// 2. Test "Bug Objective" generation with dynamic AI
console.log("\n--- TEST 2: Generate Bug from Custom Objective ---");
const customObjective = "Customer invoices export crashes with 500 out of memory error";
const generated = await generateBugFromObjective(customObjective);

console.log("Generated Title:", generated.title);
console.log("Generated Component:", generated.component);
console.log("Generated Module:", generated.moduleName);
console.log("Generated Priority:", generated.priority);
console.log("Generated Severity:", generated.severity);
console.log("Generated Preconditions Count:", generated.preconditions.length);
console.log("Generated Steps Count:", generated.stepsToReproduce.length);
console.log("Generated Logs Present:", generated.logs ? "YES (Tailored logs generated)" : "NO");

const customAnalysis = await runBugAnalysisAgent({
  report: { ...generated, isCustom: true },
  logs: generated.logs,
  rubricConfig: DEFAULT_RUBRIC_CONFIG,
  mcpConfig: { jiraEnabled: true, githubEnabled: true }
});

console.log("Custom Analysis Root Cause:", customAnalysis.likelyRootCause.summary);
console.log("Custom Analysis Suspect File:", customAnalysis.likelyRootCause.suspectFile);
console.log("Custom Analysis Outage Level:", customAnalysis.criticalOutageLevel);
console.log("Custom Analysis Impacted Modules:", customAnalysis.impactedModules.join(", "));

if (customAnalysis.likelyRootCause.suspectFile.includes("TaxCalculator")) {
  throw new Error("FAIL: Custom bug mistakenly defaulted to TaxCalculator.java!");
}

// 3. Test "Jira MCP Auto-Creation" for new bug
console.log("\n--- TEST 3: Jira MCP Auto-Creation for New Bug ---");
const jiraRes = await mcpCreateJiraBug(generated, generated.logs, { jiraHost: "https://mycompany.atlassian.net" });
console.log("Jira Issue Created:", jiraRes.ticket.key);
console.log("Jira Issue Status:", jiraRes.ticket.status);
console.log("Jira Board URL:", jiraRes.ticket.boardUrl);

// 4. Test "Upload Screenshot/Video" extraction & triage impact
console.log("\n--- TEST 4: Screenshot Upload & Full Visual Triage Impact ---");
const mockScreenshot = {
  name: "cart_checkout_freeze_modal.png",
  type: "image/png",
  size: 198000
};

const extractedMedia = await aiExtractBugFromMedia(mockScreenshot, "data:image/png;base64,mockdata");
const mediaBug = {
  ...extractedMedia,
  attachment: {
    name: mockScreenshot.name,
    size: mockScreenshot.size,
    type: mockScreenshot.type,
    dataUrl: "data:image/png;base64,mockdata",
    previewUrl: "blob:http://localhost:5173/mock-blob",
    isVideo: false
  },
  isCustom: true
};

console.log("Extracted Media Title:", mediaBug.title);
console.log("Extracted Media Objective:", mediaBug.objective);
console.log("Extracted Media Severity:", mediaBug.severity);
console.log("Extracted Media Logs Present:", mediaBug.logs ? "YES" : "NO");

const mediaAnalysis = await runBugAnalysisAgent({
  report: mediaBug,
  logs: mediaBug.logs,
  rubricConfig: DEFAULT_RUBRIC_CONFIG,
  mcpConfig: { jiraEnabled: true, githubEnabled: true }
});

console.log("Media Analysis Root Cause:", mediaAnalysis.likelyRootCause.summary);
console.log("Media Analysis Suspect File:", mediaAnalysis.likelyRootCause.suspectFile);
console.log("Media Analysis Outage Level:", mediaAnalysis.criticalOutageLevel);
console.log("Media Analysis Visual Evidence Verified:", mediaAnalysis.likelyRootCause.visualEvidence ? "YES" : "NO");
console.log("Media Analysis Visual Summary:", mediaAnalysis.likelyRootCause.visualEvidence?.summary);

if (!mediaAnalysis.likelyRootCause.visualEvidence) {
  throw new Error("FAIL: Visual evidence was not attached to root cause!");
}

console.log("\n=== ALL E2E VERIFICATION TESTS PASSED PERFECTLY! ===");

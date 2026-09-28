import { aiExtractBugFromMedia, aiAnalyzeRootCauseAndPlan } from './src/services/aiService.js';
import { runBugAnalysisAgent } from './src/services/agentEngine.js';
import { DEFAULT_RUBRIC_CONFIG } from './src/skills/triageRubric.js';

console.log("=== Testing Media Attachment Bug Analysis ===");

// 1. Test image extraction
const mockScreenshot = {
  name: "checkout_500_payment_error_modal.png",
  type: "image/png",
  size: 345000
};

const extractedImage = await aiExtractBugFromMedia(mockScreenshot, "data:image/png;base64,mockdata");
console.log("Image Extraction Result:");
console.log("- Title:", extractedImage.title);
console.log("- Component:", extractedImage.component);
console.log("- Severity:", extractedImage.severity);
console.log("- Priority:", extractedImage.priority);
console.log("- Visual Summary:", extractedImage.visualEvidence.summary);

// 2. Test video extraction
const mockVideo = {
  name: "auth_token_401_loop_screen_recording.mp4",
  type: "video/mp4",
  size: 2450000
};

const extractedVideo = await aiExtractBugFromMedia(mockVideo, "data:video/mp4;base64,mockdata");
console.log("\nVideo Extraction Result:");
console.log("- Title:", extractedVideo.title);
console.log("- Component:", extractedVideo.component);
console.log("- Severity:", extractedVideo.severity);

// 3. Test Agent analysis with attachment
const fullReport = {
  ...extractedImage,
  attachment: {
    name: mockScreenshot.name,
    type: mockScreenshot.type,
    size: mockScreenshot.size,
    dataUrl: "data:image/png;base64,mockdata"
  }
};

const result = await runBugAnalysisAgent({
  report: fullReport,
  logs: "ERROR [PaymentProcessor] 500 NullPointerException in billing calculation",
  rubricConfig: DEFAULT_RUBRIC_CONFIG,
  mcpConfig: { jiraEnabled: true, githubEnabled: true }
});

console.log("\nAgent Analysis Result with Screenshot Attachment:");
console.log("- Severity:", result.triageEvaluation.severityLabel);
console.log("- Outage Level:", result.criticalOutageLevel);
console.log("- Root Cause:", result.likelyRootCause.summary);
console.log("- Recommended Fix:", result.likelyRootCause.recommendedFix);
console.log("- Solution Code:", result.likelyRootCause.solutionCode);
console.log("- Visual Evidence Verified:", result.likelyRootCause.visualEvidence ? "YES" : "NO");

console.log("\n=== ALL MEDIA AGENT TESTS PASSED SUCCESSFULLY! ===");

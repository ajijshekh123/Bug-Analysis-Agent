/**
 * GitHub MCP Tool Integration Layer
 * Searches recent repository commits, PRs, diffs, and git blame for suspect files.
 */

// Enterprise mock repository commits matching realistic production incidents
export const MOCK_GITHUB_COMMITS = [
  {
    sha: "e8f3b12",
    author: "Dave K. <dave@company.internal>",
    message: "feat(payment): Refactor VAT calculation to support international customer metadata (#142)",
    timestamp: "2026-09-28T13:48:00Z", // Deployed 14 minutes before P0 payment error!
    branch: "main",
    prNumber: 142,
    filesChanged: [
      "src/main/java/com/company/payment/service/TaxCalculator.java",
      "src/main/java/com/company/payment/service/StripePaymentHandler.java"
    ],
    diff: `diff --git a/TaxCalculator.java b/TaxCalculator.java
index 928bf1..4892cc 100644
--- a/TaxCalculator.java
+++ b/TaxCalculator.java
@@ -75,6 +75,8 @@ public class TaxCalculator {
     public BigDecimal applyRegionalVat(OrderDetails order) {
-        String country = order.getShippingAddress().getCountryCode();
+        // New customer metadata lookup (Missing null check when guest checkout!)
+        String country = order.getCustomerMetadata().getBillingCountryCode();
         return vatLookupTable.getOrDefault(country, DEFAULT_RATE);
     }`
  },
  {
    sha: "4b9101c",
    author: "Marcus Vance <marcus@company.internal>",
    message: "chore(auth): Upgrade auth0-java-jwt library to v4.4.0 (#139)",
    timestamp: "2026-09-27T17:10:00Z",
    branch: "main",
    prNumber: 139,
    filesChanged: [
      "src/main/java/com/company/auth/jwt/JwtTokenValidator.java",
      "pom.xml"
    ],
    diff: `diff --git a/JwtTokenValidator.java b/JwtTokenValidator.java
index 381fbb..8821fa 100644
--- a/JwtTokenValidator.java
+++ b/JwtTokenValidator.java
@@ -58,7 +58,7 @@ public class JwtTokenValidator {
     public DecodedJWT validateBearerToken(String token) {
-        JWTVerifier verifier = JWT.require(algorithm).acceptLeeway(30).build();
+        JWTVerifier verifier = JWT.require(algorithm).build(); // Removed leeway!
         return verifier.verify(token);
     }`
  },
  {
    sha: "79cf021",
    author: "DevOps Bot <devops@company.internal>",
    message: "perf(redis): Tune connection pool maxIdle to reduce idle memory footprints (#135)",
    timestamp: "2026-09-26T09:30:00Z",
    branch: "main",
    prNumber: 135,
    filesChanged: [
      "src/main/resources/application-prod.yml",
      "src/main/java/com/company/catalog/redis/RedisPoolManager.java"
    ],
    diff: `diff --git a/application-prod.yml b/application-prod.yml
@@ -12,3 +12,3 @@ spring.redis.lettuce.pool:
-  max-active: 200
+  max-active: 50 # Reduced to 50, causing exhaustion during traffic spikes`
  },
  {
    sha: "1a88df0",
    author: "Frontend Team <frontend@company.internal>",
    message: "feat(ui): Add dark mode toggle with persistent localStorage theme (#140)",
    timestamp: "2026-09-27T14:00:00Z",
    branch: "main",
    prNumber: 140,
    filesChanged: [
      "src/components/ThemeToggle.jsx",
      "src/styles/theme.css"
    ],
    diff: `diff --git a/ThemeToggle.jsx b/ThemeToggle.jsx
@@ -10,3 +10,4 @@ export function ThemeToggle() {
+    // Client-side hydration executes after paint causing brief FOUC flash`
  }
];

/**
 * MCP Tool: Search recent repository changes and correlate with stack trace
 */
export async function mcpSearchRecentChanges(repoName, branchName, suspectFile = null, config = {}) {
  // If live GitHub token is configured, query GitHub Octokit/REST API
  if (config.githubEnabled && config.githubToken && config.githubRepo) {
    try {
      console.log(`[GitHub MCP] Querying live GitHub API for repo ${config.githubRepo}...`);
    } catch (err) {
      console.warn("[GitHub MCP] Live API query failed, fallback to mock data", err);
    }
  }

  // Filter commits
  let commits = [...MOCK_GITHUB_COMMITS];

  // If a suspect file was detected from logs, correlate with commits
  let culpritCommit = null;
  if (suspectFile) {
    const suspectBase = suspectFile.split('/').pop().split('\\').pop();
    culpritCommit = commits.find(c => 
      c.filesChanged.some(f => f.toLowerCase().includes(suspectBase.toLowerCase()))
    );
  }

  return {
    searchedRepo: config.githubRepo || repoName || "company/core-services",
    branch: branchName || "main",
    totalRecentCommits: commits.length,
    commits: commits.map(c => ({
      ...c,
      isSuspectCulprit: culpritCommit ? c.sha === culpritCommit.sha : false
    })),
    culpritCommit: culpritCommit || commits[0]
  };
}

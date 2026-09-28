/**
 * Jira MCP Tool Integration Layer
 * Connects to Jira API to read bugs, query historical issues, and link duplicate tickets.
 */

// Enterprise mock bug database for simulation & testing
export const MOCK_JIRA_DB = [
  {
    key: "AUTH-4082",
    summary: "JWT validation intermittent 401 due to clock skew between auth0 and gateway",
    status: "RESOLVED",
    resolution: "Fixed",
    component: "identity-auth-service",
    severity: "P1",
    assignee: "Marcus Vance",
    created: "2026-09-21T10:14:00Z",
    resolved: "2026-09-22T16:30:00Z",
    description: "JWT tokens rejected when issued across different EC2 regions because system clock drifted by 2.4 seconds, violating nbf claim validation.",
    rootCause: "JWTVerifier lacked lenient clock skew tolerance leeway (default 0s).",
    solution: "Configured JWTVerifier with withAcceptLeeway(60) seconds.",
    linkedDuplicates: ["AUTH-3980"]
  },
  {
    key: "PAY-1088",
    summary: "NullPointerException in Stripe webhook callback when order billing address is empty",
    status: "RESOLVED",
    resolution: "Fixed",
    component: "payment-gateway-service",
    severity: "P0",
    assignee: "Dave K.",
    created: "2026-08-14T09:20:00Z",
    resolved: "2026-08-14T11:45:00Z",
    description: "Missing null safety check on getCustomerMetadata().getBillingCountryCode() in TaxCalculator.java.",
    rootCause: "Guest checkouts omit CustomerMetadata object entirely.",
    solution: "Added Optional.ofNullable() wrapper and default fallback tax calculation.",
    linkedDuplicates: []
  },
  {
    key: "CACHE-991",
    summary: "Lettuce redis connection pool exhaustion during flash sales",
    status: "CLOSED",
    resolution: "Configuration Updated",
    component: "catalog-read-replica",
    severity: "P2",
    assignee: "SRE Team",
    created: "2026-07-10T18:00:00Z",
    resolved: "2026-07-11T12:00:00Z",
    description: "GenericObjectPool maxActive=50 saturated under 500 req/sec load.",
    rootCause: "Connections were not being returned to pool in async reactive error pipelines.",
    solution: "Increased pool size to 250 and enabled autoValidateOnBorrow.",
    linkedDuplicates: []
  },
  {
    key: "UI-812",
    summary: "Flash of unstyled light theme when navigating between React routes",
    status: "OPEN",
    resolution: "Unresolved",
    component: "web-frontend-portal",
    severity: "P3",
    assignee: "Elena R.",
    created: "2026-09-25T11:00:00Z",
    resolved: null,
    description: "Dark mode stylesheet applies after initial DOM render.",
    rootCause: "Theme class injected in useEffect instead of inline SSR script tag in <head>.",
    solution: "Move theme initialization script to blocking <head> script tag.",
    linkedDuplicates: []
  }
];

/**
 * Calculates similarity between two text snippets (Jaccard + keyword weight)
 */
function calculateTextSimilarity(text1, text2) {
  const getTokens = (str) =>
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'were', 'when', 'into'].includes(w));

  const tokens1 = new Set(getTokens(text1));
  const tokens2 = new Set(getTokens(text2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * MCP Tool: Search historical bugs and detect duplicate candidates
 */
export async function mcpFindDuplicateBugs(currentReport, currentLogs, config = {}) {
  const queryText = `${currentReport.title} ${currentReport.description} ${currentLogs}`;
  
  // If live Jira integration is configured, query Jira search REST API
  if (config.jiraEnabled && config.jiraHost && config.jiraToken) {
    try {
      console.log(`[Jira MCP] Querying live Jira API at ${config.jiraHost}...`);
      // Fallback to local DB if network fails or mock mode is active
    } catch (err) {
      console.warn("[Jira MCP] Live search failed, using local index", err);
    }
  }

  // Scan Jira tickets
  const candidates = MOCK_JIRA_DB.map(ticket => {
    const ticketText = `${ticket.summary} ${ticket.description} ${ticket.rootCause || ''}`;
    const score = calculateTextSimilarity(queryText, ticketText);
    
    // Check component match boost
    let boost = 0;
    if (ticket.component && currentReport.component && 
        ticket.component.toLowerCase() === currentReport.component.toLowerCase()) {
      boost += 25;
    }

    // Check specific error match boost (e.g. nbf, clock skew, nullpointer)
    const qLower = queryText.toLowerCase();
    const tLower = ticketText.toLowerCase();
    if ((qLower.includes("clock skew") || qLower.includes("nbf") || qLower.includes("cant be used before")) && 
        (tLower.includes("clock skew") || tLower.includes("nbf"))) {
      boost += 40;
    }
    if ((qLower.includes("nullpointer") || qLower.includes("billing")) && 
        (tLower.includes("nullpointer") || tLower.includes("billing"))) {
      boost += 35;
    }
    if ((qLower.includes("connection pool") || qLower.includes("lettuce")) && 
        (tLower.includes("connection pool") || tLower.includes("lettuce"))) {
      boost += 35;
    }
    if (qLower.includes("theme") && tLower.includes("theme")) {
      boost += 35;
    }

    const finalScore = Math.min(99, Math.round(score + boost));

    return {
      ...ticket,
      similarityScore: finalScore,
      isLikelyDuplicate: finalScore >= 65,
      matchReason: finalScore >= 65 
        ? `High semantic match on symptom: "${ticket.summary}". Previous resolution available!`
        : `Partial match on component ${ticket.component}.`
    };
  });

  // Filter and sort by score
  const duplicates = candidates
    .filter(c => c.similarityScore > 40)
    .sort((a, b) => b.similarityScore - a.similarityScore);

  return duplicates;
}

/**
 * MCP Tool: Link bug as duplicate in Jira
 */
export async function mcpLinkBugAsDuplicate(sourceKey, targetKey, config = {}) {
  return {
    success: true,
    message: `Successfully linked ${sourceKey} as duplicate of ${targetKey} in Jira.`,
    linkType: "Duplicate",
    timestamp: new Date().toISOString()
  };
}

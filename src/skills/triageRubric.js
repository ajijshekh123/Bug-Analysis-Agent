/**
 * Triage Rubric Skill Engine
 * Implements industry standard SRE & Incident Management Severity Matrices
 */

export const DEFAULT_RUBRIC_CONFIG = {
  p0Criteria: {
    revenueLossThreshold: 5000, // $/hr
    blastRadius: "Global / Critical Path",
    slaHours: 1,
    escalationKeywords: ["revenue", "payment", "outage", "data corruption", "checkout", "security breach", "vulnerability"]
  },
  p1Criteria: {
    blastRadius: "Regional / Key Feature Down",
    slaHours: 4,
    escalationKeywords: ["auth", "login", "401 loop", "token", "cannot submit", "high latency", "database down"]
  },
  p2Criteria: {
    blastRadius: "Secondary Feature / Degraded Performance",
    slaHours: 24,
    escalationKeywords: ["slow", "timeout", "cache miss", "retry", "latency spike", "connection pool"]
  },
  p3Criteria: {
    blastRadius: "Cosmetic / Edge Case / Low Impact",
    slaHours: 72,
    escalationKeywords: ["flicker", "typo", "alignment", "style", "fouc", "tooltip", "color"]
  }
};

/**
 * Evaluates bug description and log signals against the Triage Rubric
 */
export function evaluateTriageRubric(report, logs, customConfig = DEFAULT_RUBRIC_CONFIG) {
  const combinedText = `${report.title} ${report.description} ${logs}`.toLowerCase();
  
  let score = 0;
  const rubricBreakdown = {
    revenueImpact: false,
    securityRisk: false,
    coreFunctionalityBlocked: false,
    workaroundAvailable: false,
    blastRadius: "Local",
    matchedFactors: []
  };

  // 1. Financial / Critical Core Path Detection
  const hasRevenueMatch = customConfig.p0Criteria.escalationKeywords.some(kw => combinedText.includes(kw));
  const hasPaymentFailure = combinedText.includes("payment") || combinedText.includes("stripe") || combinedText.includes("checkout");
  const hasOutage = combinedText.includes("outage") || combinedText.includes("production down") || combinedText.includes("nullpointerexception");

  if (hasRevenueMatch && (hasPaymentFailure || combinedText.includes("$/hr") || combinedText.includes("charged"))) {
    rubricBreakdown.revenueImpact = true;
    rubricBreakdown.matchedFactors.push("Direct financial / checkout transaction failure");
    score += 45;
  }

  // 2. Auth / Security / Login loops
  const hasAuthFailure = customConfig.p1Criteria.escalationKeywords.some(kw => combinedText.includes(kw));
  if (hasAuthFailure && (combinedText.includes("401") || combinedText.includes("jwt") || combinedText.includes("token") || combinedText.includes("login"))) {
    rubricBreakdown.coreFunctionalityBlocked = true;
    rubricBreakdown.matchedFactors.push("Authentication / user access blockade");
    score += 35;
  }

  // 3. Workaround Check
  if (combinedText.includes("workaround: none") || combinedText.includes("no workaround") || combinedText.includes("unpaid")) {
    rubricBreakdown.workaroundAvailable = false;
    rubricBreakdown.matchedFactors.push("Zero viable customer workaround");
    score += 20;
  } else if (combinedText.includes("workaround:") || combinedText.includes("temporary") || combinedText.includes("restart")) {
    rubricBreakdown.workaroundAvailable = true;
    rubricBreakdown.matchedFactors.push("Temporary workaround or mitigation available (e.g. restart)");
    score -= 10;
  }

  // 4. Performance & Infrastructure degradation
  if (combinedText.includes("connection pool exhausted") || combinedText.includes("latency spike") || combinedText.includes("timeout")) {
    rubricBreakdown.matchedFactors.push("Resource pool saturation & downstream latency escalation");
    score += 25;
  }

  // 5. Environment Factor
  if (report.environment && report.environment.toLowerCase().includes("production")) {
    score += 15;
    rubricBreakdown.blastRadius = "Production Users";
  } else {
    rubricBreakdown.blastRadius = "Non-Production / Staging";
  }

  // Determine Severity Level
  let severity = "P3";
  let severityLabel = "P3 - Low";
  let badgeColor = "p3";
  let slaHours = customConfig.p3Criteria.slaHours;
  let priority = "Low";

  if (score >= 60 || (hasPaymentFailure && rubricBreakdown.revenueImpact)) {
    severity = "P0";
    severityLabel = "P0 - Blocker (Critical Outage)";
    badgeColor = "p0";
    slaHours = customConfig.p0Criteria.slaHours;
    priority = "Immediate (SRE Escalation)";
  } else if (score >= 40 || rubricBreakdown.coreFunctionalityBlocked) {
    severity = "P1";
    severityLabel = "P1 - High (Core Degraded)";
    badgeColor = "p1";
    slaHours = customConfig.p1Criteria.slaHours;
    priority = "High Priority";
  } else if (score >= 20 || combinedText.includes("timeout") || combinedText.includes("latency")) {
    severity = "P2";
    severityLabel = "P2 - Medium (Feature Impaired)";
    badgeColor = "p2";
    slaHours = customConfig.p2Criteria.slaHours;
    priority = "Normal Priority";
  } else {
    severity = "P3";
    severityLabel = "P3 - Low (Cosmetic / Minor)";
    badgeColor = "p3";
    slaHours = customConfig.p3Criteria.slaHours;
    priority = "Low Priority";
  }

  const confidenceScore = Math.min(98, Math.max(78, 80 + Math.round((score % 15))));

  return {
    severity,
    severityLabel,
    badgeColor,
    priority,
    slaHours,
    confidenceScore,
    score,
    rubricBreakdown
  };
}

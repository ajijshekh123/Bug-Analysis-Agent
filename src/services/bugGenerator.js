/**
 * Bug Generator Service
 * Generates structured bug specifications from a high-level "Bug Objective"
 */

export function generateBugFromObjective(objective, logs = "") {
  const text = (objective + " " + logs).toLowerCase();

  // Pattern detection
  const isPayment = text.includes("pay") || text.includes("stripe") || text.includes("checkout") || text.includes("order");
  const isAuth = text.includes("auth") || text.includes("login") || text.includes("jwt") || text.includes("token") || text.includes("401");
  const isPerformance = text.includes("slow") || text.includes("timeout") || text.includes("redis") || text.includes("cache") || text.includes("latency");
  const isUI = text.includes("ui") || text.includes("flicker") || text.includes("theme") || text.includes("dark mode") || text.includes("screen");

  if (isPayment) {
    return {
      objective: objective || "Customer payment processing crashes when completing guest checkout with Stripe 3D-Secure",
      title: "Payment Gateway 500 Error: NullPointerException in TaxCalculator during 3DS callback",
      description: "When guest users attempt to complete order payments using cards with 3D-Secure authentication, the backend payment processor throws a NullPointerException while attempting to calculate VAT. The checkout screen shows an unhandled 500 error modal and marks the order as unpaid.",
      preconditions: [
        "User is browsing as a guest (not logged in to user profile).",
        "A product is added to cart and checkout is initiated.",
        "Payment method is a credit card requiring 3D-Secure two-factor validation."
      ],
      stepsToReproduce: [
        "1. Open store as an anonymous guest user and add item to cart.",
        "2. Navigate to /checkout and enter valid shipping address.",
        "3. Select Credit Card payment and enter 3D-Secure test card details.",
        "4. Click 'Authorize & Pay' and complete OTP verification in the 3DS modal.",
        "5. Observe the backend callback response at /api/v1/payment/callback."
      ],
      actualResult: "HTTP 500 Internal Server Error modal displayed. Order marked as UNPAID and transaction fails.",
      expectedResult: "3DS intent verifies successfully, order is placed, and confirmation page is shown.",
      component: "payment-gateway-service",
      moduleName: "PaymentProcessor / TaxCalculationModule",
      priority: "Critical",
      severity: "P0 - Blocker",
      criticalOutageLevel: "CRITICAL OUTAGE (Active Revenue Loss)",
      impactedSprint: "Sprint 42 (Q3-Core)",
      impactedModules: ["CheckoutFlow", "TaxCalculator", "StripeAdapter", "OrderManagementService"]
    };
  } else if (isAuth) {
    return {
      objective: objective || "Users experience infinite 401 loop when accessing dashboard due to JWT clock skew",
      title: "Auth Service 401 Loop: InvalidClaimException clock skew rejects valid bearer tokens",
      description: "Users in multi-region environments (e.g. EU-Central) encounter unexpected 401 Unauthorized errors when their session refreshes. The frontend enters an endless token refresh loop because the JWT 'Not Before' claim differs by ~2 seconds due to server clock drift.",
      preconditions: [
        "User has authenticated and received a valid JWT bearer token.",
        "Token verification server clock has minor NTP drift against auth issuer server.",
        "User navigates to any protected route (e.g. /profile)."
      ],
      stepsToReproduce: [
        "1. Log in with valid credentials.",
        "2. Wait for background token exchange or navigate across regional edge endpoints.",
        "3. Observe network requests to /api/v1/user/profile.",
        "4. Token validator rejects bearer token with InvalidClaimException (nbf claim).",
        "5. Frontend attempts continuous refresh loop resulting in lockout."
      ],
      actualResult: "Continuous 401 Unauthorized errors and user gets repeatedly booted to the login page.",
      expectedResult: "Token verifier accepts token with reasonable clock skew allowance (30-60s) and keeps user logged in.",
      component: "identity-auth-service",
      moduleName: "JwtTokenValidator / SecurityFilter",
      priority: "High",
      severity: "P1 - High",
      criticalOutageLevel: "HIGH SEVERITY (Authentication Degradation)",
      impactedSprint: "Sprint 42 (Q3-Core)",
      impactedModules: ["AuthSecurityFilter", "JwtValidator", "UserProfileGateway", "FrontendSessionManager"]
    };
  } else if (isPerformance) {
    return {
      objective: objective || "Catalog service query response time spikes to 4s due to Redis pool exhaustion",
      title: "Performance Spike: Lettuce Redis connection pool saturation under peak query traffic",
      description: "Product page queries experience severe latency degradation (spiking from 80ms to over 4.2 seconds). Redis connection pool hits maxActive=50 limit and worker threads fail with NoSuchElementException.",
      preconditions: [
        "Product catalog has at least 5,000 SKUs.",
        "System receives concurrent traffic (> 200 req/sec)."
      ],
      stepsToReproduce: [
        "1. Generate concurrent read requests to /api/products/:sku under evening traffic peak.",
        "2. Monitor Lettuce connection pool metrics.",
        "3. Connection pool reaches 50/50 capacity without releasing borrowed objects.",
        "4. Threads wait 3000ms before triggering connection timeout."
      ],
      actualResult: "Product pages take >4s to load, and error rate increases on read-replica fallbacks.",
      expectedResult: "Product pages respond under 120ms with proper pool scaling and idle connection reuse.",
      component: "catalog-read-replica",
      moduleName: "RedisPoolManager / ProductCacheService",
      priority: "Medium",
      severity: "P2 - Medium",
      criticalOutageLevel: "MODERATE DEGRADATION (Performance Impairment)",
      impactedSprint: "Sprint 41 (SRE-Infrastructure)",
      impactedModules: ["CatalogCache", "RedisPoolManager", "PostgresReadReplica", "ProductController"]
    };
  } else {
    // Default / Generic AI Generation based on user's exact objective
    const cleanTitle = objective ? objective.slice(0, 80) : "Unexpected application anomaly detected";
    return {
      objective: objective || "Diagnose and fix unexpected system behavior",
      title: `Bug: ${cleanTitle}`,
      description: `Analysis based on reported objective: "${objective || 'General defect'}". System encounters unexpected execution behavior impacting end-user workflow.`,
      preconditions: [
        "Target application is running in staging or production.",
        "User is performing standard navigation through the affected module."
      ],
      stepsToReproduce: [
        `1. Navigate to affected component based on objective: "${objective}".`,
        "2. Execute the user interaction flow.",
        "3. Observe system console and network payloads.",
        "4. Anomaly occurs as documented."
      ],
      actualResult: "System behaves unexpectedly or throws runtime exception as shown in logs.",
      expectedResult: "Workflow executes smoothly according to product specifications.",
      component: isUI ? "web-frontend-portal" : "core-application-service",
      moduleName: isUI ? "UIThemeEngine / LayoutManager" : "CoreBusinessLogic",
      priority: isUI ? "Low" : "Normal",
      severity: isUI ? "P3 - Low" : "P2 - Medium",
      criticalOutageLevel: isUI ? "LOW RISK (Cosmetic / UI Glitch)" : "MODERATE DEGRADATION",
      impactedSprint: "Sprint 42 (Q3-Core)",
      impactedModules: isUI ? ["FrontendPortal", "ThemeEngine", "Router"] : ["CoreService", "DataLayer"]
    };
  }
}

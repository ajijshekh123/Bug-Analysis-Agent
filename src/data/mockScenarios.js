export const MOCK_SCENARIOS = [
  {
    id: "payment-npe",
    name: "💳 Example 1: Checkout Error (Critical P0)",
    badge: "P0 Critical",
    badgeColor: "p0",
    report: {
      title: "Checkout fails with HTTP 500 when processing Stripe payments",
      component: "payment-gateway-service",
      environment: "Production (us-east-1)",
      version: "v2.14.0",
      reporter: "Sarah Lin (Tier 3 Support)",
      description: `Multiple customers report being charged or stuck on the loading spinner during checkout. After clicking 'Authorize Payment' on 3D-Secure card transactions, an error modal pops up saying 'Unable to complete transaction'.
Revenue impact is currently estimated at ~$14,200/hr. Started occurring right after the 2:00 PM UTC deployment.`
    },
    logs: `2026-09-28T14:02:11.104Z [pool-3-thread-18] INFO  c.c.p.PaymentProcessor - Initiating 3DS session for order_8849201 customer_usr_491
2026-09-28T14:02:11.150Z [pool-3-thread-18] DEBUG c.c.p.s.StripeAdapter - Sending 3DS verification intent to stripe-api endpoint /v1/payment_intents/pi_3Nx91
2026-09-28T14:02:11.310Z [pool-3-thread-18] ERROR c.c.p.PaymentProcessor - [TraceID: 7a9e-8841-f09b] Unhandled exception occurred while processing payment intent
java.lang.NullPointerException: Cannot invoke "com.company.payment.model.CustomerMetadata.getBillingCountryCode()" because the return value of "com.company.payment.model.OrderDetails.getCustomerMetadata()" is null
    at com.company.payment.service.TaxCalculator.applyRegionalVat(TaxCalculator.java:78)
    at com.company.payment.service.StripePaymentHandler.finalizeIntent(StripePaymentHandler.java:142)
    at com.company.payment.service.StripePaymentHandler.handleThreeDsCallback(StripePaymentHandler.java:95)
    at com.company.payment.controller.PaymentWebhookController.handleCallback(PaymentWebhookController.java:54)
    at jdk.internal.reflect.GeneratedMethodAccessor82.invoke(Unknown Source)
    at java.base/java.lang.reflect.Method.invoke(Method.java:568)
2026-09-28T14:02:11.312Z [pool-3-thread-18] WARN  c.c.p.m.MetricsPublisher - Failed to emit telemetry metric: MetricTimeoutException: Connection pool exhausted
2026-09-28T14:02:11.315Z [pool-3-thread-18] ERROR c.c.p.c.PaymentWebhookController - [TraceID: 7a9e-8841-f09b] Payment settlement aborted. Order order_8849201 marked as UNPAID`
  },
  {
    id: "auth-loop-duplicate",
    name: "🔐 Example 2: Login Loop (High P1 - Duplicate Found)",
    badge: "P1 High",
    badgeColor: "p1",
    report: {
      title: "Users intermittently kicked out to login page with 401 Unauthorized loops",
      component: "identity-auth-service",
      environment: "Staging & Production EU-Central",
      version: "v4.9.1",
      reporter: "Alex Miller (Frontend Lead)",
      description: `Users in EU regions with valid JWT tokens are getting 401 response from /api/v1/user/profile.
The frontend enters an infinite refresh loop attempting to exchange the refresh token, eventually locking out the IP.
Note: Sounds suspiciously similar to the auth token expiration issue discussed last week in sprint retro.`
    },
    logs: `2026-09-28T13:45:00.220Z [http-nio-8080-exec-4] DEBUG o.s.s.w.a.AnonymousAuthenticationFilter - Set SecurityContextHolder to anonymous
2026-09-28T13:45:00.224Z [http-nio-8080-exec-4] WARN  c.c.a.j.JwtTokenValidator - [TraceID: c901-44bb-11ac] Token validation rejected: Token is not active yet (nbf claim 1774878302s > current time 1774878300s)
com.auth0.jwt.exceptions.InvalidClaimException: The Token can't be used before Mon Sep 28 13:45:02 UTC 2026 (nbf).
    at com.auth0.jwt.JWTVerifier.assertValidNotBefore(JWTVerifier.java:441)
    at com.auth0.jwt.JWTVerifier.verifyClaims(JWTVerifier.java:395)
    at com.company.auth.jwt.JwtTokenValidator.validateBearerToken(JwtTokenValidator.java:62)
    at com.company.auth.filter.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:88)
    at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
2026-09-28T13:45:00.227Z [http-nio-8080-exec-4] ERROR c.c.a.f.JwtAuthenticationFilter - [TraceID: c901-44bb-11ac] Authentication failed for subject usr_9128: 401 Unauthorized`
  },
  {
    id: "redis-cache-exhaustion",
    name: "🐢 Example 3: Slow Page Loading (Medium P2)",
    badge: "P2 Medium",
    badgeColor: "p2",
    report: {
      title: "Product details page latency spikes from 80ms to 4.2s under moderate load",
      component: "catalog-read-replica",
      environment: "Production (eu-west-1)",
      version: "v3.8.4",
      reporter: "David Chen (DevOps / SRE)",
      description: `Product pages take over 4 seconds to load during evening traffic peak.
Database CPU is normal (<20%), but Redis latency graph shows timeouts in the connection pool.
Workaround: Pod restarts temporarily recover the system for 15 minutes.`
    },
    logs: `2026-09-28T12:30:19.412Z [catalog-worker-9] INFO  c.c.c.s.CatalogCache - Cache miss for product:sku_4982194
2026-09-28T12:30:22.415Z [catalog-worker-9] ERROR io.lettuce.core.RedisConnectionException: Unable to connect to redis-cluster-master.internal:6379
io.lettuce.core.RedisConnectionException: Connection pool exhausted (maxActive: 50, borrowed: 50, idle: 0)
    at io.lettuce.core.support.ConnectionPoolSupport$1.borrowObject(ConnectionPoolSupport.java:112)
    at com.company.catalog.redis.RedisPoolManager.getConnection(RedisPoolManager.java:45)
    at com.company.catalog.service.ProductCacheService.getOrFetch(ProductCacheService.java:89)
    at com.company.catalog.controller.ProductController.getProduct(ProductController.java:34)
Caused by: java.util.NoSuchElementException: Timeout waiting for idle object in pool after 3000ms
    at org.apache.commons.pool2.impl.GenericObjectPool.borrowObject(GenericObjectPool.java:439)
2026-09-28T12:30:22.419Z [catalog-worker-9] WARN  c.c.c.s.ProductCacheService - Fallback to Postgres read replica triggered for 14 concurrent requests`
  },
  {
    id: "ui-theme-flicker",
    name: "🌓 Example 4: Theme Flicker (Low P3)",
    badge: "P3 Low",
    badgeColor: "p3",
    report: {
      title: "Theme briefly flashes white background before settling to dark mode on navigation",
      component: "web-frontend-portal",
      environment: "All Environments",
      version: "v5.2.0",
      reporter: "Elena Rostova (QA Analyst)",
      description: `When dark mode is enabled in user settings, navigating between route pages or hard-refreshing causes a 150ms flash of unstyled light theme (FOUC).
No functional impact or errors in console, but poor user experience in low-light environments.`
    },
    logs: `2026-09-28T10:15:02.110Z [browser:console] INFO [ThemeContext] Initializing theme: system default (light)
2026-09-28T10:15:02.260Z [browser:console] INFO [ThemeContext] LocalStorage hydrated: found preference 'dark'
2026-09-28T10:15:02.261Z [browser:console] DEBUG [ThemeContext] Swapping data-theme attribute on <html> from 'light' to 'dark'
2026-09-28T10:15:02.262Z [browser:console] WARN [LayoutEngine] Potential layout shift detected: CLS 0.08`
  }
];

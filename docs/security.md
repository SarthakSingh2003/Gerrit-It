# Security Architecture & Threat Model — WikiGerritTracker

This document describes the security controls, privacy safeguards, and threat model implemented across **WikiGerritTracker**.

---

## 1. Threat Model & Boundaries

WikiGerritTracker is a public technical analytics utility designed to query public Wikimedia Gerrit records. It does not require user authentication, does not store passwords, and does not maintain persistent user databases.

```
[Browser Client]
       │
       ▼ (HTTPS Same-Origin REST)
[WikiGerritTracker API Gateway]
  - IP Rate Limiter (120 req/min)
  - Zod Request Schema Validation
  - SSRF Defense (Strict parameter whitelisting)
  - Sensitive Field Redaction in Logs
  - In-Flight Request Coalescing
       │
       ▼ (HTTPS Upstream Native Fetch)
[Wikimedia Gerrit REST API] (https://gerrit.wikimedia.org/r/)
```

---

## 2. Key Security Protections

### A. Server-Side Request Forgery (SSRF) Defense
- The backend does **not** expose an open proxy endpoint or accept arbitrary external URLs.
- All upstream Gerrit requests are strictly constructed using internal query builders (`query.builder.ts`) pointing exclusively to the configured `GERRIT_BASE_URL`.
- User-supplied identifiers and parameters are validated using Zod regexes (`^[a-zA-Z0-9_\-@.+ ]+$`) before inclusion into upstream query strings.

### B. Anti-XSSI Payload Sanitization
- Gerrit responses begin with an anti-cross-site-script-inclusion header (`)]}'\n`).
- The parser safely checks for and strips this exact prefix before passing clean content to JSON deserializers.
- If an upstream response is malformed, descriptive errors are logged internally, while a sanitized error is returned to the client.

### C. Rate Limiting & Denial of Service Protection
- An in-memory sliding window rate limiter protects backend endpoints against burst floods (default: 120 requests per IP per minute).
- When the rate limit is exceeded, HTTP 429 (`RATE_LIMIT_EXCEEDED`) is returned with a descriptive message.
- Single-flight request coalescing (`coalescing.ts`) merges concurrent identical queries so only one upstream fetch is dispatched to Gerrit.

### D. Privacy & Sensitive Data Safeguards
- **No Email Enumeration:** The application does not scrape, search, or display contributor email addresses. Only public display names, usernames, and numeric account IDs are surfaced.
- **Opt-in Search History:** Contributor search history is stored strictly in browser `localStorage` and only when the user has provided explicit consent (`wgt_consent_history = true`). A one-click "Clear" button is provided.
- **Sensitive Field Redaction:** Structured application logger automatically redacts sensitive keywords (`token`, `secret`, `password`, `authorization`, `cookie`) from log entries.
- **No Stack Trace Leakage:** Production error handling catches exceptions and returns standardized HTTP status codes and error payloads without exposing internal file paths or stack traces.

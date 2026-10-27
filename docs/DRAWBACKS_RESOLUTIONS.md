# Resolutions to the Five Documented Upstream Challenges

Gerrit-It resolves the five fundamental engineering bottlenecks that affect Wikimedia Gerrit data extraction:

---

## Drawback 1 — Rate Limiting, Timeouts and HTTP 504 Errors

### The Problem
Lifetime contributor queries and repeated pagination over thousands of patchsets can overload Wikimedia Gerrit, causing gateway timeouts (HTTP 504), rate limit penalties (HTTP 429), or hung requests.

### Engineering Resolution in Gerrit-It
1. **Dual-Tier Caching System:**
   - Primary tier: Redis caching with a configurable 4-hour default TTL (between 2 and 6 hours).
   - Secondary tier: Bounded in-memory LRU cache (`lru-cache`) supporting process-local execution and automatic degradation if Redis is unavailable.
   - Cache keys differentiate canonical contributor ID, query type, metric version, and date range (`wgt:summary:458:2024-01-01_2024-12-31:v1`).
2. **Single-Flight Request Coalescing (`coalescing.ts`):**
   - Simultaneous requests for the same contributor share a single in-flight upstream Gerrit promise, preventing duplicate upstream fetches.
3. **Resilient Retry Policy & Backoff:**
   - Exponential backoff with random jitter on retryable HTTP 429, 503, and 504 responses.
   - Respects upstream `Retry-After` response headers.
4. **Safety Pagination Budgets & Request Deadlines:**
   - Configurable page size (100 changes) and maximum page count (20 pages = 2,000 changes).
   - AbortController deadline (15 seconds per request).
   - Transparent metadata: Returns `complete: false` and a clear budget warning banner if a contributor has more records than the safety budget, never falsely labeling a truncated query as a lifetime total.
5. **No Silent Zeroes:**
   - Upstream errors surface structured error notifications with explanations; failed queries are never replaced with zero contributions.

---

## Drawback 2 — Fragmented User Identities

### The Problem
Historical contributions may be associated with changing usernames, old email addresses, or multiple Gerrit accounts over time. Blind heuristics or fuzzy matching risk erroneously merging distinct people or revealing private data.

### Engineering Resolution in Gerrit-It
1. **Canonical Account Identifier Resolution (`identity.resolver.ts`):**
   - Resolves usernames and numeric IDs through Gerrit `/accounts/?q=...` and `/accounts/<id>/detail`.
   - Uses Gerrit's canonical numeric `_account_id` as the primary key for all downstream queries (`owner:<account_id>`).
2. **No Heuristic Guesswork:**
   - Never merges accounts based on name similarity.
3. **Disambiguation Modal:**
   - If an input matches multiple public Gerrit accounts, the system returns an `AMBIGUOUS_ACCOUNT_RESOLUTION` response containing disambiguation candidates, allowing the user to select their exact account.
4. **Privacy Protection:**
   - Does not conduct email enumeration or publish private email addresses.
5. **Attribution Auditability:**
   - Displays canonical account ID and provides direct Gerrit profile links for manual verification.

---

## Drawback 3 — Browser Cross-Origin (CORS) Restrictions

### The Problem
Direct browser-to-Gerrit fetch calls fail due to cross-origin security restrictions and lack of CORS headers on arbitrary Gerrit endpoints.

### Engineering Resolution in Gerrit-It
1. **Same-Origin Backend Architecture:**
   - The browser communicates solely with Gerrit-It's `/api/*` endpoints.
   - In production, the backend serves both the static Vue bundle and the API on the same origin.
2. **SSRF and Injection Mitigation:**
   - No open proxying of arbitrary URLs.
   - User inputs are strictly validated with Zod and escaped via `query.builder.ts` before being incorporated into internal Gerrit queries.
3. **API Rate Limiting:**
   - Built-in IP rate limiter (120 requests/minute) protects against Denial of Service attacks.

---

## Drawback 4 — Missing Code Review and Mentorship Data

### The Problem
Traditional tools count only authored commits, completely overlooking code review participation, peer review approvals, test verification, and technical guidance.

### Engineering Resolution in Gerrit-It
1. **Strict Metric Separation:**
   - Authored code contributions (`owner:<id>`) and review actions (`reviewer:<id> -owner:<id>`) are tracked in separate data structures and never conflated into a misleading single total.
2. **Verified Approval Extraction:**
   - Extracts detailed label vote records using Gerrit's `&o=LABELS` query parameter.
   - Accurately counts:
     - Verified Approvals (`Code-Review +2`)
     - Review Recommendations (`Code-Review +1`)
     - Automated/Verified Checks (`Verified +1` / `+2`)
     - Actionable Critiques (`Code-Review -1` / `-2`)
3. **Strict Deduplication:**
   - Multiple reviews on different patch sets of the same change are counted once under *Distinct Changes Reviewed*.
   - Self-reviews are explicitly excluded (`-owner:<id>`).
4. **Clear Mentorship Disclaimer:**
   - Explicitly notes: *"Code reviews indicate technical collaboration and peer review support across repositories. Review volume alone does not prove or establish formal mentorship."*

---

## Drawback 5 — Wikimedia Codex Design System & Accessibility

### The Problem
Developer tools often use inconsistent, generic admin templates that violate Wikimedia accessibility standards, lack keyboard navigation, and fail color contrast or RTL requirements.

### Engineering Resolution in Gerrit-It
1. **Official Wikimedia Codex Foundations:**
   - Built with `@wikimedia/codex` and `@wikimedia/codex-icons`.
   - Adheres to official Codex design tokens, typography, and styling variables (`@wikimedia/codex/dist/codex.style.css`).
2. **WCAG Accessibility Compliance:**
   - Semantic HTML5 landmark structure (`header`, `nav`, `main`, `footer`, `section`, `role="region"`).
   - "Skip to main content" keyboard shortcut.
   - Full keyboard navigation with visible focus rings (`:focus-visible`).
   - Accessible ARIA labels and live status regions.
3. **High-Contrast & Non-Color Indicators:**
   - Status badges combine distinct icons, borders, and text tags in addition to colors.
4. **Theme & Direction Flexibility:**
   - Accessible Dark and Light themes with verified contrast ratios.
   - Built-in Right-to-Left (`dir="rtl"`) layout toggle.
   - Reduced-motion support respecting `prefers-reduced-motion`.
5. **Transparency & Disclaimer:**
   - Clear disclosure that Gerrit-It is an independent community utility licensed under GPL-3.0-or-later, not an official WMF certification service.

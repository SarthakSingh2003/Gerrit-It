# Testing Guide — Gerrit-It

Gerrit-It maintains a comprehensive automated test suite covering unit tests, integration tests, and component behavior.

---

## 1. Running Tests

### Running All Test Suites
Run all tests across the monorepo:

```bash
npm test
```

### Running Backend Tests Only
Runs Vitest for the Node.js backend:

```bash
npm run test:backend
```

### Running Frontend Tests Only
Runs Vitest and Vue Test Utils with JSDOM:

```bash
npm run test:frontend
```

### Running Tests in Watch Mode

```bash
# Backend watch mode
npm run test:watch --workspace=backend

# Frontend watch mode
npm run test --workspace=frontend -- --watch
```

---

## 2. Test Architecture & Coverage

### Backend Test Suite (`backend/tests/`)
1. **`parser.test.ts` (6 tests):**
   - Stripping Gerrit anti-XSSI security prefixes (`)]}'\n`).
   - Handling whitespace and clean JSON parsing.
   - Descriptive error handling for malformed or empty responses.
2. **`classifier.test.ts` (8 tests):**
   - Deterministic matching of MediaWiki Core, Extensions, Skins, Pywikibot, Codex, and Operations.
   - Safe fallback for unrecognized or empty repository strings.
   - Preservation of original project identifiers.
3. **`metric.calculator.test.ts` (5 tests):**
   - Lifetime authored metrics (merged, open, abandoned, diff sizes).
   - Review intelligence metrics (distinct changes, CR+2 approvals, recommendations, verified votes).
   - Filtering by custom date ranges respecting merge timestamps (`submitted`) for merged patches vs creation timestamps for open patches.
   - Category distribution percentages.
4. **`identity.resolver.test.ts` (4 tests):**
   - Numeric account ID resolution (`/accounts/<id>/detail`).
   - Single username match resolution.
   - Ambiguous matches yielding `AMBIGUOUS_ACCOUNT_RESOLUTION` error with candidate lists.
   - Account not found error handling (`ACCOUNT_NOT_FOUND`).
5. **`cache.test.ts` (4 tests):**
   - Bounded in-memory LRU cache insertion and retrieval within TTL.
   - Eviction of oldest items when max items limit is reached.
   - Key deletion, flush, and namespaced key generation.
6. **`report.service.test.ts` (2 tests):**
   - Verifiable Markdown scholarship dossier generation with direct Gerrit audit links.
   - Top impacted repository table slicing.
7. **`api.integration.test.ts` (7 tests):**
   - `GET /api/health`: Service health and uptime.
   - `GET /api/version`: Software version and GPL-3.0 license.
   - `GET /api/repositories/classification`: Active classification rules and category catalog.
   - `GET /api/fixtures/sample-contributor`: Fixture retrieval.
   - `GET /api/fixtures/sample-repositories`: Repository stats fixture.
   - `POST /api/cohorts/analyze`: Zod input validation on batch usernames.
   - `GET /api/nonexistent`: Structured 404 error handler.

### Frontend Test Suite (`frontend/tests/`)
1. **`ContributorSearch.test.ts` (3 tests):**
   - Search form rendering and router navigation.
   - Input trimming and submission handling.
   - Quick-launch sample contributor chips.
2. **`MetricCards.test.ts` (3 tests):**
   - Rendering all 8 core metrics with tooltips.
   - Calculation of merge rate percentage.
   - Cached status indicator and latency metadata.
3. **`RepositoryTable.test.ts` (3 tests):**
   - Tabulated repository rows with direct Gerrit audit links.
   - Real-time client-side search filtering.
   - Subsystem category chip filtering (`Core`, `Extension`, etc.).

---

## 3. Mock Fixtures & Live Gerrit Isolation

To ensure automated CI builds run deterministically without relying on upstream Gerrit network availability:
- Tests use deterministic mock fixtures located in `backend/tests/` and `/api/fixtures/*`.
- Upstream network failures are simulated in integration tests to ensure that gateway errors produce honest, actionable user error messages rather than misleading zeroes.

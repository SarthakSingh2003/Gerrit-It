# WikiGerritTracker Architecture

This document provides an overview of the data pipeline, subsystem breakdown, caching, concurrency, and classification rules.

## Data Pipeline Overview

```
[Browser Client]
       │
       ▼ (HTTPS Same-Origin REST /api/*)
[WikiGerritTracker Express Backend]
  ├── Input Validation (Zod schemas)
  ├── Identity Resolution (Gerrit /accounts/)
  ├── Request Coalescing (single-flight)
  ├── Cache Layer (Redis → in-memory LRU fallback)
  │
  ▼ (HTTPS Upstream / Native Fetch)
[Wikimedia Gerrit REST API]
  https://gerrit.wikimedia.org/r/
```

## Backend Modules

| Module | Location | Responsibility |
|---|---|---|
| Routes | `backend/src/routes/` | Express route handlers for all `/api/*` endpoints |
| Gerrit Client | `backend/src/gerrit/` | XSSI parser, query builder, identity resolver |
| Analytics | `backend/src/analytics/` | Metric calculator, date filters |
| Classification | `backend/src/classification/` | Deterministic regex engine for repo categories |
| Cache | `backend/src/cache/` | Redis adapter, bounded LRU fallback, request coalescer |
| Validation | `backend/src/validation/` | Zod runtime schemas for all inputs |
| Config | `backend/src/config/` | Validated environment configuration |

## Frontend Modules

| Module | Location | Responsibility |
|---|---|---|
| Views | `frontend/src/views/` | Dashboard, Contributor, Reviews, Reports, About |
| Components | `frontend/src/components/` | Codex UI components (Search, Metrics, Charts, Tables) |
| Composables | `frontend/src/composables/` | `useContributor`, `useTheme`, `useSearchHistory` |
| Services | `frontend/src/services/` | Type-safe API client (wraps `/api/*` endpoints) |
| Router | `frontend/src/router/` | Vue Router with route metadata |
| Styles | `frontend/src/styles/` | Codex CSS tokens, print styles, accessibility |

## Further Reading

- [DRAWBACKS_RESOLUTIONS.md](DRAWBACKS_RESOLUTIONS.md) — Gerrit rate-limiting, anti-XSSI parsing, pagination safety budgets, and identity resolution.
- [METRIC_DEFINITIONS.md](METRIC_DEFINITIONS.md) — Formulas separating authored commits from code reviews.
- [REPOSITORY_CLASSIFICATION.md](REPOSITORY_CLASSIFICATION.md) — Regex classification rules.
- [API_SPECIFICATION.md](API_SPECIFICATION.md) — Full REST API endpoint reference.

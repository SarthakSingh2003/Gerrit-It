# WikiGerritTracker

> **Wikimedia Gerrit Contributor Analytics, Code Review Intelligence & Reporting Platform**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Wikimedia Codex](https://img.shields.io/badge/Design%20System-Wikimedia%20Codex-00af89.svg)](https://doc.wikimedia.org/codex/)

**WikiGerritTracker** empowers Wikimedia technical contributors, developers, mentors, and affiliate communities to quantify their contributions to MediaWiki core, extensions, skins, bots, and infrastructure repositories.

It retrieves public contribution records directly from [Wikimedia Gerrit](https://gerrit.wikimedia.org/r/) and turns them into transparent, verifiable analytics, days-wise analysis, and independently auditable reports.

> **Project Status:** Active community tool. Independent open-source project; not an official Wikimedia Foundation product and has no official Wikimedia Foundation affiliation.

---

## Technology Stack

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vite 5, TypeScript 5.
- **Design System:** [@wikimedia/codex](https://doc.wikimedia.org/codex/) & [@wikimedia/codex-icons](https://www.npmjs.com/package/@wikimedia/codex-icons).
- **Backend:** Node.js (v22+), Express 4, TypeScript 5.
- **Validation & Parsing:** Zod runtime validation, custom Gerrit XSSI (`)]}'\n`) stream parser.
- **Caching & Resilience:** Dual-tier caching (Redis + bounded memory LRU fallback), single-flight promise coalescing, exponential backoff with jitter.
- **Testing:** Vitest (unit, integration, and component tests across frontend and backend).

---

## Key Features

- **Authored Code Analytics:** Quantifies patches authored, merged, open/in-review, and abandoned across all Wikimedia subsystems with exact diff line counts (+insertions / -deletions).
- **Code Review Intelligence:** Measures peer code review footprint (`reviewer:<id> -owner:<id>`), counting verified approvals (`Code-Review +2`), recommendations (`+1`), and test verifications (`Verified +1`) while strictly isolating review actions from authored code.
- **Repository Classification Engine:** Deterministic regex classification mapping Gerrit projects into `Core`, `Extension`, `Skin`, `Bot ecosystem`, `Design system`, `Infrastructure`, and `Other`.
- **Verifiable Contribution Report Generator:** Instantly generates Markdown and print-ready PDF reports with embedded Gerrit search and change links for independent verification.
- **Days-Wise Precision Filtering:** Select between 7, 14, 30, 60, 90, 180, 365 days, or custom date ranges.
- **Official Wikimedia Codex Design System:** Built with `@wikimedia/codex` and `@wikimedia/codex-icons`, featuring full keyboard navigation, accessible color contrast, light/dark themes, and RTL layout support.
- **Enterprise-Grade Resilience:** Resolves Gerrit rate limits and 504 timeouts using dual-tier caching (Redis + bounded memory LRU fallback), single-flight request coalescing, exponential backoff with jitter, and strict safety budgets.

---

## Architecture Overview

```
wikigerrittracker/
├── frontend/                     # Vue 3 + Vite + TypeScript + Wikimedia Codex
│   ├── src/
│   │   ├── components/           # Codex UI components (Search, Metrics, Charts, Tables, Reports)
│   │   ├── views/                # Views: Dashboard, Contributor, Reviews, Reports, About
│   │   ├── composables/          # useContributor, useTheme, useSearchHistory
│   │   ├── services/             # Type-safe API client
│   │   ├── router/               # Vue Router with metadata
│   │   └── styles/               # Codex CSS tokens, print styles, accessibility
│   └── tests/                    # Frontend Vitest test suite
├── backend/                      # Node.js (v22+) + TypeScript + Express
│   ├── src/
│   │   ├── routes/               # Health, Contributor, Repository, Fixture
│   │   ├── services/             # Contributor, Report services
│   │   ├── gerrit/               # Gerrit client, Query builder, XSSI parser, Identity resolver
│   │   ├── analytics/            # Metric calculator, Date filters, Types
│   │   ├── classification/       # Repository classifier rules and engine
│   │   ├── cache/                # Redis cache, bounded LRU fallback, Request coalescer
│   │   ├── validation/           # Zod runtime schemas
│   │   └── config/               # Validated environment configuration
│   └── tests/                    # Vitest unit and integration test suites
├── docs/                         # Technical documentation & drawback resolutions
└── package.json                  # Workspace orchestration
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v22+
- npm v11+

### Installation

```bash
git clone https://github.com/SarthakSingh2003/WikiGerritTracker.git
cd WikiGerritTracker

# Install root, backend, and frontend dependencies
npm install
```

### Environment Configuration

Copy the documented template:

```bash
cp .env.example .env
```

Key environment variables (documented with defaults in [.env.example](.env.example)):
- `PORT` (default: `3000`): Port for the Express backend server.
- `GERRIT_API_URL` (default: `https://gerrit.wikimedia.org/r`): Wikimedia Gerrit upstream API.
- `USE_FIXTURES` (default: `false`): Enable deterministic offline fixture mode (recommended for CI or offline dev).
- `CACHE_BACKEND` (default: `memory`): `memory` (in-process LRU) or `redis`.
- `REDIS_URL` (optional): Connection URL for Redis if `CACHE_BACKEND=redis`.
- `MAX_PAGINATION_LIMIT` (default: `500`): Upstream query safety limit to protect Gerrit resources.

### Running Locally

```bash
# Terminal 1: Start Backend (Port 3000)
npm run dev --workspace=backend

# Terminal 2: Start Frontend (Port 5173 with proxy to backend)
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

---

## Verification & Testing

```bash
# Run TypeScript type check across entire monorepo
npm run typecheck

# Run both backend and frontend test suites (45 tests total)
npm test

# Run backend unit and integration tests (36 tests)
npm run test:backend

# Run frontend component tests (9 tests)
npm run test:frontend
```

---

## API Overview

All backend endpoints return standardized JSON (`{ data, meta, error }`). Detailed specs are in [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md).

| Endpoint | Method | Description |
|---|---|---|
| `/healthz` or `/api/health` | `GET` | Operational health check, uptime, cache metrics |
| `/api/version` | `GET` | Version and environment metadata |
| `/api/contributors/:id` | `GET` | Canonical Gerrit identity resolution |
| `/api/contributors/:id/summary` | `GET` | Contribution metrics (authored vs reviews, subsystem split) |
| `/api/contributors/:id/repositories` | `GET` | Per-repository patch and review aggregations |
| `/api/contributors/:id/changes` | `GET` | Normalized patch listings (authored or reviewed) |
| `/api/contributors/:id/reviews` | `GET` | Peer review breakdown (CR+2 approvals, recommendations) |
| `/api/contributors/:id/report` | `GET` | Verifiable scholarship dossier (JSON or Markdown) |
| `/api/cohorts/analyze` | `POST` | Batch group analytics with deduplicated repo counts |
| `/api/repositories/classification` | `GET` | Classification engine regex rules and tester |

---

## Known Limitations

- **Gerrit Pagination Safety Ceiling:** By default, upstream Gerrit queries are bounded to 500 changes per category to avoid triggering Gerrit HTTP 504 Gateway Timeouts or consuming excessive upstream resources.
- **Identity Resolution:** Gerrit search queries require exact account usernames, registered emails, or numeric Gerrit Account IDs. Nicknames not registered in Gerrit cannot be resolved.
- **Offline Mode:** Live Gerrit querying requires an active Internet connection to `https://gerrit.wikimedia.org/r/`. For offline testing or isolated CI environments, set `USE_FIXTURES=true`.
- **Review Timestamp Isolation:** Review events reflect patch activity recorded in Gerrit Change messages; individual patch sets without score changes are aggregated under their parent change.

---

## Production Build

```bash
# Build production bundles (both backend and frontend)
npm run build

# Start production server (serves frontend static build and /api)
npm start
```


---

## Contributing & Community

Contributions are warmly welcome! Please see:
- [CONTRIBUTING.md](CONTRIBUTING.md) for local development, commit style, and PR workflow.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.
- [SECURITY.md](SECURITY.md) for responsible vulnerability disclosure.
- [SUPPORT.md](SUPPORT.md) for questions and support channels.

---

## License

This project is licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)**. See the [LICENSE](LICENSE) file for details.


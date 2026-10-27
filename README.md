# Gerrit-It

> **Wikimedia Gerrit Contributor Analytics, Code Review Intelligence & Reporting Platform**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Wikimedia Codex](https://img.shields.io/badge/Design%20System-Wikimedia%20Codex-00af89.svg)](https://doc.wikimedia.org/codex/)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**Gerrit-It** empowers Wikimedia technical contributors, developers, mentors, and affiliate communities to quantify their contributions to MediaWiki core, extensions, skins, bots, and infrastructure repositories.

It retrieves public contribution records directly from [Wikimedia Gerrit](https://gerrit.wikimedia.org/r/) and turns them into transparent, verifiable analytics, days-wise analysis, and independently auditable reports.

> **Project Status:** Active community tool. Independent open-source project; not an official Wikimedia Foundation product and has no official Wikimedia Foundation affiliation.

---

## Technology Stack

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vite 6, TypeScript 5.
- **Design System:** [@wikimedia/codex](https://doc.wikimedia.org/codex/) & [@wikimedia/codex-icons](https://www.npmjs.com/package/@wikimedia/codex-icons).
- **Backend:** Node.js (v20+), Express 4, TypeScript 5.
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
gerrit-it/
├── frontend/                     # Vue 3 + Vite + TypeScript + Wikimedia Codex
│   ├── src/
│   │   ├── components/           # Codex UI components (Search, Metrics, Charts, Tables, Reports)
│   │   ├── views/                # Views: Dashboard, Contributor, Reviews, Reports, About
│   │   ├── composables/          # useContributor, useTheme, useSearchHistory
│   │   ├── services/             # Type-safe API client
│   │   ├── router/               # Vue Router with metadata
│   │   └── styles/               # Codex CSS tokens, print styles, accessibility
│   └── tests/                    # Frontend Vitest test suite
├── backend/                      # Node.js (v20+) + TypeScript + Express
│   ├── src/
│   │   ├── routes/               # Health, Contributor, Repository, Fixture, Cohort
│   │   ├── services/             # Contributor, Report, Cohort services
│   │   ├── gerrit/               # Gerrit client, Query builder, XSSI parser, Identity resolver
│   │   ├── analytics/            # Metric calculator, Date filters, Types
│   │   ├── classification/       # Repository classifier rules and engine
│   │   ├── cache/                # Redis cache, bounded LRU fallback, Request coalescer
│   │   ├── validation/           # Zod runtime schemas
│   │   └── config/               # Validated environment configuration
│   └── tests/                    # Vitest unit and integration test suites
├── docs/                         # Technical documentation & drawback resolutions
├── Procfile                      # Toolforge / buildpack web service definition
└── package.json                  # Workspace orchestration
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v20+
- npm v10+

### Installation

```bash
git clone https://github.com/SarthakSingh2003/Gerrit-It.git
cd Gerrit-It

# Install root, backend, and frontend dependencies
npm install
```

### Environment Configuration

Copy the documented template:

```bash
cp .env.example .env
```

Key environment variables (documented with defaults in [.env.example](.env.example)):
- `PORT` (default: `3000` in dev, `8000` in production/Toolforge): Port for the Express backend server.
- `GERRIT_BASE_URL` (default: `https://gerrit.wikimedia.org/r`): Wikimedia Gerrit upstream API.
- `REDIS_URL` (optional): Connection URL for Redis if available (automatically falls back to in-memory LRU).
- `GERRIT_MAX_PAGES` (default: `20`): Upstream query safety limit to protect Gerrit resources.
- `RATE_LIMIT_MAX_REQUESTS` (default: `120`): Maximum requests per minute per IP.

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

# Run both backend and frontend test suites
npm test

# Run backend unit and integration tests
npm run test:backend

# Run frontend component tests
npm run test:frontend
```

---

## Production Build & Wikimedia Toolforge Deployment

### 1. Build Production Bundles

```bash
# Builds both backend (tsc) and frontend (vite build)
npm run build

# Start production server (serves frontend static assets and /api)
npm start
```

### 2. Deploying to Wikimedia Toolforge (Node 20)

Gerrit-It is fully optimized for **Wikimedia Toolforge** running on Kubernetes with **Node 20**.

#### Option A: Toolforge Build Service (Recommended)

1. SSH into Toolforge and switch to your tool account:
   ```bash
   become <toolname>
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/<your-username>/Gerrit-It.git app
   cd app
   ```
3. Build the container using the Toolforge Build Service:
   ```bash
   toolforge build start https://github.com/<your-username>/Gerrit-It
   ```
4. Start the webservice:
   ```bash
   toolforge webservice buildservice start --mount=all
   ```

#### Option B: Toolforge Kubernetes Web Service (`node20`)

1. Inside your tool directory, install dependencies and build:
   ```bash
   npm ci
   npm run build
   ```
2. Start the Node 20 Kubernetes webservice:
   ```bash
   webservice --backend=kubernetes node20 start
   ```
   *Note: In production mode, the server automatically binds to port `8000` as required by the Toolforge Kubernetes ingress router.*

3. Inspect service logs and status:
   ```bash
   webservice status
   webservice logs
   ```

For detailed setup instructions, see [docs/TOOLFORGE.md](docs/TOOLFORGE.md).

---

## API Overview

All backend endpoints return standardized JSON (`{ data, meta, error }`). Detailed specs are in [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md).

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Operational health check, uptime, cache metrics |
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

- **Gerrit Pagination Safety Ceiling:** Upstream Gerrit queries are bounded by pagination limits (`GERRIT_MAX_PAGES`) to avoid triggering Gerrit HTTP 504 Gateway Timeouts or consuming excessive upstream resources.
- **Identity Resolution:** Gerrit search queries require exact account usernames, registered emails, or numeric Gerrit Account IDs. Nicknames not registered in Gerrit cannot be resolved.
- **Review Timestamp Isolation:** Review events reflect patch activity recorded in Gerrit Change messages; individual patch sets without score changes are aggregated under their parent change.

---

## Contributing & Community

Contributions are warmly welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for local development, commit style, and PR workflow.

---

## License

This project is licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)**. See the [LICENSE](LICENSE) file for the full license text.


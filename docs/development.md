# Developer Guide — Gerrit-It

This guide explains how to set up, build, and debug **Gerrit-It** locally.

---

## 1. Prerequisites

- **Node.js:** v20.x or later (Native `fetch` and modern ECMAScript support)
- **npm:** v11.x or later
- **Git**
- Optional: **Redis** (if testing distributed caching; bounded in-memory LRU fallback runs automatically if Redis is absent)

---

## 2. Local Setup

Clone and install dependencies:

```bash
git clone https://github.com/SarthakSingh2003/WikiGerritTracker.git
cd WikiGerritTracker
npm install
```

Copy the environment template:

```bash
cp .env.example .env
```

---

## 3. Running in Development Mode

The project operates as an npm monorepo with two active workspaces: `backend` and `frontend`.

### Running with Dual Terminals (Recommended)

**Terminal 1 — Backend:**
```bash
npm run dev --workspace=backend
```
Runs the Express backend with hot reloading via `tsx watch` on `http://localhost:3000`.

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
```
Runs the Vite development server with Hot Module Replacement (HMR) on `http://localhost:5173`.
Vite is preconfigured to proxy `/api/*` requests directly to `http://localhost:3000`.

---

## 4. Offline & Mock Fixture Mode

For development without an active internet connection or when upstream Gerrit is experiencing network issues:
- Pre-built fixture endpoints are available at `/api/fixtures/sample-contributor` and `/api/fixtures/sample-repositories`.
- The sample contributor profiles (`legoktm`, `reedy`, `krinkle`) provide rich test data spanning Core, Extensions, Skins, Codex, and Pywikibot.

---

## 5. Code Style & Tooling

- **Indentation & Formatting:** Defined in `.editorconfig` (2 spaces, LF line endings, utf-8).
- **TypeScript Typechecking:**
  ```bash
  npm run typecheck
  ```
- **Automated Tests:**
  ```bash
  npm test
  ```
- **Building for Production:**
  ```bash
  npm run build
  ```
  Generates `backend/dist` via `tsc` and `frontend/dist` via `vite build`.

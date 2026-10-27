# Contributing to Gerrit-It

Thank you for your interest in contributing to **Gerrit-It**! We welcome contributions from developers, designers, technical writers, and Wikimedia community members.

This document outlines the development workflow, testing standards, and pull request guidelines.

---

## 1. Community Guidelines

All contributors are expected to uphold a welcoming, respectful, and collaborative environment in alignment with the [Wikimedia Universal Code of Conduct](https://foundation.wikimedia.org/wiki/Policy:Universal_Code_of_Conduct).

---

## 2. Setting Up the Development Environment

### Prerequisites
- **Node.js:** v20.x or later
- **npm:** v10.x or later
- **Git**

### Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/SarthakSingh2003/WikiGerritTracker.git
cd WikiGerritTracker
npm install
```

### Running Locally

```bash
# Terminal 1: Start the Backend (Port 3000)
npm run dev --workspace=backend

# Terminal 2: Start the Frontend with Vite Dev Server (Port 5173, proxies /api to port 3000)
npm run dev:frontend
```

Visit `http://localhost:5173` in your browser.

---

## 3. Architecture & Guidelines

### Monorepo Structure
- `backend/`: Node.js Express service handling Gerrit REST communication, identity resolution, classification, caching, and analytics.
- `frontend/`: Vue 3 application built with Wikimedia Codex components and icons.
- `docs/`: In-depth architectural and testing documentation.

### Core Development Principles
1. **Never Fetch Gerrit Directly from the Browser:** All Gerrit requests must pass through the backend to protect against CORS issues and to ensure query validation, sanitization, and caching.
2. **Strict Identity Integrity:** Never guess or heuristically merge accounts. Always use canonical numeric account IDs (`_account_id`).
3. **Isolate Authored from Reviewed Code:** Never combine authored commits with code review votes into a single number.
4. **Use Wikimedia Codex:** When building UI features, use official Codex components (`@wikimedia/codex`) and design tokens (`codex.style.css`).
5. **No Placeholders or Fabricated Data:** Display authentic API responses or clearly labeled fixtures in mock mode.

---

## 4. Testing & Verification

Every pull request must pass the automated test suite and typechecks:

```bash
# Run both backend and frontend tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run TypeScript typechecks
npm run typecheck
```

When adding new analytical calculations, Gerrit query patterns, or repository classification rules, include corresponding unit tests in `backend/tests/` or `frontend/tests/`.

---

## 5. Pull Request Process

1. Create a descriptive feature branch from `master`:
   ```bash
   git checkout -b feature/my-enhancement
   ```
2. Ensure `.editorconfig` formatting rules are followed (2 spaces, LF line endings, no trailing whitespace).
3. Verify that all automated tests and typechecks pass locally.
4. Verify that no secrets, local machine paths, or private configuration files are included:
   ```bash
   git status
   ```
5. Submit your pull request with a concise description following our pull request template.

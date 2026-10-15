<template>
  <div class="wgt-about-page">
    <div class="wgt-about-card">
      <h1 class="wgt-about-title">About WikiGerritTracker</h1>
      <p class="wgt-lead">
        WikiGerritTracker is an open-source analytics, code review intelligence, and verifiable contribution reporting platform for the Wikimedia technical community.
      </p>

      <hr class="wgt-divider" />

      <section class="wgt-section">
        <h2>Architecture & Resolutions to Key Technical Challenges</h2>
        <p>WikiGerritTracker addresses critical challenges in analyzing Wikimedia Gerrit data:</p>

        <div class="wgt-challenge-item">
          <h3>1. Rate Limiting, Timeouts & Resilience</h3>
          <p>
            Wikimedia Gerrit serves millions of patch sets. To prevent gateway timeouts (HTTP 504) and avoid overloading upstream infrastructure, WikiGerritTracker implements dual-tier caching (Redis with bounded in-memory LRU fallback, default 4-hour TTL), single-flight request coalescing (in-flight promise deduping), exponential backoff with jitter on 429/503/504 responses, and strict pagination safety budgets.
          </p>
        </div>

        <div class="wgt-challenge-item">
          <h3>2. Canonical Identity Resolution</h3>
          <p>
            Historical contributions often involve changing usernames or usernames differing from display names. WikiGerritTracker resolves contributors against Gerrit's canonical account endpoint (<code>_account_id</code>) without heuristic merging or guesswork. If an input matches multiple accounts, a disambiguation modal allows users to select their exact account.
          </p>
        </div>

        <div class="wgt-challenge-item">
          <h3>3. Same-Origin Backend & CORS Security</h3>
          <p>
            Direct browser calls to Gerrit fail due to cross-origin security rules. WikiGerritTracker provides a hardened Node.js/Express backend that validates all queries with Zod, limits upstream parameters, eliminates SSRF attack vectors, and serves same-origin REST endpoints.
          </p>
        </div>

        <div class="wgt-challenge-item">
          <h3>4. Code Review Intelligence & Collaboration</h3>
          <p>
            Traditional counters only tally authored commits, ignoring peer code review, verification, and technical guidance. WikiGerritTracker strictly isolates authored patches from review contributions, counting distinct changes reviewed, Code-Review +2 approvals, and recommendations, while clearly explaining that review volume alone does not prove formal 1-on-1 mentorship.
          </p>
        </div>

        <div class="wgt-challenge-item">
          <h3>5. Wikimedia Codex Design System & Accessibility</h3>
          <p>
            Built using Wikimedia Codex components and design tokens (<code>@wikimedia/codex</code>), WikiGerritTracker adheres to WCAG accessibility guidelines, supporting keyboard navigation, visible focus rings, high-contrast statuses, right-to-left layout direction, reduced-motion preferences, and screen-reader announcements.
          </p>
        </div>
      </section>

      <hr class="wgt-divider" />

      <section class="wgt-section">
        <h2>License & Community Notice</h2>
        <p>
          WikiGerritTracker is free software released under the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GNU General Public License v3.0 or later (GPL-3.0-or-later)</a>.
        </p>
        <p class="wgt-disclaimer-note">
          <strong>Community Notice:</strong> WikiGerritTracker is an independent technical utility developed for Wikimedia contributors. All analytical reports and metrics are compiled from public Gerrit REST API records and do not constitute official certification or endorsement by the Wikimedia Foundation.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.wgt-about-page {
  padding: 1.5rem 0 3rem;
}

.wgt-about-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2.75rem;
  box-shadow: var(--wgt-shadow-card);
  max-width: 1300px;
  margin: 0 auto;
}

.wgt-about-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
  margin-bottom: 0.5rem;
}

.wgt-lead {
  font-size: 1.1rem;
  color: var(--wgt-text-secondary);
  line-height: 1.5;
}

.wgt-divider {
  border: none;
  border-top: 1px solid var(--wgt-border-light);
  margin: 1.75rem 0;
}

.wgt-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.wgt-section h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--wgt-text-primary);
}

.wgt-challenge-item {
  background-color: var(--wgt-bg-subtle);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius);
  padding: 1.1rem 1.25rem;
}

.wgt-challenge-item h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--wgt-color-primary);
  margin-bottom: 0.4rem;
}

.wgt-challenge-item p {
  font-size: 0.9rem;
  color: var(--wgt-text-primary);
  line-height: 1.5;
}

.wgt-disclaimer-note {
  font-size: 0.85rem;
  color: var(--wgt-text-subtle);
  line-height: 1.45;
  background-color: var(--wgt-bg-subtle);
  padding: 0.85rem 1rem;
  border-radius: var(--wgt-radius);
}
</style>

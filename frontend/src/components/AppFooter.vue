<template>
  <footer class="wgt-footer wgt-no-print" role="contentinfo">
    <div class="wgt-container wgt-footer-inner">
      <div class="wgt-footer-col">
        <p class="wgt-footer-title">Gerrit-It</p>
        <p class="wgt-footer-desc">
          Wikimedia Gerrit Contributor Analytics, Code Review Intelligence & Contribution Reporting Platform.
        </p>
        <p class="wgt-footer-legal">
          Licensed under the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GNU General Public License v3.0 or later (GPL-3.0-or-later)</a>.
        </p>
      </div>

      <div class="wgt-footer-col">
        <p class="wgt-footer-heading">Wikimedia Resources</p>
        <ul class="wgt-footer-links">
          <li><a href="https://gerrit.wikimedia.org/r/" target="_blank" rel="noopener">Wikimedia Gerrit Upstream</a></li>
          <li><a href="https://doc.wikimedia.org/codex/" target="_blank" rel="noopener">Wikimedia Codex Design System</a></li>
          <li><a href="https://www.mediawiki.org/wiki/Developer_hub" target="_blank" rel="noopener">MediaWiki Developer Hub</a></li>
        </ul>
      </div>

      <div class="wgt-footer-col">
        <p class="wgt-footer-heading">Community & Attribution</p>
        <p class="wgt-footer-disclaimer">
          Gerrit-It is an independent community utility for technical contributors and developer communities. It retrieves public Gerrit records and does not constitute official certification by the Wikimedia Foundation.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.wgt-footer {
  background-color: var(--wgt-bg-surface);
  border-top: 1px solid var(--wgt-border-subtle);
  margin-top: 3rem;
  padding: 2.5rem 0 2rem;
  font-size: 0.85rem;
  color: var(--wgt-text-secondary);
}

.wgt-footer-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 2rem;
}

.wgt-footer-title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--wgt-text-primary);
  margin-bottom: 0.4rem;
}

.wgt-footer-desc {
  margin-bottom: 0.6rem;
  line-height: 1.4;
}

.wgt-footer-legal {
  font-size: 0.78rem;
  color: var(--wgt-text-subtle);
}

.wgt-footer-heading {
  font-weight: 600;
  color: var(--wgt-text-primary);
  margin-bottom: 0.6rem;
}

.wgt-footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.wgt-footer-disclaimer {
  line-height: 1.4;
  font-size: 0.8rem;
  color: var(--wgt-text-subtle);
}

@media (max-width: 640px) {
  .wgt-footer {
    margin-top: 2rem;
    padding: 1.75rem 0 1.5rem;
  }

  .wgt-footer-inner {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>

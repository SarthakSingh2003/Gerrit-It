<template>
  <div class="wgt-dashboard-page">
    <!-- Hero Banner -->
    <section class="wgt-hero" aria-label="Hero Section">
      <div class="wgt-hero-content">
        <h1 class="wgt-hero-title">
          Quantify Your <span class="wgt-title-gradient">Technical Impact</span> Across Wikimedia
        </h1>
        <p class="wgt-hero-subtitle">
          Retrieve public contribution information directly from Wikimedia Gerrit and transform it into transparent, independently verifiable analytics, days-wise activity breakdowns, and community reports.
        </p>

        <!-- Main Search Component -->
        <div class="wgt-hero-search">
          <ContributorSearch />
        </div>

        <!-- Hero Ecosystem Highlights -->
        <div class="wgt-hero-stats" role="region" aria-label="Ecosystem Scope Highlights">
          <div class="wgt-hero-stat-item">
            <span class="wgt-hstat-num">2,500+</span>
            <span class="wgt-hstat-label">Tracked Repositories</span>
          </div>
          <div class="wgt-hero-stat-sep" aria-hidden="true"></div>
          <div class="wgt-hero-stat-item">
            <span class="wgt-hstat-num">Days-Wise</span>
            <span class="wgt-hstat-label">7 to 365 Days Analysis</span>
          </div>
          <div class="wgt-hero-stat-sep" aria-hidden="true"></div>
          <div class="wgt-hero-stat-item">
            <span class="wgt-hstat-num">CR+2 & +1</span>
            <span class="wgt-hstat-label">Peer Review Intelligence</span>
          </div>
          <div class="wgt-hero-stat-sep" aria-hidden="true"></div>
          <div class="wgt-hero-stat-item">
            <span class="wgt-hstat-num">Audit Ready</span>
            <span class="wgt-hstat-label">Markdown & PDF Reports</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Days-Wise Analysis Showcase Banner -->
    <section class="wgt-days-banner" aria-label="Days-Wise Analysis Showcase">
      <div class="wgt-days-banner-inner">
        <div class="wgt-days-banner-text">
          <div class="wgt-days-pill">📅 Precision Time Filtering</div>
          <h2 class="wgt-days-title">Days-Wise Activity & Performance Breakdown</h2>
          <p class="wgt-days-desc">
            Filter and isolate contribution metrics by exact timeframes: <strong>7 days</strong>, <strong>14 days</strong>, <strong>30 days</strong>, <strong>60 days</strong>, <strong>90 days</strong>, <strong>180 days</strong>, and <strong>365 days</strong>, or specify custom date ranges with zero guesswork.
          </p>
        </div>
        <div class="wgt-days-chips-preview">
          <span class="wgt-dchip active">Last 7 Days</span>
          <span class="wgt-dchip active">Last 14 Days</span>
          <span class="wgt-dchip active">Last 30 Days</span>
          <span class="wgt-dchip active">Last 60 Days</span>
          <span class="wgt-dchip active">Last 90 Days</span>
          <span class="wgt-dchip active">Last 180 Days</span>
          <span class="wgt-dchip active">Last 365 Days</span>
          <span class="wgt-dchip">All Time</span>
        </div>
      </div>
    </section>

    <!-- Key Capabilities Grid -->
    <section class="wgt-features-section" aria-label="Key Capabilities">
      <div class="wgt-features-header">
        <h2 class="wgt-features-heading">Engineered for Wikimedia Technical Contributors</h2>
        <p class="wgt-features-subheading">
          Comprehensive Gerrit data extraction designed to provide auditable transparency across every MediaWiki subsystem.
        </p>
      </div>

      <div class="wgt-features-grid">
        <div class="wgt-feature-card">
          <div class="wgt-feature-header">
            <div class="wgt-feature-icon">🔍</div>
            <span class="wgt-feature-badge">Code Authoring</span>
          </div>
          <h3 class="wgt-feature-title">Authored Patches & Merges</h3>
          <p class="wgt-feature-desc">
            Analyze your patchsets across MediaWiki Core, extensions, skins, and infrastructure with precise distinction between merged, open, and abandoned statuses.
          </p>
          <div class="wgt-feature-footer">
            <router-link to="/user/legoktm" class="wgt-feature-link">
              <span>View Sample Contributions</span>
              <span aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>

        <div class="wgt-feature-card">
          <div class="wgt-feature-header">
            <div class="wgt-feature-icon">⚖️</div>
            <span class="wgt-feature-badge badge-purple">Code Review</span>
          </div>
          <h3 class="wgt-feature-title">Code Review Intelligence</h3>
          <p class="wgt-feature-desc">
            Measures your peer review activity and verified approvals (Code-Review +2 / +1) without conflating review actions with authored commits.
          </p>
          <div class="wgt-feature-footer">
            <router-link to="/user/legoktm/reviews" class="wgt-feature-link">
              <span>Explore Review Insights</span>
              <span aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>

        <div class="wgt-feature-card">
          <div class="wgt-feature-header">
            <div class="wgt-feature-icon">📜</div>
            <span class="wgt-feature-badge badge-teal">Export Dossier</span>
          </div>
          <h3 class="wgt-feature-title">Verifiable Report Generator</h3>
          <p class="wgt-feature-desc">
            Instantly export Markdown or print-friendly PDF reports with granular days-wise contribution history, code review verifications, and repository impact.
          </p>
          <div class="wgt-feature-footer">
            <router-link to="/user/legoktm/report" class="wgt-feature-link">
              <span>Generate Report</span>
              <span aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ContributorSearch from '../components/ContributorSearch.vue';
</script>

<style scoped>
.wgt-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem 0 3.5rem;
  width: 100%;
}

.wgt-hero {
  background: linear-gradient(135deg, rgba(51, 102, 204, 0.08) 0%, rgba(0, 175, 137, 0.06) 50%, var(--wgt-bg-base) 100%);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 4.5rem 3rem;
  text-align: center;
  box-shadow: var(--wgt-shadow-card);
}

[data-theme="dark"] .wgt-hero {
  background: linear-gradient(135deg, #162438 0%, #102523 50%, var(--wgt-bg-surface) 100%);
  border-color: var(--wgt-border-subtle);
}

.wgt-hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}


.wgt-hero-title {
  font-size: 3.1rem;
  font-weight: 850;
  color: var(--wgt-text-primary);
  line-height: 1.18;
  letter-spacing: -0.03em;
}

.wgt-title-gradient {
  background: linear-gradient(135deg, #3366cc 20%, #00af89 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

[data-theme="dark"] .wgt-title-gradient {
  background: linear-gradient(135deg, #699bf7 20%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.wgt-hero-subtitle {
  font-size: 1.2rem;
  color: var(--wgt-text-secondary);
  line-height: 1.6;
  max-width: 960px;
}

.wgt-hero-search {
  width: 100%;
  max-width: 920px;
  margin-top: 1rem;
}

.wgt-hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.75rem;
  margin-top: 1.5rem;
  padding: 1.1rem 2rem;
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.wgt-hero-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.wgt-hstat-num {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
  line-height: 1;
}

.wgt-hstat-label {
  font-size: 0.78rem;
  color: var(--wgt-text-subtle);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.wgt-hero-stat-sep {
  width: 1px;
  height: 28px;
  background-color: var(--wgt-border-subtle);
}

/* Days-Wise Showcase Banner */
.wgt-days-banner {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2rem 2.5rem;
  box-shadow: var(--wgt-shadow-card);
}

.wgt-days-banner-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.wgt-days-banner-text {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wgt-days-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #00af89;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.wgt-days-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
}

.wgt-days-desc {
  font-size: 0.95rem;
  color: var(--wgt-text-secondary);
  line-height: 1.5;
}

.wgt-days-chips-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 520px;
}

.wgt-dchip {
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--wgt-border-subtle);
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-secondary);
}

.wgt-dchip.active {
  background-color: var(--wgt-bg-accent);
  color: var(--wgt-color-primary);
  border-color: var(--wgt-color-primary);
}

/* Features Grid */
.wgt-features-section {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.wgt-features-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.wgt-features-heading {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
}

.wgt-features-subheading {
  font-size: 1rem;
  color: var(--wgt-text-secondary);
  max-width: 700px;
}

.wgt-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.75rem;
}

.wgt-feature-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2.25rem 2rem;
  box-shadow: var(--wgt-shadow-card);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.wgt-feature-card:hover {
  transform: translateY(-3px);
  border-color: var(--wgt-color-primary);
  box-shadow: var(--wgt-shadow-elevated);
}

.wgt-feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.wgt-feature-icon {
  font-size: 2.2rem;
  line-height: 1;
}

.wgt-feature-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-secondary);
}

.badge-purple {
  background-color: #f3e8ff;
  color: #7b1fa2;
}

.badge-teal {
  background-color: #d5fdf0;
  color: #046b4c;
}

.badge-orange {
  background-color: #ffedd5;
  color: #c2410c;
}

[data-theme="dark"] .badge-purple {
  background-color: #2e1065;
  color: #d8b4fe;
}

[data-theme="dark"] .badge-teal {
  background-color: #064e3b;
  color: #6ee7b7;
}

[data-theme="dark"] .badge-orange {
  background-color: #431407;
  color: #fdba74;
}

.wgt-feature-title {
  font-size: 1.25rem;
  font-weight: 750;
  color: var(--wgt-text-primary);
}

.wgt-feature-desc {
  font-size: 0.95rem;
  color: var(--wgt-text-secondary);
  line-height: 1.55;
  flex: 1;
}

.wgt-feature-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--wgt-border-light);
}

.wgt-feature-link {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--wgt-color-primary);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  transition: gap 0.15s ease;
}

.wgt-feature-link:hover {
  text-decoration: underline;
  gap: 0.55rem;
}

@media (max-width: 900px) {
  .wgt-hero {
    padding: 3rem 1.5rem;
  }
  .wgt-hero-title {
    font-size: 2.25rem;
  }
  .wgt-hero-stat-sep {
    display: none;
  }
}
</style>

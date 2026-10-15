<template>
  <div class="wgt-metrics-wrapper" role="region" aria-label="Contributor Metrics Overview">
    <!-- Header metadata banner: Cached status, Last Updated, Completeness -->
    <div class="wgt-meta-banner">
      <div class="wgt-meta-left">
        <span class="wgt-meta-tag" :title="summary.metadata.cached ? 'Served from Redis/Memory Cache' : 'Retrieved live from Gerrit'">
          <span class="wgt-meta-indicator" :class="{ 'indicator-cached': summary.metadata.cached }"></span>
          {{ summary.metadata.cached ? 'Cached' : 'Live Data' }}
        </span>
        <span class="wgt-meta-latency">Query Latency: {{ summary.metadata.queryExecutionMs }}ms</span>
        <span class="wgt-meta-records">Records Retrieved: {{ summary.metadata.recordsRetrieved }}</span>
      </div>
      <div class="wgt-meta-right">
        <span class="wgt-meta-time">Updated: {{ formattedDate }}</span>
        <span v-if="summary.metadata.paginationBudgetHit" class="wgt-partial-warning" title="Results capped at safety limit">
          Budget Capped
        </span>
      </div>
    </div>

    <!-- The 8 Metric Cards -->
    <div class="wgt-cards-grid">
      <!-- 1. Total Authored -->
      <div class="wgt-metric-card" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Total Authored</span>
          <span class="wgt-tooltip-trigger" title="Total public patch changes owned by this account within the selected period">i</span>
        </div>
        <div class="wgt-card-value">{{ summary.authored.totalAuthored.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span>+{{ summary.authored.totalInsertions.toLocaleString() }} / -{{ summary.authored.totalDeletions.toLocaleString() }} lines</span>
        </div>
      </div>

      <!-- 2. Merged Changes -->
      <div class="wgt-metric-card metric-merged" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Merged Patches</span>
          <span class="wgt-tooltip-trigger" title="Changes reviewed, verified, and successfully submitted into upstream git branches">i</span>
        </div>
        <div class="wgt-card-value text-merged">{{ summary.authored.merged.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span class="wgt-rate-badge">{{ mergeRate }}% merge rate</span>
        </div>
      </div>

      <!-- 3. Open / In Review -->
      <div class="wgt-metric-card metric-open" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Open / In Review</span>
          <span class="wgt-tooltip-trigger" title="Active patches pending further code review, CI verification, or author updates">i</span>
        </div>
        <div class="wgt-card-value text-open">{{ summary.authored.open.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span>Awaiting review or CI</span>
        </div>
      </div>

      <!-- 4. Abandoned -->
      <div class="wgt-metric-card metric-abandoned" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Abandoned Patches</span>
          <span class="wgt-tooltip-trigger" title="Patches closed without merging (e.g. superseded by alternative approach or duplicate)">i</span>
        </div>
        <div class="wgt-card-value text-abandoned">{{ summary.authored.abandoned.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span>Closed without merging</span>
        </div>
      </div>

      <!-- 5. Reviewed Changes -->
      <div class="wgt-metric-card metric-reviewed" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Distinct Changes Reviewed</span>
          <span class="wgt-tooltip-trigger" title="Peer changes where this contributor participated as a reviewer (excluding self-reviews)">i</span>
        </div>
        <div class="wgt-card-value text-reviewed">{{ summary.reviews.distinctChangesReviewed.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span>Across {{ summary.reviews.uniqueReviewRepositories }} repositories</span>
        </div>
      </div>

      <!-- 6. Verified Approvals -->
      <div class="wgt-metric-card metric-approvals" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Verified Approvals (+2)</span>
          <span class="wgt-tooltip-trigger" title="Changes where contributor cast a Code-Review +2 vote approving the change for merge">i</span>
        </div>
        <div class="wgt-card-value text-approvals">{{ summary.reviews.approvalsCount.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span>+{{ summary.reviews.recommendationsCount }} CR+1 recommendations</span>
        </div>
      </div>

      <!-- 7. Repositories Impacted -->
      <div class="wgt-metric-card" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">Repositories Impacted</span>
          <span class="wgt-tooltip-trigger" title="Distinct Gerrit repositories touched by authored code commits">i</span>
        </div>
        <div class="wgt-card-value">{{ summary.authored.uniqueRepositories.toLocaleString() }}</div>
        <div class="wgt-card-footer">
          <span>Across MediaWiki ecosystem</span>
        </div>
      </div>

      <!-- 8. First Recorded Contribution -->
      <div class="wgt-metric-card" tabindex="0">
        <div class="wgt-card-header">
          <span class="wgt-card-title">First Recorded Activity</span>
          <span class="wgt-tooltip-trigger" title="Earliest recorded authored contribution within retrieved records">i</span>
        </div>
        <div class="wgt-card-value font-compact">
          {{ formattedFirstDate }}
        </div>
        <div class="wgt-card-footer">
          <span>Initial Gerrit patch record</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContributorSummaryResponse } from '../types/index.js';

const props = defineProps<{
  summary: ContributorSummaryResponse;
}>();

const mergeRate = computed(() => {
  const total = props.summary.authored.totalAuthored;
  if (total === 0) return 0;
  return Math.round((props.summary.authored.merged / total) * 100);
});

const formattedDate = computed(() => {
  const gen = props.summary.metadata.generatedAt;
  if (!gen) return 'Recent';
  try {
    return new Date(gen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return gen;
  }
});

const formattedFirstDate = computed(() => {
  const d = props.summary.authored.firstRecordedDate;
  if (!d) return 'N/A';
  return d.split(' ')[0] || d;
});
</script>

<style scoped>
.wgt-metrics-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wgt-meta-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  background-color: var(--wgt-bg-subtle);
  border-radius: var(--wgt-radius);
  font-size: 0.85rem;
  color: var(--wgt-text-secondary);
}

.wgt-meta-left, .wgt-meta-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.wgt-meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--wgt-text-primary);
}

.wgt-meta-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: var(--wgt-color-success);
}

.indicator-cached {
  background-color: var(--wgt-color-primary);
}

.wgt-partial-warning {
  color: var(--wgt-color-error);
  font-weight: 600;
}

.wgt-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.wgt-metric-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 1.4rem;
  box-shadow: var(--wgt-shadow-card);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.wgt-metric-card:hover {
  transform: translateY(-3px);
  border-color: var(--wgt-border-base);
  box-shadow: var(--wgt-shadow-elevated);
}

.wgt-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wgt-card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--wgt-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wgt-tooltip-trigger {
  cursor: help;
  font-size: 0.8rem;
  opacity: 0.7;
}

.wgt-card-value {
  font-size: 2.15rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
  line-height: 1.2;
  margin: 0.4rem 0;
}

.font-compact {
  font-size: 1.35rem;
}

.text-merged { color: #326e5a; }
.text-open { color: #3b5f8c; }
.text-abandoned { color: #9a4848; }
.text-reviewed { color: #685282; }
.text-approvals { color: #336a56; }

[data-theme="dark"] .text-merged { color: #78bca0; }
[data-theme="dark"] .text-open { color: #8aaad6; }
[data-theme="dark"] .text-abandoned { color: #db8e8e; }
[data-theme="dark"] .text-reviewed { color: #c5b2e3; }
[data-theme="dark"] .text-approvals { color: #80cbb0; }

.wgt-card-footer {
  font-size: 0.75rem;
  color: var(--wgt-text-subtle);
}

.wgt-rate-badge {
  color: #326e5a;
  font-weight: 600;
}

[data-theme="dark"] .wgt-rate-badge {
  color: #78bca0;
}
</style>

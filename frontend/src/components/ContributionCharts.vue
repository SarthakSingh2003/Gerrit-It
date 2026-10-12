<template>
  <div class="wgt-charts-wrapper" role="region" aria-label="Contribution Distribution and Charts">
    <div class="wgt-charts-grid">
      <!-- 1. Category Breakdown Card -->
      <div class="wgt-chart-card">
        <div class="wgt-card-title-row">
          <h3 class="wgt-chart-title">Repository Category Distribution</h3>
          <span class="wgt-chart-subtitle">Authored patches by MediaWiki subsystem</span>
        </div>

        <div class="wgt-bar-list" role="list">
          <div
            v-for="item in summary.categoryBreakdown"
            :key="item.category"
            class="wgt-bar-row"
            role="listitem"
          >
            <div class="wgt-bar-info">
              <span class="wgt-bar-label">{{ item.category }}</span>
              <span class="wgt-bar-count">{{ item.count }} ({{ item.percentage }}%)</span>
            </div>
            <div class="wgt-bar-track">
              <div
                class="wgt-bar-fill"
                :style="{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }"
                :class="`fill-${item.category.toLowerCase().replace(/\s+/g, '-')}`"
                aria-hidden="true"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Authored vs Reviewed Comparison Card -->
      <div class="wgt-chart-card">
        <div class="wgt-card-title-row">
          <h3 class="wgt-chart-title">Contribution Focus</h3>
          <span class="wgt-chart-subtitle">Authored Patches vs Code Review Activity</span>
        </div>

        <div class="wgt-focus-metrics">
          <div class="wgt-focus-block block-authored">
            <span class="wgt-focus-label">Authored Patches</span>
            <span class="wgt-focus-num">{{ summary.authored.totalAuthored }}</span>
            <span class="wgt-focus-sub">{{ summary.authored.merged }} merged ({{ authoredRatio }}%)</span>
          </div>

          <div class="wgt-focus-vs" aria-hidden="true">VS</div>

          <div class="wgt-focus-block block-reviewed">
            <span class="wgt-focus-label">Changes Reviewed</span>
            <span class="wgt-focus-num">{{ summary.reviews.distinctChangesReviewed }}</span>
            <span class="wgt-focus-sub">{{ summary.reviews.approvalsCount }} approvals ({{ reviewedRatio }}%)</span>
          </div>
        </div>

        <!-- Ratio bar -->
        <div class="wgt-ratio-bar" role="img" :aria-label="`Ratio: ${authoredRatio}% authored code, ${reviewedRatio}% code reviews`">
          <div
            class="wgt-ratio-authored"
            :style="{ width: `${authoredRatio}%` }"
            :title="`Authored: ${authoredRatio}%`"
          ></div>
          <div
            class="wgt-ratio-reviewed"
            :style="{ width: `${reviewedRatio}%` }"
            :title="`Reviewed: ${reviewedRatio}%`"
          ></div>
        </div>

        <div class="wgt-ratio-legend">
          <div class="wgt-legend-item">
            <span class="wgt-legend-dot dot-authored" aria-hidden="true"></span>
            <span>Authored Changes ({{ summary.authored.totalAuthored }})</span>
          </div>
          <div class="wgt-legend-item">
            <span class="wgt-legend-dot dot-reviewed" aria-hidden="true"></span>
            <span>Reviews Performed ({{ summary.reviews.distinctChangesReviewed }})</span>
          </div>
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

const totalActivity = computed(() => {
  return props.summary.authored.totalAuthored + props.summary.reviews.distinctChangesReviewed;
});

const authoredRatio = computed(() => {
  if (totalActivity.value === 0) return 50;
  return Math.round((props.summary.authored.totalAuthored / totalActivity.value) * 100);
});

const reviewedRatio = computed(() => {
  if (totalActivity.value === 0) return 50;
  return 100 - authoredRatio.value;
});
</script>

<style scoped>
.wgt-charts-wrapper {
  margin-top: 1.25rem;
  width: 100%;
}

.wgt-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 1.75rem;
}

.wgt-chart-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2rem;
  box-shadow: var(--wgt-shadow-card);
}

.wgt-card-title-row {
  margin-bottom: 1.25rem;
}

.wgt-chart-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--wgt-text-primary);
  margin-bottom: 0.2rem;
}

.wgt-chart-subtitle {
  font-size: 0.8rem;
  color: var(--wgt-text-subtle);
}

.wgt-bar-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wgt-bar-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wgt-bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.wgt-bar-label {
  font-weight: 600;
  color: var(--wgt-text-secondary);
}

.wgt-bar-count {
  color: var(--wgt-text-subtle);
}

.wgt-bar-track {
  height: 8px;
  background-color: var(--wgt-bg-subtle);
  border-radius: 9999px;
  overflow: hidden;
}

.wgt-bar-fill {
  height: 100%;
  border-radius: 9999px;
  background-color: var(--wgt-color-primary);
  transition: width 0.3s ease;
}

.fill-core { background-color: #3366cc; }
.fill-extension { background-color: #7b1fa2; }
.fill-skin { background-color: #d97706; }
.fill-bot-ecosystem { background-color: #059669; }
.fill-design-system { background-color: #db2777; }
.fill-infrastructure { background-color: #ea580c; }
.fill-other { background-color: #6b7280; }

.wgt-focus-metrics {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 1rem 0 1.5rem;
}

.wgt-focus-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.wgt-focus-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--wgt-text-secondary);
}

.wgt-focus-num {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0.2rem 0;
}

.block-authored .wgt-focus-num {
  color: #3366cc;
}

.block-reviewed .wgt-focus-num {
  color: #7b1fa2;
}

[data-theme="dark"] .block-authored .wgt-focus-num {
  color: #699bf7;
}

[data-theme="dark"] .block-reviewed .wgt-focus-num {
  color: #d8b4fe;
}

.wgt-focus-sub {
  font-size: 0.75rem;
  color: var(--wgt-text-subtle);
}

.wgt-focus-vs {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--wgt-text-subtle);
}

.wgt-ratio-bar {
  display: flex;
  height: 12px;
  border-radius: 9999px;
  overflow: hidden;
  background-color: var(--wgt-bg-subtle);
  margin-bottom: 0.75rem;
}

.wgt-ratio-authored {
  background-color: #3366cc;
  transition: width 0.3s ease;
}

.wgt-ratio-reviewed {
  background-color: #7b1fa2;
  transition: width 0.3s ease;
}

[data-theme="dark"] .wgt-ratio-authored {
  background-color: #699bf7;
}

[data-theme="dark"] .wgt-ratio-reviewed {
  background-color: #d8b4fe;
}

.wgt-ratio-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: var(--wgt-text-secondary);
}

.wgt-legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.wgt-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-authored { background-color: #3366cc; }
.dot-reviewed { background-color: #7b1fa2; }

[data-theme="dark"] .dot-authored { background-color: #699bf7; }
[data-theme="dark"] .dot-reviewed { background-color: #d8b4fe; }
</style>

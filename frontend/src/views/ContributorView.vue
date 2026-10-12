<template>
  <div class="wgt-contributor-page">
    <!-- Top Search Bar for quickly switching contributors -->
    <div class="wgt-top-search-row">
      <ContributorSearch />
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading && !summary" class="wgt-loading-state" role="status">
      <div class="wgt-spinner-lg" aria-hidden="true"></div>
      <p>Resolving canonical Gerrit account and fetching contribution records...</p>
    </div>

    <!-- Loaded Profile State -->
    <div v-else-if="summary" class="wgt-profile-layout">
      <!-- Contributor Identity Card -->
      <section class="wgt-identity-header" aria-label="Contributor Identity">
        <div class="wgt-identity-left">
          <div class="wgt-avatar-box">
            <span>{{ summary.contributor.displayName.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="wgt-identity-meta">
            <div class="wgt-name-row">
              <h1 class="wgt-profile-name">{{ summary.contributor.displayName }}</h1>
              <span v-if="summary.contributor.statusText" class="wgt-status-badge" :title="`Status: ${summary.contributor.statusText}`">
                {{ summary.contributor.statusText }}
              </span>
            </div>
            <div class="wgt-sub-meta">
              <span v-if="summary.contributor.username" class="wgt-username">
                @{{ summary.contributor.username }}
              </span>
              <span class="wgt-account-id">
                Gerrit Account ID: <strong>{{ summary.contributor.accountId }}</strong>
              </span>
              <span v-if="summary.contributor.registeredOn" class="wgt-reg-date">
                Joined: {{ summary.contributor.registeredOn.split(' ')[0] }}
              </span>
            </div>
          </div>
        </div>

        <div class="wgt-identity-actions">
          <a
            :href="summary.contributor.gerritProfileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="wgt-btn-outline"
          >
            <span>View on Gerrit</span>
            <span aria-hidden="true">↗</span>
          </a>
          <router-link
            :to="`/user/${encodeURIComponent(summary.contributor.username || summary.contributor.accountId)}/report`"
            class="wgt-btn-primary"
          >
            <span>Generate Report</span>
            <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>

      <!-- Date Range Filtering Section -->
      <section class="wgt-filter-bar" aria-label="Reporting Range">
        <DateRangePicker
          :initial-preset="selectedPreset"
          :initial-start="customStartDate"
          :initial-end="customEndDate"
          @change="onDateRangeChange"
        />
      </section>

      <!-- Metric Cards -->
      <section aria-label="Summary Metrics">
        <MetricCards :summary="summary" />
      </section>

      <!-- Visual Charts -->
      <section aria-label="Contribution Distribution">
        <ContributionCharts :summary="summary" />
      </section>

      <!-- Repository Footprint Table -->
      <section aria-label="Repository Contribution Table">
        <RepositoryTable :repositories="repositories" />
      </section>

      <!-- Individual Patch Records -->
      <section aria-label="Individual Patch Records">
        <ChangeList
          :changes="authoredChanges"
          title="Authored Patch Changes"
          subtitle="Direct code contributions submitted to Wikimedia Gerrit"
        />
      </section>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="wgt-no-profile">
      <p>Search for a Wikimedia contributor above to display their contribution intelligence profile.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useContributor } from '../composables/useContributor.js';
import ContributorSearch from '../components/ContributorSearch.vue';
import MetricCards from '../components/MetricCards.vue';
import ContributionCharts from '../components/ContributionCharts.vue';
import RepositoryTable from '../components/RepositoryTable.vue';
import ChangeList from '../components/ChangeList.vue';
import DateRangePicker from '../components/DateRangePicker.vue';

const route = useRoute();
const {
  summary,
  repositories,
  authoredChanges,
  isLoading,
  selectedPreset,
  customStartDate,
  customEndDate,
  loadContributor,
  loadChanges,
  setDateRange
} = useContributor();

const loadRouteUser = async () => {
  const id = route.params.identifier as string;
  if (id) {
    await loadContributor(id);
    await loadChanges('authored', 100);
  }
};

const onDateRangeChange = async (payload: { preset: string; startDate?: string; endDate?: string }) => {
  await setDateRange(payload.preset, payload.startDate, payload.endDate);
  await loadChanges('authored', 100);
};

watch(() => route.params.identifier, () => {
  loadRouteUser();
});

onMounted(() => {
  loadRouteUser();
});
</script>

<style scoped>
.wgt-contributor-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.25rem 0 3.5rem;
  width: 100%;
}

.wgt-top-search-row {
  max-width: 1100px;
  margin: 0 auto 0.5rem;
  width: 100%;
}

.wgt-loading-state {
  text-align: center;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--wgt-text-subtle);
}

.wgt-profile-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.wgt-identity-header {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2rem 2.25rem;
  box-shadow: var(--wgt-shadow-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.wgt-identity-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.wgt-avatar-box {
  width: 68px;
  height: 68px;
  background: linear-gradient(135deg, #3366cc, #00af89);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 2rem;
  box-shadow: 0 3px 8px rgba(51, 102, 204, 0.3);
}

.wgt-identity-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wgt-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wgt-profile-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
  line-height: 1.2;
}

.wgt-status-badge {
  padding: 0.15rem 0.5rem;
  background-color: var(--wgt-bg-subtle);
  border-radius: 9999px;
  font-size: 0.8rem;
}

.wgt-sub-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--wgt-text-secondary);
}

.wgt-username {
  font-weight: 600;
  color: var(--wgt-color-primary);
}

.wgt-identity-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.wgt-btn-outline,
.wgt-btn-primary {
  padding: 0.5rem 1rem;
  border-radius: var(--wgt-radius);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
}

.wgt-btn-outline {
  border: 1px solid var(--wgt-border-base);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
}

.wgt-btn-outline:hover {
  border-color: var(--wgt-color-primary);
  color: var(--wgt-color-primary);
}

.wgt-btn-primary {
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  border: 1px solid var(--wgt-color-primary);
}

.wgt-btn-primary:hover {
  background-color: var(--wgt-color-primary-hover);
}

.wgt-filter-bar {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 1rem 1.25rem;
}

.wgt-no-profile {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--wgt-text-subtle);
}
</style>

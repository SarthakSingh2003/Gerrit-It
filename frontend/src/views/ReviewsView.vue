<template>
  <div class="wgt-reviews-page">
    <div class="wgt-top-search-row">
      <ContributorSearch />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !summary" class="wgt-loading-state" role="status">
      <div class="wgt-spinner-lg" aria-hidden="true"></div>
      <p>Retrieving code review participation records from Wikimedia Gerrit...</p>
    </div>

    <div v-else-if="summary" class="wgt-reviews-layout">
      <!-- Header -->
      <section class="wgt-reviews-header">
        <div>
          <span class="wgt-eyebrow">Code Review & Mentorship Footprint</span>
          <h1 class="wgt-title">{{ summary.contributor.displayName }}'s Review Intelligence</h1>
          <p class="wgt-desc">
            Peer review analysis for Gerrit Account ID <strong>{{ summary.contributor.accountId }}</strong>
          </p>
        </div>

        <div class="wgt-header-links">
          <a
            :href="`https://gerrit.wikimedia.org/r/q/reviewer:${summary.contributor.accountId}+-owner:${summary.contributor.accountId}`"
            target="_blank"
            rel="noopener noreferrer"
            class="wgt-link-btn"
          >
            Inspect on Gerrit
          </a>
        </div>
      </section>

      <!-- Review Metrics Grid -->
      <section class="wgt-review-cards-grid" aria-label="Review Metrics">
        <div class="wgt-review-card">
          <span class="wgt-rc-label">Distinct Changes Reviewed</span>
          <span class="wgt-rc-val text-reviewed">{{ summary.reviews.distinctChangesReviewed }}</span>
          <span class="wgt-rc-sub">Peer patches evaluated</span>
        </div>

        <div class="wgt-review-card">
          <span class="wgt-rc-label">Verified Approvals (+2)</span>
          <span class="wgt-rc-val text-merged">{{ summary.reviews.approvalsCount }}</span>
          <span class="wgt-rc-sub">Code-Review +2 votes cast</span>
        </div>

        <div class="wgt-review-card">
          <span class="wgt-rc-label">Recommendations (+1)</span>
          <span class="wgt-rc-val text-open">{{ summary.reviews.recommendationsCount }}</span>
          <span class="wgt-rc-sub">Code-Review +1 votes cast</span>
        </div>

        <div class="wgt-review-card">
          <span class="wgt-rc-label">Verified Tests (+1/+2)</span>
          <span class="wgt-rc-val">{{ summary.reviews.verifiedCount }}</span>
          <span class="wgt-rc-sub">Verified label votes</span>
        </div>

        <div class="wgt-review-card">
          <span class="wgt-rc-label">Critiques / Changes Needed</span>
          <span class="wgt-rc-val text-abandoned">{{ summary.reviews.critiquesCount }}</span>
          <span class="wgt-rc-sub">Code-Review -1/-2 votes</span>
        </div>

        <div class="wgt-review-card">
          <span class="wgt-rc-label">Unique Repositories</span>
          <span class="wgt-rc-val">{{ summary.reviews.uniqueReviewRepositories }}</span>
          <span class="wgt-rc-sub">Cross-project review span</span>
        </div>
      </section>

      <!-- Mentorship and Collaboration Callout Banner -->
      <section class="wgt-mentorship-banner" role="note">
        <div class="wgt-banner-icon">
          <svg class="wgt-banner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="wgt-banner-text">
          <h3 class="wgt-banner-title">Technical Collaboration & Community Mentorship Guidance</h3>
          <p class="wgt-banner-desc">
            {{ summary.reviews.mentorshipDisclaimer }}
          </p>
          <p class="wgt-banner-sub">
            {{ summary.reviews.limitationsNote }}
          </p>
        </div>
      </section>

      <!-- Reviewed Changes List -->
      <section aria-label="Reviewed Changes List">
        <ChangeList
          :changes="reviewedChanges"
          title="Peer Changes Reviewed"
          subtitle="Changes where contributor cast review votes or participated as reviewer (excluding self-reviews)"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useContributor } from '../composables/useContributor.js';
import ContributorSearch from '../components/ContributorSearch.vue';
import ChangeList from '../components/ChangeList.vue';

const route = useRoute();
const { summary, reviewedChanges, isLoading, loadContributor, loadChanges } = useContributor();

const loadData = async () => {
  const id = route.params.identifier as string;
  if (id) {
    await loadContributor(id);
    await loadChanges('reviewed', 100);
  }
};

watch(() => route.params.identifier, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.wgt-reviews-page {
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

.wgt-reviews-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.wgt-reviews-header {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 2rem 2.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  box-shadow: var(--wgt-shadow-card);
}

.wgt-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--wgt-cat-extension, #685282);
  letter-spacing: 0.05em;
}

.wgt-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--wgt-text-primary);
  margin-top: 0.2rem;
}

.wgt-desc {
  font-size: 0.95rem;
  color: var(--wgt-text-secondary);
}

.wgt-link-btn {
  padding: 0.55rem 1.1rem;
  border: 1px solid var(--wgt-border-base);
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.wgt-link-btn:hover {
  border-color: var(--wgt-color-primary);
  color: var(--wgt-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.wgt-review-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 1.25rem;
}

.wgt-review-card {
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--wgt-shadow-card);
  display: flex;
  flex-direction: column;
}

.wgt-rc-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--wgt-text-subtle);
  text-transform: uppercase;
}

.wgt-rc-val {
  font-size: 2rem;
  font-weight: 800;
  margin: 0.3rem 0;
  line-height: 1.2;
}

.wgt-rc-sub {
  font-size: 0.75rem;
  color: var(--wgt-text-subtle);
}

.wgt-mentorship-banner {
  background-color: var(--wgt-bg-accent);
  border: 1px solid var(--wgt-cat-core-border, #d0e0f2);
  border-radius: var(--wgt-radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

[data-theme="dark"] .wgt-mentorship-banner {
  border-color: var(--wgt-cat-core-border, #293d5a);
}

.wgt-banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-surface);
  border: 1px solid var(--wgt-border-subtle);
  color: var(--wgt-color-primary);
}

.wgt-banner-svg {
  width: 20px;
  height: 20px;
}

.wgt-banner-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--wgt-text-primary);
  margin-bottom: 0.3rem;
}

.wgt-banner-desc {
  font-size: 0.88rem;
  color: var(--wgt-text-primary);
  margin-bottom: 0.4rem;
  line-height: 1.45;
}

.wgt-banner-sub {
  font-size: 0.78rem;
  color: var(--wgt-text-subtle);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .wgt-reviews-page {
    gap: 1.25rem;
    padding: 0.75rem 0 2.5rem;
  }

  .wgt-reviews-layout {
    gap: 1.25rem;
  }

  .wgt-reviews-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem 1rem;
    gap: 1rem;
  }

  .wgt-title {
    font-size: clamp(1.3rem, 4.5vw, 1.85rem);
    word-break: break-word;
  }

  .wgt-header-links,
  .wgt-link-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
  }

  .wgt-review-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .wgt-review-card {
    padding: 1rem 0.85rem;
  }

  .wgt-rc-val {
    font-size: 1.6rem;
  }

  .wgt-mentorship-banner {
    flex-direction: column;
    padding: 1rem;
    gap: 0.75rem;
  }
}

@media (max-width: 380px) {
  .wgt-review-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

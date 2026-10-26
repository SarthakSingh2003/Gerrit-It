<template>
  <div class="wgt-search-wrapper" role="search" aria-label="Gerrit Contributor Search">
    <form @submit.prevent="handleSearch" class="wgt-search-form">
      <div class="wgt-input-container">
        <label for="contributor-input" class="wgt-sr-only">Wikimedia Gerrit Username or Numeric Account ID</label>
        <input
          id="contributor-input"
          v-model="query"
          type="text"
          placeholder="Enter Gerrit username or Account ID (e.g. legoktm, 458)..."
          class="wgt-search-input"
          :disabled="isLoading"
          autocomplete="off"
          spellcheck="false"
          @input="onInput"
        />
        <button
          v-if="query"
          type="button"
          class="wgt-clear-btn"
          @click="handleClear"
          aria-label="Clear search input"
        >
          ×
        </button>
      </div>

      <button
        type="submit"
        class="wgt-search-submit"
        :disabled="isLoading || !query.trim()"
      >
        <span v-if="isLoading" class="wgt-spinner" aria-hidden="true"></span>
        <span>{{ isLoading ? 'Retrieving Gerrit Records...' : 'Analyze Contributions' }}</span>
      </button>
    </form>

    <!-- Error message banner if any -->
    <div v-if="error" class="wgt-error-banner" role="alert">
      <svg class="wgt-error-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div class="wgt-error-content">
        <p class="wgt-error-title">{{ error }}</p>
        <p class="wgt-error-hint">Verify your username on <a href="https://gerrit.wikimedia.org/r/" target="_blank" rel="noopener">Wikimedia Gerrit</a> or try searching by numeric account ID.</p>
      </div>
    </div>

    <!-- Disambiguation Dialog -->
    <div
      v-if="disambiguationCandidates.length > 0"
      class="wgt-disambiguation-card"
      role="region"
      aria-label="Account Disambiguation"
    >
      <h3 class="wgt-disambig-title">Select Your Canonical Gerrit Account</h3>
      <p class="wgt-disambig-desc">
        Multiple public accounts matched "{{ query }}". To maintain verifiable attribution without guesswork, please select your specific profile:
      </p>
      <div class="wgt-candidate-list">
        <button
          v-for="candidate in disambiguationCandidates"
          :key="candidate._account_id"
          type="button"
          class="wgt-candidate-item"
          @click="selectCandidate(candidate)"
        >
          <div class="wgt-candidate-info">
            <span class="wgt-candidate-name">{{ candidate.name || 'Unnamed Contributor' }}</span>
            <span class="wgt-candidate-sub">
              @{{ candidate.username || 'no-username' }} • Account ID: {{ candidate._account_id }}
            </span>
          </div>
          <span class="wgt-candidate-action">Select</span>
        </button>
      </div>
    </div>

    <!-- Suggested profiles & Search History -->
    <div class="wgt-search-footer">
      <div class="wgt-suggestions">
        <span class="wgt-suggestion-label">Sample Contributors:</span>
        <button
          v-for="sample in sampleProfiles"
          :key="sample"
          type="button"
          class="wgt-sample-chip"
          @click="selectSample(sample)"
        >
          {{ sample }}
        </button>
      </div>

      <!-- Local search history with explicit consent -->
      <div v-if="consentGiven && searchHistory.length > 0" class="wgt-history-section">
        <span class="wgt-suggestion-label">Recent Searches:</span>
        <button
          v-for="item in searchHistory"
          :key="item"
          type="button"
          class="wgt-sample-chip"
          @click="selectSample(item)"
        >
          {{ item }}
        </button>
        <button
          type="button"
          class="wgt-clear-history-btn"
          @click="clearHistory"
          title="Clear search history"
        >
          Clear
        </button>
      </div>

      <div v-else-if="!consentGiven" class="wgt-consent-note">
        <button
          type="button"
          class="wgt-consent-toggle"
          @click="setConsent(true)"
        >
          Enable local search history (stored only in browser)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useContributor } from '../composables/useContributor.js';
import { useSearchHistory } from '../composables/useSearchHistory.js';
import { DisambiguationCandidate } from '../types/index.js';

const router = useRouter();
const route = useRoute();
const query = ref('');
const {
  isLoading,
  error,
  disambiguationCandidates,
  currentIdentifier,
  summary,
  loadContributor,
  reset
} = useContributor();
const { consentGiven, searchHistory, setConsent, addSearch, clearHistory } = useSearchHistory();

const sampleProfiles = ['legoktm', 'reedy', 'krinkle', 'roan', 'matmarex'];

// Sync search query with current route / active contributor
watch(
  [() => currentIdentifier.value, () => route?.params?.identifier],
  ([newId, routeId]) => {
    const active = newId || (typeof routeId === 'string' ? routeId : '');
    if (active && query.value !== active) {
      query.value = active;
    }
  },
  { immediate: true }
);

const handleClear = () => {
  query.value = '';
  reset();
  if (route?.path && route.path.startsWith('/user')) {
    router.push('/');
  }
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.value.trim() && (currentIdentifier.value || summary.value)) {
    handleClear();
  }
};

const handleSearch = async () => {
  const trimmed = query.value.trim();
  if (!trimmed) {
    handleClear();
    return;
  }

  addSearch(trimmed);
  router.push(`/user/${encodeURIComponent(trimmed)}`);
  await loadContributor(trimmed);
};

const selectSample = (name: string) => {
  query.value = name;
  handleSearch();
};

const selectCandidate = async (candidate: DisambiguationCandidate) => {
  const idStr = String(candidate._account_id);
  query.value = candidate.username || idStr;
  addSearch(query.value);
  router.push(`/user/${encodeURIComponent(idStr)}`);
  await loadContributor(idStr);
};
</script>

<style scoped>
.wgt-search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wgt-search-form {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.wgt-input-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.wgt-search-input {
  width: 100%;
  padding: 0.75rem 2.2rem 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--wgt-border-base);
  border-radius: var(--wgt-radius-lg);
  background-color: var(--wgt-bg-surface);
  color: var(--wgt-text-primary);
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.wgt-search-input:focus {
  border-color: var(--wgt-color-primary);
  box-shadow: 0 0 0 3px rgba(78, 112, 154, 0.22);
  outline: none;
}

.wgt-clear-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--wgt-text-subtle);
  cursor: pointer;
  padding: 0 0.25rem;
}

.wgt-clear-btn:hover {
  color: var(--wgt-text-primary);
}

.wgt-search-submit {
  padding: 0 1.5rem;
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--wgt-radius-lg);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.wgt-search-submit:hover:not(:disabled) {
  background-color: var(--wgt-color-primary-hover);
}

.wgt-search-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.wgt-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.wgt-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background-color: #faeeee;
  border: 1px solid #f0cccc;
  border-radius: var(--wgt-radius);
  color: #8a3b3b;
  font-size: 0.9rem;
}

[data-theme="dark"] .wgt-error-banner {
  background-color: #331c1f;
  border-color: #542d32;
  color: #e69999;
}

.wgt-error-svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.wgt-error-title {
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.wgt-error-hint {
  font-size: 0.8rem;
  opacity: 0.9;
}

.wgt-error-hint a {
  color: inherit;
  text-decoration: underline;
}

.wgt-disambiguation-card {
  background-color: var(--wgt-bg-surface);
  border: 2px solid var(--wgt-color-primary);
  border-radius: var(--wgt-radius-lg);
  padding: 1.25rem;
  margin-top: 0.5rem;
}

.wgt-disambig-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--wgt-color-primary);
  margin-bottom: 0.4rem;
}

.wgt-disambig-desc {
  font-size: 0.85rem;
  color: var(--wgt-text-secondary);
  margin-bottom: 1rem;
}

.wgt-candidate-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wgt-candidate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius);
  background-color: var(--wgt-bg-subtle);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.wgt-candidate-item:hover {
  border-color: var(--wgt-color-primary);
  background-color: var(--wgt-bg-accent);
}

.wgt-candidate-name {
  font-weight: 600;
  font-size: 0.95rem;
  display: block;
}

.wgt-candidate-sub {
  font-size: 0.8rem;
  color: var(--wgt-text-subtle);
}

.wgt-candidate-action {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--wgt-color-primary);
}

.wgt-search-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.wgt-suggestions,
.wgt-history-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.wgt-suggestion-label {
  color: var(--wgt-text-subtle);
  font-size: 0.8rem;
  margin-right: 0.2rem;
}

.wgt-sample-chip {
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  background-color: var(--wgt-bg-subtle);
  border: 1px solid var(--wgt-border-subtle);
  color: var(--wgt-color-primary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.wgt-sample-chip:hover {
  background-color: var(--wgt-bg-accent);
}

.wgt-clear-history-btn {
  background: none;
  border: none;
  color: var(--wgt-text-subtle);
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.5rem;
}

.wgt-consent-note {
  font-size: 0.78rem;
  color: var(--wgt-text-subtle);
}

.wgt-consent-toggle {
  background: none;
  border: none;
  color: var(--wgt-color-primary);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.wgt-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .wgt-search-form {
    flex-direction: column;
    gap: 0.75rem;
  }

  .wgt-search-submit {
    width: 100%;
    min-height: 44px;
    padding: 0.75rem 1.25rem;
    justify-content: center;
  }

  .wgt-candidate-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .wgt-sample-chip {
    padding: 0.35rem 0.65rem;
    min-height: 32px;
    display: inline-flex;
    align-items: center;
  }
}
</style>

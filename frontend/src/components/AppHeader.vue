<template>
  <header class="wgt-header" role="banner">
    <div class="wgt-container wgt-header-inner">
      <div class="wgt-brand-group">
        <router-link to="/" class="wgt-brand-link" aria-label="WikiGerritTracker Home">
          <div class="wgt-logo-mark" aria-hidden="true">
            <span class="wgt-logo-g">W</span>
          </div>
          <div class="wgt-brand-text">
            <span class="wgt-title">WikiGerritTracker</span>
            <span class="wgt-subtitle">Wikimedia Contributor Analytics</span>
          </div>
        </router-link>
      </div>

      <nav class="wgt-nav" role="navigation" aria-label="Main Navigation">
        <router-link to="/" class="wgt-nav-item" active-class="wgt-nav-active">
          Dashboard
        </router-link>
        <router-link
          :to="userProfileLink"
          class="wgt-nav-item"
          active-class="wgt-nav-active"
        >
          Contributions
        </router-link>
        <router-link
          :to="userReviewsLink"
          class="wgt-nav-item"
          active-class="wgt-nav-active"
        >
          Code Reviews
        </router-link>
        <router-link
          :to="userReportsLink"
          class="wgt-nav-item"
          active-class="wgt-nav-active"
        >
          Report
        </router-link>
      </nav>

      <div class="wgt-header-actions">
        <a
          href="https://gerrit.wikimedia.org/r/"
          target="_blank"
          rel="noopener noreferrer"
          class="wgt-action-btn"
          title="Open Wikimedia Gerrit in new tab"
        >
          <span>Gerrit</span>
          <span class="wgt-ext-icon" aria-hidden="true">↗</span>
        </a>

        <button
          type="button"
          class="wgt-action-btn"
          @click="toggleTheme"
          :title="isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          :aria-label="isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
        >
          <span>{{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useContributor } from '../composables/useContributor.js';
import { useTheme } from '../composables/useTheme.js';

const { currentIdentifier } = useContributor();
const { isDarkMode, toggleTheme } = useTheme();

const targetUser = computed(() => currentIdentifier.value || 'legoktm');
const userProfileLink = computed(() => `/user/${encodeURIComponent(targetUser.value)}`);
const userReviewsLink = computed(() => `/user/${encodeURIComponent(targetUser.value)}/reviews`);
const userReportsLink = computed(() => `/user/${encodeURIComponent(targetUser.value)}/report`);
</script>

<style scoped>
.wgt-header {
  background-color: var(--wgt-bg-surface);
  border-bottom: 1px solid var(--wgt-border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.wgt-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.wgt-brand-group {
  display: flex;
  align-items: center;
}

.wgt-brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
}

.wgt-logo-mark {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3366cc, #00af89);
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  box-shadow: 0 2px 4px rgba(51, 102, 204, 0.3);
}

.wgt-brand-text {
  display: flex;
  flex-direction: column;
}

.wgt-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--wgt-text-primary);
  line-height: 1.2;
}

.wgt-subtitle {
  font-size: 0.75rem;
  color: var(--wgt-text-subtle);
  line-height: 1.1;
}

.wgt-nav {
  display: flex;
  gap: 0.25rem;
}

.wgt-nav-item {
  padding: 0.5rem 0.85rem;
  border-radius: var(--wgt-radius);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--wgt-text-secondary);
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.wgt-nav-item:hover {
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-primary);
  text-decoration: none;
}

.wgt-nav-active {
  background-color: var(--wgt-bg-accent);
  color: var(--wgt-color-primary);
  font-weight: 600;
}

.wgt-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wgt-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--wgt-text-secondary);
  background-color: var(--wgt-bg-subtle);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius);
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.wgt-action-btn:hover {
  background-color: var(--wgt-bg-accent);
  color: var(--wgt-color-primary);
  border-color: var(--wgt-color-primary);
  text-decoration: none;
}

.wgt-ext-icon {
  font-size: 0.9rem;
  line-height: 1;
}

@media (max-width: 900px) {
  .wgt-nav {
    display: none;
  }
}
</style>

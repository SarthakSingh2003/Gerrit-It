<template>
  <header class="wgt-header" role="banner">
    <div class="wgt-container wgt-header-inner">
      <div class="wgt-brand-group">
        <router-link to="/" class="wgt-brand-link" aria-label="Gerrit-It Home" @click="isMobileMenuOpen = false">
          <div class="wgt-logo-mark" aria-hidden="true">
            <span class="wgt-logo-g">G</span>
          </div>
          <div class="wgt-brand-text">
            <span class="wgt-title">Gerrit-It</span>
            <span class="wgt-subtitle">Wikimedia Contributor Analytics</span>
          </div>
        </router-link>
      </div>

      <!-- Desktop Nav -->
      <nav class="wgt-nav wgt-nav-desktop" role="navigation" aria-label="Main Navigation">
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
          class="wgt-action-btn wgt-gerrit-link"
          title="Open Wikimedia Gerrit in new tab"
        >
          <span>Gerrit</span>
          <svg class="wgt-ext-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>

        <button
          type="button"
          class="wgt-action-btn"
          @click="toggleTheme"
          :title="isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          :aria-label="isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
        >
          <svg v-if="isDarkMode" class="wgt-theme-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else class="wgt-theme-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span class="wgt-theme-label">{{ isDarkMode ? 'Light' : 'Dark' }}</span>
        </button>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          class="wgt-action-btn wgt-mobile-toggle"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <svg v-if="!isMobileMenuOpen" class="wgt-menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg v-else class="wgt-menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <nav
      v-if="isMobileMenuOpen"
      class="wgt-mobile-nav"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div class="wgt-container wgt-mobile-nav-inner">
        <router-link
          to="/"
          class="wgt-mobile-nav-item"
          active-class="wgt-mobile-nav-active"
          @click="isMobileMenuOpen = false"
        >
          Dashboard
        </router-link>
        <router-link
          :to="userProfileLink"
          class="wgt-mobile-nav-item"
          active-class="wgt-mobile-nav-active"
          @click="isMobileMenuOpen = false"
        >
          Contributions
        </router-link>
        <router-link
          :to="userReviewsLink"
          class="wgt-mobile-nav-item"
          active-class="wgt-mobile-nav-active"
          @click="isMobileMenuOpen = false"
        >
          Code Reviews
        </router-link>
        <router-link
          :to="userReportsLink"
          class="wgt-mobile-nav-item"
          active-class="wgt-mobile-nav-active"
          @click="isMobileMenuOpen = false"
        >
          Report
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useContributor } from '../composables/useContributor.js';
import { useTheme } from '../composables/useTheme.js';

const { currentIdentifier } = useContributor();
const { isDarkMode, toggleTheme } = useTheme();

const isMobileMenuOpen = ref(false);

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
  min-width: 0;
}

.wgt-brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
  min-width: 0;
}

.wgt-logo-mark {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.15rem;
}

[data-theme="dark"] .wgt-logo-mark {
  background-color: #354760;
  color: #dbe7f7;
  border: 1px solid #4a6182;
}

.wgt-brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.wgt-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--wgt-text-primary);
  line-height: 1.2;
  white-space: nowrap;
}

.wgt-subtitle {
  font-size: 0.75rem;
  color: var(--wgt-text-subtle);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wgt-nav-desktop {
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
  border: 1px solid transparent;
}

.wgt-nav-item:hover {
  background-color: var(--wgt-bg-subtle);
  color: var(--wgt-text-primary);
  text-decoration: none;
}

.wgt-nav-active {
  background-color: var(--wgt-bg-accent);
  color: var(--wgt-color-primary);
  border-color: var(--wgt-border-subtle);
  font-weight: 600;
}

.wgt-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.wgt-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  min-height: 36px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--wgt-text-secondary);
  background-color: var(--wgt-bg-subtle);
  border: 1px solid var(--wgt-border-subtle);
  border-radius: var(--wgt-radius);
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  user-select: none;
}

.wgt-action-btn:hover {
  background-color: var(--wgt-bg-accent);
  color: var(--wgt-color-primary);
  border-color: var(--wgt-color-primary);
  text-decoration: none;
}

.wgt-ext-svg,
.wgt-theme-svg,
.wgt-menu-svg {
  width: 16px;
  height: 16px;
  display: block;
}

.wgt-mobile-toggle {
  display: none;
  padding: 0.45rem 0.6rem;
}

/* Mobile Nav Drawer */
.wgt-mobile-nav {
  display: flex;
  flex-direction: column;
  background-color: var(--wgt-bg-surface);
  border-bottom: 1px solid var(--wgt-border-subtle);
  box-shadow: var(--wgt-shadow-card);
  animation: slideDown 0.18s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wgt-mobile-nav-inner {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem 1rem;
  gap: 0.4rem;
}

.wgt-mobile-nav-item {
  padding: 0.7rem 1rem;
  border-radius: var(--wgt-radius);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--wgt-text-primary);
  text-decoration: none;
  background-color: var(--wgt-bg-subtle);
  border: 1px solid var(--wgt-border-subtle);
  transition: background-color 0.15s ease;
}

.wgt-mobile-nav-item:hover,
.wgt-mobile-nav-active {
  background-color: var(--wgt-bg-accent);
  color: var(--wgt-color-primary);
  border-color: var(--wgt-color-primary);
  font-weight: 600;
}

@media (max-width: 900px) {
  .wgt-nav-desktop {
    display: none;
  }
  .wgt-mobile-toggle {
    display: inline-flex;
  }
}

@media (max-width: 500px) {
  .wgt-subtitle {
    display: none;
  }
  .wgt-title {
    font-size: 1.05rem;
  }
  .wgt-theme-label {
    display: none;
  }
  .wgt-gerrit-link span {
    display: none;
  }
}
</style>

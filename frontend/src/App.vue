<template>
  <div class="wgt-app-root">
    <!-- Skip to main content link for screen readers and keyboard users -->
    <a href="#main-content" class="wgt-skip-link">Skip to main content</a>

    <AppHeader />

    <main id="main-content" class="wgt-container wgt-main" role="main">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import { useTheme } from './composables/useTheme.js';

const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<style scoped>
.wgt-app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.wgt-main {
  flex: 1;
  width: 100%;
}

.wgt-skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  background-color: var(--wgt-color-primary);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: var(--wgt-radius);
  font-weight: 600;
  z-index: 1000;
  transition: top 0.2s ease;
}

.wgt-skip-link:focus {
  top: 1rem;
}
</style>

<template>
  <span :class="['wgt-cat-badge', categoryClass]" :title="description">
    {{ category }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RepoCategory } from '../types/index.js';

const props = defineProps<{
  category: RepoCategory;
}>();

const categoryClass = computed(() => {
  switch (props.category) {
    case 'Core':
      return 'cat-core';
    case 'Extension':
      return 'cat-extension';
    case 'Skin':
      return 'cat-skin';
    case 'Bot ecosystem':
      return 'cat-bot';
    case 'Design system':
      return 'cat-design';
    case 'Infrastructure':
      return 'cat-infra';
    default:
      return 'cat-other';
  }
});

const description = computed(() => {
  switch (props.category) {
    case 'Core':
      return 'MediaWiki Core engine';
    case 'Extension':
      return 'MediaWiki Extension';
    case 'Skin':
      return 'MediaWiki Skin';
    case 'Bot ecosystem':
      return 'Pywikibot automation framework';
    case 'Design system':
      return 'Wikimedia Codex design system';
    case 'Infrastructure':
      return 'Wikimedia operations & tools';
    default:
      return 'Other Wikimedia repository';
  }
});
</script>

<style scoped>
.wgt-cat-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.cat-core {
  background-color: #eaf3ff;
  color: #174ea6;
  border-color: #c2e0ff;
}

.cat-extension {
  background-color: #f3e8ff;
  color: #6b21a8;
  border-color: #e9d5ff;
}

.cat-skin {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.cat-bot {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.cat-design {
  background-color: #fce7f3;
  color: #9d174d;
  border-color: #fbcfe8;
}

.cat-infra {
  background-color: #ffedd5;
  color: #9a3412;
  border-color: #fed7aa;
}

.cat-other {
  background-color: #f3f4f6;
  color: #4b5563;
  border-color: #e5e7eb;
}

[data-theme="dark"] .cat-core {
  background-color: #172b4d;
  color: #90caf9;
  border-color: #264a7f;
}

[data-theme="dark"] .cat-extension {
  background-color: #3b1d54;
  color: #d8b4fe;
  border-color: #581c87;
}

[data-theme="dark"] .cat-skin {
  background-color: #452a0a;
  color: #fde047;
  border-color: #713f12;
}

[data-theme="dark"] .cat-bot {
  background-color: #064e3b;
  color: #6ee7b7;
  border-color: #047857;
}

[data-theme="dark"] .cat-design {
  background-color: #500724;
  color: #f472b6;
  border-color: #831843;
}

[data-theme="dark"] .cat-infra {
  background-color: #431407;
  color: #fdba74;
  border-color: #7c2d12;
}

[data-theme="dark"] .cat-other {
  background-color: #1f2937;
  color: #9ca3af;
  border-color: #374151;
}
</style>

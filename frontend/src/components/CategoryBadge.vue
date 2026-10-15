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
  padding: 0.18rem 0.55rem;
  border-radius: var(--wgt-radius, 6px);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.cat-core {
  background-color: var(--wgt-cat-core-bg, #eef4fb);
  color: var(--wgt-cat-core, #436994);
  border-color: var(--wgt-cat-core-border, #d0e0f2);
}

.cat-extension {
  background-color: var(--wgt-cat-extension-bg, #f4eff9);
  color: var(--wgt-cat-extension, #685282);
  border-color: var(--wgt-cat-extension-border, #e2d5f0);
}

.cat-skin {
  background-color: var(--wgt-cat-skin-bg, #faf4e8);
  color: var(--wgt-cat-skin, #7f5c29);
  border-color: var(--wgt-cat-skin-border, #eedec2);
}

.cat-bot {
  background-color: var(--wgt-cat-bot-bg, #eef6f2);
  color: var(--wgt-cat-bot, #336a56);
  border-color: var(--wgt-cat-bot-border, #c8e6d8);
}

.cat-design {
  background-color: var(--wgt-cat-design-bg, #faf0f4);
  color: var(--wgt-cat-design, #824364);
  border-color: var(--wgt-cat-design-border, #eed2e0);
}

.cat-infra {
  background-color: var(--wgt-cat-infra-bg, #f9f2eb);
  color: var(--wgt-cat-infra, #805335);
  border-color: var(--wgt-cat-infra-border, #ebd6c5);
}

.cat-other {
  background-color: var(--wgt-cat-other-bg, #f0f3f6);
  color: var(--wgt-cat-other, #546072);
  border-color: var(--wgt-cat-other-border, #d7dce4);
}

[data-theme="dark"] .cat-core {
  background-color: var(--wgt-cat-core-bg, #1a273b);
  color: var(--wgt-cat-core, #9bbfe8);
  border-color: var(--wgt-cat-core-border, #293d5a);
}

[data-theme="dark"] .cat-extension {
  background-color: var(--wgt-cat-extension-bg, #291f37);
  color: var(--wgt-cat-extension, #c5b2e3);
  border-color: var(--wgt-cat-extension-border, #423258);
}

[data-theme="dark"] .cat-skin {
  background-color: var(--wgt-cat-skin-bg, #332717);
  color: var(--wgt-cat-skin, #ddb77b);
  border-color: var(--wgt-cat-skin-border, #503d24);
}

[data-theme="dark"] .cat-bot {
  background-color: var(--wgt-cat-bot-bg, #162b22);
  color: var(--wgt-cat-bot, #80cbb0);
  border-color: var(--wgt-cat-bot-border, #234537);
}

[data-theme="dark"] .cat-design {
  background-color: var(--wgt-cat-design-bg, #331c28);
  color: var(--wgt-cat-design, #dda1bf);
  border-color: var(--wgt-cat-design-border, #502b3f);
}

[data-theme="dark"] .cat-infra {
  background-color: var(--wgt-cat-infra-bg, #322217);
  color: var(--wgt-cat-infra, #dcad8b);
  border-color: var(--wgt-cat-infra-border, #4e3625);
}

[data-theme="dark"] .cat-other {
  background-color: var(--wgt-cat-other-bg, #202632);
  color: var(--wgt-cat-other, #9eabbf);
  border-color: var(--wgt-cat-other-border, #323d4e);
}
</style>

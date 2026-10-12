<template>
  <span :class="badgeClass" role="status" :aria-label="label">
    <span class="wgt-status-dot" aria-hidden="true"></span>
    <span class="wgt-status-text">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'merged' | 'open' | 'abandoned' | 'MERGED' | 'NEW' | 'ABANDONED';
}>();

const normalized = computed(() => {
  const s = props.status.toLowerCase();
  if (s === 'new') return 'open';
  return s as 'merged' | 'open' | 'abandoned';
});

const label = computed(() => {
  switch (normalized.value) {
    case 'merged':
      return 'Merged';
    case 'open':
      return 'Open / In Review';
    case 'abandoned':
      return 'Abandoned';
    default:
      return props.status;
  }
});

const badgeClass = computed(() => {
  return ['wgt-badge', `wgt-badge-${normalized.value}`];
});
</script>

<style scoped>
.wgt-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background-color: currentColor;
}
</style>

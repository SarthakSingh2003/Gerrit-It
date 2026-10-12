<template>
  <div class="wgt-reports-page">
    <div class="wgt-top-search-row wgt-no-print">
      <ContributorSearch />
    </div>

    <section aria-label="Contribution Report Center">
      <ReportGenerator />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useContributor } from '../composables/useContributor.js';
import ContributorSearch from '../components/ContributorSearch.vue';
import ReportGenerator from '../components/ReportGenerator.vue';

const route = useRoute();
const { loadContributor } = useContributor();

onMounted(() => {
  const id = route.params.identifier as string;
  if (id) {
    loadContributor(id);
  }
});
</script>

<style scoped>
.wgt-reports-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem 0 3rem;
}

.wgt-top-search-row {
  max-width: 1100px;
  margin: 0 auto 0.5rem;
  width: 100%;
}
</style>

import { createRouter, createWebHashHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ContributorView from '../views/ContributorView.vue';
import ReviewsView from '../views/ReviewsView.vue';
import ReportsView from '../views/ReportsView.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard — Gerrit-It' }
  },
  {
    path: '/user/:identifier',
    name: 'contributor',
    component: ContributorView,
    meta: { title: 'Contributor Profile — Gerrit-It' }
  },
  {
    path: '/user/:identifier/reviews',
    name: 'reviews',
    component: ReviewsView,
    meta: { title: 'Code Review Intelligence — Gerrit-It' }
  },
  {
    path: '/user/:identifier/report',
    name: 'reports',
    component: ReportsView,
    meta: { title: 'Report — Gerrit-It' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = String(to.meta.title);
  }
});

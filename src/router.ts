import { createRouter, createWebHistory } from 'vue-router';
import CreateAgentView from './views/CreateAgentView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'create-agent',
      component: CreateAgentView,
    },
  ],
});

export default router;

import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Layout from "@/views/Layout.vue";
import Chat2LLM from "@/views/chat2llm/Chat2LLM.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Layout,
      redirect: 'chat',
      children: [
        {
          path: 'home',
          name: 'home',
          component: HomeView
        }, {
          path: 'chat',
          name: 'chat',
          component: Chat2LLM
        }
      ]
    }
  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'
import Layout from "@/views/Layout.vue";
import Chat2LLM from "@/views/chat2llm/Chat2LLM.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Layout,
      redirect: 'home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: HomeView,
          meta: {
            title: '首页',
            showBack: false,
            showSetting: true
          }
        }, {
          path: 'chat/:sessionId',
          name: 'chat',
          component: Chat2LLM,
          props: (route) => ({ sessionId: route.params.sessionId, chatMode: route.query.chatMode, knowledgeName: route.query.knowledgeName }),
          meta: {
            title: '对话',
            showBack: true,
            showSetting: true
          }
        }
      ]
    }
  ]
})

export default router

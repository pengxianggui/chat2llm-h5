import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'
import Layout from "@/views/Layout.vue";
import Chat2LLM from "@/views/chat2llm/Chat2LLM.vue";
import { useChatSessions } from "@/stores/chatSessions";
import { RequestParam, ChatSession } from "@/views/chat2llm/model";
import { ChatMode } from '../views/chat2llm/model';
import {isEmpty} from 'lodash'

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
            showSetting: false
          }
        }, {
          path: 'chat/:sessionId',
          name: 'chat',
          component: Chat2LLM,
          props: true,
          meta: {
            title: '对话',
            showBack: true,
            showSetting: true
          },
          // 在路由钩子里初始化session，并塞到store里，保证header>setting和chat2llm里都能获取到
          beforeEnter: (to, /*from*/) => {
            const {params:{sessionId}, query:{knowledgeName}} = to;
            if (isEmpty(sessionId)) {
              return {name: 'home'}; // 回主页
            }
            const sessionStore = useChatSessions();
            // @ts-ignore
            let session: ChatSession | any = sessionStore.get(sessionId);
            if (isEmpty(session)) { // 新建会话
              const chatMode = isEmpty(knowledgeName) ? ChatMode.LLM : ChatMode.Knowledge;
              // @ts-ignore
              const param = new RequestParam(chatMode, '', knowledgeName);
              // @ts-ignore
              session = new ChatSession(sessionId, param);
              sessionStore.put(session);
            }
            return true;
          }
        }
      ]
    }
  ]
})

export default router

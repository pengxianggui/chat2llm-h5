import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'
import Page401 from '@/views/err/Page401.vue'
import Layout from "@/views/Layout.vue";
import Chat2LLM from "@/views/chat2llm/Chat2LLM.vue";
import { useChatSessions } from "@/stores/chatSessions.ts";
import { useToken } from '@/stores/token.ts';
import { useKnowledgeStore } from '@/stores/knowledge.ts'
import { RequestParam, ChatSession } from "@/views/chat2llm/model";
import { ChatMode } from '../views/chat2llm/model';
import { isEmpty } from 'lodash'

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
          // beforeEnter: (to, /*from*/) => {
          //   const { params: { sessionId }, query: { knowledgeName } } = to;
          //   if (isEmpty(sessionId)) {
          //     return { name: 'home' }; // 回主页
          //   }
          //   const sessionStore = useChatSessions();
          //   // @ts-ignore
          //   let session: ChatSession | any = sessionStore.get(sessionId);
          //   if (isEmpty(session)) { // 新建会话
          //     const chatMode = isEmpty(knowledgeName) ? ChatMode.LLM : ChatMode.Knowledge;
          //     // @ts-ignore
          //     const param = new RequestParam(chatMode, '', knowledgeName);
          //     // @ts-ignore
          //     session = new ChatSession(sessionId, chatMode, param);
          //     sessionStore.put(session);
          //   }
          //   return true;
          // },
        }
      ]
    },
    {
      path: '/401',
      name: '401',
      component: Page401,
    }
  ]
})

// 全局守卫
router.beforeEach(async (to, from) => {
  const tokenStore = useToken()
  const tokenInStorage = tokenStore.get()

  const { token: tokenInPath } = to.query
  const token = isEmpty(tokenInPath) ? tokenInStorage : tokenInPath

  if (isEmpty(token) && to.name != '401') {
    return '/401'
  }
  // @ts-ignore
  tokenStore.set(token) // 将token存到store

  const kbStore = useKnowledgeStore();
  if (kbStore.isEmpty()) {
    kbStore.initKbs();
  }

  const sessionStore = useChatSessions();
  if (sessionStore.isEmpty()) {
    await sessionStore.init(); // await 防止后面可能明明是进入已有的对话，却因为异步导致创建了新会话
  }

  // 如果前往对话界面
  if (to.name == 'chat') {
    const { params: { sessionId }, query: { knowledgeName } } = to;
    if (isEmpty(sessionId)) {
      return { name: 'home' }; // 回主页
    }
    // @ts-ignore
    let session: ChatSession | any = sessionStore.get(sessionId);
    if (isEmpty(session)) { // 如果会话不存在，则新建会话
      const chatMode = isEmpty(knowledgeName) ? ChatMode.LLM : ChatMode.Knowledge;
      // @ts-ignore
      const param = new RequestParam(chatMode, '', knowledgeName);
      // @ts-ignore
      session = new ChatSession(sessionId, chatMode, param);
      sessionStore.put(session);
    }
  }

  return true
})

export default router

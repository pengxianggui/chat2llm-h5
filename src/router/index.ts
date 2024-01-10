import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'
import ErrorLayout from '@/views/err/ErrorLayout.vue'
import Page401 from '@/views/err/Page401.vue'
import SSO from '@/views/SSO.vue'
import Layout from "@/views/Layout.vue";
import Chat2LLM from "@/views/chat2llm/Chat2LLM.vue";
import { useChatSessions } from "@/stores/chatSessions.ts";
import { useToken } from '@/stores/token.ts';
import { useKnowledgeStore } from '@/stores/knowledge.ts'
import { isEmpty } from 'lodash'
import { useUserStore } from '@/stores/user';

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
            title: '火星智呼',
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
      path: '/',
      name: 'error',
      component: ErrorLayout,
      children: [
        {
          path: '/401',
          name: '401',
          component: Page401,
          props: (route) => { return {message: route.query.message }}
        }
      ]
    },
    {
      path: '/sso',
      name: 'sso',
      component: SSO
    }
  ]
})


// 全局守卫
router.beforeEach(async (to, from) => {
  const tokenStore = useToken()
  const token = tokenStore.get()
  if (isEmpty(token)) {
    if (to.name == '401' || to.name == 'sso') {
      return true
    }
    
    const client = getClient(to)
    // 重定向到后端sso接口
    const search = (window.location.search + (isEmpty(window.location.search) ? '?' : '&'))
    window.location.href = window.location.origin + `/api/sso${search}client=${client}`
    return false
  }

  // 缓存知识库
  const kbStore = useKnowledgeStore();
  if (kbStore.isEmpty()) {
    kbStore.initKbs();
  }

  // 缓存用户
  const userStore = useUserStore();
  if (userStore.isEmpty()) {
    await userStore.init();
  }

  // 缓存会话
  const sessionStore = useChatSessions();
  if (sessionStore.isEmpty()) {
    await sessionStore.init(); // await 防止后面可能明明是进入已有的对话，却因为异步导致创建了新会话
  }

  return true
})

/**
 * 获取当前h5所属的client
 * @param to 
 */
const getClient = function(to: RouteLocationNormalized) {
  const { client: clientInPath } = to.query
    const clientInStorage = localStorage.getItem('client')
    let client = !isEmpty(clientInPath) ? clientInPath : clientInStorage
    if (isEmpty(client)) {
      client = '0'
    }
    localStorage.setItem('client', client + '')
    return client
}

export default router

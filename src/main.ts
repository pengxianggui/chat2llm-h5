import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import directiveInstaller from '@/directive/index.ts'

const app = createApp(App)

app.use(createPinia())
app.use(router)

directiveInstaller(app)

app.mount('#app')

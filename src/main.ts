/**
 * 这是一种特殊的导入方式，可以将项目中使用到的多个SVG图标注册到一个“虚拟的SVG文件”中，
 * 从而可以在代码中以文件的方式引入并使用这些图标。因此，开发者可以更加方便地管理和使用SVG图标，同时也可以减少HTTP请求的次数，优化加载速度。
 * 需要注意的是，该导入方式只适用于使用Vite构建的项目中，并且需要搭配特定的Vite插件(vite-plugin-svg-icons)使用。
 */
import 'virtual:svg-icons-register'
import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SvgIcon from '@/components/svgicon/SvgIcon.vue'

import App from './App.vue'
import router from './router'
import directiveInstaller from '@/directive/index.ts'

const app = createApp(App)

app.component('SvgIcon', SvgIcon)
app.use(createPinia())
app.use(router)

directiveInstaller(app)

app.mount('#app')

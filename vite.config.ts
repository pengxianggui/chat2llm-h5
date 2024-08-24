import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default (({ mode }: { mode: string }) => {
  const VITE_API_URL = loadEnv(mode, process.cwd()).VITE_API_URL
// https://vitejs.dev/config/
  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      // element-plus 部分导入(自动引用的插件配置)。详见: https://element-plus.org/zh-CN/guide/quickstart.html#%E6%8C%89%E9%9C%80%E5%AF%BC%E5%85%A5
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')], // 指定需要缓存的图标所在文件夹
        symbolId: 'icon-[dir]-[name]' // 指定symbolId格式
      })
    ],
    server: {
      host: '0.0.0.0',
      port: 8080,
      open: true,
      // https: true,
      // 部署后记得ng配置此代理
      proxy: {
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  })
})


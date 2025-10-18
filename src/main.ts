/**
 * 应用入口
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from './i18n'

// 导入全局样式
import './styles/design-tokens.css'
import './styles/global.css'
import './styles/animations.css'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 使用Pinia
app.use(pinia)

// 使用 i18n
app.use(i18n)

// 挂载应用
app.mount('#app')


/**
 * Vue I18n 配置
 */
import { createI18n } from 'vue-i18n'
import { messages, type Locale } from './locales'

const LOCALE_KEY = 'imagebatch-locale'

/**
 * 检测浏览器语言
 */
function detectBrowserLocale(): Locale {
  const browserLang = navigator.language.toLowerCase()
  
  // 精确匹配
  if (browserLang === 'zh-cn' || browserLang === 'zh') {
    return 'zh-CN'
  }
  if (browserLang === 'en-us' || browserLang.startsWith('en')) {
    return 'en-US'
  }
  
  // 默认中文
  return 'zh-CN'
}

/**
 * 获取初始语言
 * 优先级：localStorage > 浏览器语言 > 默认中文
 */
function getInitialLocale(): Locale {
  // 从 localStorage 读取
  const savedLocale = localStorage.getItem(LOCALE_KEY)
  if (savedLocale === 'zh-CN' || savedLocale === 'en-US') {
    return savedLocale
  }
  
  // 检测浏览器语言
  return detectBrowserLocale()
}

/**
 * 保存语言设置到 localStorage
 */
export function saveLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale)
}

/**
 * 创建 i18n 实例
 */
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true // 全局注入 $t
})


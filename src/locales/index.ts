/**
 * 语言包导出
 */
import zhCN from './zh-CN'
import enUS from './en-US'

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export type Locale = 'zh-CN' | 'en-US'

export const availableLocales: { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' }
]


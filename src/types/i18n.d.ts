/**
 * Vue I18n 类型声明
 */
import 'vue-i18n'

declare module 'vue-i18n' {
  // 确保 $t 方法类型正确
  export interface VueI18n {
    global: {
      locale: { value: string }
      t: (key: string, values?: Record<string, any>) => string
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string, values?: Record<string, any>) => string
  }
}

export {}


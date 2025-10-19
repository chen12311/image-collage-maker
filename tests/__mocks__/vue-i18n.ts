/**
 * vue-i18n Mock
 */

export const createI18n = jest.fn(() => ({
  global: {
    locale: { value: 'zh-CN' },
    t: (key: string) => key,
    messages: {}
  }
}))

export const useI18n = jest.fn(() => ({
  locale: { value: 'zh-CN' },
  t: (key: string) => key
}))


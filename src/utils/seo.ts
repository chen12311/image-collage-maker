/**
 * SEO 动态更新工具
 * 用于在语言切换时动态更新页面的 SEO 标签
 */

/**
 * SEO 配置接口
 */
interface SEOConfig {
  title: string
  description: string
  keywords: string
  ogTitle?: string
  ogDescription?: string
  twitterTitle?: string
  twitterDescription?: string
}

/**
 * 中英文 SEO 配置
 */
const seoConfigs: Record<string, SEOConfig> = {
  'zh-CN': {
    title: 'ImageBatch - 在线图片拼接工具 | 免费多图拼接、照片拼图制作',
    description: 'ImageBatch 是一款简洁高效的在线图片拼接工具，支持多种布局模式（1-4宫格）、自定义文字、背景设置、实时预览。无需注册，完全免费，浏览器内完成所有操作，保护隐私安全。',
    keywords: '图片拼接,照片拼图,图片合成,多图拼接,在线拼图工具,照片网格,图片拼贴,collage maker,image stitcher,photo grid',
    ogTitle: 'ImageBatch - 在线图片拼接工具 | 免费多图拼接',
    ogDescription: '简洁高效的在线图片拼接工具，支持多种布局、自定义文字、实时预览。无需注册，完全免费，浏览器内完成所有操作。',
    twitterTitle: 'ImageBatch - 在线图片拼接工具',
    twitterDescription: '简洁高效的在线图片拼接工具，支持多种布局、自定义文字、实时预览。无需注册，完全免费。'
  },
  'en-US': {
    title: 'ImageBatch - Online Image Stitcher | Free Photo Collage Maker',
    description: 'ImageBatch is a simple and efficient online image stitching tool. Supports multiple layouts (1-4 grids), custom text, background settings, and real-time preview. No registration required, completely free, all operations in browser, privacy protected.',
    keywords: 'image stitcher,photo collage,collage maker,photo grid,image combiner,picture merge,online collage tool,图片拼接,照片拼图',
    ogTitle: 'ImageBatch - Online Image Stitcher | Free Collage Maker',
    ogDescription: 'Simple and efficient online image stitching tool. Multiple layouts, custom text, real-time preview. No registration, completely free.',
    twitterTitle: 'ImageBatch - Online Image Stitcher',
    twitterDescription: 'Simple and efficient online image stitching tool. Multiple layouts, custom text, real-time preview. No registration required.'
  }
}

/**
 * 更新页面标题
 */
export function updateTitle(locale: string): void {
  const config = seoConfigs[locale] || seoConfigs['zh-CN']
  document.title = config.title
  
  // 更新 meta title
  updateMetaTag('name', 'title', config.title)
}

/**
 * 更新 meta 描述
 */
export function updateMetaDescription(locale: string): void {
  const config = seoConfigs[locale] || seoConfigs['zh-CN']
  updateMetaTag('name', 'description', config.description)
}

/**
 * 更新 meta 关键词
 */
export function updateMetaKeywords(locale: string): void {
  const config = seoConfigs[locale] || seoConfigs['zh-CN']
  updateMetaTag('name', 'keywords', config.keywords)
}

/**
 * 更新 Open Graph 标签
 */
export function updateOGTags(locale: string): void {
  const config = seoConfigs[locale] || seoConfigs['zh-CN']
  
  updateMetaTag('property', 'og:title', config.ogTitle || config.title)
  updateMetaTag('property', 'og:description', config.ogDescription || config.description)
  updateMetaTag('property', 'og:locale', locale === 'en-US' ? 'en_US' : 'zh_CN')
}

/**
 * 更新 Twitter Card 标签
 */
export function updateTwitterTags(locale: string): void {
  const config = seoConfigs[locale] || seoConfigs['zh-CN']
  
  updateMetaTag('name', 'twitter:title', config.twitterTitle || config.title)
  updateMetaTag('name', 'twitter:description', config.twitterDescription || config.description)
}

/**
 * 更新语言标签
 */
export function updateLanguageTag(locale: string): void {
  // 更新 html lang 属性
  document.documentElement.lang = locale
  
  // 更新 meta language
  updateMetaTag('name', 'language', locale)
}

/**
 * 更新所有 SEO 标签（语言切换时调用）
 */
export function updateAllSEOTags(locale: string): void {
  updateTitle(locale)
  updateMetaDescription(locale)
  updateMetaKeywords(locale)
  updateOGTags(locale)
  updateTwitterTags(locale)
  updateLanguageTag(locale)
}

/**
 * 辅助函数：更新 meta 标签
 */
function updateMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string): void {
  let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`)
  
  if (!meta) {
    // 如果标签不存在，创建新标签
    meta = document.createElement('meta')
    meta.setAttribute(attributeName, attributeValue)
    document.head.appendChild(meta)
  }
  
  meta.setAttribute('content', content)
}

/**
 * 获取当前语言的 SEO 配置
 */
export function getSEOConfig(locale: string): SEOConfig {
  return seoConfigs[locale] || seoConfigs['zh-CN']
}

/**
 * 导出所有配置（用于测试或调试）
 */
export { seoConfigs }


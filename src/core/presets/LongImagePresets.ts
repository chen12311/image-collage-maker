/**
 * 长图场景预设系统
 * 
 * 提供针对不同使用场景优化的预设配置
 * 包括社交媒体、教程制作、漫画拼接等常见场景
 */

import type { LongImageDirection } from '@/layout/LongImageLayoutGenerator'
import type { SizeCalculationMode } from '@/core/canvas/CanvasSizeCalculator'

/**
 * 长图场景预设配置
 */
export interface LongImagePreset {
  /** 预设ID */
  readonly id: string
  
  /** 预设名称 */
  readonly name: string
  
  /** 预设描述 */
  readonly description: string
  
  /** 预设图标（可选） */
  readonly icon?: string
  
  /** 拼接方向 */
  readonly direction: LongImageDirection
  
  /** 尺寸计算模式 */
  readonly sizeMode: SizeCalculationMode
  
  /** 固定宽度（用于fixed-width模式） */
  readonly fixedWidth?: number
  
  /** 固定高度（用于fixed-height模式） */
  readonly fixedHeight?: number
  
  /** 图片间距 */
  readonly spacing: number
  
  /** 边距 */
  readonly padding: number
  
  /** 圆角 */
  readonly radius: number
  
  /** 背景颜色 */
  readonly bgColor?: string
  
  /** 推荐画布尺寸（可选） */
  readonly recommendedSize?: {
    width: number
    height: number
  }
  
  /** 使用场景标签 */
  readonly tags: readonly string[]
}

/**
 * 社交媒体预设
 */
export const SOCIAL_MEDIA_PRESETS: readonly LongImagePreset[] = [
  {
    id: 'xiaohongshu',
    name: '小红书',
    description: '小红书平台长图，3:4比例，适合多图展示',
    icon: '📱',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#ffffff',
    recommendedSize: {
      width: 1080,
      height: 1440
    },
    tags: ['社交媒体', '小红书', '竖版']
  },
  {
    id: 'weibo',
    name: '微博长图',
    description: '微博平台长图，竖向无缝拼接',
    icon: '🐦',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#ffffff',
    tags: ['社交媒体', '微博', '竖版']
  },
  {
    id: 'wechat-moments',
    name: '朋友圈',
    description: '微信朋友圈九宫格长图',
    icon: '💬',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 10,
    padding: 10,
    radius: 8,
    bgColor: '#f5f5f5',
    tags: ['社交媒体', '微信', '朋友圈']
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: 'Instagram故事模式，9:16比例',
    icon: '📸',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#000000',
    recommendedSize: {
      width: 1080,
      height: 1920
    },
    tags: ['社交媒体', 'Instagram', '竖版']
  },
  {
    id: 'douyin',
    name: '抖音',
    description: '抖音短视频封面长图，9:16比例',
    icon: '🎵',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#000000',
    recommendedSize: {
      width: 1080,
      height: 1920
    },
    tags: ['社交媒体', '抖音', '竖版']
  }
]

/**
 * 教程制作预设
 */
export const TUTORIAL_PRESETS: readonly LongImagePreset[] = [
  {
    id: 'tutorial-steps',
    name: '教程步骤',
    description: '教程步骤截图，带间距和边距，便于添加说明',
    icon: '📚',
    direction: 'vertical',
    sizeMode: 'auto',
    spacing: 20,
    padding: 20,
    radius: 8,
    bgColor: '#f8f9fa',
    tags: ['教程', '步骤', '竖版']
  },
  {
    id: 'tutorial-compact',
    name: '紧凑教程',
    description: '紧凑型教程，无间距，适合内容密集展示',
    icon: '📖',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#ffffff',
    tags: ['教程', '紧凑', '竖版']
  },
  {
    id: 'code-tutorial',
    name: '代码教程',
    description: '代码截图教程，深色背景，适合代码展示',
    icon: '💻',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1200,
    spacing: 10,
    padding: 20,
    radius: 4,
    bgColor: '#1e1e1e',
    tags: ['教程', '代码', '竖版']
  },
  {
    id: 'comparison',
    name: '对比展示',
    description: '前后对比，适合展示变化过程',
    icon: '⚖️',
    direction: 'horizontal',
    sizeMode: 'fixed-height',
    fixedHeight: 1080,
    spacing: 20,
    padding: 20,
    radius: 8,
    bgColor: '#ffffff',
    tags: ['教程', '对比', '横版']
  }
]

/**
 * 漫画与创作预设
 */
export const COMIC_PRESETS: readonly LongImagePreset[] = [
  {
    id: 'comic-vertical',
    name: '竖版漫画',
    description: '竖向漫画条漫，无缝拼接',
    icon: '📖',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 800,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#ffffff',
    tags: ['漫画', '条漫', '竖版']
  },
  {
    id: 'comic-horizontal',
    name: '横版漫画',
    description: '横向漫画长卷，适合全景展示',
    icon: '📜',
    direction: 'horizontal',
    sizeMode: 'fixed-height',
    fixedHeight: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#ffffff',
    tags: ['漫画', '长卷', '横版']
  },
  {
    id: 'illustration',
    name: '插画作品集',
    description: '插画作品展示，带边距和圆角',
    icon: '🎨',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 30,
    padding: 30,
    radius: 12,
    bgColor: '#fafafa',
    tags: ['插画', '作品集', '竖版']
  }
]

/**
 * 截图拼接预设
 */
export const SCREENSHOT_PRESETS: readonly LongImagePreset[] = [
  {
    id: 'screenshot-seamless',
    name: '无缝截图',
    description: '网页或应用截图，无缝拼接',
    icon: '📱',
    direction: 'vertical',
    sizeMode: 'auto',
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#ffffff',
    tags: ['截图', '无缝', '竖版']
  },
  {
    id: 'screenshot-with-gap',
    name: '分段截图',
    description: '带间距的截图拼接，便于区分不同部分',
    icon: '📸',
    direction: 'vertical',
    sizeMode: 'auto',
    spacing: 10,
    padding: 10,
    radius: 4,
    bgColor: '#f5f5f5',
    tags: ['截图', '分段', '竖版']
  },
  {
    id: 'mobile-screenshot',
    name: '手机截图',
    description: '手机应用截图，适合App展示',
    icon: '📱',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 20,
    padding: 20,
    radius: 12,
    bgColor: '#000000',
    tags: ['截图', '手机', '竖版']
  },
  {
    id: 'desktop-screenshot',
    name: '桌面截图',
    description: '桌面应用截图，横向拼接',
    icon: '🖥️',
    direction: 'horizontal',
    sizeMode: 'fixed-height',
    fixedHeight: 900,
    spacing: 10,
    padding: 10,
    radius: 4,
    bgColor: '#e5e5e5',
    tags: ['截图', '桌面', '横版']
  }
]

/**
 * 全景与特殊预设
 */
export const SPECIAL_PRESETS: readonly LongImagePreset[] = [
  {
    id: 'panorama',
    name: '全景拼接',
    description: '全景照片无缝拼接',
    icon: '🌄',
    direction: 'horizontal',
    sizeMode: 'fixed-height',
    fixedHeight: 1080,
    spacing: 0,
    padding: 0,
    radius: 0,
    bgColor: '#000000',
    tags: ['全景', '横版']
  },
  {
    id: 'timeline',
    name: '时间线',
    description: '时间线展示，适合展示过程',
    icon: '📅',
    direction: 'horizontal',
    sizeMode: 'fixed-height',
    fixedHeight: 800,
    spacing: 20,
    padding: 20,
    radius: 8,
    bgColor: '#ffffff',
    tags: ['时间线', '横版']
  },
  {
    id: 'product-showcase',
    name: '产品展示',
    description: '产品照片展示，适合电商',
    icon: '🛍️',
    direction: 'vertical',
    sizeMode: 'fixed-width',
    fixedWidth: 1080,
    spacing: 30,
    padding: 30,
    radius: 16,
    bgColor: '#ffffff',
    tags: ['产品', '电商', '竖版']
  },
  {
    id: 'before-after',
    name: '前后对比',
    description: '前后效果对比，适合美妆、装修等',
    icon: '↔️',
    direction: 'horizontal',
    sizeMode: 'fixed-height',
    fixedHeight: 1080,
    spacing: 40,
    padding: 40,
    radius: 12,
    bgColor: '#fafafa',
    tags: ['对比', '横版']
  }
]

/**
 * 所有预设集合
 */
export const ALL_PRESETS: readonly LongImagePreset[] = [
  ...SOCIAL_MEDIA_PRESETS,
  ...TUTORIAL_PRESETS,
  ...COMIC_PRESETS,
  ...SCREENSHOT_PRESETS,
  ...SPECIAL_PRESETS
]

/**
 * 预设分类
 */
export const PRESET_CATEGORIES = [
  {
    id: 'social',
    name: '社交媒体',
    icon: '📱',
    presets: SOCIAL_MEDIA_PRESETS
  },
  {
    id: 'tutorial',
    name: '教程制作',
    icon: '📚',
    presets: TUTORIAL_PRESETS
  },
  {
    id: 'comic',
    name: '漫画创作',
    icon: '🎨',
    presets: COMIC_PRESETS
  },
  {
    id: 'screenshot',
    name: '截图拼接',
    icon: '📸',
    presets: SCREENSHOT_PRESETS
  },
  {
    id: 'special',
    name: '特殊场景',
    icon: '✨',
    presets: SPECIAL_PRESETS
  }
] as const

/**
 * 预设映射表（用于快速查找）
 */
export const PRESET_MAP = new Map<string, LongImagePreset>(
  ALL_PRESETS.map(preset => [preset.id, preset])
)

/**
 * 根据ID获取预设
 */
export function getPresetById(id: string): LongImagePreset | undefined {
  return PRESET_MAP.get(id)
}

/**
 * 根据标签搜索预设
 */
export function searchPresetsByTag(tag: string): readonly LongImagePreset[] {
  const lowerTag = tag.toLowerCase()
  return ALL_PRESETS.filter(preset =>
    preset.tags.some(t => t.toLowerCase().includes(lowerTag))
  )
}

/**
 * 根据方向筛选预设
 */
export function filterPresetsByDirection(
  direction: LongImageDirection
): readonly LongImagePreset[] {
  return ALL_PRESETS.filter(preset => preset.direction === direction)
}

/**
 * 获取推荐预设（根据图片数量）
 */
export function getRecommendedPresets(imageCount: number): readonly LongImagePreset[] {
  // 根据图片数量推荐合适的预设
  if (imageCount <= 2) {
    return [
      getPresetById('before-after')!,
      getPresetById('comparison')!
    ]
  } else if (imageCount <= 5) {
    return [
      getPresetById('tutorial-steps')!,
      getPresetById('xiaohongshu')!,
      getPresetById('screenshot-with-gap')!
    ]
  } else if (imageCount <= 10) {
    return [
      getPresetById('weibo')!,
      getPresetById('tutorial-compact')!,
      getPresetById('comic-vertical')!
    ]
  } else {
    return [
      getPresetById('screenshot-seamless')!,
      getPresetById('comic-vertical')!,
      getPresetById('panorama')!
    ]
  }
}


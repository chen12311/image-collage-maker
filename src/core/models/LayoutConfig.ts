/**
 * 布局配置模型
 * 
 * 定义图片拼接的布局方式，支持24种布局模式
 */

/**
 * 布局类型 - 使用字符串标识符
 */
export type LayoutType = string

/**
 * 布局分类
 */
export enum LayoutCategory {
  /** 基础网格布局 */
  Grid = 'grid',
  /** 创意组合布局 */
  Creative = 'creative',
  /** 社交媒体布局 */
  Social = 'social'
}

/**
 * 单元格定义
 * [x, y, width, height] - 归一化坐标（0-1范围）
 */
export type Cell = readonly [number, number, number, number]

/**
 * 布局模板接口
 */
export interface LayoutTemplate {
  /** 唯一标识符 */
  readonly id: string
  
  /** 显示名称 */
  readonly name: string
  
  /** 布局分类 */
  readonly category: LayoutCategory
  
  /** 单元格列表 */
  readonly cells: readonly Cell[]
  
  /** 图片数量 */
  readonly imageCount: number
  
  /** 搜索标签 */
  readonly tags: readonly string[]
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  /** 布局类型ID */
  readonly type: string
  
  /** 单元格列表 */
  readonly cells: readonly Cell[]
  
  /** 图片间距（像素） */
  readonly spacing: number
  
  /** 边距（像素） */
  readonly padding: number
  
  /** 圆角半径（像素） */
  readonly radius: number
}

/**
 * 所有布局模板
 */
export const LAYOUT_TEMPLATES: readonly LayoutTemplate[] = [
  // ============================================================================
  // 基础网格类（13种）
  // ============================================================================
  {
    id: 'grid-1x1',
    name: '单图',
    category: LayoutCategory.Grid,
    cells: [[0, 0, 1, 1]],
    imageCount: 1,
    tags: ['单图', '1图', '基础']
  },
  {
    id: 'grid-2x1-h',
    name: '2图横排',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.5, 1],
      [0.5, 0, 0.5, 1]
    ],
    imageCount: 2,
    tags: ['2图', '横排', '基础']
  },
  {
    id: 'grid-1x2-v',
    name: '2图竖排',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 1, 0.5],
      [0, 0.5, 1, 0.5]
    ],
    imageCount: 2,
    tags: ['2图', '竖排', '基础']
  },
  {
    id: 'grid-3x1-h',
    name: '3图横排',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.33, 1],
      [0.33, 0, 0.34, 1],
      [0.67, 0, 0.33, 1]
    ],
    imageCount: 3,
    tags: ['3图', '横排', '基础']
  },
  {
    id: 'grid-1x3-v',
    name: '3图竖排',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 1, 0.33],
      [0, 0.33, 1, 0.34],
      [0, 0.67, 1, 0.33]
    ],
    imageCount: 3,
    tags: ['3图', '竖排', '基础']
  },
  {
    id: 'grid-2x2',
    name: '4图田字格',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5]
    ],
    imageCount: 4,
    tags: ['4图', '田字格', '基础', '正方形']
  },
  {
    id: 'grid-2x3',
    name: '6图网格(2行3列)',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.33, 0.5],
      [0.33, 0, 0.34, 0.5],
      [0.67, 0, 0.33, 0.5],
      [0, 0.5, 0.33, 0.5],
      [0.33, 0.5, 0.34, 0.5],
      [0.67, 0.5, 0.33, 0.5]
    ],
    imageCount: 6,
    tags: ['6图', '网格', '基础']
  },
  {
    id: 'grid-3x2',
    name: '6图网格(3行2列)',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.5, 0.33],
      [0.5, 0, 0.5, 0.33],
      [0, 0.33, 0.5, 0.34],
      [0.5, 0.33, 0.5, 0.34],
      [0, 0.67, 0.5, 0.33],
      [0.5, 0.67, 0.5, 0.33]
    ],
    imageCount: 6,
    tags: ['6图', '网格', '基础']
  },
  {
    id: 'grid-3x3',
    name: '9图九宫格',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.33, 0.33],
      [0.33, 0, 0.34, 0.33],
      [0.67, 0, 0.33, 0.33],
      [0, 0.33, 0.33, 0.34],
      [0.33, 0.33, 0.34, 0.34],
      [0.67, 0.33, 0.33, 0.34],
      [0, 0.67, 0.33, 0.33],
      [0.33, 0.67, 0.34, 0.33],
      [0.67, 0.67, 0.33, 0.33]
    ],
    imageCount: 9,
    tags: ['9图', '九宫格', '基础', '正方形']
  },
  {
    id: 'grid-4x2',
    name: '8图网格(4行2列)',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.5, 0.25],
      [0.5, 0, 0.5, 0.25],
      [0, 0.25, 0.5, 0.25],
      [0.5, 0.25, 0.5, 0.25],
      [0, 0.5, 0.5, 0.25],
      [0.5, 0.5, 0.5, 0.25],
      [0, 0.75, 0.5, 0.25],
      [0.5, 0.75, 0.5, 0.25]
    ],
    imageCount: 8,
    tags: ['8图', '网格', '基础']
  },
  {
    id: 'grid-2x4',
    name: '8图网格(2行4列)',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.25, 0.5],
      [0.25, 0, 0.25, 0.5],
      [0.5, 0, 0.25, 0.5],
      [0.75, 0, 0.25, 0.5],
      [0, 0.5, 0.25, 0.5],
      [0.25, 0.5, 0.25, 0.5],
      [0.5, 0.5, 0.25, 0.5],
      [0.75, 0.5, 0.25, 0.5]
    ],
    imageCount: 8,
    tags: ['8图', '网格', '基础']
  },
  {
    id: 'grid-4x3',
    name: '12图网格(4行3列)',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.33, 0.25],
      [0.33, 0, 0.34, 0.25],
      [0.67, 0, 0.33, 0.25],
      [0, 0.25, 0.33, 0.25],
      [0.33, 0.25, 0.34, 0.25],
      [0.67, 0.25, 0.33, 0.25],
      [0, 0.5, 0.33, 0.25],
      [0.33, 0.5, 0.34, 0.25],
      [0.67, 0.5, 0.33, 0.25],
      [0, 0.75, 0.33, 0.25],
      [0.33, 0.75, 0.34, 0.25],
      [0.67, 0.75, 0.33, 0.25]
    ],
    imageCount: 12,
    tags: ['12图', '网格', '基础']
  },
  {
    id: 'grid-4x4',
    name: '16图网格(4行4列)',
    category: LayoutCategory.Grid,
    cells: [
      [0, 0, 0.25, 0.25],
      [0.25, 0, 0.25, 0.25],
      [0.5, 0, 0.25, 0.25],
      [0.75, 0, 0.25, 0.25],
      [0, 0.25, 0.25, 0.25],
      [0.25, 0.25, 0.25, 0.25],
      [0.5, 0.25, 0.25, 0.25],
      [0.75, 0.25, 0.25, 0.25],
      [0, 0.5, 0.25, 0.25],
      [0.25, 0.5, 0.25, 0.25],
      [0.5, 0.5, 0.25, 0.25],
      [0.75, 0.5, 0.25, 0.25],
      [0, 0.75, 0.25, 0.25],
      [0.25, 0.75, 0.25, 0.25],
      [0.5, 0.75, 0.25, 0.25],
      [0.75, 0.75, 0.25, 0.25]
    ],
    imageCount: 16,
    tags: ['16图', '网格', '基础', '正方形']
  },
  
  // ============================================================================
  // 创意组合类（8种）
  // ============================================================================
  {
    id: 'creative-L-1',
    name: 'L型布局-左大右小',
    category: LayoutCategory.Creative,
    cells: [
      [0, 0, 0.67, 1],      // 左侧大图
      [0.67, 0, 0.33, 0.5], // 右上小图
      [0.67, 0.5, 0.33, 0.5] // 右下小图
    ],
    imageCount: 3,
    tags: ['3图', 'L型', '创意', '主副图']
  },
  {
    id: 'creative-L-2',
    name: 'L型布局-右大左小',
    category: LayoutCategory.Creative,
    cells: [
      [0, 0, 0.33, 0.5],    // 左上小图
      [0, 0.5, 0.33, 0.5],  // 左下小图
      [0.33, 0, 0.67, 1]    // 右侧大图
    ],
    imageCount: 3,
    tags: ['3图', 'L型', '创意', '主副图']
  },
  {
    id: 'creative-T-1',
    name: 'T型布局-上大下小',
    category: LayoutCategory.Creative,
    cells: [
      [0, 0, 1, 0.67],      // 上方大图
      [0, 0.67, 0.5, 0.33], // 下左小图
      [0.5, 0.67, 0.5, 0.33] // 下右小图
    ],
    imageCount: 3,
    tags: ['3图', 'T型', '创意', '主副图']
  },
  {
    id: 'creative-T-2',
    name: 'T型布局-下大上小',
    category: LayoutCategory.Creative,
    cells: [
      [0, 0, 0.5, 0.33],    // 上左小图
      [0.5, 0, 0.5, 0.33],  // 上右小图
      [0, 0.33, 1, 0.67]    // 下方大图
    ],
    imageCount: 3,
    tags: ['3图', 'T型', '创意', '主副图']
  },
  {
    id: 'creative-focus-4',
    name: '中心聚焦-1大4小',
    category: LayoutCategory.Creative,
    cells: [
      [0.25, 0.25, 0.5, 0.5], // 中央大图
      [0, 0, 0.25, 0.25],      // 左上小图
      [0.75, 0, 0.25, 0.25],   // 右上小图
      [0, 0.75, 0.25, 0.25],   // 左下小图
      [0.75, 0.75, 0.25, 0.25] // 右下小图
    ],
    imageCount: 5,
    tags: ['5图', '聚焦', '创意', '主副图']
  },
  {
    id: 'creative-diagonal',
    name: '对角线排列',
    category: LayoutCategory.Creative,
    cells: [
      [0, 0, 0.4, 0.4],       // 左上
      [0.3, 0.3, 0.4, 0.4],   // 中央
      [0.6, 0.6, 0.4, 0.4]    // 右下
    ],
    imageCount: 3,
    tags: ['3图', '对角线', '创意', '错位']
  },
  {
    id: 'creative-pyramid',
    name: '金字塔型(1-2-3)',
    category: LayoutCategory.Creative,
    cells: [
      [0.33, 0, 0.34, 0.33],     // 顶部1图
      [0.17, 0.33, 0.33, 0.34],  // 中间左
      [0.5, 0.33, 0.33, 0.34],   // 中间右
      [0, 0.67, 0.25, 0.33],     // 底部1
      [0.25, 0.67, 0.25, 0.33],  // 底部2
      [0.5, 0.67, 0.25, 0.33],   // 底部3
      [0.75, 0.67, 0.25, 0.33]   // 底部4
    ],
    imageCount: 7,
    tags: ['7图', '金字塔', '创意', '层次']
  },
  {
    id: 'creative-magazine',
    name: '杂志风格',
    category: LayoutCategory.Creative,
    cells: [
      [0, 0, 0.6, 0.7],       // 左侧大图
      [0.6, 0, 0.4, 0.35],    // 右上中图
      [0.6, 0.35, 0.4, 0.35], // 右中图
      [0, 0.7, 0.3, 0.3],     // 左下小图
      [0.3, 0.7, 0.3, 0.3],   // 中下小图
      [0.6, 0.7, 0.4, 0.3]    // 右下小图
    ],
    imageCount: 6,
    tags: ['6图', '杂志', '创意', '不规则']
  },
  
  // ============================================================================
  // 社交媒体类（3种）
  // ============================================================================
  {
    id: 'social-instagram',
    name: 'Instagram九宫格',
    category: LayoutCategory.Social,
    cells: [
      [0, 0, 0.33, 0.33],
      [0.33, 0, 0.34, 0.33],
      [0.67, 0, 0.33, 0.33],
      [0, 0.33, 0.33, 0.34],
      [0.33, 0.33, 0.34, 0.34],
      [0.67, 0.33, 0.33, 0.34],
      [0, 0.67, 0.33, 0.33],
      [0.33, 0.67, 0.34, 0.33],
      [0.67, 0.67, 0.33, 0.33]
    ],
    imageCount: 9,
    tags: ['9图', 'Instagram', '社交', '正方形']
  },
  {
    id: 'social-wechat',
    name: '微信朋友圈样式',
    category: LayoutCategory.Social,
    cells: [
      [0, 0, 0.33, 0.33],
      [0.33, 0, 0.34, 0.33],
      [0.67, 0, 0.33, 0.33],
      [0, 0.33, 0.33, 0.34],
      [0.33, 0.33, 0.34, 0.34],
      [0.67, 0.33, 0.33, 0.34],
      [0, 0.67, 0.33, 0.33],
      [0.33, 0.67, 0.34, 0.33],
      [0.67, 0.67, 0.33, 0.33]
    ],
    imageCount: 9,
    tags: ['9图', '微信', '朋友圈', '社交']
  },
  {
    id: 'social-story',
    name: '竖屏故事模式',
    category: LayoutCategory.Social,
    cells: [
      [0.2, 0, 0.6, 0.5],    // 上方故事图
      [0.2, 0.5, 0.6, 0.5]   // 下方故事图
    ],
    imageCount: 2,
    tags: ['2图', '故事', '竖屏', '社交', 'Story']
  }
]

/**
 * 布局模板映射表（用于快速查找）
 */
export const LAYOUT_MAP = new Map<string, LayoutTemplate>(
  LAYOUT_TEMPLATES.map(template => [template.id, template])
)

/**
 * 默认布局配置
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  type: 'grid-1x1',
  cells: LAYOUT_MAP.get('grid-1x1')!.cells,
  spacing: 10,
  padding: 0,
  radius: 0
}

/**
 * 创建布局配置
 */
export function createLayoutConfig(
  type: string = 'grid-1x1',
  spacing: number = 10,
  padding: number = 0,
  radius: number = 0
): LayoutConfig {
  const template = LAYOUT_MAP.get(type)
  
  if (!template) {
    console.warn(`未找到布局模板: ${type}，使用默认布局`)
    return DEFAULT_LAYOUT_CONFIG
  }
  
  return {
    type,
    cells: template.cells,
    spacing,
    padding,
    radius
  }
}

/**
 * 根据ID获取布局模板
 */
export function getLayoutById(id: string): LayoutTemplate | undefined {
  return LAYOUT_MAP.get(id)
}

/**
 * 根据分类获取布局模板列表
 */
export function getLayoutsByCategory(category: LayoutCategory): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter(template => template.category === category)
}

/**
 * 搜索布局模板
 */
export function searchLayouts(keyword: string): LayoutTemplate[] {
  const lowerKeyword = keyword.toLowerCase()
  return LAYOUT_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowerKeyword) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * 获取所有分类
 */
export function getAllCategories(): LayoutCategory[] {
  return [LayoutCategory.Grid, LayoutCategory.Creative, LayoutCategory.Social]
}

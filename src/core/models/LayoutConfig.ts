/**
 * 布局配置模型
 * 
 * 定义图片拼接的布局方式，支持1-4宫格布局
 */

/**
 * 布局类型
 * 1: 单图
 * 2: 2图横排
 * 3: 3图横排  
 * 4: 4图田字格
 */
export type LayoutType = 1 | 2 | 3 | 4

/**
 * 单元格定义
 * [x, y, width, height] - 归一化坐标（0-1范围）
 */
export type Cell = readonly [number, number, number, number]

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  /** 布局类型 */
  readonly type: LayoutType
  
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
 * 预定义布局模板
 * 基于demo中的layouts对象
 */
export const LAYOUT_TEMPLATES: Record<LayoutType, readonly Cell[]> = {
  1: [[0, 0, 1, 1]],
  2: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  3: [[0, 0, 0.33, 1], [0.33, 0, 0.34, 1], [0.67, 0, 0.33, 1]],
  4: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]
}

/**
 * 默认布局配置
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  type: 1,
  cells: LAYOUT_TEMPLATES[1],
  spacing: 10,
  padding: 0,
  radius: 0
}

/**
 * 创建布局配置
 */
export function createLayoutConfig(
  type: LayoutType = 1,
  spacing: number = 10,
  padding: number = 0,
  radius: number = 0
): LayoutConfig {
  return {
    type,
    cells: LAYOUT_TEMPLATES[type],
    spacing,
    padding,
    radius
  }
}


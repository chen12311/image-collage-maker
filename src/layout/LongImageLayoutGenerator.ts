/**
 * 长图布局生成器
 * 
 * 根据图片数量和配置动态生成竖向或横向的长图布局
 * 支持自动计算单元格位置、智能尺寸适配
 */

import type { Cell, LayoutTemplate } from '@/core/models'

/**
 * 长图方向
 */
export type LongImageDirection = 'vertical' | 'horizontal'

/**
 * 长图布局配置
 */
export interface LongImageConfig {
  /** 图片数量 */
  imageCount: number
  
  /** 方向（竖向/横向） */
  direction: LongImageDirection
  
  /** 是否无缝拼接（间距为0） */
  seamless?: boolean
  
  /** 自定义单元格高度/宽度比例（可选） */
  cellRatio?: number
}

/**
 * 长图布局生成器
 */
export class LongImageLayoutGenerator {
  /**
   * 生成长图布局
   * 
   * @param config 长图配置
   * @returns 布局模板
   */
  static generate(config: LongImageConfig): LayoutTemplate {
    const { imageCount, direction, seamless = false } = config
    
    if (imageCount <= 0) {
      throw new Error('图片数量必须大于0')
    }
    
    // 根据方向生成布局
    const cells = direction === 'vertical' 
      ? this.generateVerticalCells(imageCount)
      : this.generateHorizontalCells(imageCount)
    
    // 生成布局ID和名称
    const id = `long-image-${direction}-${imageCount}`
    const name = direction === 'vertical' 
      ? `竖向长图 (${imageCount}张)` 
      : `横向长图 (${imageCount}张)`
    
    return {
      id,
      name,
      cells,
      imageCount,
      tags: ['长图', direction === 'vertical' ? '竖向' : '横向', `${imageCount}图`]
    }
  }
  
  /**
   * 生成竖向单元格
   * 每个单元格宽度为100%，高度平均分配
   */
  private static generateVerticalCells(count: number): readonly Cell[] {
    const cells: Cell[] = []
    const cellHeight = 1 / count
    
    for (let i = 0; i < count; i++) {
      const y = i * cellHeight
      cells.push([0, y, 1, cellHeight])
    }
    
    return cells
  }
  
  /**
   * 生成横向单元格
   * 每个单元格高度为100%，宽度平均分配
   */
  private static generateHorizontalCells(count: number): readonly Cell[] {
    const cells: Cell[] = []
    const cellWidth = 1 / count
    
    for (let i = 0; i < count; i++) {
      const x = i * cellWidth
      cells.push([x, 0, cellWidth, 1])
    }
    
    return cells
  }
  
  /**
   * 生成自适应竖向布局（根据图片实际尺寸）
   * 
   * @param imageSizes 图片尺寸数组 [{width, height}, ...]
   * @returns 布局单元格
   */
  static generateAdaptiveVerticalCells(
    imageSizes: Array<{ width: number; height: number }>
  ): readonly Cell[] {
    if (imageSizes.length === 0) {
      return []
    }
    
    // 计算总高度（基于固定宽度）
    const fixedWidth = 1 // 归一化宽度
    const heights = imageSizes.map(size => {
      // 计算在固定宽度下的归一化高度
      return (size.height / size.width) * fixedWidth
    })
    
    const totalHeight = heights.reduce((sum, h) => sum + h, 0)
    
    // 生成单元格
    const cells: Cell[] = []
    let currentY = 0
    
    for (let i = 0; i < imageSizes.length; i++) {
      const normalizedHeight = heights[i] / totalHeight
      cells.push([0, currentY, 1, normalizedHeight])
      currentY += normalizedHeight
    }
    
    return cells
  }
  
  /**
   * 生成自适应横向布局（根据图片实际尺寸）
   * 
   * @param imageSizes 图片尺寸数组 [{width, height}, ...]
   * @returns 布局单元格
   */
  static generateAdaptiveHorizontalCells(
    imageSizes: Array<{ width: number; height: number }>
  ): readonly Cell[] {
    if (imageSizes.length === 0) {
      return []
    }
    
    // 计算总宽度（基于固定高度）
    const fixedHeight = 1 // 归一化高度
    const widths = imageSizes.map(size => {
      // 计算在固定高度下的归一化宽度
      return (size.width / size.height) * fixedHeight
    })
    
    const totalWidth = widths.reduce((sum, w) => sum + w, 0)
    
    // 生成单元格
    const cells: Cell[] = []
    let currentX = 0
    
    for (let i = 0; i < imageSizes.length; i++) {
      const normalizedWidth = widths[i] / totalWidth
      cells.push([currentX, 0, normalizedWidth, 1])
      currentX += normalizedWidth
    }
    
    return cells
  }
  
  /**
   * 检查是否为长图布局
   */
  static isLongImageLayout(layoutId: string): boolean {
    return layoutId.startsWith('long-image-')
  }
  
  /**
   * 从布局ID中提取配置信息
   */
  static parseLayoutId(layoutId: string): LongImageConfig | null {
    if (!this.isLongImageLayout(layoutId)) {
      return null
    }
    
    // 格式: long-image-{direction}-{count}
    const parts = layoutId.split('-')
    if (parts.length < 4) {
      return null
    }
    
    const direction = parts[2] as LongImageDirection
    const imageCount = parseInt(parts[3], 10)
    
    if (isNaN(imageCount)) {
      return null
    }
    
    return {
      imageCount,
      direction,
      seamless: false
    }
  }
}

/**
 * 快捷生成函数 - 竖向长图
 */
export function generateVerticalLongImage(imageCount: number): LayoutTemplate {
  return LongImageLayoutGenerator.generate({
    imageCount,
    direction: 'vertical'
  })
}

/**
 * 快捷生成函数 - 横向长图
 */
export function generateHorizontalLongImage(imageCount: number): LayoutTemplate {
  return LongImageLayoutGenerator.generate({
    imageCount,
    direction: 'horizontal'
  })
}


/**
 * 画布尺寸计算器
 * 
 * 根据图片数量和尺寸自动计算最佳画布大小
 * 支持固定宽度/高度模式、智能适配不同尺寸的图片
 */

import type { ImageElement } from '@/core/models'

/**
 * 尺寸计算模式
 */
export type SizeCalculationMode = 
  | 'fixed-width'      // 固定宽度，自动计算高度
  | 'fixed-height'     // 固定高度，自动计算宽度
  | 'auto'             // 自动计算最佳尺寸
  | 'preset'           // 使用预设尺寸

/**
 * 画布尺寸
 */
export interface CanvasSize {
  width: number
  height: number
}

/**
 * 尺寸计算配置
 */
export interface SizeCalculationConfig {
  /** 计算模式 */
  mode: SizeCalculationMode
  
  /** 方向（'vertical' | 'horizontal'，可选） */
  direction?: 'vertical' | 'horizontal'
  
  /** 固定宽度（当mode为fixed-width时使用） */
  fixedWidth?: number
  
  /** 固定高度（当mode为fixed-height时使用） */
  fixedHeight?: number
  
  /** 图片间距 */
  spacing?: number
  
  /** 边距 */
  padding?: number
  
  /** 最大宽度限制 */
  maxWidth?: number
  
  /** 最大高度限制 */
  maxHeight?: number
  
  /** 最小宽度 */
  minWidth?: number
  
  /** 最小高度 */
  minHeight?: number
}

/**
 * 画布尺寸计算器
 */
export class CanvasSizeCalculator {
  /** 默认固定宽度（竖向长图） */
  static readonly DEFAULT_VERTICAL_WIDTH = 1080
  
  /** 默认固定高度（横向长图） */
  static readonly DEFAULT_HORIZONTAL_HEIGHT = 1080
  
  /** 默认最大宽度 */
  static readonly DEFAULT_MAX_WIDTH = 4096
  
  /** 默认最大高度 */
  static readonly DEFAULT_MAX_HEIGHT = 20000
  
  /** 默认最小宽度 */
  static readonly DEFAULT_MIN_WIDTH = 100
  
  /** 默认最小高度 */
  static readonly DEFAULT_MIN_HEIGHT = 100
  
  /**
   * 计算画布尺寸
   * 
   * @param images 图片列表
   * @param config 计算配置
   * @returns 计算后的画布尺寸
   */
  static calculate(
    images: ImageElement[],
    config: SizeCalculationConfig
  ): CanvasSize {
    // 过滤有效图片
    const validImages = images.filter(img => img && img !== null)
    
    if (validImages.length === 0) {
      // 没有图片时返回默认尺寸
      return this.getDefaultSize(config.direction || 'vertical')
    }
    
    const { mode, direction } = config
    
    switch (mode) {
      case 'fixed-width':
        return this.calculateWithFixedWidth(validImages, {
          ...config,
          fixedWidth: config.fixedWidth || this.DEFAULT_VERTICAL_WIDTH
        })
      
      case 'fixed-height':
        return this.calculateWithFixedHeight(validImages, {
          ...config,
          fixedHeight: config.fixedHeight || this.DEFAULT_HORIZONTAL_HEIGHT
        })
      
      case 'auto':
        return this.calculateAuto(validImages, config)
      
      case 'preset':
      default:
        // 预设模式不计算，由外部指定
        return this.getDefaultSize(direction || 'vertical')
    }
  }
  
  /**
   * 固定宽度模式计算
   */
  private static calculateWithFixedWidth(
    images: ImageElement[],
    config: SizeCalculationConfig
  ): CanvasSize {
    const { fixedWidth = this.DEFAULT_VERTICAL_WIDTH, spacing = 0, padding = 0 } = config
    
    // 计算可用宽度（减去边距）
    const availableWidth = fixedWidth - padding * 2
    
    // 计算总高度
    let totalHeight = padding * 2 // 上下边距
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      // 根据固定宽度计算图片高度
      const imgHeight = (img.height / img.width) * availableWidth
      totalHeight += imgHeight
      
      // 添加间距（除了最后一张图片）
      if (i < images.length - 1) {
        totalHeight += spacing
      }
    }
    
    // 应用高度限制
    const maxHeight = config.maxHeight || this.DEFAULT_MAX_HEIGHT
    const minHeight = config.minHeight || this.DEFAULT_MIN_HEIGHT
    const finalHeight = Math.max(minHeight, Math.min(maxHeight, Math.round(totalHeight)))
    
    return {
      width: fixedWidth,
      height: finalHeight
    }
  }
  
  /**
   * 固定高度模式计算
   */
  private static calculateWithFixedHeight(
    images: ImageElement[],
    config: SizeCalculationConfig
  ): CanvasSize {
    const { fixedHeight = this.DEFAULT_HORIZONTAL_HEIGHT, spacing = 0, padding = 0 } = config
    
    // 计算可用高度（减去边距）
    const availableHeight = fixedHeight - padding * 2
    
    // 计算总宽度
    let totalWidth = padding * 2 // 左右边距
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      // 根据固定高度计算图片宽度
      const imgWidth = (img.width / img.height) * availableHeight
      totalWidth += imgWidth
      
      // 添加间距（除了最后一张图片）
      if (i < images.length - 1) {
        totalWidth += spacing
      }
    }
    
    // 应用宽度限制
    const maxWidth = config.maxWidth || this.DEFAULT_MAX_WIDTH
    const minWidth = config.minWidth || this.DEFAULT_MIN_WIDTH
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, Math.round(totalWidth)))
    
    return {
      width: finalWidth,
      height: fixedHeight
    }
  }
  
  /**
   * 自动模式计算（智能选择最佳尺寸）
   */
  private static calculateAuto(
    images: ImageElement[],
    config: SizeCalculationConfig
  ): CanvasSize {
    const { direction } = config
    
    // 根据方向使用对应的固定模式
    if (direction === 'vertical') {
      return this.calculateWithFixedWidth(images, {
        ...config,
        fixedWidth: this.DEFAULT_VERTICAL_WIDTH
      })
    } else {
      return this.calculateWithFixedHeight(images, {
        ...config,
        fixedHeight: this.DEFAULT_HORIZONTAL_HEIGHT
      })
    }
  }
  
  /**
   * 获取默认尺寸
   */
  private static getDefaultSize(direction: 'vertical' | 'horizontal'): CanvasSize {
    if (direction === 'vertical') {
      return {
        width: this.DEFAULT_VERTICAL_WIDTH,
        height: this.DEFAULT_VERTICAL_WIDTH
      }
    } else {
      return {
        width: this.DEFAULT_HORIZONTAL_HEIGHT,
        height: this.DEFAULT_HORIZONTAL_HEIGHT
      }
    }
  }
  
  /**
   * 计算平均宽度
   */
  static calculateAverageWidth(images: ImageElement[]): number {
    if (images.length === 0) return 0
    const total = images.reduce((sum, img) => sum + img.width, 0)
    return Math.round(total / images.length)
  }
  
  /**
   * 计算平均高度
   */
  static calculateAverageHeight(images: ImageElement[]): number {
    if (images.length === 0) return 0
    const total = images.reduce((sum, img) => sum + img.height, 0)
    return Math.round(total / images.length)
  }
  
  /**
   * 计算平均宽高比
   */
  static calculateAverageRatio(images: ImageElement[]): number {
    if (images.length === 0) return 1
    const total = images.reduce((sum, img) => sum + (img.width / img.height), 0)
    return total / images.length
  }
  
  /**
   * 预估画布尺寸（快速预览，不精确计算）
   */
  static estimate(
    imageCount: number,
    direction: 'vertical' | 'horizontal',
    avgSize: { width: number; height: number }
  ): CanvasSize {
    if (direction === 'vertical') {
      return {
        width: this.DEFAULT_VERTICAL_WIDTH,
        height: Math.round(
          (this.DEFAULT_VERTICAL_WIDTH / avgSize.width) * avgSize.height * imageCount
        )
      }
    } else {
      return {
        width: Math.round(
          (this.DEFAULT_HORIZONTAL_HEIGHT / avgSize.height) * avgSize.width * imageCount
        ),
        height: this.DEFAULT_HORIZONTAL_HEIGHT
      }
    }
  }
}

/**
 * 快捷计算函数 - 竖向长图（固定宽度）
 */
export function calculateVerticalLongImageSize(
  images: ImageElement[],
  fixedWidth: number = CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH,
  spacing: number = 0,
  padding: number = 0
): CanvasSize {
  return CanvasSizeCalculator.calculate(images, {
    mode: 'fixed-width',
    direction: 'vertical',
    fixedWidth,
    spacing,
    padding
  })
}

/**
 * 快捷计算函数 - 横向长图（固定高度）
 */
export function calculateHorizontalLongImageSize(
  images: ImageElement[],
  fixedHeight: number = CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT,
  spacing: number = 0,
  padding: number = 0
): CanvasSize {
  return CanvasSizeCalculator.calculate(images, {
    mode: 'fixed-height',
    direction: 'horizontal',
    fixedHeight,
    spacing,
    padding
  })
}


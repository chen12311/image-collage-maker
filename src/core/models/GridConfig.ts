/**
 * GridConfig - 网格坐标系统配置
 * 
 * Linus哲学体现：
 * - 统一所有布局模式（横向=1×N，纵向=N×1，网格=M×N）
 * - 零特殊情况处理
 * - 简洁的数学模型
 */

export interface GridConfig {
  /** 网格行数 */
  readonly rows: number
  
  /** 网格列数 */
  readonly cols: number
  
  /** 单元格宽度（像素） */
  readonly cellWidth: number
  
  /** 单元格高度（像素） */
  readonly cellHeight: number
  
  /** 单元格间距（像素） */
  readonly spacing: number
}

/**
 * 网格坐标点
 */
export interface GridCoord {
  readonly gridX: number
  readonly gridY: number
}

/**
 * 像素坐标点  
 */
export interface PixelCoord {
  readonly x: number
  readonly y: number
}

/**
 * 尺寸接口
 */
export interface Size {
  readonly width: number
  readonly height: number
}

/**
 * 网格配置工厂方法
 * 提供常用布局的快速创建
 */
export class GridConfigBuilder {
  /**
   * 创建横向布局配置 (1×N网格)
   */
  static horizontal(imageCount: number, cellWidth = 200, cellHeight = 200, spacing = 10): GridConfig {
    return {
      rows: 1,
      cols: imageCount,
      cellWidth,
      cellHeight,
      spacing
    }
  }

  /**
   * 创建纵向布局配置 (N×1网格)
   */
  static vertical(imageCount: number, cellWidth = 200, cellHeight = 200, spacing = 10): GridConfig {
    return {
      rows: imageCount,
      cols: 1,
      cellWidth,
      cellHeight,
      spacing
    }
  }

  /**
   * 创建网格布局配置 (M×N网格)
   */
  static grid(rows: number, cols: number, cellWidth = 200, cellHeight = 200, spacing = 10): GridConfig {
    return {
      rows,
      cols,
      cellWidth,
      cellHeight,
      spacing
    }
  }

  /**
   * 自动检测最佳网格布局
   * 根据图片数量自动计算合理的行列数
   */
  static autoLayout(imageCount: number, cellWidth = 200, cellHeight = 200, spacing = 10): GridConfig {
    if (imageCount <= 0) {
      throw new Error('图片数量必须大于0')
    }

    if (imageCount === 1) {
      return this.grid(1, 1, cellWidth, cellHeight, spacing)
    }

    if (imageCount <= 3) {
      return this.horizontal(imageCount, cellWidth, cellHeight, spacing)
    }

    if (imageCount <= 6) {
      return this.grid(2, Math.ceil(imageCount / 2), cellWidth, cellHeight, spacing)
    }

    // 更多图片时使用接近正方形的网格
    const cols = Math.ceil(Math.sqrt(imageCount))
    const rows = Math.ceil(imageCount / cols)
    
    return this.grid(rows, cols, cellWidth, cellHeight, spacing)
  }

  /**
   * 验证网格配置的合理性
   */
  static validate(config: GridConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (config.rows <= 0) {
      errors.push('网格行数必须大于0')
    }

    if (config.cols <= 0) {
      errors.push('网格列数必须大于0')
    }

    if (config.cellWidth <= 0) {
      errors.push('单元格宽度必须大于0')
    }

    if (config.cellHeight <= 0) {
      errors.push('单元格高度必须大于0')  
    }

    if (config.spacing < 0) {
      errors.push('间距不能为负数')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * 布局模式枚举
 * 自动从网格配置推导，无需额外存储
 */
export type LayoutMode = 'horizontal' | 'vertical' | 'grid'

/**
 * 从网格配置推导布局模式
 * 体现"好品味"：让特殊情况成为一般情况的副产品
 */
export function detectLayoutMode(config: GridConfig): LayoutMode {
  if (config.rows === 1) return 'horizontal'
  if (config.cols === 1) return 'vertical'
  return 'grid'
}

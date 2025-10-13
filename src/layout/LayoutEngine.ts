/**
 * 布局计算引擎
 * 
 * 基于demo中的布局计算逻辑，计算每个图片单元格的实际像素位置和尺寸
 */

import type { LayoutConfig, Cell, LayoutTemplate, LayoutCategory } from '@/core/models'
import { getLayoutById, getLayoutsByCategory, searchLayouts } from '@/core/models'

/**
 * 计算后的单元格信息
 */
export interface ComputedCell {
  /** X坐标（像素） */
  readonly x: number
  
  /** Y坐标（像素） */
  readonly y: number
  
  /** 宽度（像素） */
  readonly width: number
  
  /** 高度（像素） */
  readonly height: number
  
  /** 单元格索引 */
  readonly index: number
}

/**
 * 布局计算结果
 */
export interface LayoutResult {
  /** 计算后的单元格列表 */
  readonly cells: readonly ComputedCell[]
  
  /** 可用区域宽度（减去边距后） */
  readonly availableWidth: number
  
  /** 可用区域高度（减去边距后） */
  readonly availableHeight: number
  
  /** 布局配置 */
  readonly config: LayoutConfig
}

/**
 * 布局引擎类
 * 
 * 参考demo中renderCanvas函数的布局计算逻辑
 */
export class LayoutEngine {
  /**
   * 计算布局
   * 
   * @param config 布局配置
   * @param canvasWidth 画布宽度
   * @param canvasHeight 画布高度
   * @returns 布局计算结果
   */
  static compute(
    config: LayoutConfig,
    canvasWidth: number,
    canvasHeight: number
  ): LayoutResult {
    // 计算可用区域（减去边距）
    const availableWidth = canvasWidth - config.padding * 2
    const availableHeight = canvasHeight - config.padding * 2
    
    // 计算每个单元格的实际位置和尺寸
    const cells = config.cells.map((cell, index) => 
      this.computeCell(cell, index, config, availableWidth, availableHeight)
    )
    
    return {
      cells,
      availableWidth,
      availableHeight,
      config
    }
  }
  
  /**
   * 计算单个单元格
   * 
   * 基于demo的逻辑：
   * - 使用归一化坐标 [x, y, w, h]
   * - 处理spacing（间距）
   * - 处理padding（边距）
   */
  private static computeCell(
    cell: Cell,
    index: number,
    config: LayoutConfig,
    availableWidth: number,
    availableHeight: number
  ): ComputedCell {
    const [normX, normY, normW, normH] = cell
    const { spacing, padding } = config
    
    // 计算单元格位置（基于归一化坐标）
    // 如果不是第一个单元格，需要考虑spacing的一半
    const cellX = padding + normX * availableWidth + (normX > 0 ? spacing / 2 : 0)
    const cellY = padding + normY * availableHeight + (normY > 0 ? spacing / 2 : 0)
    
    // 计算单元格尺寸
    // 需要减去两侧的spacing（如果有相邻单元格）
    const cellW = normW * availableWidth 
      - (normX > 0 ? spacing / 2 : 0) // 左侧spacing
      - (normX + normW < 1 ? spacing / 2 : 0) // 右侧spacing
      
    const cellH = normH * availableHeight
      - (normY > 0 ? spacing / 2 : 0) // 上侧spacing
      - (normY + normH < 1 ? spacing / 2 : 0) // 下侧spacing
    
    return {
      x: Math.round(cellX),
      y: Math.round(cellY),
      width: Math.round(cellW),
      height: Math.round(cellH),
      index
    }
  }
  
  /**
   * 获取指定索引的单元格
   */
  static getCell(result: LayoutResult, index: number): ComputedCell | undefined {
    return result.cells[index]
  }
  
  /**
   * 判断点是否在单元格内
   */
  static isPointInCell(cell: ComputedCell, x: number, y: number): boolean {
    return (
      x >= cell.x &&
      x <= cell.x + cell.width &&
      y >= cell.y &&
      y <= cell.y + cell.height
    )
  }
  
  /**
   * 查找包含指定点的单元格
   */
  static findCellAtPoint(result: LayoutResult, x: number, y: number): ComputedCell | undefined {
    return result.cells.find(cell => this.isPointInCell(cell, x, y))
  }
}

/**
 * 快捷计算函数
 */
export function computeLayout(
  config: LayoutConfig,
  canvasWidth: number,
  canvasHeight: number
): LayoutResult {
  return LayoutEngine.compute(config, canvasWidth, canvasHeight)
}

/**
 * 根据ID获取布局模板（重新导出）
 */
export { getLayoutById }

/**
 * 根据分类获取布局模板列表（重新导出）
 */
export { getLayoutsByCategory }

/**
 * 搜索布局模板（重新导出）
 */
export { searchLayouts }


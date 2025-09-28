/**
 * LayoutEngine - 统一布局引擎
 * 
 * Linus哲学体现：
 * - 零if/else分支，消除横向/纵向/网格的特殊情况
 * - 纯数学模型，一切都是网格坐标运算
 * - 贪心算法，简单高效
 * - 可组合的布局策略
 * 
 * 核心思想：所有布局都是网格填充问题，
 * 横向=1×N网格，纵向=N×1网格，网格=M×N网格
 */

import type { GridConfig, GridCoord, LayoutMode } from '../core/models/GridConfig'
import type { Transform } from '../core/models/Transform'
import type { Element } from '../core/models/Element'
import { GridConfigBuilder, detectLayoutMode } from '../core/models/GridConfig'
import { GridSystem, GridUtils } from './GridSystem'
import { TransformBuilder } from '../core/models/Transform'

/**
 * 布局策略枚举
 */
export type LayoutStrategy = 
  | 'auto'        // 自动选择最佳策略
  | 'tight'       // 紧密排列（最小画布尺寸）
  | 'loose'       // 宽松排列（更多空隙）
  | 'balanced'    // 平衡排列（接近正方形）

/**
 * 布局选项
 */
export interface LayoutOptions {
  /** 布局策略 */
  strategy: LayoutStrategy
  
  /** 单元格最小宽度 */
  minCellWidth: number
  
  /** 单元格最小高度 */
  minCellHeight: number
  
  /** 单元格间距 */
  spacing: number
  
  /** 是否保持元素原始尺寸比例 */
  preserveAspectRatio: boolean
  
  /** 最大画布尺寸限制 */
  maxCanvasSize?: { width: number; height: number }
  
  /** 是否允许元素重叠 */
  allowOverlap: boolean
}

/**
 * 布局结果
 */
export interface LayoutResult {
  /** 网格配置 */
  gridConfig: GridConfig
  
  /** 元素变换列表 */
  transforms: Transform[]
  
  /** 布局模式 */
  layoutMode: LayoutMode
  
  /** 画布尺寸 */
  canvasSize: { width: number; height: number }
  
  /** 布局统计 */
  statistics: {
    totalElements: number
    gridUtilization: number
    wastedSpace: number
    layoutEfficiency: number
  }
  
  /** 布局警告（如有） */
  warnings: string[]
}

/**
 * 自动布局引擎
 * 
 * 核心设计：一切布局问题都转化为网格填充数学问题
 * 零特殊情况，零条件分支
 */
export class LayoutEngine {
  /**
   * 自动布局元素
   * 
   * 这是核心方法，体现"好品味"：
   * 1. 所有布局类型统一处理
   * 2. 纯数学计算，无条件分支
   * 3. 可预测的结果
   * 
   * @param elements 要布局的元素列表
   * @param options 布局选项
   * @returns 布局结果
   */
  static autoLayout(elements: Element[], options: LayoutOptions): LayoutResult {
    if (elements.length === 0) {
      return this.createEmptyLayout(options)
    }

    // 第一步：分析元素特性
    const elementAnalysis = this.analyzeElements(elements, options)
    
    // 第二步：计算最佳网格配置
    const gridConfig = this.calculateOptimalGrid(elementAnalysis, options)
    
    // 第三步：分配元素到网格位置（贪心算法）
    const transforms = this.assignElementsToGrid(elementAnalysis, gridConfig, options)
    
    // 第四步：验证布局并生成统计
    const validation = this.validateLayout(transforms, gridConfig)
    
    return {
      gridConfig,
      transforms,
      layoutMode: detectLayoutMode(gridConfig),
      canvasSize: GridSystem.calculateCanvasSize(gridConfig),
      statistics: this.calculateStatistics(transforms, gridConfig),
      warnings: validation.warnings
    }
  }

  /**
   * 检测最佳布局模式
   * 
   * 基于元素数量和尺寸特性，自动推导最佳布局类型
   * 体现"好品味"：让算法自己发现最优解，而不是硬编码规则
   * 
   * @param elements 元素列表
   * @param options 布局选项
   * @returns 推荐的布局模式和配置
   */
  static detectOptimalLayout(
    elements: Element[], 
    options: LayoutOptions
  ): { mode: LayoutMode; config: GridConfig } {
    const count = elements.length
    
    if (count === 0) {
      return {
        mode: 'grid',
        config: GridConfigBuilder.grid(1, 1, options.minCellWidth, options.minCellHeight, options.spacing)
      }
    }

    const analysis = this.analyzeElements(elements, options)
    
    // 计算不同布局模式的效率分数
    const layouts = [
      this.evaluateHorizontalLayout(analysis, options),
      this.evaluateVerticalLayout(analysis, options),
      this.evaluateGridLayout(analysis, options)
    ]
    
    // 选择效率最高的布局
    const bestLayout = layouts.reduce((best, current) => 
      current.efficiency > best.efficiency ? current : best
    )
    
    return {
      mode: bestLayout.mode,
      config: bestLayout.config
    }
  }

  /**
   * 验证布局有效性
   * 
   * 检查布局是否存在问题：重叠、超界、空隙过大等
   * 
   * @param transforms 元素变换列表
   * @param gridConfig 网格配置
   * @returns 验证结果
   */
  static validateLayout(
    transforms: Transform[],
    gridConfig: GridConfig
  ): { isValid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = []
    const errors: string[] = []

    // 检查元素边界
    for (const transform of transforms) {
      if (!GridSystem.isElementInBounds(transform, gridConfig)) {
        errors.push(`元素超出网格边界: (${transform.gridX}, ${transform.gridY})`)
      }
    }

    // 检查元素重叠
    for (let i = 0; i < transforms.length; i++) {
      for (let j = i + 1; j < transforms.length; j++) {
        if (GridUtils.isOverlapping(transforms[i], transforms[j])) {
          warnings.push(`元素重叠: 元素${i} 与 元素${j}`)
        }
      }
    }

    // 检查网格利用率
    const utilization = GridUtils.getGridUtilization(transforms, gridConfig)
    if (utilization.utilizationRate < 0.5) {
      warnings.push(`网格利用率较低: ${(utilization.utilizationRate * 100).toFixed(1)}%`)
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    }
  }

  /**
   * 重新排列元素
   * 
   * 在现有布局基础上优化排列，消除重叠和空隙
   * 
   * @param transforms 当前变换列表
   * @param gridConfig 网格配置
   * @param strategy 排列策略
   * @returns 优化后的变换列表
   */
  static rearrangeElements(
    transforms: Transform[],
    gridConfig: GridConfig,
    strategy: 'compact' | 'distribute' | 'align' = 'compact'
  ): Transform[] {
    switch (strategy) {
      case 'compact':
        return this.compactArrangement(transforms, gridConfig)
      case 'distribute':
        return this.distributeArrangement(transforms, gridConfig)
      case 'align':
        return this.alignArrangement(transforms, gridConfig)
      default:
        return transforms
    }
  }

  /**
   * 分析元素特性
   * 
   * 计算元素的尺寸分布、纵横比等统计信息
   * 为布局算法提供决策依据
   */
  private static analyzeElements(
    elements: Element[],
    options: LayoutOptions
  ): ElementAnalysis {
    const analysis: ElementAnalysis = {
      count: elements.length,
      totalArea: 0,
      averageAspectRatio: 0,
      sizeVariance: 0,
      elements: elements.map(element => this.analyzeElement(element, options))
    }

    // 计算统计信息
    analysis.totalArea = analysis.elements.reduce((sum, e) => sum + e.area, 0)
    analysis.averageAspectRatio = analysis.elements.reduce((sum, e) => sum + e.aspectRatio, 0) / elements.length
    
    const avgArea = analysis.totalArea / elements.length
    analysis.sizeVariance = analysis.elements.reduce(
      (sum, e) => sum + Math.pow(e.area - avgArea, 2), 0
    ) / elements.length

    return analysis
  }

  /**
   * 分析单个元素
   */
  private static analyzeElement(element: Element, options: LayoutOptions): ElementInfo {
    // 根据元素类型和内容计算理想尺寸
    let naturalWidth: number, naturalHeight: number

    if (element.type === 'image' && 'originalSize' in element.content) {
      naturalWidth = element.content.originalSize.width
      naturalHeight = element.content.originalSize.height
    } else if (element.type === 'text' && 'fontSize' in element.content) {
      // 文字元素根据字体大小估算尺寸
      const textContent = element.content
      const estimatedWidth = textContent.text.length * textContent.fontSize * 0.6
      const estimatedHeight = textContent.fontSize * textContent.lineHeight
      naturalWidth = Math.max(estimatedWidth, options.minCellWidth)
      naturalHeight = Math.max(estimatedHeight, options.minCellHeight)
    } else {
      naturalWidth = options.minCellWidth
      naturalHeight = options.minCellHeight
    }

    // 计算网格尺寸需求，确保至少为1
    const gridWidth = Math.max(1, Math.ceil(naturalWidth / options.minCellWidth))
    const gridHeight = Math.max(1, Math.ceil(naturalHeight / options.minCellHeight))

    return {
      element,
      naturalWidth,
      naturalHeight,
      gridWidth,
      gridHeight,
      area: gridWidth * gridHeight,
      aspectRatio: naturalWidth / naturalHeight
    }
  }

  /**
   * 计算最佳网格配置
   * 
   * 基于元素分析结果，计算能容纳所有元素的最优网格
   */
  private static calculateOptimalGrid(
    analysis: ElementAnalysis,
    options: LayoutOptions
  ): GridConfig {
    const { strategy } = options

    if (strategy === 'auto') {
      // 自动选择最佳策略
      const bestLayout = this.detectOptimalLayout(
        analysis.elements.map(e => e.element),
        options
      )
      return bestLayout.config
    }

    // 根据策略计算网格尺寸
    const totalGridArea = analysis.elements.reduce((sum, e) => sum + e.area, 0)
    
    // 确保网格至少能容纳所有元素
    const minRequiredArea = Math.max(totalGridArea, analysis.count)
    
    let rows: number, cols: number

    switch (strategy) {
      case 'tight':
        // 紧密排列：最小画布面积
        cols = Math.ceil(Math.sqrt(minRequiredArea))
        rows = Math.ceil(minRequiredArea / cols)
        break
        
      case 'loose':
        // 宽松排列：增加20%空间
        const looseFactor = 1.2
        cols = Math.ceil(Math.sqrt(minRequiredArea * looseFactor))
        rows = Math.ceil(minRequiredArea * looseFactor / cols)
        break
        
      case 'balanced':
        // 平衡排列：接近正方形
        const side = Math.ceil(Math.sqrt(minRequiredArea))
        cols = side
        rows = side
        break
        
      default:
        cols = Math.ceil(Math.sqrt(analysis.count))
        rows = Math.ceil(analysis.count / cols)
    }
    
    // 确保网格尺寸至少为1×1
    rows = Math.max(1, rows)
    cols = Math.max(1, cols)

    return GridConfigBuilder.grid(
      rows,
      cols,
      options.minCellWidth,
      options.minCellHeight,
      options.spacing
    )
  }

  /**
   * 分配元素到网格位置
   * 
   * 使用贪心算法将元素按最佳适应原则分配到网格
   * 体现"好品味"：简单的贪心策略，无复杂的回溯算法
   */
  private static assignElementsToGrid(
    analysis: ElementAnalysis,
    gridConfig: GridConfig,
    options: LayoutOptions
  ): Transform[] {
    const transforms: Transform[] = []
    
    // 按面积从大到小排序（贪心策略：大元素优先放置）
    const sortedElements = [...analysis.elements].sort((a, b) => b.area - a.area)
    
    for (const elementInfo of sortedElements) {
      const elementSize = {
        gridWidth: elementInfo.gridWidth,
        gridHeight: elementInfo.gridHeight
      }
      
      // 查找可用位置
      const position = GridUtils.findAvailablePosition(transforms, elementSize, gridConfig)
      
      if (position) {
        // 创建变换
        const transform = TransformBuilder.create(
          position.gridX,
          position.gridY,
          elementSize.gridWidth,
          elementSize.gridHeight,
          0, // 默认无旋转
          transforms.length // z-index按添加顺序
        )
        
        transforms.push(transform)
      } else if (!options.allowOverlap) {
        // 无法放置且不允许重叠，约束元素到网格边界内
        const fallbackPosition = this.findFallbackPosition(gridConfig, elementSize)
        
        // 确保元素不超出网格边界
        const clampedWidth = Math.min(elementSize.gridWidth, gridConfig.cols)
        const clampedHeight = Math.min(elementSize.gridHeight, gridConfig.rows)
        const clampedX = Math.min(fallbackPosition.gridX, gridConfig.cols - clampedWidth)
        const clampedY = Math.min(fallbackPosition.gridY, gridConfig.rows - clampedHeight)
        
        const transform = TransformBuilder.create(
          Math.max(0, clampedX),
          Math.max(0, clampedY),
          clampedWidth,
          clampedHeight,
          0,
          transforms.length
        )
        transforms.push(transform)
      }
    }
    
    return transforms
  }

  /**
   * 评估横向布局效率
   */
  private static evaluateHorizontalLayout(
    analysis: ElementAnalysis,
    options: LayoutOptions
  ): LayoutEvaluation {
    const config = GridConfigBuilder.horizontal(
      analysis.count,
      options.minCellWidth,
      options.minCellHeight,
      options.spacing
    )
    
    const canvasSize = GridSystem.calculateCanvasSize(config)
    const efficiency = this.calculateLayoutEfficiency(analysis, config, canvasSize)
    
    return {
      mode: 'horizontal',
      config,
      efficiency,
      canvasSize
    }
  }

  /**
   * 评估纵向布局效率
   */
  private static evaluateVerticalLayout(
    analysis: ElementAnalysis,
    options: LayoutOptions
  ): LayoutEvaluation {
    const config = GridConfigBuilder.vertical(
      analysis.count,
      options.minCellWidth,
      options.minCellHeight,
      options.spacing
    )
    
    const canvasSize = GridSystem.calculateCanvasSize(config)
    const efficiency = this.calculateLayoutEfficiency(analysis, config, canvasSize)
    
    return {
      mode: 'vertical',
      config,
      efficiency,
      canvasSize
    }
  }

  /**
   * 评估网格布局效率
   */
  private static evaluateGridLayout(
    analysis: ElementAnalysis,
    options: LayoutOptions
  ): LayoutEvaluation {
    const config = GridConfigBuilder.autoLayout(
      analysis.count,
      options.minCellWidth,
      options.minCellHeight,
      options.spacing
    )
    
    const canvasSize = GridSystem.calculateCanvasSize(config)
    const efficiency = this.calculateLayoutEfficiency(analysis, config, canvasSize)
    
    return {
      mode: 'grid',
      config,
      efficiency,
      canvasSize
    }
  }

  /**
   * 计算布局效率
   * 
   * 综合考虑空间利用率、纵横比、画布尺寸等因素
   */
  private static calculateLayoutEfficiency(
    analysis: ElementAnalysis,
    config: GridConfig,
    canvasSize: { width: number; height: number }
  ): number {
    const totalCells = config.rows * config.cols
    const utilization = analysis.count / totalCells
    
    // 画布纵横比评分（接近1.618黄金比例得分更高）
    const canvasAspectRatio = canvasSize.width / canvasSize.height
    const aspectRatioScore = 1 - Math.abs(canvasAspectRatio - 1.618) / 1.618
    
    // 综合效率：空间利用率70% + 纵横比30%
    return utilization * 0.7 + aspectRatioScore * 0.3
  }

  /**
   * 紧凑排列
   */
  private static compactArrangement(
    transforms: Transform[],
    gridConfig: GridConfig
  ): Transform[] {
    const result: Transform[] = []
    
    for (const transform of transforms) {
      // 尝试将元素移动到最左上角的可用位置
      const position = GridUtils.findAvailablePosition(
        result,
        { gridWidth: transform.gridWidth, gridHeight: transform.gridHeight },
        gridConfig
      )
      
      if (position) {
        result.push(TransformBuilder.withPosition(transform, position.gridX, position.gridY))
      } else {
        result.push(transform)
      }
    }
    
    return result
  }

  /**
   * 分布排列
   */
  private static distributeArrangement(
    transforms: Transform[],
    gridConfig: GridConfig
  ): Transform[] {
    // 均匀分布元素到网格中
    const spacing = Math.floor(gridConfig.cols / transforms.length)
    
    return transforms.map((transform, index) => {
      const newX = (index * spacing) % gridConfig.cols
      const newY = Math.floor((index * spacing) / gridConfig.cols)
      
      return TransformBuilder.withPosition(transform, newX, newY)
    })
  }

  /**
   * 对齐排列
   */
  private static alignArrangement(
    transforms: Transform[],
    gridConfig: GridConfig
  ): Transform[] {
    // 将所有元素对齐到网格中心
    const centerX = Math.floor(gridConfig.cols / 2)
    const centerY = Math.floor(gridConfig.rows / 2)
    
    return transforms.map((transform, index) => {
      const offsetX = index % 3 - 1 // -1, 0, 1 的循环
      const offsetY = Math.floor(index / 3) - 1
      
      const newX = Math.max(0, Math.min(centerX + offsetX, gridConfig.cols - transform.gridWidth))
      const newY = Math.max(0, Math.min(centerY + offsetY, gridConfig.rows - transform.gridHeight))
      
      return TransformBuilder.withPosition(transform, newX, newY)
    })
  }

  /**
   * 查找后备位置
   */
  private static findFallbackPosition(
    gridConfig: GridConfig,
    elementSize: { gridWidth: number; gridHeight: number }
  ): GridCoord {
    // 简单后备策略：放到网格右下角
    return {
      gridX: Math.max(0, gridConfig.cols - elementSize.gridWidth),
      gridY: Math.max(0, gridConfig.rows - elementSize.gridHeight)
    }
  }

  /**
   * 创建空布局
   */
  private static createEmptyLayout(options: LayoutOptions): LayoutResult {
    const gridConfig = GridConfigBuilder.grid(
      1, 1,
      options.minCellWidth,
      options.minCellHeight,
      options.spacing
    )
    
    return {
      gridConfig,
      transforms: [],
      layoutMode: 'grid',
      canvasSize: GridSystem.calculateCanvasSize(gridConfig),
      statistics: {
        totalElements: 0,
        gridUtilization: 0,
        wastedSpace: 1,
        layoutEfficiency: 0
      },
      warnings: []
    }
  }

  /**
   * 计算布局统计
   */
  private static calculateStatistics(
    transforms: Transform[],
    gridConfig: GridConfig
  ): LayoutResult['statistics'] {
    const utilization = GridUtils.getGridUtilization(transforms, gridConfig)
    
    return {
      totalElements: transforms.length,
      gridUtilization: utilization.utilizationRate,
      wastedSpace: 1 - utilization.utilizationRate,
      layoutEfficiency: utilization.utilizationRate * 0.8 + (transforms.length > 0 ? 0.2 : 0)
    }
  }
}

/**
 * 元素分析结果
 */
interface ElementAnalysis {
  count: number
  totalArea: number
  averageAspectRatio: number
  sizeVariance: number
  elements: ElementInfo[]
}

/**
 * 元素信息
 */
interface ElementInfo {
  element: Element
  naturalWidth: number
  naturalHeight: number
  gridWidth: number
  gridHeight: number
  area: number
  aspectRatio: number
}

/**
 * 布局评估结果
 */
interface LayoutEvaluation {
  mode: LayoutMode
  config: GridConfig
  efficiency: number
  canvasSize: { width: number; height: number }
}

/**
 * 布局引擎工具方法
 */
export class LayoutUtils {
  /**
   * 创建默认布局选项
   */
  static createDefaultOptions(): LayoutOptions {
    return {
      strategy: 'auto',
      minCellWidth: 200,
      minCellHeight: 200,
      spacing: 10,
      preserveAspectRatio: true,
      allowOverlap: false
    }
  }

  /**
   * 合并布局选项
   */
  static mergeOptions(
    base: LayoutOptions,
    overrides: Partial<LayoutOptions>
  ): LayoutOptions {
    return { ...base, ...overrides }
  }

  /**
   * 验证布局选项
   */
  static validateOptions(options: LayoutOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (options.minCellWidth <= 0) {
      errors.push('最小单元格宽度必须大于0')
    }

    if (options.minCellHeight <= 0) {
      errors.push('最小单元格高度必须大于0')
    }

    if (options.spacing < 0) {
      errors.push('间距不能为负数')
    }

    if (options.maxCanvasSize) {
      if (options.maxCanvasSize.width <= 0 || options.maxCanvasSize.height <= 0) {
        errors.push('最大画布尺寸必须大于0')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 估算布局内存占用
   */
  static estimateMemoryUsage(result: LayoutResult): number {
    const gridCells = result.gridConfig.rows * result.gridConfig.cols
    const canvasPixels = result.canvasSize.width * result.canvasSize.height
    
    // 估算：网格状态 + 画布内存
    return gridCells * 4 + canvasPixels * 4 // 4字节per单位
  }
}

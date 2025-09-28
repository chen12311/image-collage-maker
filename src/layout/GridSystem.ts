/**
 * GridSystem - 网格坐标系统核心算法
 * 
 * Linus哲学体现：
 * - O(1)复杂度的纯数学运算，零特殊情况
 * - 统一处理所有布局模式（横向/纵向/网格都是M×N的特例）
 * - 不可变输入输出，无副作用
 * 
 * 核心思想：网格坐标 ↔ 像素坐标的双向转换
 */

import type { GridConfig, GridCoord, PixelCoord, Size } from '../core/models/GridConfig'
import type { Transform } from '../core/models/Transform'

/**
 * 网格系统核心算法类
 * 提供坐标转换和尺寸计算的核心数学函数
 */
export class GridSystem {
  /**
   * 网格坐标转换为像素坐标
   * 
   * 数学公式：
   * pixelX = gridX * (cellWidth + spacing)
   * pixelY = gridY * (cellHeight + spacing)
   * 
   * @param gridCoord 网格坐标
   * @param config 网格配置
   * @returns 像素坐标
   */
  static gridToPixel(gridCoord: GridCoord, config: GridConfig): PixelCoord {
    return {
      x: gridCoord.gridX * (config.cellWidth + config.spacing),
      y: gridCoord.gridY * (config.cellHeight + config.spacing)
    }
  }

  /**
   * 像素坐标转换为网格坐标
   * 
   * 数学公式：
   * gridX = floor(pixelX / (cellWidth + spacing))
   * gridY = floor(pixelY / (cellHeight + spacing))
   * 
   * @param pixelCoord 像素坐标
   * @param config 网格配置
   * @returns 网格坐标
   */
  static pixelToGrid(pixelCoord: PixelCoord, config: GridConfig): GridCoord {
    const cellAndSpacingWidth = config.cellWidth + config.spacing
    const cellAndSpacingHeight = config.cellHeight + config.spacing
    
    return {
      gridX: Math.floor(pixelCoord.x / cellAndSpacingWidth),
      gridY: Math.floor(pixelCoord.y / cellAndSpacingHeight)
    }
  }

  /**
   * 计算元素在像素空间的尺寸
   * 
   * 数学公式：
   * pixelWidth = gridWidth * cellWidth + (gridWidth - 1) * spacing
   * pixelHeight = gridHeight * cellHeight + (gridHeight - 1) * spacing
   * 
   * 思考：为什么是 (gridWidth - 1) * spacing？
   * 因为N个单元格之间只有N-1个间距。这是"好品味"的体现。
   * 
   * @param transform 变换信息（包含网格尺寸）
   * @param config 网格配置
   * @returns 像素尺寸
   */
  static calculateElementSize(transform: Transform, config: GridConfig): Size {
    const pixelWidth = transform.gridWidth * config.cellWidth + 
                      Math.max(0, transform.gridWidth - 1) * config.spacing
    
    const pixelHeight = transform.gridHeight * config.cellHeight + 
                       Math.max(0, transform.gridHeight - 1) * config.spacing
    
    return {
      width: pixelWidth,
      height: pixelHeight
    }
  }

  /**
   * 计算整个画布的像素尺寸
   * 
   * 数学公式：
   * canvasWidth = cols * cellWidth + (cols - 1) * spacing
   * canvasHeight = rows * cellHeight + (rows - 1) * spacing
   * 
   * @param config 网格配置
   * @returns 画布尺寸
   */
  static calculateCanvasSize(config: GridConfig): Size {
    const canvasWidth = config.cols * config.cellWidth + 
                       Math.max(0, config.cols - 1) * config.spacing
    
    const canvasHeight = config.rows * config.cellHeight + 
                        Math.max(0, config.rows - 1) * config.spacing
    
    return {
      width: canvasWidth,
      height: canvasHeight
    }
  }

  /**
   * 计算元素在画布中的像素边界框
   * 
   * 组合使用 gridToPixel 和 calculateElementSize
   * 体现了函数组合的"好品味"
   * 
   * @param transform 变换信息
   * @param config 网格配置
   * @returns 像素边界框 {x, y, width, height}
   */
  static calculateElementBounds(
    transform: Transform, 
    config: GridConfig
  ): { x: number; y: number; width: number; height: number } {
    const position = this.gridToPixel(
      { gridX: transform.gridX, gridY: transform.gridY }, 
      config
    )
    const size = this.calculateElementSize(transform, config)
    
    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    }
  }

  /**
   * 检查网格坐标是否在有效范围内
   * 
   * 边界检查：
   * - gridX >= 0 && gridX < cols
   * - gridY >= 0 && gridY < rows
   * 
   * @param gridCoord 网格坐标
   * @param config 网格配置
   * @returns 是否在范围内
   */
  static isValidGridCoord(gridCoord: GridCoord, config: GridConfig): boolean {
    return gridCoord.gridX >= 0 && 
           gridCoord.gridX < config.cols &&
           gridCoord.gridY >= 0 && 
           gridCoord.gridY < config.rows
  }

  /**
   * 检查元素是否完全在网格范围内
   * 
   * 边界检查：元素的右下角不能超出网格
   * 
   * @param transform 变换信息
   * @param config 网格配置
   * @returns 是否在范围内
   */
  static isElementInBounds(transform: Transform, config: GridConfig): boolean {
    const rightEdge = transform.gridX + transform.gridWidth
    const bottomEdge = transform.gridY + transform.gridHeight
    
    return transform.gridX >= 0 &&
           transform.gridY >= 0 &&
           rightEdge <= config.cols &&
           bottomEdge <= config.rows
  }

  /**
   * 将元素约束到网格范围内
   * 
   * 如果元素超出边界，自动调整到最近的有效位置
   * 这是一个"善意的修正"，避免用户错误导致崩溃
   * 
   * @param transform 变换信息
   * @param config 网格配置
   * @returns 修正后的变换
   */
  static clampElementToGrid(transform: Transform, config: GridConfig): Transform {
    // 确保位置不为负数
    const clampedX = Math.max(0, transform.gridX)
    const clampedY = Math.max(0, transform.gridY)
    
    // 确保元素不超出右边界和下边界
    const maxX = Math.max(0, config.cols - transform.gridWidth)
    const maxY = Math.max(0, config.rows - transform.gridHeight)
    
    return {
      ...transform,
      gridX: Math.min(clampedX, maxX),
      gridY: Math.min(clampedY, maxY)
    }
  }

  /**
   * 计算两个网格坐标之间的距离（曼哈顿距离）
   * 
   * 用于拖拽排序、碰撞检测等场景
   * 
   * @param coord1 坐标1
   * @param coord2 坐标2
   * @returns 曼哈顿距离
   */
  static gridDistance(coord1: GridCoord, coord2: GridCoord): number {
    return Math.abs(coord1.gridX - coord2.gridX) + Math.abs(coord1.gridY - coord2.gridY)
  }

  /**
   * 生成网格内所有有效坐标的迭代器
   * 
   * 用于遍历网格、查找空位等场景
   * 采用生成器模式，内存友好
   * 
   * @param config 网格配置
   * @yields 网格坐标
   */
  static *iterateGridCoords(config: GridConfig): Generator<GridCoord> {
    for (let gridY = 0; gridY < config.rows; gridY++) {
      for (let gridX = 0; gridX < config.cols; gridX++) {
        yield { gridX, gridY }
      }
    }
  }
}

/**
 * 网格系统工具方法
 * 提供更高级的网格操作
 */
export class GridUtils {
  /**
   * 查找网格中的空位
   * 
   * 给定当前元素列表，找到可以放置新元素的位置
   * 
   * @param elements 当前元素列表
   * @param elementSize 要放置的元素尺寸
   * @param config 网格配置
   * @returns 可用位置，如果没有返回null
   */
  static findAvailablePosition(
    elements: Transform[],
    elementSize: { gridWidth: number; gridHeight: number },
    config: GridConfig
  ): GridCoord | null {
    // 创建占用状态矩阵
    const occupied = new Array(config.rows)
      .fill(null)
      .map(() => new Array(config.cols).fill(false))
    
    // 标记已占用的位置
    for (const element of elements) {
      for (let y = element.gridY; y < element.gridY + element.gridHeight; y++) {
        for (let x = element.gridX; x < element.gridX + element.gridWidth; x++) {
          if (y < config.rows && x < config.cols) {
            occupied[y][x] = true
          }
        }
      }
    }
    
    // 查找可用位置（从左上角开始）
    for (let gridY = 0; gridY <= config.rows - elementSize.gridHeight; gridY++) {
      for (let gridX = 0; gridX <= config.cols - elementSize.gridWidth; gridX++) {
        let canPlace = true
        
        // 检查这个位置是否可以放置元素
        for (let y = gridY; y < gridY + elementSize.gridHeight && canPlace; y++) {
          for (let x = gridX; x < gridX + elementSize.gridWidth && canPlace; x++) {
            if (occupied[y][x]) {
              canPlace = false
            }
          }
        }
        
        if (canPlace) {
          return { gridX, gridY }
        }
      }
    }
    
    return null // 没有可用位置
  }

  /**
   * 检查两个元素是否重叠
   * 
   * @param transform1 元素1的变换
   * @param transform2 元素2的变换
   * @returns 是否重叠
   */
  static isOverlapping(transform1: Transform, transform2: Transform): boolean {
    const left1 = transform1.gridX
    const right1 = transform1.gridX + transform1.gridWidth
    const top1 = transform1.gridY
    const bottom1 = transform1.gridY + transform1.gridHeight

    const left2 = transform2.gridX
    const right2 = transform2.gridX + transform2.gridWidth
    const top2 = transform2.gridY
    const bottom2 = transform2.gridY + transform2.gridHeight

    return !(right1 <= left2 || right2 <= left1 || bottom1 <= top2 || bottom2 <= top1)
  }

  /**
   * 获取网格利用率统计
   * 
   * @param elements 元素列表
   * @param config 网格配置
   * @returns 利用率信息
   */
  static getGridUtilization(
    elements: Transform[],
    config: GridConfig
  ): { occupiedCells: number; totalCells: number; utilizationRate: number } {
    const totalCells = config.rows * config.cols
    let occupiedCells = 0

    // 创建占用状态矩阵
    const occupied = new Array(config.rows)
      .fill(null)
      .map(() => new Array(config.cols).fill(false))

    // 标记已占用的位置
    for (const element of elements) {
      for (let y = element.gridY; y < element.gridY + element.gridHeight; y++) {
        for (let x = element.gridX; x < element.gridX + element.gridWidth; x++) {
          if (y < config.rows && x < config.cols && !occupied[y][x]) {
            occupied[y][x] = true
            occupiedCells++
          }
        }
      }
    }

    return {
      occupiedCells,
      totalCells,
      utilizationRate: totalCells > 0 ? occupiedCells / totalCells : 0
    }
  }
}

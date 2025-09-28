/**
 * GridSystem单元测试
 * 
 * Linus测试哲学：
 * - 100%代码覆盖率，特别关注边界情况
 * - 验证数学公式的正确性
 * - 确保O(1)性能特性
 * - 测试"坏输入"不会导致程序崩溃
 */

import { describe, it, expect } from '@jest/globals'
import { GridSystem, GridUtils } from '../../src/layout/GridSystem'
import { GridConfigBuilder } from '../../src/core/models/GridConfig'
import { TransformBuilder } from '../../src/core/models/Transform'
import type { GridConfig, GridCoord, PixelCoord } from '../../src/core/models/GridConfig'
import type { Transform } from '../../src/core/models/Transform'

describe('GridSystem', () => {
  // 测试用的标准网格配置
  const standardGrid: GridConfig = {
    rows: 3,
    cols: 4,
    cellWidth: 100,
    cellHeight: 80,
    spacing: 10
  }

  // 零间距网格（边界情况）
  const noSpacingGrid: GridConfig = {
    rows: 2,
    cols: 2,
    cellWidth: 50,
    cellHeight: 50,
    spacing: 0
  }

  // 单元格网格（最小情况）
  const singleCellGrid: GridConfig = {
    rows: 1,
    cols: 1,
    cellWidth: 200,
    cellHeight: 150,
    spacing: 5
  }

  describe('gridToPixel()', () => {
    it('应该正确转换基础网格坐标', () => {
      const gridCoord: GridCoord = { gridX: 0, gridY: 0 }
      const result = GridSystem.gridToPixel(gridCoord, standardGrid)
      
      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('应该正确计算带间距的坐标转换', () => {
      const gridCoord: GridCoord = { gridX: 2, gridY: 1 }
      const result = GridSystem.gridToPixel(gridCoord, standardGrid)
      
      // 计算公式：x = 2 * (100 + 10) = 220, y = 1 * (80 + 10) = 90
      expect(result).toEqual({ x: 220, y: 90 })
    })

    it('应该处理零间距的情况', () => {
      const gridCoord: GridCoord = { gridX: 1, gridY: 1 }
      const result = GridSystem.gridToPixel(gridCoord, noSpacingGrid)
      
      // 计算公式：x = 1 * (50 + 0) = 50, y = 1 * (50 + 0) = 50
      expect(result).toEqual({ x: 50, y: 50 })
    })

    it('应该处理边界坐标（最大值）', () => {
      const gridCoord: GridCoord = { gridX: 3, gridY: 2 } // 最后一格
      const result = GridSystem.gridToPixel(gridCoord, standardGrid)
      
      // 计算公式：x = 3 * (100 + 10) = 330, y = 2 * (80 + 10) = 180
      expect(result).toEqual({ x: 330, y: 180 })
    })

    it('应该处理负坐标（虽然通常不应该出现）', () => {
      const gridCoord: GridCoord = { gridX: -1, gridY: -1 }
      const result = GridSystem.gridToPixel(gridCoord, standardGrid)
      
      expect(result).toEqual({ x: -110, y: -90 })
    })

    it('应该处理超大坐标', () => {
      const gridCoord: GridCoord = { gridX: 100, gridY: 50 }
      const result = GridSystem.gridToPixel(gridCoord, standardGrid)
      
      expect(result).toEqual({ x: 11000, y: 4500 })
    })
  })

  describe('pixelToGrid()', () => {
    it('应该正确转换基础像素坐标', () => {
      const pixelCoord: PixelCoord = { x: 0, y: 0 }
      const result = GridSystem.pixelToGrid(pixelCoord, standardGrid)
      
      expect(result).toEqual({ gridX: 0, gridY: 0 })
    })

    it('应该正确处理向下取整', () => {
      const pixelCoord: PixelCoord = { x: 109, y: 89 } // 接近但不到下一格
      const result = GridSystem.pixelToGrid(pixelCoord, standardGrid)
      
      expect(result).toEqual({ gridX: 0, gridY: 0 })
    })

    it('应该正确转换到下一个网格', () => {
      const pixelCoord: PixelCoord = { x: 110, y: 90 } // 正好是下一格
      const result = GridSystem.pixelToGrid(pixelCoord, standardGrid)
      
      expect(result).toEqual({ gridX: 1, gridY: 1 })
    })

    it('应该处理零间距情况', () => {
      const pixelCoord: PixelCoord = { x: 75, y: 25 }
      const result = GridSystem.pixelToGrid(pixelCoord, noSpacingGrid)
      
      // 计算公式：gridX = floor(75/50) = 1, gridY = floor(25/50) = 0
      expect(result).toEqual({ gridX: 1, gridY: 0 })
    })

    it('应该处理负像素坐标', () => {
      const pixelCoord: PixelCoord = { x: -50, y: -30 }
      const result = GridSystem.pixelToGrid(pixelCoord, standardGrid)
      
      expect(result).toEqual({ gridX: -1, gridY: -1 })
    })

    it('应该与gridToPixel形成双向转换', () => {
      const originalGrid: GridCoord = { gridX: 2, gridY: 1 }
      const pixel = GridSystem.gridToPixel(originalGrid, standardGrid)
      const backToGrid = GridSystem.pixelToGrid(pixel, standardGrid)
      
      expect(backToGrid).toEqual(originalGrid)
    })
  })

  describe('calculateElementSize()', () => {
    it('应该计算单格元素尺寸', () => {
      const transform = TransformBuilder.create(0, 0, 1, 1)
      const result = GridSystem.calculateElementSize(transform, standardGrid)
      
      // 单个格子：width = 1 * 100 + 0 * 10 = 100
      expect(result).toEqual({ width: 100, height: 80 })
    })

    it('应该计算多格元素尺寸（横向）', () => {
      const transform = TransformBuilder.create(0, 0, 3, 1)
      const result = GridSystem.calculateElementSize(transform, standardGrid)
      
      // 3个格子：width = 3 * 100 + 2 * 10 = 320, height = 1 * 80 + 0 * 10 = 80
      expect(result).toEqual({ width: 320, height: 80 })
    })

    it('应该计算多格元素尺寸（纵向）', () => {
      const transform = TransformBuilder.create(0, 0, 1, 2)
      const result = GridSystem.calculateElementSize(transform, standardGrid)
      
      // 2行：width = 1 * 100 + 0 * 10 = 100, height = 2 * 80 + 1 * 10 = 170
      expect(result).toEqual({ width: 100, height: 170 })
    })

    it('应该计算大尺寸元素（2×3）', () => {
      const transform = TransformBuilder.create(0, 0, 2, 3)
      const result = GridSystem.calculateElementSize(transform, standardGrid)
      
      // 2×3：width = 2 * 100 + 1 * 10 = 210, height = 3 * 80 + 2 * 10 = 260
      expect(result).toEqual({ width: 210, height: 260 })
    })

    it('应该处理零间距情况', () => {
      const transform = TransformBuilder.create(0, 0, 2, 2)
      const result = GridSystem.calculateElementSize(transform, noSpacingGrid)
      
      // 零间距：width = 2 * 50 + 1 * 0 = 100, height = 2 * 50 + 1 * 0 = 100
      expect(result).toEqual({ width: 100, height: 100 })
    })

    it('应该处理单格在零间距网格中', () => {
      const transform = TransformBuilder.create(0, 0, 1, 1)
      const result = GridSystem.calculateElementSize(transform, noSpacingGrid)
      
      expect(result).toEqual({ width: 50, height: 50 })
    })
  })

  describe('calculateCanvasSize()', () => {
    it('应该计算标准网格画布尺寸', () => {
      const result = GridSystem.calculateCanvasSize(standardGrid)
      
      // 4×3网格：width = 4 * 100 + 3 * 10 = 430, height = 3 * 80 + 2 * 10 = 260
      expect(result).toEqual({ width: 430, height: 260 })
    })

    it('应该计算单格画布尺寸', () => {
      const result = GridSystem.calculateCanvasSize(singleCellGrid)
      
      // 1×1网格：width = 1 * 200 + 0 * 5 = 200, height = 1 * 150 + 0 * 5 = 150
      expect(result).toEqual({ width: 200, height: 150 })
    })

    it('应该计算零间距画布尺寸', () => {
      const result = GridSystem.calculateCanvasSize(noSpacingGrid)
      
      // 2×2零间距：width = 2 * 50 + 1 * 0 = 100, height = 2 * 50 + 1 * 0 = 100
      expect(result).toEqual({ width: 100, height: 100 })
    })

    it('应该计算横向布局画布尺寸', () => {
      const horizontalGrid = GridConfigBuilder.horizontal(5, 100, 80, 5)
      const result = GridSystem.calculateCanvasSize(horizontalGrid)
      
      // 1×5横向：width = 5 * 100 + 4 * 5 = 520, height = 1 * 80 + 0 * 5 = 80
      expect(result).toEqual({ width: 520, height: 80 })
    })

    it('应该计算纵向布局画布尺寸', () => {
      const verticalGrid = GridConfigBuilder.vertical(4, 100, 80, 8)
      const result = GridSystem.calculateCanvasSize(verticalGrid)
      
      // 4×1纵向：width = 1 * 100 + 0 * 8 = 100, height = 4 * 80 + 3 * 8 = 344
      expect(result).toEqual({ width: 100, height: 344 })
    })
  })

  describe('calculateElementBounds()', () => {
    it('应该计算元素完整边界框', () => {
      const transform = TransformBuilder.create(1, 1, 2, 2)
      const result = GridSystem.calculateElementBounds(transform, standardGrid)
      
      // 位置：x = 1 * 110 = 110, y = 1 * 90 = 90
      // 尺寸：width = 2 * 100 + 1 * 10 = 210, height = 2 * 80 + 1 * 10 = 170
      expect(result).toEqual({
        x: 110,
        y: 90,
        width: 210,
        height: 170
      })
    })

    it('应该计算原点位置元素边界', () => {
      const transform = TransformBuilder.create(0, 0, 1, 1)
      const result = GridSystem.calculateElementBounds(transform, standardGrid)
      
      expect(result).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 80
      })
    })
  })

  describe('isValidGridCoord()', () => {
    it('应该验证有效坐标', () => {
      expect(GridSystem.isValidGridCoord({ gridX: 0, gridY: 0 }, standardGrid)).toBe(true)
      expect(GridSystem.isValidGridCoord({ gridX: 3, gridY: 2 }, standardGrid)).toBe(true)
      expect(GridSystem.isValidGridCoord({ gridX: 2, gridY: 1 }, standardGrid)).toBe(true)
    })

    it('应该拒绝超出边界的坐标', () => {
      expect(GridSystem.isValidGridCoord({ gridX: 4, gridY: 2 }, standardGrid)).toBe(false)
      expect(GridSystem.isValidGridCoord({ gridX: 3, gridY: 3 }, standardGrid)).toBe(false)
      expect(GridSystem.isValidGridCoord({ gridX: 5, gridY: 5 }, standardGrid)).toBe(false)
    })

    it('应该拒绝负坐标', () => {
      expect(GridSystem.isValidGridCoord({ gridX: -1, gridY: 0 }, standardGrid)).toBe(false)
      expect(GridSystem.isValidGridCoord({ gridX: 0, gridY: -1 }, standardGrid)).toBe(false)
      expect(GridSystem.isValidGridCoord({ gridX: -1, gridY: -1 }, standardGrid)).toBe(false)
    })
  })

  describe('isElementInBounds()', () => {
    it('应该验证单格元素在边界内', () => {
      const transform = TransformBuilder.create(3, 2, 1, 1) // 最后一格
      expect(GridSystem.isElementInBounds(transform, standardGrid)).toBe(true)
    })

    it('应该验证多格元素在边界内', () => {
      const transform = TransformBuilder.create(2, 1, 2, 2) // 2×2元素
      expect(GridSystem.isElementInBounds(transform, standardGrid)).toBe(true)
    })

    it('应该拒绝超出右边界的元素', () => {
      const transform = TransformBuilder.create(3, 0, 2, 1) // 超出列边界
      expect(GridSystem.isElementInBounds(transform, standardGrid)).toBe(false)
    })

    it('应该拒绝超出下边界的元素', () => {
      const transform = TransformBuilder.create(0, 2, 1, 2) // 超出行边界
      expect(GridSystem.isElementInBounds(transform, standardGrid)).toBe(false)
    })

    it('应该拒绝负坐标元素', () => {
      const transform = TransformBuilder.create(-1, 0, 1, 1)
      expect(GridSystem.isElementInBounds(transform, standardGrid)).toBe(false)
    })
  })

  describe('clampElementToGrid()', () => {
    it('应该保持有效元素不变', () => {
      const transform = TransformBuilder.create(1, 1, 2, 2)
      const result = GridSystem.clampElementToGrid(transform, standardGrid)
      
      expect(result).toEqual(transform)
    })

    it('应该修正负坐标', () => {
      const transform = TransformBuilder.create(-1, -2, 1, 1)
      const result = GridSystem.clampElementToGrid(transform, standardGrid)
      
      expect(result.gridX).toBe(0)
      expect(result.gridY).toBe(0)
    })

    it('应该修正超出边界的元素', () => {
      const transform = TransformBuilder.create(3, 2, 2, 2) // 超出边界
      const result = GridSystem.clampElementToGrid(transform, standardGrid)
      
      // 最大位置：x = 4-2 = 2, y = 3-2 = 1
      expect(result.gridX).toBe(2)
      expect(result.gridY).toBe(1)
    })

    it('应该处理大于网格的元素', () => {
      const transform = TransformBuilder.create(0, 0, 10, 10) // 超大元素
      const result = GridSystem.clampElementToGrid(transform, standardGrid)
      
      expect(result.gridX).toBe(0)
      expect(result.gridY).toBe(0)
    })
  })

  describe('gridDistance()', () => {
    it('应该计算相同位置的距离', () => {
      const coord1: GridCoord = { gridX: 2, gridY: 2 }
      const coord2: GridCoord = { gridX: 2, gridY: 2 }
      
      expect(GridSystem.gridDistance(coord1, coord2)).toBe(0)
    })

    it('应该计算水平距离', () => {
      const coord1: GridCoord = { gridX: 0, gridY: 1 }
      const coord2: GridCoord = { gridX: 3, gridY: 1 }
      
      expect(GridSystem.gridDistance(coord1, coord2)).toBe(3)
    })

    it('应该计算垂直距离', () => {
      const coord1: GridCoord = { gridX: 2, gridY: 0 }
      const coord2: GridCoord = { gridX: 2, gridY: 4 }
      
      expect(GridSystem.gridDistance(coord1, coord2)).toBe(4)
    })

    it('应该计算对角线距离（曼哈顿距离）', () => {
      const coord1: GridCoord = { gridX: 0, gridY: 0 }
      const coord2: GridCoord = { gridX: 3, gridY: 4 }
      
      expect(GridSystem.gridDistance(coord1, coord2)).toBe(7) // |3-0| + |4-0| = 7
    })
  })

  describe('iterateGridCoords()', () => {
    it('应该遍历所有网格坐标', () => {
      const coords = Array.from(GridSystem.iterateGridCoords(noSpacingGrid))
      
      expect(coords).toEqual([
        { gridX: 0, gridY: 0 },
        { gridX: 1, gridY: 0 },
        { gridX: 0, gridY: 1 },
        { gridX: 1, gridY: 1 }
      ])
    })

    it('应该处理单格网格', () => {
      const coords = Array.from(GridSystem.iterateGridCoords(singleCellGrid))
      
      expect(coords).toEqual([{ gridX: 0, gridY: 0 }])
    })

    it('应该按正确顺序遍历（行优先）', () => {
      const smallGrid: GridConfig = {
        rows: 2,
        cols: 3,
        cellWidth: 10,
        cellHeight: 10,
        spacing: 0
      }
      
      const coords = Array.from(GridSystem.iterateGridCoords(smallGrid))
      
      expect(coords).toEqual([
        { gridX: 0, gridY: 0 }, { gridX: 1, gridY: 0 }, { gridX: 2, gridY: 0 },
        { gridX: 0, gridY: 1 }, { gridX: 1, gridY: 1 }, { gridX: 2, gridY: 1 }
      ])
    })
  })
})

describe('GridUtils', () => {
  const testGrid: GridConfig = {
    rows: 3,
    cols: 3,
    cellWidth: 100,
    cellHeight: 100,
    spacing: 5
  }

  describe('findAvailablePosition()', () => {
    it('应该在空网格中找到第一个位置', () => {
      const result = GridUtils.findAvailablePosition(
        [], 
        { gridWidth: 1, gridHeight: 1 }, 
        testGrid
      )
      
      expect(result).toEqual({ gridX: 0, gridY: 0 })
    })

    it('应该找到下一个可用位置', () => {
      const existingElements = [
        TransformBuilder.create(0, 0, 1, 1), // 占用第一格
        TransformBuilder.create(1, 0, 1, 1)  // 占用第二格
      ]
      
      const result = GridUtils.findAvailablePosition(
        existingElements,
        { gridWidth: 1, gridHeight: 1 },
        testGrid
      )
      
      expect(result).toEqual({ gridX: 2, gridY: 0 })
    })

    it('应该为大元素找到合适位置', () => {
      const existingElements = [
        TransformBuilder.create(0, 0, 1, 1)
      ]
      
      const result = GridUtils.findAvailablePosition(
        existingElements,
        { gridWidth: 2, gridHeight: 2 },
        testGrid
      )
      
      expect(result).toEqual({ gridX: 1, gridY: 0 })
    })

    it('应该在没有空间时返回null', () => {
      const existingElements = [
        TransformBuilder.create(0, 0, 3, 3) // 占满整个网格
      ]
      
      const result = GridUtils.findAvailablePosition(
        existingElements,
        { gridWidth: 1, gridHeight: 1 },
        testGrid
      )
      
      expect(result).toBeNull()
    })

    it('应该处理元素超出网格边界的情况', () => {
      const result = GridUtils.findAvailablePosition(
        [],
        { gridWidth: 5, gridHeight: 5 }, // 超大元素
        testGrid
      )
      
      expect(result).toBeNull()
    })
  })

  describe('isOverlapping()', () => {
    it('应该检测完全相同的元素重叠', () => {
      const transform1 = TransformBuilder.create(1, 1, 2, 2)
      const transform2 = TransformBuilder.create(1, 1, 2, 2)
      
      expect(GridUtils.isOverlapping(transform1, transform2)).toBe(true)
    })

    it('应该检测部分重叠', () => {
      const transform1 = TransformBuilder.create(0, 0, 2, 2)
      const transform2 = TransformBuilder.create(1, 1, 2, 2)
      
      expect(GridUtils.isOverlapping(transform1, transform2)).toBe(true)
    })

    it('应该检测不重叠的元素', () => {
      const transform1 = TransformBuilder.create(0, 0, 1, 1)
      const transform2 = TransformBuilder.create(2, 2, 1, 1)
      
      expect(GridUtils.isOverlapping(transform1, transform2)).toBe(false)
    })

    it('应该检测相邻但不重叠的元素', () => {
      const transform1 = TransformBuilder.create(0, 0, 1, 1)
      const transform2 = TransformBuilder.create(1, 0, 1, 1)
      
      expect(GridUtils.isOverlapping(transform1, transform2)).toBe(false)
    })
  })

  describe('getGridUtilization()', () => {
    it('应该计算空网格的利用率', () => {
      const result = GridUtils.getGridUtilization([], testGrid)
      
      expect(result).toEqual({
        occupiedCells: 0,
        totalCells: 9,
        utilizationRate: 0
      })
    })

    it('应该计算部分占用的利用率', () => {
      const elements = [
        TransformBuilder.create(0, 0, 2, 2), // 占用4格
        TransformBuilder.create(2, 2, 1, 1)  // 占用1格
      ]
      
      const result = GridUtils.getGridUtilization(elements, testGrid)
      
      expect(result).toEqual({
        occupiedCells: 5,
        totalCells: 9,
        utilizationRate: 5/9
      })
    })

    it('应该计算完全占用的利用率', () => {
      const elements = [
        TransformBuilder.create(0, 0, 3, 3)
      ]
      
      const result = GridUtils.getGridUtilization(elements, testGrid)
      
      expect(result).toEqual({
        occupiedCells: 9,
        totalCells: 9,
        utilizationRate: 1
      })
    })

    it('应该处理重叠元素（不重复计算）', () => {
      const elements = [
        TransformBuilder.create(0, 0, 2, 2),
        TransformBuilder.create(1, 1, 2, 2) // 与第一个重叠
      ]
      
      const result = GridUtils.getGridUtilization(elements, testGrid)
      
      expect(result.occupiedCells).toBe(7) // 去重后的实际占用格数
      expect(result.totalCells).toBe(9)
    })
  })
})

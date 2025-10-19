/**
 * LayoutEngine 布局计算引擎单元测试
 */

import { LayoutEngine, computeLayout } from '@/layout/LayoutEngine'
import { createLayoutConfig, getLayoutById } from '@/core/models'
import type { LayoutConfig, Cell } from '@/core/models'

describe('LayoutEngine - 基础功能', () => {
  it('应该正确计算1x1布局', () => {
    const config = createLayoutConfig('grid-1x1')
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.cells.length).toBe(1)
    expect(result.availableWidth).toBe(800) // 无边距时
    expect(result.availableHeight).toBe(800)
  })

  it('应该正确计算2x2布局', () => {
    const config = createLayoutConfig('grid-2x2')
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.cells.length).toBe(4)
  })

  it('应该返回完整的布局结果', () => {
    const config = createLayoutConfig('grid-1x1')
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result).toHaveProperty('cells')
    expect(result).toHaveProperty('availableWidth')
    expect(result).toHaveProperty('availableHeight')
    expect(result).toHaveProperty('config')
  })
})

describe('LayoutEngine - 边距计算', () => {
  it('应该正确处理边距', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 20) // 20px边距
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.availableWidth).toBe(760) // 800 - 20*2
    expect(result.availableHeight).toBe(760)
  })

  it('应该在单元格位置中应用边距', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 20)
    
    const result = LayoutEngine.compute(config, 800, 800)
    const cell = result.cells[0]
    
    expect(cell.x).toBe(20) // 从边距开始
    expect(cell.y).toBe(20)
    expect(cell.width).toBe(760) // 减去边距
    expect(cell.height).toBe(760)
  })

  it('应该处理零边距', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.availableWidth).toBe(800)
    expect(result.availableHeight).toBe(800)
    expect(result.cells[0].x).toBe(0)
    expect(result.cells[0].y).toBe(0)
  })

  it('应该处理大边距', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 100)
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.availableWidth).toBe(600) // 800 - 100*2
    expect(result.availableHeight).toBe(600)
  })
})

describe('LayoutEngine - 间距计算', () => {
  it('应该正确处理间距', () => {
    const layout = getLayoutById('grid-2x2')!
    const config: LayoutConfig = {
      ...createLayoutConfig(layout),
      spacing: 10
    }
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    // 验证单元格之间有间距
    expect(result.cells.length).toBe(4)
  })

  it('零间距时单元格应该紧密排列', () => {
    const layout = getLayoutById('grid-2x2')!
    const config: LayoutConfig = {
      ...createLayoutConfig(layout),
      spacing: 0,
      padding: 0
    }
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    // 每个单元格应该是400x400
    expect(result.cells[0].width).toBe(400)
    expect(result.cells[0].height).toBe(400)
  })

  it('应该在相邻单元格之间应用间距', () => {
    const config: LayoutConfig = {
      ...createLayoutConfig('grid-2x1-h'),
      spacing: 20,
      padding: 0
    }
    
    const result = LayoutEngine.compute(config, 800, 400)
    
    // 第一个单元格应该从0开始
    expect(result.cells[0].x).toBe(0)
    
    // 第二个单元格应该考虑间距
    expect(result.cells[1].x).toBeGreaterThan(400)
  })
})

describe('LayoutEngine - 单元格索引', () => {
  it('应该正确设置单元格索引', () => {
    const config = createLayoutConfig('grid-2x2')
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.cells[0].index).toBe(0)
    expect(result.cells[1].index).toBe(1)
    expect(result.cells[2].index).toBe(2)
    expect(result.cells[3].index).toBe(3)
  })

  it('getCell应该返回正确的单元格', () => {
    const config = createLayoutConfig('grid-2x2')
    const result = LayoutEngine.compute(config, 800, 800)
    
    const cell = LayoutEngine.getCell(result, 2)
    
    expect(cell).toBeDefined()
    expect(cell?.index).toBe(2)
  })

  it('getCell对于无效索引应该返回undefined', () => {
    const config = createLayoutConfig('grid-2x2')
    const result = LayoutEngine.compute(config, 800, 800)
    
    const cell = LayoutEngine.getCell(result, 10)
    
    expect(cell).toBeUndefined()
  })
})

describe('LayoutEngine - 点击检测', () => {
  it('应该正确检测点是否在单元格内', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    const result = LayoutEngine.compute(config, 800, 800)
    const cell = result.cells[0]
    
    // 中心点应该在单元格内
    expect(LayoutEngine.isPointInCell(cell, 400, 400)).toBe(true)
    
    // 左上角应该在单元格内
    expect(LayoutEngine.isPointInCell(cell, 0, 0)).toBe(true)
    
    // 超出范围应该不在单元格内
    expect(LayoutEngine.isPointInCell(cell, 900, 900)).toBe(false)
  })

  it('应该正确找到包含指定点的单元格', () => {
    const layout = getLayoutById('grid-2x2')!
    const config = createLayoutConfig(layout, 0)
    const result = LayoutEngine.compute(config, 800, 800)
    
    // 左上角区域
    const cell1 = LayoutEngine.findCellAtPoint(result, 200, 200)
    expect(cell1?.index).toBe(0)
    
    // 右上角区域
    const cell2 = LayoutEngine.findCellAtPoint(result, 600, 200)
    expect(cell2?.index).toBe(1)
    
    // 左下角区域
    const cell3 = LayoutEngine.findCellAtPoint(result, 200, 600)
    expect(cell3?.index).toBe(2)
    
    // 右下角区域
    const cell4 = LayoutEngine.findCellAtPoint(result, 600, 600)
    expect(cell4?.index).toBe(3)
  })

  it('边界点应该正确处理', () => {
    const layout = getLayoutById('grid-2x2')!
    const config = createLayoutConfig(layout, 0)
    const result = LayoutEngine.compute(config, 800, 800)
    
    // 边界线上的点
    const cell = LayoutEngine.findCellAtPoint(result, 400, 400)
    expect(cell).toBeDefined()
  })

  it('超出范围的点应该返回undefined', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    const result = LayoutEngine.compute(config, 800, 800)
    
    const cell = LayoutEngine.findCellAtPoint(result, 1000, 1000)
    expect(cell).toBeUndefined()
  })
})

describe('LayoutEngine - 不同画布尺寸', () => {
  it('应该处理正方形画布', () => {
    const layout = getLayoutById('grid-2x2')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 1000, 1000)
    
    expect(result.availableWidth).toBe(1000)
    expect(result.availableHeight).toBe(1000)
  })

  it('应该处理宽屏画布', () => {
    const layout = getLayoutById('grid-2x1-h')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 1600, 900)
    
    expect(result.availableWidth).toBe(1600)
    expect(result.availableHeight).toBe(900)
  })

  it('应该处理竖屏画布', () => {
    const config = createLayoutConfig('grid-1x2-v', 0)
    
    const result = LayoutEngine.compute(config, 900, 1600)
    
    expect(result.availableWidth).toBe(900)
    expect(result.availableHeight).toBe(1600)
  })

  it('应该处理小画布', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 100, 100)
    
    expect(result.availableWidth).toBe(100)
    expect(result.availableHeight).toBe(100)
    expect(result.cells[0].width).toBe(100)
    expect(result.cells[0].height).toBe(100)
  })

  it('应该处理超大画布', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 4096, 4096)
    
    expect(result.availableWidth).toBe(4096)
    expect(result.availableHeight).toBe(4096)
  })
})

describe('LayoutEngine - 复杂布局', () => {
  it('应该处理3x3布局', () => {
    const layout = getLayoutById('grid-3x3')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 900, 900)
    
    expect(result.cells.length).toBe(9)
    
    // 每个单元格应该是300x300
    expect(result.cells[0].width).toBeCloseTo(300, 0)
    expect(result.cells[0].height).toBeCloseTo(300, 0)
  })

  it('应该处理4x4布局', () => {
    const config = createLayoutConfig('grid-4x4', 0)
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    expect(result.cells.length).toBe(16)
  })

  it('应该处理不对称布局（2x1）', () => {
    const layout = getLayoutById('grid-2x1-h')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 800, 400)
    
    expect(result.cells.length).toBe(2)
    expect(result.cells[0].width).toBe(400)
    expect(result.cells[0].height).toBe(400)
  })
})

describe('LayoutEngine - 像素对齐', () => {
  it('应该将坐标四舍五入到整数像素', () => {
    const layout = getLayoutById('grid-3x3')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 800, 800)
    
    // 所有坐标和尺寸应该是整数
    result.cells.forEach(cell => {
      expect(Number.isInteger(cell.x)).toBe(true)
      expect(Number.isInteger(cell.y)).toBe(true)
      expect(Number.isInteger(cell.width)).toBe(true)
      expect(Number.isInteger(cell.height)).toBe(true)
    })
  })

  it('奇数尺寸也应该正确对齐', () => {
    const layout = getLayoutById('grid-2x2')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 801, 801)
    
    result.cells.forEach(cell => {
      expect(Number.isInteger(cell.x)).toBe(true)
      expect(Number.isInteger(cell.y)).toBe(true)
      expect(Number.isInteger(cell.width)).toBe(true)
      expect(Number.isInteger(cell.height)).toBe(true)
    })
  })
})

describe('LayoutEngine - 快捷函数', () => {
  it('computeLayout应该与LayoutEngine.compute等价', () => {
    const config = createLayoutConfig('grid-2x2')
    
    const result1 = LayoutEngine.compute(config, 800, 800)
    const result2 = computeLayout(config, 800, 800)
    
    expect(result1.cells.length).toBe(result2.cells.length)
    expect(result1.availableWidth).toBe(result2.availableWidth)
    expect(result1.availableHeight).toBe(result2.availableHeight)
  })
})

describe('LayoutEngine - 边界条件', () => {
  it('应该处理边距大于画布尺寸', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 500) // 边距500，画布400
    
    const result = LayoutEngine.compute(config, 400, 400)
    
    // 可用区域为负，但应该不崩溃
    expect(result.availableWidth).toBe(-600) // 400 - 500*2
  })

  it('应该处理零尺寸画布', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    
    const result = LayoutEngine.compute(config, 0, 0)
    
    expect(result.availableWidth).toBe(0)
    expect(result.availableHeight).toBe(0)
  })

  it('应该处理负数坐标查询', () => {
    const layout = getLayoutById('grid-1x1')!
    const config = createLayoutConfig(layout, 0)
    const result = LayoutEngine.compute(config, 800, 800)
    
    const cell = LayoutEngine.findCellAtPoint(result, -10, -10)
    expect(cell).toBeUndefined()
  })
})


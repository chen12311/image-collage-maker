/**
 * LongImageLayoutGenerator 长图布局生成器单元测试
 */

import {
  LongImageLayoutGenerator,
  generateVerticalLongImage,
  generateHorizontalLongImage
} from '@/layout/LongImageLayoutGenerator'

describe('LongImageLayoutGenerator - 基础功能', () => {
  it('应该生成竖向长图布局', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 3,
      direction: 'vertical'
    })
    
    expect(layout.cells.length).toBe(3)
    expect(layout.id).toBe('long-image-vertical-3')
    expect(layout.name).toContain('竖向长图')
    expect(layout.imageCount).toBe(3)
  })

  it('应该生成横向长图布局', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 3,
      direction: 'horizontal'
    })
    
    expect(layout.cells.length).toBe(3)
    expect(layout.id).toBe('long-image-horizontal-3')
    expect(layout.name).toContain('横向长图')
    expect(layout.imageCount).toBe(3)
  })

  it('应该包含正确的标签', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 5,
      direction: 'vertical'
    })
    
    expect(layout.tags).toContain('长图')
    expect(layout.tags).toContain('竖向')
    expect(layout.tags).toContain('5图')
  })
})

describe('LongImageLayoutGenerator - 竖向布局', () => {
  it('每个单元格应该宽度100%', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 3,
      direction: 'vertical'
    })
    
    layout.cells.forEach(cell => {
      const [x, y, width, height] = cell
      expect(x).toBe(0)
      expect(width).toBe(1) // 100%
    })
  })

  it('单元格高度应该平均分配', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 4,
      direction: 'vertical'
    })
    
    const cellHeight = 1 / 4
    layout.cells.forEach((cell, index) => {
      const [x, y, width, height] = cell
      expect(height).toBeCloseTo(cellHeight, 10)
      expect(y).toBeCloseTo(index * cellHeight, 10)
    })
  })

  it('应该正确处理单张图片', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 1,
      direction: 'vertical'
    })
    
    expect(layout.cells.length).toBe(1)
    const [x, y, width, height] = layout.cells[0]
    expect(x).toBe(0)
    expect(y).toBe(0)
    expect(width).toBe(1)
    expect(height).toBe(1)
  })

  it('应该正确处理多张图片', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 10,
      direction: 'vertical'
    })
    
    expect(layout.cells.length).toBe(10)
    
    const cellHeight = 1 / 10
    layout.cells.forEach((cell, index) => {
      const [x, y, width, height] = cell
      expect(height).toBeCloseTo(cellHeight, 10)
    })
  })
})

describe('LongImageLayoutGenerator - 横向布局', () => {
  it('每个单元格应该高度100%', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 3,
      direction: 'horizontal'
    })
    
    layout.cells.forEach(cell => {
      const [x, y, width, height] = cell
      expect(y).toBe(0)
      expect(height).toBe(1) // 100%
    })
  })

  it('单元格宽度应该平均分配', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 4,
      direction: 'horizontal'
    })
    
    const cellWidth = 1 / 4
    layout.cells.forEach((cell, index) => {
      const [x, y, width, height] = cell
      expect(width).toBeCloseTo(cellWidth, 10)
      expect(x).toBeCloseTo(index * cellWidth, 10)
    })
  })

  it('应该正确处理单张图片', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 1,
      direction: 'horizontal'
    })
    
    expect(layout.cells.length).toBe(1)
    const [x, y, width, height] = layout.cells[0]
    expect(x).toBe(0)
    expect(y).toBe(0)
    expect(width).toBe(1)
    expect(height).toBe(1)
  })

  it('应该正确处理多张图片', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 10,
      direction: 'horizontal'
    })
    
    expect(layout.cells.length).toBe(10)
    
    const cellWidth = 1 / 10
    layout.cells.forEach((cell, index) => {
      const [x, y, width, height] = cell
      expect(width).toBeCloseTo(cellWidth, 10)
    })
  })
})

describe('LongImageLayoutGenerator - 自适应竖向布局', () => {
  it('应该根据图片尺寸生成自适应布局', () => {
    const imageSizes = [
      { width: 800, height: 600 },  // 4:3
      { width: 800, height: 800 },  // 1:1
      { width: 800, height: 1200 }  // 2:3
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells(imageSizes)
    
    expect(cells.length).toBe(3)
  })

  it('所有单元格宽度应该是100%', () => {
    const imageSizes = [
      { width: 800, height: 600 },
      { width: 1000, height: 500 }
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells(imageSizes)
    
    cells.forEach(cell => {
      const [x, y, width, height] = cell
      expect(x).toBe(0)
      expect(width).toBe(1)
    })
  })

  it('高度应该按比例分配', () => {
    const imageSizes = [
      { width: 100, height: 100 },  // 正方形
      { width: 100, height: 200 }   // 长方形，高度是宽度的2倍
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells(imageSizes)
    
    const [x1, y1, w1, h1] = cells[0]
    const [x2, y2, w2, h2] = cells[1]
    
    // 第二个单元格高度应该约是第一个的2倍
    expect(h2 / h1).toBeCloseTo(2, 1)
  })

  it('应该处理空数组', () => {
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells([])
    expect(cells.length).toBe(0)
  })

  it('单元格Y坐标应该连续', () => {
    const imageSizes = [
      { width: 800, height: 600 },
      { width: 800, height: 400 },
      { width: 800, height: 800 }
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells(imageSizes)
    
    let expectedY = 0
    cells.forEach(cell => {
      const [x, y, width, height] = cell
      expect(y).toBeCloseTo(expectedY, 10)
      expectedY += height
    })
    
    // 总高度应该是1
    expect(expectedY).toBeCloseTo(1, 10)
  })
})

describe('LongImageLayoutGenerator - 自适应横向布局', () => {
  it('应该根据图片尺寸生成自适应布局', () => {
    const imageSizes = [
      { width: 600, height: 800 },  // 3:4
      { width: 800, height: 800 },  // 1:1
      { width: 1200, height: 800 }  // 3:2
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveHorizontalCells(imageSizes)
    
    expect(cells.length).toBe(3)
  })

  it('所有单元格高度应该是100%', () => {
    const imageSizes = [
      { width: 600, height: 800 },
      { width: 500, height: 1000 }
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveHorizontalCells(imageSizes)
    
    cells.forEach(cell => {
      const [x, y, width, height] = cell
      expect(y).toBe(0)
      expect(height).toBe(1)
    })
  })

  it('宽度应该按比例分配', () => {
    const imageSizes = [
      { width: 100, height: 100 },  // 正方形
      { width: 200, height: 100 }   // 长方形，宽度是高度的2倍
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveHorizontalCells(imageSizes)
    
    const [x1, y1, w1, h1] = cells[0]
    const [x2, y2, w2, h2] = cells[1]
    
    // 第二个单元格宽度应该约是第一个的2倍
    expect(w2 / w1).toBeCloseTo(2, 1)
  })

  it('应该处理空数组', () => {
    const cells = LongImageLayoutGenerator.generateAdaptiveHorizontalCells([])
    expect(cells.length).toBe(0)
  })

  it('单元格X坐标应该连续', () => {
    const imageSizes = [
      { width: 600, height: 800 },
      { width: 400, height: 800 },
      { width: 800, height: 800 }
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveHorizontalCells(imageSizes)
    
    let expectedX = 0
    cells.forEach(cell => {
      const [x, y, width, height] = cell
      expect(x).toBeCloseTo(expectedX, 10)
      expectedX += width
    })
    
    // 总宽度应该是1
    expect(expectedX).toBeCloseTo(1, 10)
  })
})

describe('LongImageLayoutGenerator - 布局ID检测', () => {
  it('应该正确识别长图布局ID', () => {
    expect(LongImageLayoutGenerator.isLongImageLayout('long-image-vertical-3')).toBe(true)
    expect(LongImageLayoutGenerator.isLongImageLayout('long-image-horizontal-5')).toBe(true)
  })

  it('应该正确排除非长图布局ID', () => {
    expect(LongImageLayoutGenerator.isLongImageLayout('grid-2x2')).toBe(false)
    expect(LongImageLayoutGenerator.isLongImageLayout('grid-3x3')).toBe(false)
    expect(LongImageLayoutGenerator.isLongImageLayout('custom-layout')).toBe(false)
  })
})

describe('LongImageLayoutGenerator - 布局ID解析', () => {
  it('应该正确解析竖向布局ID', () => {
    const config = LongImageLayoutGenerator.parseLayoutId('long-image-vertical-5')
    
    expect(config).not.toBeNull()
    expect(config?.direction).toBe('vertical')
    expect(config?.imageCount).toBe(5)
    expect(config?.seamless).toBe(false)
  })

  it('应该正确解析横向布局ID', () => {
    const config = LongImageLayoutGenerator.parseLayoutId('long-image-horizontal-10')
    
    expect(config).not.toBeNull()
    expect(config?.direction).toBe('horizontal')
    expect(config?.imageCount).toBe(10)
  })

  it('非长图布局ID应该返回null', () => {
    const config = LongImageLayoutGenerator.parseLayoutId('grid-2x2')
    expect(config).toBeNull()
  })

  it('格式错误的ID应该返回null', () => {
    expect(LongImageLayoutGenerator.parseLayoutId('long-image-vertical')).toBeNull()
    expect(LongImageLayoutGenerator.parseLayoutId('long-image')).toBeNull()
    expect(LongImageLayoutGenerator.parseLayoutId('invalid')).toBeNull()
  })

  it('数量为非数字应该返回null', () => {
    const config = LongImageLayoutGenerator.parseLayoutId('long-image-vertical-abc')
    expect(config).toBeNull()
  })
})

describe('LongImageLayoutGenerator - 快捷生成函数', () => {
  it('generateVerticalLongImage应该生成竖向布局', () => {
    const layout = generateVerticalLongImage(3)
    
    expect(layout.id).toBe('long-image-vertical-3')
    expect(layout.cells.length).toBe(3)
  })

  it('generateHorizontalLongImage应该生成横向布局', () => {
    const layout = generateHorizontalLongImage(3)
    
    expect(layout.id).toBe('long-image-horizontal-3')
    expect(layout.cells.length).toBe(3)
  })
})

describe('LongImageLayoutGenerator - 边界条件', () => {
  it('应该拒绝零张图片', () => {
    expect(() => {
      LongImageLayoutGenerator.generate({
        imageCount: 0,
        direction: 'vertical'
      })
    }).toThrow('图片数量必须大于0')
  })

  it('应该拒绝负数图片数量', () => {
    expect(() => {
      LongImageLayoutGenerator.generate({
        imageCount: -1,
        direction: 'vertical'
      })
    }).toThrow('图片数量必须大于0')
  })

  it('应该处理大量图片', () => {
    const layout = LongImageLayoutGenerator.generate({
      imageCount: 100,
      direction: 'vertical'
    })
    
    expect(layout.cells.length).toBe(100)
    
    const cellHeight = 1 / 100
    layout.cells.forEach((cell, index) => {
      const [x, y, width, height] = cell
      expect(height).toBeCloseTo(cellHeight, 10)
    })
  })

  it('应该处理极端宽高比的图片', () => {
    const imageSizes = [
      { width: 10000, height: 100 },  // 超宽
      { width: 100, height: 10000 }   // 超高
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells(imageSizes)
    expect(cells.length).toBe(2)
    
    // 所有高度之和应该是1
    const totalHeight = cells.reduce((sum, cell) => sum + cell[3], 0)
    expect(totalHeight).toBeCloseTo(1, 10)
  })

  it('应该处理相同尺寸的图片', () => {
    const imageSizes = [
      { width: 800, height: 600 },
      { width: 800, height: 600 },
      { width: 800, height: 600 }
    ]
    
    const cells = LongImageLayoutGenerator.generateAdaptiveVerticalCells(imageSizes)
    
    // 所有单元格高度应该相同
    const height1 = cells[0][3]
    cells.forEach(cell => {
      expect(cell[3]).toBeCloseTo(height1, 10)
    })
  })
})


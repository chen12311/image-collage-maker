/**
 * CanvasSizeCalculator 画布尺寸计算器单元测试
 */

import {
  CanvasSizeCalculator,
  calculateVerticalLongImageSize,
  calculateHorizontalLongImageSize
} from '@/core/canvas/CanvasSizeCalculator'
import type { ImageElement } from '@/core/models'

/** 创建测试用的图片元素 */
function createTestImage(width: number, height: number): ImageElement {
  return {
    id: `img-${width}x${height}`,
    fileName: 'test.jpg',
    src: 'data:image/png;base64,test',
    image: new Image(),
    width,
    height,
    fileSize: 1024,
    timestamp: Date.now(),
    index: 0,
    transform: {
      rotation: 0,
      flipH: false,
      flipV: false
    }
  }
}

describe('CanvasSizeCalculator - 基础常量', () => {
  it('应该定义正确的默认值', () => {
    expect(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH).toBe(1080)
    expect(CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT).toBe(1080)
    expect(CanvasSizeCalculator.DEFAULT_MAX_WIDTH).toBe(4096)
    expect(CanvasSizeCalculator.DEFAULT_MAX_HEIGHT).toBe(20000)
    expect(CanvasSizeCalculator.DEFAULT_MIN_WIDTH).toBe(100)
    expect(CanvasSizeCalculator.DEFAULT_MIN_HEIGHT).toBe(100)
  })
})

describe('CanvasSizeCalculator - 固定宽度模式', () => {
  it('应该使用固定宽度计算高度', () => {
    const images = [
      createTestImage(800, 600),  // 4:3
      createTestImage(800, 800),  // 1:1
      createTestImage(800, 1200)  // 2:3
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1080,
      spacing: 0,
      padding: 0
    })
    
    expect(size.width).toBe(1080)
    expect(size.height).toBeGreaterThan(0)
  })

  it('应该正确计算多张图片的总高度', () => {
    const images = [
      createTestImage(1000, 1000),
      createTestImage(1000, 1000)
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1000,
      spacing: 0,
      padding: 0
    })
    
    // 两张1:1的图片，高度应该约为2000
    expect(size.height).toBeCloseTo(2000, 0)
  })

  it('应该考虑间距', () => {
    const images = [
      createTestImage(1000, 1000),
      createTestImage(1000, 1000)
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1000,
      spacing: 20,
      padding: 0
    })
    
    // 应该包含间距
    expect(size.height).toBeGreaterThan(2000)
  })

  it('应该考虑边距', () => {
    const images = [
      createTestImage(1000, 1000)
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1000,
      spacing: 0,
      padding: 20
    })
    
    // 宽度保持不变（固定）
    expect(size.width).toBe(1000)
    // 高度应该包含上下边距
    expect(size.height).toBeGreaterThan(940) // 约1000 - 20*2（用于计算）+ 20*2（边距）
  })

  it('应该应用最大高度限制', () => {
    const images = [
      createTestImage(1000, 10000) // 超高图片
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1000,
      maxHeight: 5000,
      spacing: 0,
      padding: 0
    })
    
    expect(size.height).toBeLessThanOrEqual(5000)
  })

  it('应该应用最小高度限制', () => {
    const images = [
      createTestImage(1000, 10) // 超扁图片
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1000,
      minHeight: 200,
      spacing: 0,
      padding: 0
    })
    
    expect(size.height).toBeGreaterThanOrEqual(200)
  })
})

describe('CanvasSizeCalculator - 固定高度模式', () => {
  it('应该使用固定高度计算宽度', () => {
    const images = [
      createTestImage(600, 800),  // 3:4
      createTestImage(800, 800),  // 1:1
      createTestImage(1200, 800)  // 3:2
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-height',
      direction: 'horizontal',
      fixedHeight: 1080,
      spacing: 0,
      padding: 0
    })
    
    expect(size.height).toBe(1080)
    expect(size.width).toBeGreaterThan(0)
  })

  it('应该正确计算多张图片的总宽度', () => {
    const images = [
      createTestImage(1000, 1000),
      createTestImage(1000, 1000)
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-height',
      direction: 'horizontal',
      fixedHeight: 1000,
      spacing: 0,
      padding: 0
    })
    
    // 两张1:1的图片，宽度应该约为2000
    expect(size.width).toBeCloseTo(2000, 0)
  })

  it('应该考虑间距', () => {
    const images = [
      createTestImage(1000, 1000),
      createTestImage(1000, 1000)
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-height',
      direction: 'horizontal',
      fixedHeight: 1000,
      spacing: 20,
      padding: 0
    })
    
    // 应该包含间距
    expect(size.width).toBeGreaterThan(2000)
  })

  it('应该应用最大宽度限制', () => {
    const images = [
      createTestImage(10000, 1000) // 超宽图片
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-height',
      direction: 'horizontal',
      fixedHeight: 1000,
      maxWidth: 5000,
      spacing: 0,
      padding: 0
    })
    
    expect(size.width).toBeLessThanOrEqual(5000)
  })

  it('应该应用最小宽度限制', () => {
    const images = [
      createTestImage(10, 1000) // 超窄图片
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-height',
      direction: 'horizontal',
      fixedHeight: 1000,
      minWidth: 200,
      spacing: 0,
      padding: 0
    })
    
    expect(size.width).toBeGreaterThanOrEqual(200)
  })
})

describe('CanvasSizeCalculator - 自动模式', () => {
  it('竖向应该使用固定宽度模式', () => {
    const images = [createTestImage(800, 600)]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'auto',
      direction: 'vertical',
      spacing: 0,
      padding: 0
    })
    
    expect(size.width).toBe(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH)
  })

  it('横向应该使用固定高度模式', () => {
    const images = [createTestImage(800, 600)]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'auto',
      direction: 'horizontal',
      spacing: 0,
      padding: 0
    })
    
    expect(size.height).toBe(CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT)
  })
})

describe('CanvasSizeCalculator - 预设模式', () => {
  it('应该返回默认尺寸', () => {
    const images = [createTestImage(800, 600)]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'preset',
      direction: 'vertical',
      spacing: 0,
      padding: 0
    })
    
    // 预设模式返回默认尺寸
    expect(size.width).toBe(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH)
  })
})

describe('CanvasSizeCalculator - 空图片列表', () => {
  it('应该返回默认尺寸（竖向）', () => {
    const size = CanvasSizeCalculator.calculate([], {
      mode: 'fixed-width',
      direction: 'vertical'
    })
    
    expect(size.width).toBe(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH)
    expect(size.height).toBe(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH)
  })

  it('应该返回默认尺寸（横向）', () => {
    const size = CanvasSizeCalculator.calculate([], {
      mode: 'fixed-height',
      direction: 'horizontal'
    })
    
    expect(size.width).toBe(CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT)
    expect(size.height).toBe(CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT)
  })
})

describe('CanvasSizeCalculator - 工具方法', () => {
  it('应该正确计算平均宽度', () => {
    const images = [
      createTestImage(800, 600),
      createTestImage(1000, 800),
      createTestImage(1200, 1000)
    ]
    
    const avgWidth = CanvasSizeCalculator.calculateAverageWidth(images)
    expect(avgWidth).toBe(1000) // (800 + 1000 + 1200) / 3
  })

  it('应该正确计算平均高度', () => {
    const images = [
      createTestImage(800, 600),
      createTestImage(1000, 800),
      createTestImage(1200, 1000)
    ]
    
    const avgHeight = CanvasSizeCalculator.calculateAverageHeight(images)
    expect(avgHeight).toBe(800) // (600 + 800 + 1000) / 3
  })

  it('应该正确计算平均宽高比', () => {
    const images = [
      createTestImage(800, 800),   // 1:1
      createTestImage(1600, 800),  // 2:1
      createTestImage(1200, 800)   // 1.5:1
    ]
    
    const avgRatio = CanvasSizeCalculator.calculateAverageRatio(images)
    expect(avgRatio).toBeCloseTo((1 + 2 + 1.5) / 3, 2)
  })

  it('空数组应该返回0或1', () => {
    expect(CanvasSizeCalculator.calculateAverageWidth([])).toBe(0)
    expect(CanvasSizeCalculator.calculateAverageHeight([])).toBe(0)
    expect(CanvasSizeCalculator.calculateAverageRatio([])).toBe(1)
  })
})

describe('CanvasSizeCalculator - 预估功能', () => {
  it('应该快速预估竖向长图尺寸', () => {
    const size = CanvasSizeCalculator.estimate(
      3,
      'vertical',
      { width: 1000, height: 1000 }
    )
    
    expect(size.width).toBe(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH)
    expect(size.height).toBeGreaterThan(0)
  })

  it('应该快速预估横向长图尺寸', () => {
    const size = CanvasSizeCalculator.estimate(
      3,
      'horizontal',
      { width: 1000, height: 1000 }
    )
    
    expect(size.height).toBe(CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT)
    expect(size.width).toBeGreaterThan(0)
  })
})

describe('CanvasSizeCalculator - 快捷函数', () => {
  it('calculateVerticalLongImageSize应该计算竖向长图', () => {
    const images = [
      createTestImage(1000, 1000),
      createTestImage(1000, 1000)
    ]
    
    const size = calculateVerticalLongImageSize(images)
    
    expect(size.width).toBe(CanvasSizeCalculator.DEFAULT_VERTICAL_WIDTH)
    expect(size.height).toBeGreaterThan(0)
  })

  it('calculateHorizontalLongImageSize应该计算横向长图', () => {
    const images = [
      createTestImage(1000, 1000),
      createTestImage(1000, 1000)
    ]
    
    const size = calculateHorizontalLongImageSize(images)
    
    expect(size.height).toBe(CanvasSizeCalculator.DEFAULT_HORIZONTAL_HEIGHT)
    expect(size.width).toBeGreaterThan(0)
  })

  it('应该支持自定义参数', () => {
    const images = [createTestImage(1000, 1000)]
    
    const size = calculateVerticalLongImageSize(images, 2000, 10, 20)
    
    expect(size.width).toBe(2000)
  })
})

describe('CanvasSizeCalculator - 边界条件', () => {
  it('应该处理极端宽高比的图片', () => {
    const images = [
      createTestImage(10000, 100) // 100:1 超宽
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1080,
      spacing: 0,
      padding: 0
    })
    
    expect(size.width).toBe(1080)
    expect(size.height).toBeGreaterThan(0)
  })

  it('应该处理超多图片', () => {
    const images = Array.from({ length: 100 }, () => 
      createTestImage(1000, 1000)
    )
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1080,
      spacing: 0,
      padding: 0
    })
    
    expect(size.width).toBe(1080)
    // 高度会被限制在最大值
    expect(size.height).toBeLessThanOrEqual(CanvasSizeCalculator.DEFAULT_MAX_HEIGHT)
  })

  it('应该过滤null和undefined图片', () => {
    const images = [
      createTestImage(1000, 1000),
      null as any,
      createTestImage(1000, 1000),
      undefined as any
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1080,
      spacing: 0,
      padding: 0
    })
    
    // 应该只计算有效图片
    expect(size.height).toBeGreaterThan(0)
  })

  it('应该处理零尺寸图片', () => {
    const images = [
      createTestImage(0, 0)
    ]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1080,
      spacing: 0,
      padding: 0
    })
    
    // 不应该崩溃
    expect(size.width).toBe(1080)
  })

  it('应该处理非常大的边距', () => {
    const images = [createTestImage(1000, 1000)]
    
    const size = CanvasSizeCalculator.calculate(images, {
      mode: 'fixed-width',
      direction: 'vertical',
      fixedWidth: 1080,
      spacing: 0,
      padding: 500 // 边距很大
    })
    
    expect(size.width).toBe(1080)
    // 可用宽度变小，计算仍应正常进行
    expect(size.height).toBeGreaterThan(0)
  })
})


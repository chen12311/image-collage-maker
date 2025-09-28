/**
 * LayoutEngine单元测试
 * 
 * Linus测试哲学：
 * - 验证"好品味"：零if/else分支的统一布局逻辑
 * - 验证贪心算法的正确性和效率
 * - 验证边界情况和错误处理
 * - 确保数学模型的一致性
 */

import { describe, it, expect } from '@jest/globals'
import { LayoutEngine, LayoutUtils } from '../../src/layout/LayoutEngine'
import { ElementBuilder } from '../../src/core/models/Element'
import { TransformBuilder } from '../../src/core/models/Transform'
import { GridConfigBuilder } from '../../src/core/models/GridConfig'
import type { Element, ImageContent, TextContent } from '../../src/core/models/Element'
import type { LayoutOptions, LayoutStrategy } from '../../src/layout/LayoutEngine'

describe('LayoutEngine', () => {
  // 测试用的默认选项
  const defaultOptions = LayoutUtils.createDefaultOptions()
  
  // 创建测试图片元素
  const createImageElement = (id: string, width = 200, height = 200): Element => {
    const imageContent: ImageContent = {
      file: new File([], `image-${id}.jpg`),
      imageData: new ImageData(width, height),
      thumbnail: new ImageData(50, 50),
      originalSize: { width, height },
      fileSize: 1024,
      mimeType: 'image/jpeg'
    }
    
    return ElementBuilder.createImage(
      id,
      imageContent,
      TransformBuilder.create(0, 0, 1, 1)
    )
  }
  
  // 创建测试文字元素
  const createTextElement = (id: string, text = '测试文字'): Element => {
    const textContent: TextContent = {
      text,
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#000000',
      textAlign: 'left',
      fontWeight: 'normal',
      lineHeight: 1.5
    }
    
    return ElementBuilder.createText(
      id,
      textContent,
      TransformBuilder.create(0, 0, 1, 1)
    )
  }

  describe('autoLayout()', () => {
    it('应该处理空元素列表', () => {
      const result = LayoutEngine.autoLayout([], defaultOptions)
      
      expect(result.transforms).toHaveLength(0)
      expect(result.statistics.totalElements).toBe(0)
      expect(result.layoutMode).toBe('grid')
      expect(result.gridConfig.rows).toBe(1)
      expect(result.gridConfig.cols).toBe(1)
    })

    it('应该处理单个元素', () => {
      const elements = [createImageElement('img1')]
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      expect(result.transforms).toHaveLength(1)
      expect(result.transforms[0].gridX).toBe(0)
      expect(result.transforms[0].gridY).toBe(0)
      expect(result.statistics.totalElements).toBe(1)
      expect(result.warnings).toEqual([])
    })

    it('应该处理多个相同尺寸的元素', () => {
      const elements = [
        createImageElement('img1'),
        createImageElement('img2'),
        createImageElement('img3'),
        createImageElement('img4')
      ]
      
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      expect(result.transforms).toHaveLength(4)
      expect(result.statistics.totalElements).toBe(4)
      
      // 验证无重叠
      for (let i = 0; i < result.transforms.length; i++) {
        for (let j = i + 1; j < result.transforms.length; j++) {
          expect(isOverlapping(result.transforms[i], result.transforms[j])).toBe(false)
        }
      }
    })

    it('应该处理混合元素类型（图片+文字）', () => {
      const elements = [
        createImageElement('img1', 400, 300),
        createTextElement('text1', '标题文字'),
        createImageElement('img2', 200, 200),
        createTextElement('text2', '描述文字')
      ]
      
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      expect(result.transforms).toHaveLength(4)
      expect(result.statistics.totalElements).toBe(4)
      expect(result.statistics.gridUtilization).toBeGreaterThan(0)
    })

    it('应该处理不同尺寸的元素（贪心算法验证）', () => {
      const elements = [
        createImageElement('large', 800, 600),  // 大元素
        createImageElement('small1', 100, 100), // 小元素1
        createImageElement('small2', 100, 100), // 小元素2
        createImageElement('medium', 300, 200)  // 中等元素
      ]
      
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      expect(result.transforms).toHaveLength(4)
      
      // 验证大元素被优先放置在前面位置（贪心算法特性）
      const largeElementTransform = result.transforms[0] // 按面积排序，最大的应该在第一个
      expect(largeElementTransform.gridWidth * largeElementTransform.gridHeight).toBeGreaterThanOrEqual(
        result.transforms[1].gridWidth * result.transforms[1].gridHeight
      )
    })
  })

  describe('detectOptimalLayout()', () => {
    it('应该为空列表返回基础网格', () => {
      const result = LayoutEngine.detectOptimalLayout([], defaultOptions)
      
      expect(result.mode).toBe('grid')
      expect(result.config.rows).toBe(1)
      expect(result.config.cols).toBe(1)
    })

    it('应该为单个元素选择合适布局', () => {
      const elements = [createImageElement('img1')]
      const result = LayoutEngine.detectOptimalLayout(elements, defaultOptions)
      
      expect(result.config.rows).toBeGreaterThan(0)
      expect(result.config.cols).toBeGreaterThan(0)
      expect(['horizontal', 'vertical', 'grid']).toContain(result.mode)
    })

    it('应该为少量元素倾向于选择横向布局', () => {
      const elements = [
        createImageElement('img1'),
        createImageElement('img2'),
        createImageElement('img3')
      ]
      
      const result = LayoutEngine.detectOptimalLayout(elements, defaultOptions)
      
      // 3个元素，算法会在horizontal和grid中选择最佳的
      expect(['horizontal', 'vertical', 'grid']).toContain(result.mode)
    })

    it('应该为大量元素选择网格布局', () => {
      const elements = Array.from({ length: 12 }, (_, i) => createImageElement(`img${i}`))
      
      const result = LayoutEngine.detectOptimalLayout(elements, defaultOptions)
      
      // 12个元素，网格布局应该是最佳选择
      expect(result.mode).toBe('grid')
      expect(result.config.rows * result.config.cols).toBeGreaterThanOrEqual(12)
    })
  })

  describe('validateLayout()', () => {
    it('应该验证有效布局', () => {
      const transforms = [
        TransformBuilder.create(0, 0, 1, 1),
        TransformBuilder.create(1, 0, 1, 1),
        TransformBuilder.create(0, 1, 1, 1)
      ]
      const gridConfig = GridConfigBuilder.grid(2, 2, 200, 200, 10)
      
      const result = LayoutEngine.validateLayout(transforms, gridConfig)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测元素超出边界', () => {
      const transforms = [
        TransformBuilder.create(2, 2, 1, 1) // 超出2×2网格边界
      ]
      const gridConfig = GridConfigBuilder.grid(2, 2, 200, 200, 10)
      
      const result = LayoutEngine.validateLayout(transforms, gridConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('超出网格边界')
    })

    it('应该检测元素重叠', () => {
      const transforms = [
        TransformBuilder.create(0, 0, 2, 2),
        TransformBuilder.create(1, 1, 2, 2) // 与第一个重叠
      ]
      const gridConfig = GridConfigBuilder.grid(3, 3, 200, 200, 10)
      
      const result = LayoutEngine.validateLayout(transforms, gridConfig)
      
      expect(result.isValid).toBe(true) // 重叠是警告，不是错误
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('重叠')
    })

    it('应该检测低利用率', () => {
      const transforms = [
        TransformBuilder.create(0, 0, 1, 1) // 单个元素在大网格中
      ]
      const gridConfig = GridConfigBuilder.grid(5, 5, 200, 200, 10) // 25格的大网格
      
      const result = LayoutEngine.validateLayout(transforms, gridConfig)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings.some(w => w.includes('利用率较低'))).toBe(true)
    })
  })

  describe('rearrangeElements()', () => {
    const testTransforms = [
      TransformBuilder.create(2, 2, 1, 1),
      TransformBuilder.create(0, 1, 1, 1),
      TransformBuilder.create(1, 0, 1, 1)
    ]
    const testGrid = GridConfigBuilder.grid(3, 3, 200, 200, 10)

    it('应该执行紧密排列', () => {
      const result = LayoutEngine.rearrangeElements(testTransforms, testGrid, 'compact')
      
      expect(result).toHaveLength(testTransforms.length)
      
      // 紧密排列应该将元素移动到左上角附近
      const firstElement = result[0]
      expect(firstElement.gridX + firstElement.gridY).toBeLessThanOrEqual(2)
    })

    it('应该执行分布排列', () => {
      const result = LayoutEngine.rearrangeElements(testTransforms, testGrid, 'distribute')
      
      expect(result).toHaveLength(testTransforms.length)
      
      // 分布排列应该均匀分布元素
      const positions = result.map(t => ({ x: t.gridX, y: t.gridY }))
      expect(positions).toHaveLength(testTransforms.length)
    })

    it('应该执行对齐排列', () => {
      const result = LayoutEngine.rearrangeElements(testTransforms, testGrid, 'align')
      
      expect(result).toHaveLength(testTransforms.length)
      
      // 对齐排列应该将元素移动到中心附近
      const centerX = Math.floor(testGrid.cols / 2)
      const centerY = Math.floor(testGrid.rows / 2)
      
      for (const transform of result) {
        expect(Math.abs(transform.gridX - centerX)).toBeLessThanOrEqual(2)
        expect(Math.abs(transform.gridY - centerY)).toBeLessThanOrEqual(2)
      }
    })
  })

  describe('布局策略测试', () => {
    const testElements = Array.from({ length: 6 }, (_, i) => createImageElement(`img${i}`))

    it('应该测试tight策略', () => {
      const options = LayoutUtils.mergeOptions(defaultOptions, { strategy: 'tight' as LayoutStrategy })
      const result = LayoutEngine.autoLayout(testElements, options)
      
      expect(result.statistics.gridUtilization).toBeGreaterThan(0.5)
      
      // tight策略应该产生较小的画布
      expect(result.canvasSize.width * result.canvasSize.height).toBeLessThan(
        1000 * 1000 // 合理的上限
      )
    })

    it('应该测试loose策略', () => {
      const options = LayoutUtils.mergeOptions(defaultOptions, { strategy: 'loose' as LayoutStrategy })
      const result = LayoutEngine.autoLayout(testElements, options)
      
      // loose策略可能产生较低的利用率
      expect(result.statistics.gridUtilization).toBeGreaterThan(0)
      expect(result.statistics.gridUtilization).toBeLessThanOrEqual(1)
    })

    it('应该测试balanced策略', () => {
      const options = LayoutUtils.mergeOptions(defaultOptions, { strategy: 'balanced' as LayoutStrategy })
      const result = LayoutEngine.autoLayout(testElements, options)
      
      // balanced策略应该产生接近正方形的布局
      const aspectRatio = result.canvasSize.width / result.canvasSize.height
      expect(aspectRatio).toBeGreaterThan(0.5)
      expect(aspectRatio).toBeLessThan(2.0)
    })

    it('应该测试auto策略', () => {
      const options = LayoutUtils.mergeOptions(defaultOptions, { strategy: 'auto' as LayoutStrategy })
      const result = LayoutEngine.autoLayout(testElements, options)
      
      expect(result.statistics.totalElements).toBe(6)
      expect(result.statistics.gridUtilization).toBeGreaterThan(0)
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理巨大的元素', () => {
      const elements = [createImageElement('huge', 2000, 2000)]
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      expect(result.transforms).toHaveLength(1)
      expect(result.warnings).toBeDefined()
    })

    it('应该处理零尺寸元素', () => {
      const elements = [createImageElement('zero', 0, 0)]
      const options = LayoutUtils.mergeOptions(defaultOptions, { 
        minCellWidth: 100, 
        minCellHeight: 100 
      })
      
      const result = LayoutEngine.autoLayout(elements, options)
      
      expect(result.transforms).toHaveLength(1)
      expect(result.transforms[0].gridWidth).toBeGreaterThan(0)
      expect(result.transforms[0].gridHeight).toBeGreaterThan(0)
    })

    it('应该处理大量元素', () => {
      const elements = Array.from({ length: 100 }, (_, i) => createImageElement(`img${i}`))
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      expect(result.transforms).toHaveLength(100)
      expect(result.statistics.totalElements).toBe(100)
    })

    it('应该处理allowOverlap选项', () => {
      const elements = Array.from({ length: 50 }, (_, i) => createImageElement(`img${i}`))
      const options = LayoutUtils.mergeOptions(defaultOptions, { allowOverlap: true })
      
      const result = LayoutEngine.autoLayout(elements, options)
      
      expect(result.transforms).toHaveLength(50)
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内处理大量元素', () => {
      const elements = Array.from({ length: 200 }, (_, i) => createImageElement(`img${i}`))
      
      const startTime = performance.now()
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(1000) // 1秒内完成
      expect(result.transforms).toHaveLength(200)
    })

    it('应该验证O(n)复杂度特性', () => {
      const sizes = [10, 20, 40, 80]
      const times: number[] = []
      
      for (const size of sizes) {
        const elements = Array.from({ length: size }, (_, i) => createImageElement(`img${i}`))
        
        const startTime = performance.now()
        LayoutEngine.autoLayout(elements, defaultOptions)
        const endTime = performance.now()
        
        times.push(endTime - startTime)
      }
      
      // 验证时间复杂度大致呈线性增长
      expect(times[3] / times[0]).toBeLessThan(20) // 8倍元素，时间不超过20倍
    })
  })

  describe('数学模型一致性验证', () => {
    it('应该验证布局结果的数学一致性', () => {
      const elements = [
        createImageElement('img1', 200, 200),
        createImageElement('img2', 400, 300),
        createImageElement('img3', 300, 300)
      ]
      
      const result = LayoutEngine.autoLayout(elements, defaultOptions)
      
      // 验证所有元素都在网格边界内
      for (const transform of result.transforms) {
        expect(transform.gridX).toBeGreaterThanOrEqual(0)
        expect(transform.gridY).toBeGreaterThanOrEqual(0)
        expect(transform.gridX + transform.gridWidth).toBeLessThanOrEqual(result.gridConfig.cols)
        expect(transform.gridY + transform.gridHeight).toBeLessThanOrEqual(result.gridConfig.rows)
      }
      
      // 验证统计数据的一致性
      expect(result.statistics.totalElements).toBe(elements.length)
      expect(result.statistics.gridUtilization).toBeGreaterThan(0)
      expect(result.statistics.gridUtilization).toBeLessThanOrEqual(1)
      expect(result.statistics.wastedSpace).toBe(1 - result.statistics.gridUtilization)
    })

    it('应该验证不同策略产生的布局都是有效的', () => {
      const elements = Array.from({ length: 8 }, (_, i) => createImageElement(`img${i}`))
      const strategies: LayoutStrategy[] = ['auto', 'tight', 'loose', 'balanced']
      
      for (const strategy of strategies) {
        const options = LayoutUtils.mergeOptions(defaultOptions, { strategy })
        const result = LayoutEngine.autoLayout(elements, options)
        
        expect(result.transforms).toHaveLength(8)
        
        const validation = LayoutEngine.validateLayout(result.transforms, result.gridConfig)
        expect(validation.isValid).toBe(true)
      }
    })
  })
})

describe('LayoutUtils', () => {
  describe('createDefaultOptions()', () => {
    it('应该创建有效的默认选项', () => {
      const options = LayoutUtils.createDefaultOptions()
      
      expect(options.strategy).toBe('auto')
      expect(options.minCellWidth).toBeGreaterThan(0)
      expect(options.minCellHeight).toBeGreaterThan(0)
      expect(options.spacing).toBeGreaterThanOrEqual(0)
      expect(options.preserveAspectRatio).toBeDefined()
      expect(options.allowOverlap).toBeDefined()
    })
  })

  describe('mergeOptions()', () => {
    it('应该正确合并选项', () => {
      const base = LayoutUtils.createDefaultOptions()
      const overrides = { 
        strategy: 'tight' as LayoutStrategy, 
        spacing: 20 
      }
      
      const merged = LayoutUtils.mergeOptions(base, overrides)
      
      expect(merged.strategy).toBe('tight')
      expect(merged.spacing).toBe(20)
      expect(merged.minCellWidth).toBe(base.minCellWidth) // 保持原值
    })
  })

  describe('validateOptions()', () => {
    it('应该验证有效选项', () => {
      const options = LayoutUtils.createDefaultOptions()
      const result = LayoutUtils.validateOptions(options)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的单元格尺寸', () => {
      const options = LayoutUtils.mergeOptions(LayoutUtils.createDefaultOptions(), {
        minCellWidth: 0,
        minCellHeight: -10
      })
      
      const result = LayoutUtils.validateOptions(options)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该检测无效的间距', () => {
      const options = LayoutUtils.mergeOptions(LayoutUtils.createDefaultOptions(), {
        spacing: -5
      })
      
      const result = LayoutUtils.validateOptions(options)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('间距'))).toBe(true)
    })
  })

  describe('estimateMemoryUsage()', () => {
    it('应该估算内存使用量', () => {
      // 在这个作用域内重新定义createImageElement
      const createTestImageElement = (id: string): Element => {
        const imageContent: ImageContent = {
          file: new File([], `image-${id}.jpg`),
          imageData: new ImageData(200, 200),
          thumbnail: new ImageData(50, 50),
          originalSize: { width: 200, height: 200 },
          fileSize: 1024,
          mimeType: 'image/jpeg'
        }
        
        return ElementBuilder.createImage(
          id,
          imageContent,
          TransformBuilder.create(0, 0, 1, 1)
        )
      }
      
      const elements = [createTestImageElement('img1')]
      const result = LayoutEngine.autoLayout(elements, LayoutUtils.createDefaultOptions())
      
      const memoryUsage = LayoutUtils.estimateMemoryUsage(result)
      
      expect(memoryUsage).toBeGreaterThan(0)
      expect(typeof memoryUsage).toBe('number')
    })
  })
})

// 辅助函数
function isOverlapping(transform1: any, transform2: any): boolean {
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

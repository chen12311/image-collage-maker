/**
 * Canvas 渲染逻辑测试
 * 
 * 测试图片数组到画布单元格的映射是否正确
 */

import { describe, it, expect } from '@jest/globals'
import type { ImageElement } from '@/core/models'
import type { ComputedCell } from '@/layout/LayoutEngine'

describe('Canvas 渲染映射测试', () => {
  /**
   * 模拟渲染逻辑
   */
  function simulateRender(cells: ComputedCell[], images: (ImageElement | null)[]) {
    const result: { cellIndex: number; imageId: string | null }[] = []
    
    cells.forEach((cell, index) => {
      const image = images[index]
      if (image && image !== null) {
        result.push({ cellIndex: index, imageId: image.id })
      } else {
        result.push({ cellIndex: index, imageId: null })
      }
    })
    
    return result
  }

  /**
   * 创建测试用的图片元素
   */
  function createTestImage(id: string): ImageElement {
    return {
      id,
      src: `data:image/png;base64,test`,
      fileName: `${id}.png`,
      index: 0,
      width: 100,
      height: 100,
      transform: {
        flipH: false,
        flipV: false,
        rotation: 0
      }
    }
  }

  /**
   * 创建测试用的单元格
   */
  function createCells(count: number): ComputedCell[] {
    return Array.from({ length: count }, (_, i) => ({
      x: i * 100,
      y: 0,
      width: 100,
      height: 100
    }))
  }

  it('场景1：2个单元格，只有一张图片在位置0', () => {
    const cells = createCells(2)
    const images = [createTestImage('img1')]
    
    const result = simulateRender(cells, images)
    
    expect(result).toEqual([
      { cellIndex: 0, imageId: 'img1' },
      { cellIndex: 1, imageId: null }
    ])
  })

  it('场景2：2个单元格，两张不同的图片', () => {
    const cells = createCells(2)
    const images = [createTestImage('img1'), createTestImage('img2')]
    
    const result = simulateRender(cells, images)
    
    expect(result).toEqual([
      { cellIndex: 0, imageId: 'img1' },
      { cellIndex: 1, imageId: 'img2' }
    ])
  })

  it('场景3：2个单元格，位置0有图片，位置1是null', () => {
    const cells = createCells(2)
    const images = [createTestImage('img1'), null]
    
    const result = simulateRender(cells, images)
    
    expect(result).toEqual([
      { cellIndex: 0, imageId: 'img1' },
      { cellIndex: 1, imageId: null }
    ])
  })

  it('场景4：3个单元格，但只有2张图片', () => {
    const cells = createCells(3)
    const images = [createTestImage('img1'), createTestImage('img2')]
    
    const result = simulateRender(cells, images)
    
    expect(result).toEqual([
      { cellIndex: 0, imageId: 'img1' },
      { cellIndex: 1, imageId: 'img2' },
      { cellIndex: 2, imageId: null }
    ])
  })

  it('场景5：验证不会出现"两个位置都是同一张图片"的情况', () => {
    const cells = createCells(2)
    const image1 = createTestImage('img1')
    const images = [image1]
    
    const result = simulateRender(cells, images)
    
    // 验证：位置0有图片，位置1是null（而不是img1）
    expect(result[0].imageId).toBe('img1')
    expect(result[1].imageId).toBeNull()
    
    // 验证：不存在两个位置都是同一个ID的情况
    const imageIds = result.filter(r => r.imageId !== null).map(r => r.imageId)
    const uniqueIds = new Set(imageIds)
    expect(imageIds.length).toBe(uniqueIds.size) // 应该没有重复
  })
})


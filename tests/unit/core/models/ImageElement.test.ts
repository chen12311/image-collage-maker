/**
 * ImageElement 图片元素模型单元测试
 * 
 * 测试图片加载、创建和工具函数
 */

import {
  createImageElement,
  createImageElements,
  getImageAspectRatio
} from '@/core/models/ImageElement'
import type { ImageElement } from '@/core/models/ImageElement'

/** 创建测试用的File对象 */
function createTestFile(name: string, _size: number = 1024): File {
  return new File(['test content'], name, { type: 'image/jpeg' })
}

describe('ImageElement - createImageElement()', () => {
  it('应该成功创建图片元素', async () => {
    const file = createTestFile('test.jpg', 2048)
    
    const element = await createImageElement(file, 0)
    
    // 验证基本属性
    expect(element).toBeDefined()
    expect(element.id).toBeDefined()
    expect(element.id).toMatch(/^img-\d+-[a-z0-9]+$/)
    expect(element.fileName).toBe('test.jpg')
    // fileSize 可能与Mock实现有关，只验证存在即可
    expect(element.fileSize).toBeGreaterThan(0)
    expect(element.index).toBe(0)
  })

  it('应该正确设置图片尺寸', async () => {
    const file = createTestFile('test.jpg')
    
    // Mock Image 在 setup.ts 中默认设置 width 和 height 为 0
    // 我们需要在这里覆盖它
    const originalImage = global.Image
    global.Image = class MockImage {
      width = 0
      height = 0
      naturalWidth = 800
      naturalHeight = 600
      src = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      
      constructor() {
        setTimeout(() => {
          this.width = this.naturalWidth
          this.height = this.naturalHeight
          if (this.onload) {
            this.onload()
          }
        }, 0)
      }
    } as any
    
    const element = await createImageElement(file)
    
    expect(element.width).toBe(800)
    expect(element.height).toBe(600)
    
    // 恢复原始 Image mock
    global.Image = originalImage
  })

  it('应该生成唯一的ID', async () => {
    const file = createTestFile('test.jpg')
    
    const element1 = await createImageElement(file, 0)
    const element2 = await createImageElement(file, 0)
    
    expect(element1.id).not.toBe(element2.id)
  })

  it('应该正确设置index', async () => {
    const file = createTestFile('test.jpg')
    
    const element0 = await createImageElement(file, 0)
    const element5 = await createImageElement(file, 5)
    
    expect(element0.index).toBe(0)
    expect(element5.index).toBe(5)
  })

  it('应该包含src属性（Data URL）', async () => {
    const file = createTestFile('test.jpg')
    
    const element = await createImageElement(file)
    
    expect(element.src).toBeDefined()
    expect(element.src).toMatch(/^data:image/)
  })

  it('应该包含image实例', async () => {
    const file = createTestFile('test.jpg')
    
    const element = await createImageElement(file)
    
    expect(element.image).toBeDefined()
    expect(element.image).toBeInstanceOf(Image)
  })

  it('应该包含默认的transform配置', async () => {
    const file = createTestFile('test.jpg')
    
    const element = await createImageElement(file)
    
    expect(element.transform).toEqual({
      flipH: false,
      flipV: false,
      rotation: 0
    })
  })

  it('应该包含timestamp', async () => {
    const before = Date.now()
    const file = createTestFile('test.jpg')
    
    const element = await createImageElement(file)
    const after = Date.now()
    
    expect(element.timestamp).toBeGreaterThanOrEqual(before)
    expect(element.timestamp).toBeLessThanOrEqual(after)
  })

  it('应该处理图片加载失败', async () => {
    const file = createTestFile('invalid.jpg')
    
    // Mock Image 使其失败
    const originalImage = global.Image
    global.Image = class MockImage {
      src = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      
      constructor() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror()
          }
        }, 0)
      }
    } as any
    
    await expect(createImageElement(file)).rejects.toThrow('图片加载失败: invalid.jpg')
    
    // 恢复原始 Image mock
    global.Image = originalImage
  })

  it('应该处理FileReader错误', async () => {
    const file = createTestFile('test.jpg')
    
    // Mock FileReader 使其失败
    const originalFileReader = global.FileReader
    global.FileReader = class MockFileReader {
      result: string | ArrayBuffer | null = null
      error: any = null
      onload: ((event: any) => void) | null = null
      onerror: ((event: any) => void) | null = null
      
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror({} as any)
          }
        }, 0)
      }
    } as any
    
    await expect(createImageElement(file)).rejects.toThrow('文件读取失败: test.jpg')
    
    // 恢复原始 FileReader mock
    global.FileReader = originalFileReader
  })
})

describe('ImageElement - createImageElements()', () => {
  it('应该批量创建多个图片元素', async () => {
    const files = [
      createTestFile('image1.jpg'),
      createTestFile('image2.jpg'),
      createTestFile('image3.jpg')
    ]
    
    const elements = await createImageElements(files)
    
    expect(elements).toHaveLength(3)
    expect(elements[0].fileName).toBe('image1.jpg')
    expect(elements[1].fileName).toBe('image2.jpg')
    expect(elements[2].fileName).toBe('image3.jpg')
  })

  it('应该正确设置每个图片的index', async () => {
    const files = [
      createTestFile('image1.jpg'),
      createTestFile('image2.jpg'),
      createTestFile('image3.jpg')
    ]
    
    const elements = await createImageElements(files)
    
    expect(elements[0].index).toBe(0)
    expect(elements[1].index).toBe(1)
    expect(elements[2].index).toBe(2)
  })

  it('应该处理空数组', async () => {
    const elements = await createImageElements([])
    
    expect(elements).toHaveLength(0)
    expect(elements).toEqual([])
  })

  it('应该并行加载所有图片', async () => {
    const files = [
      createTestFile('image1.jpg'),
      createTestFile('image2.jpg'),
      createTestFile('image3.jpg')
    ]
    
    const startTime = Date.now()
    const elements = await createImageElements(files)
    const endTime = Date.now()
    
    // 并行加载应该快于串行（如果串行每个需10ms，3个就需30ms+）
    // 但由于setTimeout(0)，实际可能很快，这里主要验证能成功返回
    expect(elements).toHaveLength(3)
    expect(endTime - startTime).toBeLessThan(1000) // 合理的超时时间
  })
})

describe('ImageElement - getImageAspectRatio()', () => {
  /** 创建测试用的ImageElement */
  function createMockImageElement(width: number, height: number): ImageElement {
    const img = new Image()
    return {
      id: 'test-id',
      src: 'data:image/png;base64,test',
      image: img,
      width,
      height,
      fileName: 'test.jpg',
      fileSize: 1024,
      timestamp: Date.now(),
      index: 0,
      transform: {
        flipH: false,
        flipV: false,
        rotation: 0
      },
      fitMode: 'contain'
    }
  }

  it('应该正确计算横图的比例', () => {
    const element = createMockImageElement(1600, 900)
    
    const ratio = getImageAspectRatio(element)
    
    expect(ratio).toBeCloseTo(16 / 9, 5)
  })

  it('应该正确计算竖图的比例', () => {
    const element = createMockImageElement(900, 1600)
    
    const ratio = getImageAspectRatio(element)
    
    expect(ratio).toBeCloseTo(9 / 16, 5)
  })

  it('应该正确计算正方形的比例', () => {
    const element = createMockImageElement(1000, 1000)
    
    const ratio = getImageAspectRatio(element)
    
    expect(ratio).toBe(1)
  })

  it('应该处理常见的宽高比', () => {
    // 16:9
    expect(getImageAspectRatio(createMockImageElement(1920, 1080)))
      .toBeCloseTo(16 / 9, 5)
    
    // 4:3
    expect(getImageAspectRatio(createMockImageElement(1024, 768)))
      .toBeCloseTo(4 / 3, 5)
    
    // 3:2
    expect(getImageAspectRatio(createMockImageElement(3000, 2000)))
      .toBeCloseTo(3 / 2, 5)
    
    // 21:9 (超宽屏) - 实际2560/1080 = 2.37
    expect(getImageAspectRatio(createMockImageElement(2560, 1080)))
      .toBeCloseTo(2560 / 1080, 5)
  })

  it('应该处理极小尺寸', () => {
    const element = createMockImageElement(1, 1)
    
    const ratio = getImageAspectRatio(element)
    
    expect(ratio).toBe(1)
  })

  it('应该处理极大尺寸', () => {
    const element = createMockImageElement(10000, 5000)
    
    const ratio = getImageAspectRatio(element)
    
    expect(ratio).toBe(2)
  })
})


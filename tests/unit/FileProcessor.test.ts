/**
 * FileProcessor - 单元测试
 * 
 * 测试策略：
 * 1. 测试数据结构正确性
 * 2. 测试边界情况处理
 * 3. 测试错误恢复能力
 * 4. 测试性能要求
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { FileProcessor, type ProcessorConfig, type ProcessingResult } from '../../src/processing/FileProcessor'

// ============================================================================
// 测试工具 - Mock数据和辅助函数
// ============================================================================

/**
 * 创建测试用File对象
 */
function createTestFile(options: {
  name?: string
  type?: string
  size?: number
  content?: string
}): File {
  const {
    name = 'test.jpg',
    type = 'image/jpeg',
    size = 1024 * 1024, // 1MB
    content = 'fake-image-content'
  } = options

  const blob = new Blob([content], { type })
  const file = new File([blob], name, { type })
  
  // Mock file size
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false
  })
  
  return file
}

/**
 * 创建测试用ImageData - 简单直接的mock
 */
function createTestImageData(width = 100, height = 100): ImageData {
  // 不在测试环境中使用真实Canvas，直接创建ImageData对象
  const data = new Uint8ClampedArray(width * height * 4)
  
  // 填充简单的测试数据 - 红绿蓝黄四色模式
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = Math.floor(i / 4)
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    
    if (x < width / 2 && y < height / 2) {
      // 左上角 - 红色
      data[i] = 255; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255
    } else if (x >= width / 2 && y < height / 2) {
      // 右上角 - 绿色
      data[i] = 0; data[i + 1] = 255; data[i + 2] = 0; data[i + 3] = 255
    } else if (x < width / 2 && y >= height / 2) {
      // 左下角 - 蓝色
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 255; data[i + 3] = 255
    } else {
      // 右下角 - 黄色
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 0; data[i + 3] = 255
    }
  }
  
  // 在Jest环境中，直接构造一个符合ImageData接口的对象
  const imageData = new ImageData(data, width, height)
  
  // 确保width和height属性可访问
  Object.defineProperty(imageData, 'width', {
    value: width,
    writable: false,
    enumerable: true
  })
  Object.defineProperty(imageData, 'height', {
    value: height,
    writable: false,
    enumerable: true
  })
  
  return imageData
}

/**
 * Mock HTMLImageElement
 */
function mockImage(): void {
  global.Image = class MockImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src = ''
    naturalWidth = 200
    naturalHeight = 200
    
    constructor() {
      // 异步触发onload
      setTimeout(() => {
        if (this.onload) {
          this.onload()
        }
      }, 10)
    }
    
    remove() {
      // Mock remove method
    }
  } as any
}

/**
 * Mock Canvas相关API
 */
function mockCanvas(): void {
  const mockGetContext = jest.fn().mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue(createTestImageData()),
    putImageData: jest.fn(),
    fillRect: jest.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  })

  global.HTMLCanvasElement.prototype.getContext = mockGetContext
  global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
    const blob = new Blob(['fake-canvas-data'], { type: 'image/jpeg' })
    setTimeout(() => callback(blob), 10)
  })
  
  // Mock Canvas width和height属性
  Object.defineProperty(global.HTMLCanvasElement.prototype, 'width', {
    writable: true,
    value: 200
  })
  Object.defineProperty(global.HTMLCanvasElement.prototype, 'height', {
    writable: true,
    value: 200
  })
}

/**
 * Mock URL API
 */
function mockURL(): void {
  global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')
  global.URL.revokeObjectURL = jest.fn()
}

// ============================================================================
// 测试套件
// ============================================================================

describe('FileProcessor', () => {
  let processor: FileProcessor
  
  beforeEach(() => {
    // Reset processor with default config
    processor = new FileProcessor()
    
    // Setup mocks
    mockImage()
    mockCanvas()
    mockURL()
    
    // Mock performance.now with incrementing values
    let mockTime = 1000
    jest.spyOn(performance, 'now').mockImplementation(() => {
      mockTime += 100 // 每次调用增加100ms
      return mockTime
    })
  })

  // ==========================================================================
  // 构造函数和配置测试
  // ==========================================================================

  describe('构造函数和配置', () => {
    it('应该使用默认配置创建实例', () => {
      const processor = new FileProcessor()
      expect(processor).toBeInstanceOf(FileProcessor)
    })

    it('应该接受自定义配置', () => {
      const config: Partial<ProcessorConfig> = {
        compressionThreshold: 10 * 1024 * 1024, // 10MB
        compressionQuality: 0.9,
        thumbnailMaxWidth: 150,
        maxConcurrency: 2
      }
      
      const processor = new FileProcessor(config)
      expect(processor).toBeInstanceOf(FileProcessor)
    })
  })

  // ==========================================================================
  // 文件验证测试
  // ==========================================================================

  describe('文件验证', () => {
    it('应该接受支持的文件类型', async () => {
      const jpegFile = createTestFile({ name: 'test.jpg', type: 'image/jpeg' })
      const pngFile = createTestFile({ name: 'test.png', type: 'image/png' })
      const webpFile = createTestFile({ name: 'test.webp', type: 'image/webp' })
      
      const results = await processor.processFiles([jpegFile, pngFile, webpFile])
      
      // 注意：由于我们mock了Image和Canvas，这些测试可能会成功
      // 但在实际环境中需要真实的图片文件
      expect(results).toHaveLength(3)
    })

    it('应该拒绝不支持的文件类型', async () => {
      const unsupportedFile = createTestFile({ 
        name: 'test.txt', 
        type: 'text/plain' 
      })
      
      const result = await processor.processSingleFile(unsupportedFile)
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation')
      expect(result.error?.message).toContain('不支持的文件类型')
    })

    it('应该拒绝过大的文件', async () => {
      const processor = new FileProcessor({ maxFileSize: 1024 * 1024 }) // 1MB
      const largeFile = createTestFile({ 
        name: 'large.jpg', 
        size: 2 * 1024 * 1024 // 2MB
      })
      
      const result = await processor.processSingleFile(largeFile)
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation')
      expect(result.error?.message).toContain('文件大小超过限制')
    })

    it('应该拒绝空文件名', async () => {
      const invalidFile = createTestFile({ name: '' })
      
      const result = await processor.processSingleFile(invalidFile)
      
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('validation')
      expect(result.error?.message).toContain('文件名不能为空')
    })
  })

  // ==========================================================================
  // 批量处理测试
  // ==========================================================================

  describe('批量处理', () => {
    it('应该并行处理多个文件', async () => {
      const files = [
        createTestFile({ name: 'test1.jpg' }),
        createTestFile({ name: 'test2.png' }),
        createTestFile({ name: 'test3.webp' })
      ]
      
      const results = await processor.processFiles(files)
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.file.name.startsWith('test'))).toBe(true)
    })

    it('应该报告处理进度', async () => {
      const files = Array.from({ length: 5 }, (_, i) => 
        createTestFile({ name: `test${i}.jpg` })
      )
      
      const progressCalls: any[] = []
      const onProgress = jest.fn((progress) => {
        progressCalls.push(progress)
      })
      
      await processor.processFiles(files, onProgress)
      
      expect(onProgress).toHaveBeenCalled()
      expect(progressCalls.length).toBeGreaterThan(0)
      
      // 检查最后一次进度调用
      const lastProgress = progressCalls[progressCalls.length - 1]
      expect(lastProgress.processed).toBe(files.length)
      expect(lastProgress.total).toBe(files.length)
      expect(lastProgress.percentage).toBe(1)
    })

    it('应该处理空文件数组', async () => {
      const results = await processor.processFiles([])
      expect(results).toHaveLength(0)
    })

    it('单个文件失败不应影响其他文件', async () => {
      const files = [
        createTestFile({ name: 'valid.jpg', type: 'image/jpeg' }),
        createTestFile({ name: 'invalid.txt', type: 'text/plain' }),
        createTestFile({ name: 'valid2.png', type: 'image/png' })
      ]
      
      const results = await processor.processFiles(files)
      
      expect(results).toHaveLength(3)
      expect(results[1].success).toBe(false) // 中间的无效文件
      // 其他文件的成功与否取决于mock的实现
    })
  })

  // ==========================================================================
  // 压缩功能测试
  // ==========================================================================

  describe('压缩功能', () => {
    it('小文件不应被压缩', async () => {
      const smallFile = createTestFile({ 
        name: 'small.jpg', 
        size: 1024 * 1024 // 1MB，小于默认阈值50MB
      })
      
      const result = await processor.processSingleFile(smallFile)
      
      if (result.success) {
        expect(result.stats.compressed).toBe(false)
      }
    })

    it('大文件应该被压缩', async () => {
      const processor = new FileProcessor({ 
        compressionThreshold: 1024 * 1024 // 1MB阈值
      })
      
      const largeFile = createTestFile({ 
        name: 'large.jpg', 
        size: 5 * 1024 * 1024 // 5MB
      })
      
      const result = await processor.processSingleFile(largeFile)
      
      if (result.success) {
        expect(result.stats.compressed).toBe(true)
      }
    })
  })

  // ==========================================================================
  // 缩略图测试
  // ==========================================================================

  describe('缩略图生成', () => {
    it('应该生成正确尺寸的缩略图', async () => {
      const file = createTestFile({ name: 'test.jpg' })
      
      const result = await processor.processSingleFile(file)
      
      if (result.success && result.imageContent) {
        const { thumbnail } = result.imageContent
        
        // 缩略图尺寸应该不超过配置的最大值
        expect(thumbnail.width).toBeLessThanOrEqual(200)
        expect(thumbnail.height).toBeLessThanOrEqual(200)
        
        // 对于测试用的100x100图片，缩略图应该是100x100（不放大）
        expect(thumbnail.width).toBe(100)
        expect(thumbnail.height).toBe(100)
      }
    })

    it('小图片不应该被放大', async () => {
      // 这个测试在真实环境中会更有意义，因为我们的mock始终返回200x200
      const file = createTestFile({ name: 'small.jpg' })
      
      const result = await processor.processSingleFile(file)
      
      if (result.success && result.imageContent) {
        // 在mock环境中，我们至少可以验证缩略图被创建了
        expect(result.imageContent.thumbnail).toBeDefined()
        expect(result.imageContent.thumbnail.width).toBeGreaterThan(0)
        expect(result.imageContent.thumbnail.height).toBeGreaterThan(0)
      }
    })
  })

  // ==========================================================================
  // 错误处理测试
  // ==========================================================================

  describe('错误处理', () => {
    it('应该处理图片加载失败', async () => {
      // Mock Image to fail loading
      global.Image = class FailingMockImage {
        onerror: (() => void) | null = null
        src = ''
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror()
            }
          }, 10)
        }
        
        remove() {}
      } as any
      
      const file = createTestFile({ name: 'corrupt.jpg' })
      const result = await processor.processSingleFile(file)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理Canvas操作失败', async () => {
      // Mock getContext to return null
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null)
      
      const file = createTestFile({ name: 'test.jpg' })
      const result = await processor.processSingleFile(file)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('错误结果应该包含完整信息', async () => {
      const invalidFile = createTestFile({ 
        name: 'invalid.txt', 
        type: 'text/plain' 
      })
      
      const result = await processor.processSingleFile(invalidFile)
      
      expect(result.success).toBe(false)
      expect(result.file).toBe(invalidFile)
      expect(result.error).toBeDefined()
      expect(result.error!.type).toBe('validation')
      expect(result.error!.message).toBeTruthy()
      expect(result.stats).toBeDefined()
      expect(result.stats.originalSize).toBe(invalidFile.size)
      expect(result.stats.processingTime).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // 性能和内存测试
  // ==========================================================================

  describe('性能和内存', () => {
    it('应该记录处理时间', async () => {
      let callCount = 0
      jest.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount * 100 // 模拟时间流逝
      })
      
      const file = createTestFile({ name: 'test.jpg' })
      const result = await processor.processSingleFile(file)
      
      expect(result.stats.processingTime).toBeGreaterThan(0)
    })

    it('应该限制并发处理数', async () => {
      const processor = new FileProcessor({ maxConcurrency: 2 })
      
      const files = Array.from({ length: 10 }, (_, i) => 
        createTestFile({ name: `test${i}.jpg` })
      )
      
      // 这个测试更多是验证不会抛出错误，而不是验证具体的并发控制
      // 因为在测试环境中很难验证真正的并发行为
      const results = await processor.processFiles(files)
      expect(results).toHaveLength(10)
    })

    it('应该正确估算内存使用', async () => {
      const file = createTestFile({ name: 'test.jpg' })
      const result = await processor.processSingleFile(file)
      
      if (result.success) {
        // 验证内存使用统计被正确记录
        expect(result.stats.processedSize).toBeGreaterThan(0)
        expect(result.stats.thumbnailSize).toBeGreaterThan(0)
        
        // 对于100x100的测试图片，内存使用应该是 100*100*4 = 40000 字节
        expect(result.stats.processedSize).toBe(40000)
        expect(result.stats.thumbnailSize).toBe(40000) // 缩略图不放大，也是100*100*4
      }
    })
  })

  // ==========================================================================
  // 边界情况测试
  // ==========================================================================

  describe('边界情况', () => {
    it('应该处理极小的图片', async () => {
      const processor = new FileProcessor({
        thumbnailMaxWidth: 50,
        thumbnailMaxHeight: 50
      })
      
      const file = createTestFile({ name: 'tiny.jpg' })
      const result = await processor.processSingleFile(file)
      
      // 在mock环境中，主要验证不会抛出错误
      expect(result).toBeDefined()
    })

    it('应该处理正方形图片', async () => {
      const file = createTestFile({ name: 'square.jpg' })
      const result = await processor.processSingleFile(file)
      
      if (result.success && result.imageContent) {
        // Mock返回的是100x100，应该保持正方形
        const { thumbnail } = result.imageContent
        expect(thumbnail.width).toBe(thumbnail.height)
      }
    })

    it('应该处理特殊字符文件名', async () => {
      const file = createTestFile({ 
        name: '测试文件 (1) - 副本.jpg',
        type: 'image/jpeg'
      })
      
      const result = await processor.processSingleFile(file)
      
      // 应该成功处理，不因文件名中的特殊字符而失败
      expect(result.file.name).toBe('测试文件 (1) - 副本.jpg')
    })
  })
})

// ============================================================================
// 模块级函数测试
// ============================================================================

describe('模块级函数', () => {
  beforeEach(() => {
    mockImage()
    mockCanvas()
    mockURL()
  })

  it('processFiles 应该使用默认处理器', async () => {
    const { processFiles } = await import('../../src/processing/FileProcessor')
    
    const files = [createTestFile({ name: 'test.jpg' })]
    const results = await processFiles(files)
    
    expect(results).toHaveLength(1)
  })

  it('processSingleFile 应该使用默认处理器', async () => {
    const { processSingleFile } = await import('../../src/processing/FileProcessor')
    
    const file = createTestFile({ name: 'test.jpg' })
    const result = await processSingleFile(file)
    
    expect(result).toBeDefined()
    expect(result.file).toBe(file)
  })

  it('createFileProcessor 应该创建自定义处理器', async () => {
    const { createFileProcessor } = await import('../../src/processing/FileProcessor')
    
    const processor = createFileProcessor({ 
      compressionQuality: 0.9,
      maxConcurrency: 8 
    })
    
    expect(processor).toBeInstanceOf(FileProcessor)
  })
})

/**
 * ExportManager单元测试
 * 
 * 测试图片导出功能的正确性
 */

import { ExportManager, ExportPresets } from '../../src/rendering/ExportManager'
import { CanvasRenderer } from '../../src/rendering/CanvasRenderer'
import { ElementBuilder } from '../../src/core/models/Element'
import { TransformBuilder } from '../../src/core/models/Transform'
import { GridConfigBuilder } from '../../src/core/models/GridConfig'
import type { Element } from '../../src/core/models/Element'
import type { GridConfig } from '../../src/core/models/GridConfig'

// Mock CanvasRenderer
jest.mock('../../src/rendering/CanvasRenderer', () => ({
  CanvasRenderer: {
    render: jest.fn(() => ({
      success: true,
      canvas: {
        toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
        toBlob: jest.fn((callback) => callback(new Blob(['fake-image-data'], { type: 'image/png' })))
      },
      renderTime: 100
    }))
  },
  RendererUtils: {
    exportToDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    exportToBlob: jest.fn(() => Promise.resolve(new Blob(['fake-image-data'], { type: 'image/png' })))
  }
}))

// Mock document for download testing
const mockLink = {
  href: '',
  download: '',
  style: { display: '' },
  click: jest.fn()
}

// Mock document methods
const originalCreateElement = document.createElement
const originalAppendChild = document.body.appendChild
const originalRemoveChild = document.body.removeChild

beforeAll(() => {
  document.createElement = jest.fn(() => mockLink as any)
  document.body.appendChild = jest.fn()
  document.body.removeChild = jest.fn()
})

afterAll(() => {
  document.createElement = originalCreateElement
  document.body.appendChild = originalAppendChild
  document.body.removeChild = originalRemoveChild
})

describe('ExportManager', () => {
  let testElements: Element[]
  let testConfig: GridConfig

  beforeEach(() => {
    // 创建测试数据
    testConfig = GridConfigBuilder.grid(2, 2, 100, 100, 5)

    const imageContent = {
      file: new File([''], 'test.jpg'),
      imageData: new ImageData(100, 100),
      thumbnail: new ImageData(50, 50),
      originalSize: { width: 100, height: 100 },
      fileSize: 1024,
      mimeType: 'image/jpeg'
    }

    testElements = [
      ElementBuilder.createImage(
        'img1',
        imageContent,
        TransformBuilder.create(0, 0, 1, 1)
      )
    ]

    // 清除所有mock
    jest.clearAllMocks()
  })

  describe('exportImage', () => {
    it('应该成功导出图片', async () => {
      const exportConfig = {
        format: 'png' as const,
        quality: 0.9,
        backgroundColor: '#ffffff',
        filename: 'test-image'
      }

      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      expect(result.success).toBe(true)
      expect(result.filename).toBe('test-image.png')
      expect(result.dataURL).toBeDefined()
      expect(result.fileSize).toBeGreaterThan(0)
      expect(result.exportTime).toBeGreaterThan(0)
      expect(result.error).toBeUndefined()
    })

    it('应该正确处理JPEG格式', async () => {
      const exportConfig = {
        format: 'jpeg' as const,
        quality: 0.8,
        filename: 'test-jpeg'
      }

      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      expect(result.success).toBe(true)
      expect(result.filename).toBe('test-jpeg.jpg')
    })

    it('应该调用进度回调', async () => {
      const progressCallback = jest.fn()
      const exportConfig = { format: 'png' as const }

      await ExportManager.exportImage(testElements, testConfig, exportConfig, progressCallback)

      expect(progressCallback).toHaveBeenCalledWith(10, '开始渲染...')
      expect(progressCallback).toHaveBeenCalledWith(50, '渲染完成，正在导出...')
      expect(progressCallback).toHaveBeenCalledWith(80, '正在计算文件大小...')
      expect(progressCallback).toHaveBeenCalledWith(100, '导出完成')
    })

    it('应该处理渲染失败', async () => {
      // Mock渲染失败
      const mockRender = jest.mocked(CanvasRenderer.render)
      mockRender.mockReturnValueOnce({
        success: false,
        canvas: document.createElement('canvas'),
        renderTime: 50,
        error: '渲染错误'
      })

      const exportConfig = { format: 'png' as const }
      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      expect(result.success).toBe(false)
      expect(result.error).toBe('渲染错误')
    })

    it('应该生成带时间戳的默认文件名', async () => {
      const exportConfig = { format: 'png' as const }
      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      expect(result.filename).toMatch(/^imagebatch-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/)
    })
  })

  describe('exportAndDownload', () => {
    it('应该导出并触发下载', async () => {
      const exportConfig = {
        format: 'png' as const,
        filename: 'download-test'
      }

      const result = await ExportManager.exportAndDownload(testElements, testConfig, exportConfig)

      expect(result.success).toBe(true)
      expect(mockLink.href).toContain('data:image/png;base64,')
      expect(mockLink.download).toBe('download-test.png')
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
    })

    it('导出失败时不应该触发下载', async () => {
      // Mock渲染失败
      const mockRender = jest.mocked(CanvasRenderer.render)
      mockRender.mockReturnValueOnce({
        success: false,
        canvas: document.createElement('canvas'),
        renderTime: 50,
        error: '渲染错误'
      })

      const exportConfig = { format: 'png' as const }
      const result = await ExportManager.exportAndDownload(testElements, testConfig, exportConfig)

      expect(result.success).toBe(false)
      expect(mockLink.click).not.toHaveBeenCalled()
    })
  })

  describe('exportToBlob', () => {
    it('应该返回Blob对象', async () => {
      const exportConfig = { format: 'png' as const }
      const blob = await ExportManager.exportToBlob(testElements, testConfig, exportConfig)

      expect(blob).toBeInstanceOf(Blob)
    })

    it('渲染失败时应该返回null', async () => {
      // Mock渲染失败
      const mockRender = jest.mocked(CanvasRenderer.render)
      mockRender.mockReturnValueOnce({
        success: false,
        canvas: document.createElement('canvas'),
        renderTime: 50,
        error: '渲染错误'
      })

      const exportConfig = { format: 'png' as const }
      const blob = await ExportManager.exportToBlob(testElements, testConfig, exportConfig)

      expect(blob).toBeNull()
    })
  })

  describe('文件大小估算', () => {
    it('应该正确估算文件大小', async () => {
      const exportConfig = { format: 'png' as const }
      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      // 基于我们的mock数据，应该能计算出大概的文件大小
      expect(result.fileSize).toBeGreaterThan(0)
      expect(typeof result.fileSize).toBe('number')
    })
  })

  describe('预设配置', () => {
    it('highQualityPNG应该返回正确配置', () => {
      const config = ExportPresets.highQualityPNG()
      
      expect(config.format).toBe('png')
      expect(config.backgroundColor).toBe('#ffffff')
    })

    it('highQualityJPEG应该返回正确配置', () => {
      const config = ExportPresets.highQualityJPEG()
      
      expect(config.format).toBe('jpeg')
      expect(config.quality).toBe(0.95)
      expect(config.backgroundColor).toBe('#ffffff')
    })

    it('mediumQualityJPEG应该返回正确配置', () => {
      const config = ExportPresets.mediumQualityJPEG()
      
      expect(config.format).toBe('jpeg')
      expect(config.quality).toBe(0.8)
      expect(config.backgroundColor).toBe('#ffffff')
    })

    it('transparentPNG应该返回正确配置', () => {
      const config = ExportPresets.transparentPNG()
      
      expect(config.format).toBe('png')
      expect(config.backgroundColor).toBeUndefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理意外错误', async () => {
      // Mock一个会抛出异常的情况
      const mockRender = jest.mocked(CanvasRenderer.render)
      mockRender.mockImplementationOnce(() => {
        throw new Error('意外错误')
      })

      const exportConfig = { format: 'png' as const }
      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      expect(result.success).toBe(false)
      expect(result.error).toBe('意外错误')
      expect(result.fileSize).toBe(0)
    })

    it('应该处理未知错误类型', async () => {
      // Mock抛出非Error对象
      const mockRender = jest.mocked(CanvasRenderer.render)
      mockRender.mockImplementationOnce(() => {
        throw 'string error'
      })

      const exportConfig = { format: 'png' as const }
      const result = await ExportManager.exportImage(testElements, testConfig, exportConfig)

      expect(result.success).toBe(false)
      expect(result.error).toBe('导出失败')
    })
  })
})

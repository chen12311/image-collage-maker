/**
 * CanvasRenderer单元测试
 * 
 * 测试核心渲染功能的正确性
 */

import { CanvasRenderer, RendererUtils } from '../../src/rendering/CanvasRenderer'
import { ElementBuilder, ElementPresets } from '../../src/core/models/Element'
import { TransformBuilder } from '../../src/core/models/Transform'
import { GridConfigBuilder } from '../../src/core/models/GridConfig'
import type { Element } from '../../src/core/models/Element'
import type { GridConfig } from '../../src/core/models/GridConfig'

// Mock Canvas API for testing
const mockCtx = {
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
  clearRect: jest.fn(),
  fillStyle: '',
  fillRect: jest.fn(),
  globalAlpha: 1,
  translate: jest.fn(),
  rotate: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  drawImage: jest.fn(),
  putImageData: jest.fn(),
  font: '',
  textAlign: 'left',
  textBaseline: 'top',
  fillText: jest.fn(),
  strokeStyle: '',
  lineWidth: 0,
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0
}

const mockCanvas = {
  width: 0,
  height: 0,
  style: {},
  getContext: jest.fn(() => mockCtx),
  toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
  toBlob: jest.fn((callback) => callback(new Blob()))
}

// Mock document.createElement
const originalCreateElement = document.createElement
beforeAll(() => {
  document.createElement = jest.fn(() => mockCanvas as any)
})

afterAll(() => {
  document.createElement = originalCreateElement
})

describe('CanvasRenderer', () => {
  let testElements: Element[]
  let testConfig: GridConfig

  beforeEach(() => {
    // 创建测试用的网格配置
    testConfig = GridConfigBuilder.grid(2, 3, 100, 100, 10)

    // 创建测试元素
    const imageContent = {
      file: new File([''], 'test.jpg'),
      imageData: new ImageData(100, 100),
      thumbnail: new ImageData(50, 50),
      originalSize: { width: 100, height: 100 },
      fileSize: 1024,
      mimeType: 'image/jpeg'
    }

    const textContent = ElementPresets.titleText('测试文字')

    testElements = [
      ElementBuilder.createImage(
        'img1',
        imageContent,
        TransformBuilder.create(0, 0, 1, 1),
        undefined,
        { name: '测试图片' }
      ),
      ElementBuilder.createText(
        'text1',
        textContent,
        TransformBuilder.create(1, 0, 1, 1),
        ElementPresets.defaultTextStyle(),
        { name: '测试文字' }
      )
    ]

    // 重置mock
    jest.clearAllMocks()
    // 重置mockCanvas状态
    mockCanvas.width = 0
    mockCanvas.height = 0
    mockCanvas.style = {}
    // 重置mockCtx状态
    mockCtx.globalAlpha = 1
    mockCtx.fillStyle = ''
    mockCtx.strokeStyle = ''
    mockCtx.lineWidth = 0
    mockCtx.shadowColor = ''
    mockCtx.shadowBlur = 0
    mockCtx.shadowOffsetX = 0
    mockCtx.shadowOffsetY = 0
  })

  describe('render', () => {
    it('应该成功渲染元素数组', () => {
      const result = CanvasRenderer.render(testElements, testConfig, {
        mode: 'preview'
      })

      expect(result.success).toBe(true)
      expect(result.canvas).toBeDefined()
      expect(result.renderTime).toBeGreaterThan(0)
      expect(result.error).toBeUndefined()
    })

    it('应该按Z轴顺序渲染元素', () => {
      // 设置不同的Z轴顺序
      const elementsWithZIndex = [
        {
          ...testElements[0],
          transform: { ...testElements[0].transform, zIndex: 10 }
        },
        {
          ...testElements[1],
          transform: { ...testElements[1].transform, zIndex: 5 }
        }
      ]

      const result = CanvasRenderer.render(elementsWithZIndex, testConfig)

      expect(result.success).toBe(true)
    })

    it('应该跳过不可见元素', () => {
      const invisibleElements = testElements.map(element => ({
        ...element,
        style: { ...element.style, visible: false }
      }))

      const result = CanvasRenderer.render(invisibleElements, testConfig)

      expect(result.success).toBe(true)
    })

    it('应该处理渲染错误', () => {
      // 保存原始的getContext方法
      const originalGetContext = mockCanvas.getContext
      
      // 模拟getContext返回null的情况
      mockCanvas.getContext = jest.fn(() => null)

      const result = CanvasRenderer.render(testElements, testConfig)

      expect(result.success).toBe(false)
      expect(result.error).toBe('无法获取Canvas渲染上下文')
      
      // 恢复原始的getContext方法
      mockCanvas.getContext = originalGetContext
    })
  })

  describe('RendererUtils', () => {
    it('renderPreview应该使用预览模式', () => {
      const spy = jest.spyOn(CanvasRenderer, 'render')
      
      RendererUtils.renderPreview(testElements, testConfig)

      expect(spy).toHaveBeenCalledWith(testElements, testConfig, {
        mode: 'preview',
        antiAlias: false,
        backgroundColor: '#ffffff'
      })
    })

    it('renderExport应该使用导出模式', () => {
      const spy = jest.spyOn(CanvasRenderer, 'render')
      
      RendererUtils.renderExport(testElements, testConfig, '#ff0000')

      expect(spy).toHaveBeenCalledWith(testElements, testConfig, {
        mode: 'export',
        antiAlias: true,
        quality: 0.95,
        backgroundColor: '#ff0000'
      })
    })

    it('exportToDataURL应该调用Canvas.toDataURL', () => {
      const result = RendererUtils.exportToDataURL(mockCanvas as any, 'png', 0.9)

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.9)
      expect(result).toBe('data:image/png;base64,mock')
    })

    it('exportToBlob应该调用Canvas.toBlob', async () => {
      const promise = RendererUtils.exportToBlob(mockCanvas as any, 'jpeg', 0.8)

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.8
      )

      const blob = await promise
      expect(blob).toBeInstanceOf(Blob)
    })
  })

  describe('不同元素类型渲染', () => {
    it('应该能渲染图片元素', () => {
      const imageElement = testElements.find(e => e.type === 'image')!
      const result = CanvasRenderer.render([imageElement], testConfig)
      expect(result.success).toBe(true)
    })

    it('应该能渲染文字元素', () => {
      const textElement = testElements.find(e => e.type === 'text')!
      const result = CanvasRenderer.render([textElement], testConfig)
      expect(result.success).toBe(true)
    })

    it('应该能渲染旋转元素', () => {
      const rotatedElement = {
        ...testElements[0],
        transform: { ...testElements[0].transform, rotation: Math.PI / 2 }
      }
      const result = CanvasRenderer.render([rotatedElement], testConfig)
      expect(result.success).toBe(true)
    })

    it('应该能渲染带样式的元素', () => {
      const styledElement = {
        ...testElements[0],
        style: {
          ...testElements[0].style,
          opacity: 0.5,
          borderWidth: 2,
          borderColor: '#ff0000',
          shadow: {
            enabled: true,
            offsetX: 2,
            offsetY: 2,
            blur: 4,
            color: 'rgba(0,0,0,0.5)'
          }
        }
      }
      const result = CanvasRenderer.render([styledElement], testConfig)
      expect(result.success).toBe(true)
    })
  })
})

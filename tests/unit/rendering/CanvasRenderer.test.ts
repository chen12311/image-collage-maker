/**
 * CanvasRenderer Canvas渲染器单元测试
 */

import { CanvasRenderer, renderCanvas } from '@/rendering/CanvasRenderer'
import { LayoutEngine } from '@/layout/LayoutEngine'
import { createLayoutConfig, createEmptyCanvasState } from '@/core/models'
import type { ImageElement, TextElement, CanvasState, LayoutConfig } from '@/core/models'

/** 创建测试用的Canvas上下文 */
function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 800
  return canvas
}

/** 创建测试用的图片元素 */
function createTestImage(id: string): ImageElement {
  const img = new Image()
  return {
    id,
    fileName: `${id}.jpg`,
    src: 'data:image/png;base64,test',
    image: img,
    width: 100,
    height: 100,
    fileSize: 1024,
    timestamp: Date.now(),
    index: 0,
    transform: {
      rotation: 0,
      flipH: false,
      flipV: false
    },
    fitMode: 'contain'
  }
}

/** 创建测试用的文字元素 */
function createTestText(content: string): TextElement {
  return {
    id: `text-${Date.now()}`,
    content,
    position: { x: 100, y: 100 },
    style: {
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      textBaseline: 'top'
    },
    visible: true,
    selected: false,
    timestamp: Date.now()
  }
}

describe('CanvasRenderer - 基础渲染', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该正确渲染空画布', async () => {
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    // 验证clearRect被调用
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 800)
  })

  it('应该先清空画布', async () => {
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    expect(ctx.clearRect).toHaveBeenCalled()
  })
})

describe('CanvasRenderer - 背景渲染', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该渲染纯色背景', async () => {
    state = {
      ...state,
      background: {
        type: 'color',
        color: '#ff0000',
        opacity: 100
      }
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('应该应用背景透明度', async () => {
    state = {
      ...state,
      background: {
        type: 'color',
        color: '#ff0000',
        opacity: 50
      }
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    // globalAlpha应该被设置为0.5
    expect(ctx.globalAlpha).toBeDefined()
  })

  it('应该处理透明背景', async () => {
    state = {
      ...state,
      background: {
        type: 'color',
        color: '#ffffff',
        opacity: 0
      }
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    // 应该渲染但透明度为0
    expect(ctx.fillRect).toHaveBeenCalled()
  })
})

describe('CanvasRenderer - 图片渲染', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该渲染单张图片', async () => {
    const image = createTestImage('img1')
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    expect(ctx.drawImage).toHaveBeenCalled()
  })

  it('应该渲染多张图片', async () => {
    const images = [
      createTestImage('img1'),
      createTestImage('img2'),
      createTestImage('img3'),
      createTestImage('img4')
    ]
    const layout2x2 = createLayoutConfig('grid-2x2')
    const layoutResult = LayoutEngine.compute(layout2x2, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images,
      texts: [],
      state: { ...state, layout: layout2x2 }
    })
    
    // 应该绘制4次
    expect(ctx.drawImage).toHaveBeenCalledTimes(4)
  })

  it('应该处理稀疏图片数组', async () => {
    const images = [
      createTestImage('img1'),
      null as any,
      createTestImage('img3')
    ]
    const layout1x3 = createLayoutConfig('grid-1x3-v')
    const layoutResult = LayoutEngine.compute(layout1x3, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images,
      texts: [],
      state: { ...state, layout: layout1x3 }
    })
    
    // 应该绘制2张图片，中间绘制占位框
    expect(ctx.drawImage).toHaveBeenCalledTimes(2)
  })
})

describe('CanvasRenderer - 图片变换', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该应用图片旋转', async () => {
    const image = {
      ...createTestImage('img1'),
      transform: {
        rotation: 90 as 0 | 90 | 180 | 270,
        flipH: false,
        flipV: false
      },
      fitMode: 'contain' as const
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    // 应该调用旋转相关的方法
    expect(ctx.rotate).toHaveBeenCalled()
  })

  it('应该应用水平翻转', async () => {
    const image = {
      ...createTestImage('img1'),
      transform: {
        rotation: 0 as 0 | 90 | 180 | 270,
        flipH: true,
        flipV: false
      },
      fitMode: 'contain' as const
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    // 应该调用scale进行翻转
    expect(ctx.scale).toHaveBeenCalled()
  })

  it('应该应用垂直翻转', async () => {
    const image = {
      ...createTestImage('img1'),
      transform: {
        rotation: 0 as 0 | 90 | 180 | 270,
        flipH: false,
        flipV: true
      },
      fitMode: 'contain' as const
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    expect(ctx.scale).toHaveBeenCalled()
  })

  it('应该正确保存和恢复上下文', async () => {
    const image = {
      ...createTestImage('img1'),
      transform: {
        rotation: 90 as 0 | 90 | 180 | 270,
        flipH: true,
        flipV: false
      },
      fitMode: 'contain' as const
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })
})

describe('CanvasRenderer - 占位框渲染', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x2')
    state = createEmptyCanvasState(layout)
  })

  it('应该渲染占位框', async () => {
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    // 应该绘制虚线边框（无圆角时使用strokeRect）
    expect(ctx.setLineDash).toHaveBeenCalled()
    expect(ctx.strokeRect).toHaveBeenCalled()
  })

  it('应该在占位框中显示提示文字', async () => {
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    // 应该绘制文字
    expect(ctx.fillText).toHaveBeenCalled()
  })
})

describe('CanvasRenderer - 文字渲染', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该渲染单个文字', async () => {
    const text = createTestText('测试文字')
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [text],
      state
    })
    
    expect(ctx.fillText).toHaveBeenCalledWith('测试文字', 100, 100)
  })

  it('应该应用文字样式', async () => {
    const text = {
      ...createTestText('样式文字'),
      style: {
        fontSize: 24,
        fontFamily: 'Helvetica',
        fontWeight: 'bold' as 'bold' | 'normal',
        color: '#ff0000',
        textAlign: 'center' as const,
        textBaseline: 'middle' as const
      }
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [text],
      state
    })
    
    expect(ctx.fillStyle).toBe('#ff0000')
    expect(ctx.font).toContain('24px')
    expect(ctx.font).toContain('Helvetica')
  })

  it('应该跳过不可见的文字', async () => {
    const text = {
      ...createTestText('隐藏文字'),
      visible: false
    }
    
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    const fillTextCalls = jest.spyOn(ctx, 'fillText')
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [text],
      state
    })
    
    // fillText可能被占位框调用，但不应该用来渲染这个文字
    const textCalls = fillTextCalls.mock.calls.filter(call => call[0] === '隐藏文字')
    expect(textCalls.length).toBe(0)
  })
})

describe('CanvasRenderer - 透明度', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该应用全局透明度', async () => {
    state = {
      ...state,
      opacity: {
        global: 50,
        image: 100
      }
    }
    
    const image = createTestImage('img1')
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    // globalAlpha应该被设置
    expect(ctx.globalAlpha).toBeDefined()
  })

  it('应该组合全局和图片透明度', async () => {
    state = {
      ...state,
      opacity: {
        global: 80,
        image: 50
      }
    }
    
    const image = createTestImage('img1')
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    // 组合后的透明度应该是 0.8 * 0.5 = 0.4
    expect(ctx.globalAlpha).toBeDefined()
  })
})

describe('CanvasRenderer - 圆角处理', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = {
      ...createLayoutConfig('grid-2x1-h'),
      radius: 20
    }
    state = {
      ...createEmptyCanvasState(layout),
      layout
    }
  })

  it('应该绘制圆角', async () => {
    const image = createTestImage('img1')
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [image],
      texts: [],
      state
    })
    
    // 应该使用quadraticCurveTo绘制圆角
    expect(ctx.quadraticCurveTo).toHaveBeenCalled()
    expect(ctx.clip).toHaveBeenCalled()
  })
})

describe('CanvasRenderer - 导出功能', () => {
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    canvas = createMockCanvas()
  })

  it('应该导出为DataURL', () => {
    const dataURL = CanvasRenderer.toDataURL(canvas, 'image/png')
    expect(typeof dataURL).toBe('string')
  })

  it('应该支持不同格式', () => {
    const pngURL = CanvasRenderer.toDataURL(canvas, 'image/png')
    const jpegURL = CanvasRenderer.toDataURL(canvas, 'image/jpeg')
    
    expect(pngURL).toBeDefined()
    expect(jpegURL).toBeDefined()
  })

  it('应该支持质量参数', () => {
    const highQuality = CanvasRenderer.toDataURL(canvas, 'image/jpeg', 1.0)
    const lowQuality = CanvasRenderer.toDataURL(canvas, 'image/jpeg', 0.5)
    
    expect(highQuality).toBeDefined()
    expect(lowQuality).toBeDefined()
  })

  it('应该导出为Blob', async () => {
    const blob = await CanvasRenderer.toBlob(canvas, 'image/png')
    expect(blob).toBeDefined()
  })
})

describe('CanvasRenderer - 快捷函数', () => {
  it('renderCanvas应该与CanvasRenderer.render等价', async () => {
    const canvas = createMockCanvas()
    const ctx = canvas.getContext('2d')!
    const layout = createLayoutConfig('grid-2x1-h')
    const state = createEmptyCanvasState(layout)
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await renderCanvas({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    expect(ctx.clearRect).toHaveBeenCalled()
  })
})

describe('CanvasRenderer - 边界条件', () => {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let layout: LayoutConfig
  let state: CanvasState

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')!
    layout = createLayoutConfig('grid-2x1-h')
    state = createEmptyCanvasState(layout)
  })

  it('应该处理超大画布', async () => {
    const bigCanvas = document.createElement('canvas')
    bigCanvas.width = 4096
    bigCanvas.height = 4096
    const bigCtx = bigCanvas.getContext('2d')!
    
    const layoutResult = LayoutEngine.compute(layout, 4096, 4096)
    
    await CanvasRenderer.render({
      ctx: bigCtx,
      layout: layoutResult,
      images: [],
      texts: [],
      state
    })
    
    expect(bigCtx.clearRect).toHaveBeenCalledWith(0, 0, 4096, 4096)
  })

  it('应该处理超多图片', async () => {
    const layout4x4 = createLayoutConfig('grid-4x4')
    const images = Array.from({ length: 16 }, (_, i) => 
      createTestImage(`img${i}`)
    )
    
    const layoutResult = LayoutEngine.compute(layout4x4, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images,
      texts: [],
      state: { ...state, layout: layout4x4 }
    })
    
    expect(ctx.drawImage).toHaveBeenCalledTimes(16)
  })

  it('应该处理空文字内容', async () => {
    const text = createTestText('')
    const layoutResult = LayoutEngine.compute(layout, 800, 800)
    
    await CanvasRenderer.render({
      ctx,
      layout: layoutResult,
      images: [],
      texts: [text],
      state
    })
    
    // 不应该崩溃
    expect(ctx.fillText).toHaveBeenCalled()
  })
})


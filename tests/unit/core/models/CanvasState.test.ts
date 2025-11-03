/**
 * CanvasState 画布状态模型单元测试
 * 
 * 测试状态创建、克隆和比较函数
 */

import {
  createEmptyCanvasState,
  cloneCanvasState,
  isStateEqual,
  DEFAULT_CANVAS_SIZE,
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_OPACITY_CONFIG
} from '@/core/models/CanvasState'
import { createLayoutConfig } from '@/core/models/LayoutConfig'
import type { CanvasState } from '@/core/models/CanvasState'
import type { ImageElement, TextElement } from '@/core/models'

/** 创建测试用的ImageElement */
function createTestImageElement(id: string): ImageElement {
  const img = new Image()
  return {
    id,
    src: `data:image/png;base64,${id}`,
    image: img,
    width: 100,
    height: 100,
    fileName: `${id}.jpg`,
    fileSize: 1024,
    timestamp: Date.now(),
    index: 0,
    transform: {
      flipH: false,
      flipV: false,
      rotation: 0
    }
  }
}

/** 创建测试用的TextElement */
function createTestTextElement(id: string, content: string): TextElement {
  return {
    id,
    content,
    position: { x: 100, y: 200 },
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
      textBaseline: 'middle'
    },
    visible: true,
    selected: false,
    timestamp: Date.now()
  }
}

describe('CanvasState - DEFAULT 常量', () => {
  it('DEFAULT_CANVAS_SIZE 应该有正确的默认值', () => {
    expect(DEFAULT_CANVAS_SIZE).toEqual({
      width: 800,
      height: 800
    })
  })

  it('DEFAULT_BACKGROUND_CONFIG 应该有正确的默认值', () => {
    expect(DEFAULT_BACKGROUND_CONFIG).toEqual({
      type: 'color',
      color: '#ffffff',
      opacity: 0,
      image: undefined
    })
  })

  it('DEFAULT_OPACITY_CONFIG 应该有正确的默认值', () => {
    expect(DEFAULT_OPACITY_CONFIG).toEqual({
      global: 100,
      image: 100
    })
  })

  it('默认背景应该是透明的（显示棋盘格）', () => {
    expect(DEFAULT_BACKGROUND_CONFIG.opacity).toBe(0)
    expect(DEFAULT_BACKGROUND_CONFIG.type).toBe('color')
  })
})

describe('CanvasState - createEmptyCanvasState()', () => {
  it('应该创建空白画布状态', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    
    const state = createEmptyCanvasState(layout)
    
    expect(state).toBeDefined()
    expect(state.layout).toBe(layout)
    expect(state.images).toEqual([])
    expect(state.texts).toEqual([])
  })

  it('应该使用默认画布尺寸', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    
    const state = createEmptyCanvasState(layout)
    
    expect(state.canvasSize).toEqual(DEFAULT_CANVAS_SIZE)
    expect(state.canvasSize.width).toBe(800)
    expect(state.canvasSize.height).toBe(800)
  })

  it('应该使用默认背景配置', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    
    const state = createEmptyCanvasState(layout)
    
    expect(state.background).toEqual(DEFAULT_BACKGROUND_CONFIG)
  })

  it('应该使用默认透明度配置', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    
    const state = createEmptyCanvasState(layout)
    
    expect(state.opacity).toEqual(DEFAULT_OPACITY_CONFIG)
  })

  it('应该生成时间戳', () => {
    const before = Date.now()
    const layout = createLayoutConfig('grid-2x1-h')
    
    const state = createEmptyCanvasState(layout)
    const after = Date.now()
    
    expect(state.timestamp).toBeGreaterThanOrEqual(before)
    expect(state.timestamp).toBeLessThanOrEqual(after)
  })

  it('应该包含传入的layout配置', () => {
    const layout = createLayoutConfig('grid-3x3', 20, 10, 8)
    
    const state = createEmptyCanvasState(layout)
    
    expect(state.layout).toBe(layout)
    expect(state.layout.type).toBe('grid-3x3')
    expect(state.layout.spacing).toBe(20)
    expect(state.layout.padding).toBe(10)
    expect(state.layout.radius).toBe(8)
  })
})

describe('CanvasState - cloneCanvasState()', () => {
  it('应该深拷贝画布状态', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const originalState = createEmptyCanvasState(layout)
    
    const clonedState = cloneCanvasState(originalState)
    
    expect(clonedState).not.toBe(originalState)
    expect(clonedState).toEqual({
      ...originalState,
      timestamp: clonedState.timestamp // timestamp会变化
    })
  })

  it('应该深拷贝layout对象', () => {
    const layout = createLayoutConfig('grid-2x1-h', 15, 5, 4)
    const state = createEmptyCanvasState(layout)
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.layout).not.toBe(state.layout)
    expect(cloned.layout).toEqual(state.layout)
  })

  it('应该深拷贝images数组', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1'), createTestImageElement('img-2')]
    }
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.images).not.toBe(state.images)
    expect(cloned.images).toEqual(state.images)
  })

  it('应该深拷贝texts数组和嵌套对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state: CanvasState = {
      ...createEmptyCanvasState(layout),
      texts: [createTestTextElement('text-1', 'Hello')]
    }
    
    const cloned = cloneCanvasState(state)
    
    // 数组本身是新的
    expect(cloned.texts).not.toBe(state.texts)
    
    // texts内部对象是新的
    expect(cloned.texts[0]).not.toBe(state.texts[0])
    expect(cloned.texts[0].position).not.toBe(state.texts[0].position)
    expect(cloned.texts[0].style).not.toBe(state.texts[0].style)
    
    // 但值相同
    expect(cloned.texts[0]).toEqual(state.texts[0])
  })

  it('应该深拷贝canvasSize对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state = createEmptyCanvasState(layout)
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.canvasSize).not.toBe(state.canvasSize)
    expect(cloned.canvasSize).toEqual(state.canvasSize)
  })

  it('应该深拷贝background对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state = createEmptyCanvasState(layout)
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.background).not.toBe(state.background)
    expect(cloned.background).toEqual(state.background)
  })

  it('应该深拷贝opacity对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state = createEmptyCanvasState(layout)
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.opacity).not.toBe(state.opacity)
    expect(cloned.opacity).toEqual(state.opacity)
  })

  it('应该生成新的时间戳', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state = createEmptyCanvasState(layout)
    
    // 等待一点时间确保时间戳不同
    const originalTimestamp = state.timestamp
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.timestamp).toBeGreaterThanOrEqual(originalTimestamp)
  })

  it('修改克隆体不应影响原对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state: CanvasState = {
      ...createEmptyCanvasState(layout),
      texts: [createTestTextElement('text-1', 'Original')]
    }
    
    const cloned = cloneCanvasState(state)
    
    // 修改克隆体的text
    cloned.texts[0].content = 'Modified'
    cloned.texts[0].position.x = 999
    cloned.texts[0].style.fontSize = 100
    
    // 原对象不应改变
    expect(state.texts[0].content).toBe('Original')
    expect(state.texts[0].position.x).toBe(100)
    expect(state.texts[0].style.fontSize).toBe(24)
  })

  it('应该深度克隆图片的 transform 对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1')]
    }
    
    const cloned = cloneCanvasState(state)
    
    // transform 对象应该是新的
    expect(cloned.images[0]).not.toBe(state.images[0])
    expect(cloned.images[0].transform).not.toBe(state.images[0].transform)
    
    // 修改克隆体的 transform
    cloned.images[0].transform.flipH = true
    cloned.images[0].transform.flipV = true
    cloned.images[0].transform.rotation = 90
    
    // 原对象的 transform 不应改变
    expect(state.images[0].transform.flipH).toBe(false)
    expect(state.images[0].transform.flipV).toBe(false)
    expect(state.images[0].transform.rotation).toBe(0)
  })

  it('应该深度克隆背景图片的 effects 对象', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state: CanvasState = {
      ...createEmptyCanvasState(layout),
      background: {
        type: 'image',
        color: '#ffffff',
        opacity: 100,
        image: {
          url: 'data:image/png;base64,test',
          effects: {
            opacity: 80,
            blur: 5,
            brightness: 110,
            contrast: 120
          }
        }
      }
    }
    
    const cloned = cloneCanvasState(state)
    
    // background.image 和 effects 应该是新对象
    expect(cloned.background).not.toBe(state.background)
    expect(cloned.background.image).not.toBe(state.background.image)
    expect(cloned.background.image?.effects).not.toBe(state.background.image?.effects)
    
    // 修改克隆体的 effects
    cloned.background.image!.effects.opacity = 50
    cloned.background.image!.effects.blur = 10
    
    // 原对象的 effects 不应改变
    expect(state.background.image?.effects.opacity).toBe(80)
    expect(state.background.image?.effects.blur).toBe(5)
  })

  it('应该正确处理没有背景图片的情况', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state = createEmptyCanvasState(layout)
    
    const cloned = cloneCanvasState(state)
    
    expect(cloned.background.image).toBeUndefined()
    expect(state.background.image).toBeUndefined()
  })
})

describe('CanvasState - isStateEqual()', () => {
  it('相同的状态应该返回true', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1 = createEmptyCanvasState(layout)
    const state2 = createEmptyCanvasState(layout)
    
    expect(isStateEqual(state1, state2)).toBe(true)
  })

  it('不同的layout应该返回false', () => {
    const layout1 = createLayoutConfig('grid-2x1-h')
    const layout2 = createLayoutConfig('grid-3x3')
    const state1 = createEmptyCanvasState(layout1)
    const state2 = createEmptyCanvasState(layout2)
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('不同的images应该返回false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1')]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-2')]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('images中包含null时应该正确过滤', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const img1 = createTestImageElement('img-1')
    
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1, null as any, img1]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1, img1]
    }
    
    // 过滤null后的id数组应该相同
    expect(isStateEqual(state1, state2)).toBe(true)
  })

  it('不同的texts应该返回false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      texts: [createTestTextElement('text-1', 'Hello')]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      texts: [createTestTextElement('text-1', 'World')]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('不同的canvasSize应该返回false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1 = createEmptyCanvasState(layout)
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      canvasSize: { width: 1920, height: 1080 }
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('不同的background应该返回false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1 = createEmptyCanvasState(layout)
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      background: {
        type: 'color',
        color: '#000000',
        opacity: 100,
        image: undefined
      }
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('不同的opacity应该返回false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1 = createEmptyCanvasState(layout)
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      opacity: { global: 50, image: 80 }
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('timestamp不同不应影响相等性判断', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1 = createEmptyCanvasState(layout)
    const state2: CanvasState = {
      ...state1,
      timestamp: state1.timestamp + 1000
    }
    
    // timestamp不在比较范围内
    expect(isStateEqual(state1, state2)).toBe(true)
  })

  it('应该正确比较复杂状态', () => {
    const layout = createLayoutConfig('grid-3x3')
    const baseState: CanvasState = {
      layout,
      images: [createTestImageElement('img-1'), createTestImageElement('img-2')],
      texts: [createTestTextElement('text-1', 'Title')],
      canvasSize: { width: 1200, height: 1200 },
      background: {
        type: 'color',
        color: '#f0f0f0',
        opacity: 50,
        image: undefined
      },
      opacity: { global: 90, image: 85 },
      timestamp: Date.now()
    }
    
    const state1 = { ...baseState }
    const state2 = { ...baseState, timestamp: baseState.timestamp + 1000 }
    
    expect(isStateEqual(state1, state2)).toBe(true)
  })

  it('图片 transform.flipH 变化应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const img1 = createTestImageElement('img-1')
    const img2 = createTestImageElement('img-1')
    img2.transform.flipH = true
    
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img2]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('图片 transform.flipV 变化应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const img1 = createTestImageElement('img-1')
    const img2 = createTestImageElement('img-1')
    img2.transform.flipV = true
    
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img2]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('图片 transform.rotation 变化应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const img1 = createTestImageElement('img-1')
    const img2 = createTestImageElement('img-1')
    img2.transform.rotation = 90
    
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img2]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('图片 index 变化应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const img1 = createTestImageElement('img-1')
    const img2 = createTestImageElement('img-1')
    img1.index = 0
    img2.index = 1
    
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img2]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('图片顺序变化应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const img1 = createTestImageElement('img-1')
    const img2 = createTestImageElement('img-2')
    img1.index = 0
    img2.index = 1
    
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img1, img2]
    }
    
    // 交换顺序并更新索引
    const img1Swapped = { ...img1, index: 1 }
    const img2Swapped = { ...img2, index: 0 }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [img2Swapped, img1Swapped]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('图片数量变化（增加）应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1')]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1'), createTestImageElement('img-2')]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })

  it('图片数量变化（删除）应该返回 false', () => {
    const layout = createLayoutConfig('grid-2x1-h')
    const state1: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1'), createTestImageElement('img-2')]
    }
    const state2: CanvasState = {
      ...createEmptyCanvasState(layout),
      images: [createTestImageElement('img-1')]
    }
    
    expect(isStateEqual(state1, state2)).toBe(false)
  })
})



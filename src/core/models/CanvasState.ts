/**
 * 画布状态模型
 * 
 * 用于撤销/重做功能的状态快照
 */

import type { LayoutConfig } from './LayoutConfig'
import type { ImageElement } from './ImageElement'
import type { TextElement } from './TextElement'

/**
 * 画布尺寸
 */
export interface CanvasSize {
  readonly width: number
  readonly height: number
}

/**
 * 背景图片效果配置
 */
export interface BackgroundImageEffects {
  /** 透明度 (0-100) */
  opacity: number
  
  /** 模糊效果 (0-20 px) */
  blur: number
  
  /** 亮度 (0-200 %) */
  brightness: number
  
  /** 对比度 (0-200 %) */
  contrast: number
}

/**
 * 背景图片配置
 */
export interface BackgroundImageConfig {
  /** 图片 Data URL */
  url: string
  
  /** 效果配置 */
  effects: BackgroundImageEffects
}

/**
 * 背景配置
 */
export interface BackgroundConfig {
  /** 背景类型 */
  type: 'color' | 'image'
  
  /** 背景颜色 */
  color: string
  
  /** 透明度 (0-100) - 仅用于纯色背景 */
  opacity: number
  
  /** 图片背景配置 */
  image?: BackgroundImageConfig
}

/**
 * 透明度配置
 */
export interface OpacityConfig {
  /** 全局透明度 (0-100) */
  global: number
  
  /** 图片透明度 (0-100) */
  image: number
}

/**
 * 画布完整状态
 * 包含所有可撤销的状态信息
 */
export interface CanvasState {
  /** 布局配置 */
  readonly layout: LayoutConfig
  
  /** 图片列表 */
  readonly images: readonly ImageElement[]
  
  /** 文字列表 */
  readonly texts: readonly TextElement[]
  
  /** 画布尺寸 */
  readonly canvasSize: CanvasSize
  
  /** 背景配置 */
  readonly background: BackgroundConfig
  
  /** 透明度配置 */
  readonly opacity: OpacityConfig
  
  /** 状态时间戳 */
  readonly timestamp: number
}

/**
 * 默认画布尺寸
 */
export const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: 800,
  height: 800
}

/**
 * 默认背景配置
 * 默认透明，显示棋盘格背景
 */
export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: 'color',
  color: '#ffffff',
  opacity: 0,
  image: undefined
}

/**
 * 默认背景图片效果配置
 */
export const DEFAULT_BACKGROUND_IMAGE_EFFECTS: BackgroundImageEffects = {
  opacity: 100,
  blur: 0,
  brightness: 100,
  contrast: 100
}

/**
 * 默认透明度配置
 */
export const DEFAULT_OPACITY_CONFIG: OpacityConfig = {
  global: 100,
  image: 100
}

/**
 * 创建空白画布状态
 */
export function createEmptyCanvasState(layout: LayoutConfig): CanvasState {
  return {
    layout,
    images: [],
    texts: [],
    canvasSize: DEFAULT_CANVAS_SIZE,
    background: DEFAULT_BACKGROUND_CONFIG,
    opacity: DEFAULT_OPACITY_CONFIG,
    timestamp: Date.now()
  }
}

/**
 * 克隆画布状态（用于历史记录）
 */
export function cloneCanvasState(state: CanvasState): CanvasState {
  return {
    layout: { ...state.layout },
    images: [...state.images],
    texts: state.texts.map(t => ({ ...t, position: { ...t.position }, style: { ...t.style } })),
    canvasSize: { ...state.canvasSize },
    background: { ...state.background },
    opacity: { ...state.opacity },
    timestamp: Date.now()
  }
}

/**
 * 比较两个状态是否相同（用于优化历史记录）
 */
export function isStateEqual(state1: CanvasState, state2: CanvasState): boolean {
  return (
    JSON.stringify(state1.layout) === JSON.stringify(state2.layout) &&
    JSON.stringify(state1.images.filter(i => i && i !== null).map(i => i.id)) === JSON.stringify(state2.images.filter(i => i && i !== null).map(i => i.id)) &&
    JSON.stringify(state1.texts) === JSON.stringify(state2.texts) &&
    JSON.stringify(state1.canvasSize) === JSON.stringify(state2.canvasSize) &&
    JSON.stringify(state1.background) === JSON.stringify(state2.background) &&
    JSON.stringify(state1.opacity) === JSON.stringify(state2.opacity)
  )
}


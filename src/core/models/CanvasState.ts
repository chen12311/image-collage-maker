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
 * 背景配置
 */
export interface BackgroundConfig {
  /** 背景颜色 */
  color: string
  
  /** 透明度 (0-100) */
  opacity: number
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
 */
export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  color: '#ffffff',
  opacity: 100
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
    JSON.stringify(state1.images.map(i => i.id)) === JSON.stringify(state2.images.map(i => i.id)) &&
    JSON.stringify(state1.texts) === JSON.stringify(state2.texts) &&
    JSON.stringify(state1.canvasSize) === JSON.stringify(state2.canvasSize) &&
    JSON.stringify(state1.background) === JSON.stringify(state2.background) &&
    JSON.stringify(state1.opacity) === JSON.stringify(state2.opacity)
  )
}


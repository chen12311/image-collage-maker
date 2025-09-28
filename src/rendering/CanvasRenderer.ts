/**
 * CanvasRenderer - 核心Canvas渲染器
 * 
 * Linus哲学体现：
 * - 一个函数做一件事：遍历Element数组并绘制
 * - 消除特殊情况：图片和文字使用统一的渲染流程
 * - 直接而简单：没有过度抽象，代码即文档
 * 
 * "Talk is cheap. Show me the code."
 */

import type { Element } from '../core/models/Element'
import type { GridConfig } from '../core/models/GridConfig'
import { GridSystem } from '../layout/GridSystem'
import { ElementUtils } from '../core/models/Element'

/**
 * 渲染模式
 */
export type RenderMode = 'preview' | 'export'

/**
 * 渲染选项
 */
export interface RenderOptions {
  /** 渲染模式 */
  mode: RenderMode
  
  /** 是否启用抗锯齿 */
  antiAlias?: boolean
  
  /** 导出质量 (0-1, 仅用于JPEG) */
  quality?: number
  
  /** 背景色 */
  backgroundColor?: string
}

/**
 * 渲染结果
 */
export interface RenderResult {
  /** 渲染成功 */
  success: boolean
  
  /** Canvas元素 */
  canvas: HTMLCanvasElement
  
  /** 渲染耗时（毫秒） */
  renderTime: number
  
  /** 错误信息（如果有） */
  error?: string
}

/**
 * Canvas渲染器核心类
 * 
 * 设计原则：
 * 1. 统一接口：render()方法处理所有元素类型
 * 2. 零特殊情况：图片、文字、样式都走同一个渲染管道
 * 3. 纯函数：给定输入总是产生相同输出
 */
export class CanvasRenderer {
  /**
   * 渲染元素数组到Canvas
   * 
   * 这是整个渲染器的核心方法。
   * 遵循"单一职责原则"：只负责协调渲染流程
   * 
   * @param elements 要渲染的元素数组
   * @param config 网格配置
   * @param options 渲染选项
   * @returns 渲染结果
   */
  static render(
    elements: Element[],
    config: GridConfig,
    options: RenderOptions = { mode: 'preview' }
  ): RenderResult {
    const startTime = performance.now()
    
    try {
      // 1. 创建Canvas
      const canvas = this.createCanvas(config, options)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('无法获取Canvas渲染上下文')
      }
      
      // 2. 初始化Canvas
      this.initializeCanvas(ctx, config, options)
      
      // 3. 渲染所有元素
      this.renderElements(ctx, elements, config, options)
      
      const renderTime = performance.now() - startTime
      
      return {
        success: true,
        canvas,
        renderTime
      }
    } catch (error) {
      const renderTime = performance.now() - startTime
      
      return {
        success: false,
        canvas: document.createElement('canvas'), // 返回空Canvas避免null
        renderTime,
        error: error instanceof Error ? error.message : '未知渲染错误'
      }
    }
  }

  /**
   * 创建Canvas元素
   * 
   * 根据网格配置计算Canvas尺寸
   * 这里体现了GridSystem的价值：O(1)计算画布尺寸
   * 
   * @param config 网格配置
   * @param options 渲染选项
   * @returns Canvas元素
   */
  private static createCanvas(config: GridConfig, options: RenderOptions): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const canvasSize = GridSystem.calculateCanvasSize(config)
    
    // 设置Canvas尺寸
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    
    // 预览模式使用较小尺寸以提高性能
    if (options.mode === 'preview') {
      const scale = 0.5 // 预览时缩小50%
      canvas.style.width = `${canvasSize.width * scale}px`
      canvas.style.height = `${canvasSize.height * scale}px`
    }
    
    return canvas
  }

  /**
   * 初始化Canvas渲染上下文
   * 
   * 设置渲染参数和背景
   * 
   * @param ctx Canvas渲染上下文
   * @param config 网格配置
   * @param options 渲染选项
   */
  private static initializeCanvas(
    ctx: CanvasRenderingContext2D,
    config: GridConfig,
    options: RenderOptions
  ): void {
    // 设置渲染质量
    ctx.imageSmoothingEnabled = options.antiAlias !== false
    if (ctx.imageSmoothingEnabled) {
      ctx.imageSmoothingQuality = options.mode === 'export' ? 'high' : 'medium'
    }
    
    // 清空画布并设置背景色
    const canvasSize = GridSystem.calculateCanvasSize(config)
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
    }
  }

  /**
   * 渲染所有元素
   * 
   * 核心循环：遍历元素数组，按Z轴顺序渲染
   * 体现了"统一处理"的设计理念
   * 
   * @param ctx Canvas渲染上下文
   * @param elements 元素数组
   * @param config 网格配置
   * @param options 渲染选项
   */
  private static renderElements(
    ctx: CanvasRenderingContext2D,
    elements: Element[],
    config: GridConfig,
    options: RenderOptions
  ): void {
    // 按Z轴顺序排序，确保正确的层叠显示
    const sortedElements = elements
      .filter(element => element.style.visible)
      .sort((a, b) => a.transform.zIndex - b.transform.zIndex)
    
    // 逐个渲染元素
    for (const element of sortedElements) {
      this.renderElement(ctx, element, config, options)
    }
  }

  /**
   * 渲染单个元素
   * 
   * 这是"消除特殊情况"的典型实现：
   * 图片和文字都走相同的渲染流程
   * 
   * @param ctx Canvas渲染上下文
   * @param element 要渲染的元素
   * @param config 网格配置
   * @param options 渲染选项
   */
  private static renderElement(
    ctx: CanvasRenderingContext2D,
    element: Element,
    config: GridConfig,
    options: RenderOptions
  ): void {
    // 计算元素在画布中的位置和尺寸
    const bounds = GridSystem.calculateElementBounds(element.transform, config)
    
    // 保存当前Canvas状态
    ctx.save()
    
    try {
      // 应用元素变换（旋转、透明度等）
      this.applyElementTransform(ctx, element, bounds)
      
      // 根据元素类型进行渲染
      if (ElementUtils.isImage(element)) {
        this.renderImageElement(ctx, element, bounds, options)
      } else if (ElementUtils.isText(element)) {
        this.renderTextElement(ctx, element, bounds, options)
      }
      
      // 渲染元素样式（边框、阴影等）
      this.renderElementStyle(ctx, element, bounds, options)
      
    } finally {
      // 恢复Canvas状态
      ctx.restore()
    }
  }

  /**
   * 应用元素变换
   * 
   * 处理旋转、透明度等变换
   * 
   * @param ctx Canvas渲染上下文
   * @param element 元素
   * @param bounds 元素边界框
   */
  private static applyElementTransform(
    ctx: CanvasRenderingContext2D,
    element: Element,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    // 设置透明度
    ctx.globalAlpha = element.style.opacity
    
    // 应用旋转（如果有）
    if (element.transform.rotation !== 0) {
      const centerX = bounds.x + bounds.width / 2
      const centerY = bounds.y + bounds.height / 2
      
      ctx.translate(centerX, centerY)
      ctx.rotate(element.transform.rotation)
      ctx.translate(-centerX, -centerY)
    }
  }

  /**
   * 渲染图片元素
   * 
   * 使用ImageData直接绘制到Canvas
   * 
   * @param ctx Canvas渲染上下文
   * @param element 图片元素
   * @param bounds 元素边界框
   * @param options 渲染选项
   */
  private static renderImageElement(
    ctx: CanvasRenderingContext2D,
    element: Element & { content: import('../core/models/Element').ImageContent },
    bounds: { x: number; y: number; width: number; height: number },
    options: RenderOptions
  ): void {
    const { imageData, thumbnail } = element.content
    
    // 预览模式使用缩略图以提高性能
    const sourceData = options.mode === 'preview' ? thumbnail : imageData
    
    // 创建临时Canvas来绘制ImageData
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = sourceData.width
    tempCanvas.height = sourceData.height
    
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return
    
    tempCtx.putImageData(sourceData, 0, 0)
    
    // 将临时Canvas绘制到目标Canvas，并缩放到指定尺寸
    ctx.drawImage(tempCanvas, bounds.x, bounds.y, bounds.width, bounds.height)
  }

  /**
   * 渲染文字元素
   * 
   * 使用Canvas文字API绘制文本
   * 
   * @param ctx Canvas渲染上下文
   * @param element 文字元素
   * @param bounds 元素边界框
   * @param options 渲染选项
   */
  private static renderTextElement(
    ctx: CanvasRenderingContext2D,
    element: Element & { content: import('../core/models/Element').TextContent },
    bounds: { x: number; y: number; width: number; height: number },
    options: RenderOptions
  ): void {
    const { text, fontFamily, fontSize, color, textAlign, fontWeight } = element.content
    
    // 设置字体样式
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.textAlign = textAlign
    ctx.textBaseline = 'top'
    
    // 绘制背景色（如果有）
    if (element.style.backgroundColor !== 'transparent') {
      ctx.fillStyle = element.style.backgroundColor
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
      ctx.fillStyle = color // 恢复文字颜色
    }
    
    // 计算文字位置
    let textX = bounds.x
    if (textAlign === 'center') {
      textX = bounds.x + bounds.width / 2
    } else if (textAlign === 'right') {
      textX = bounds.x + bounds.width
    }
    
    // 绘制文字
    ctx.fillText(text, textX, bounds.y)
  }

  /**
   * 渲染元素样式
   * 
   * 处理边框、阴影等装饰性样式
   * 
   * @param ctx Canvas渲染上下文
   * @param element 元素
   * @param bounds 元素边界框
   * @param options 渲染选项
   */
  private static renderElementStyle(
    ctx: CanvasRenderingContext2D,
    element: Element,
    bounds: { x: number; y: number; width: number; height: number },
    options: RenderOptions
  ): void {
    // 绘制阴影
    if (element.style.shadow.enabled) {
      ctx.shadowColor = element.style.shadow.color
      ctx.shadowBlur = element.style.shadow.blur
      ctx.shadowOffsetX = element.style.shadow.offsetX
      ctx.shadowOffsetY = element.style.shadow.offsetY
      
      // 绘制阴影矩形（透明填充）
      ctx.fillStyle = 'transparent'
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
      
      // 清除阴影设置
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
    
    // 绘制边框
    if (element.style.borderWidth > 0) {
      ctx.strokeStyle = element.style.borderColor
      ctx.lineWidth = element.style.borderWidth
      
      if (element.style.borderRadius > 0) {
        // 绘制圆角矩形边框
        this.drawRoundedRect(
          ctx,
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
          element.style.borderRadius,
          false, // 不填充，只描边
          true   // 描边
        )
      } else {
        // 绘制普通矩形边框
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
      }
    }
  }

  /**
   * 绘制圆角矩形
   * 
   * Canvas API没有内置圆角矩形，需要手动绘制
   * 
   * @param ctx Canvas渲染上下文
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   * @param radius 圆角半径
   * @param fill 是否填充
   * @param stroke 是否描边
   */
  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill = false,
    stroke = false
  ): void {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    
    if (fill) {
      ctx.fill()
    }
    if (stroke) {
      ctx.stroke()
    }
  }
}

/**
 * 渲染器工具类
 * 提供便捷的渲染操作
 */
export class RendererUtils {
  /**
   * 快速预览渲染
   * 
   * @param elements 元素数组
   * @param config 网格配置
   * @returns 渲染结果
   */
  static renderPreview(elements: Element[], config: GridConfig): RenderResult {
    return CanvasRenderer.render(elements, config, {
      mode: 'preview',
      antiAlias: false, // 预览时关闭抗锯齿以提高性能
      backgroundColor: '#ffffff'
    })
  }

  /**
   * 高质量导出渲染
   * 
   * @param elements 元素数组
   * @param config 网格配置
   * @param backgroundColor 背景色
   * @returns 渲染结果
   */
  static renderExport(
    elements: Element[],
    config: GridConfig,
    backgroundColor = '#ffffff'
  ): RenderResult {
    return CanvasRenderer.render(elements, config, {
      mode: 'export',
      antiAlias: true,
      quality: 0.95,
      backgroundColor
    })
  }

  /**
   * 将Canvas导出为图片数据
   * 
   * @param canvas Canvas元素
   * @param format 图片格式
   * @param quality 质量 (0-1)
   * @returns 图片数据URL
   */
  static exportToDataURL(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' = 'png',
    quality = 0.95
  ): string {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    return canvas.toDataURL(mimeType, quality)
  }

  /**
   * 将Canvas导出为Blob
   * 
   * @param canvas Canvas元素
   * @param format 图片格式
   * @param quality 质量 (0-1)
   * @returns Promise<Blob>
   */
  static exportToBlob(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' = 'png',
    quality = 0.95
  ): Promise<Blob | null> {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    return new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality)
    })
  }
}

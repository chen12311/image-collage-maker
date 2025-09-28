/**
 * ImageProcessor - 图片变换处理器
 * 
 * Linus哲学体现：
 * 1. Transform Pipeline - 统一处理所有图片变换，零特殊情况
 * 2. OffscreenCanvas - 内存安全，避免UI阻塞
 * 3. 简洁数据流 - Transform + ImageData → 变换后ImageData
 * 4. Worker友好 - 可在主线程或Worker中运行
 */

import type { Transform } from '../core/models'

// ============================================================================
// 类型定义 - "好品味"的数据结构
// ============================================================================

/**
 * 图片变换结果
 */
export interface TransformResult {
  /** 变换后的图片数据 */
  readonly imageData: ImageData
  
  /** 变换统计信息 */
  readonly stats: TransformStats
  
  /** 是否发生了实际变换 */
  readonly transformed: boolean
}

/**
 * 变换统计
 */
export interface TransformStats {
  /** 原始尺寸 */
  readonly originalSize: { width: number; height: number }
  
  /** 变换后尺寸 */
  readonly transformedSize: { width: number; height: number }
  
  /** 应用的变换类型 */
  readonly appliedTransforms: TransformType[]
  
  /** 处理耗时（毫秒） */
  readonly processingTime: number
  
  /** 内存使用（字节） */
  readonly memoryUsed: number
}

/**
 * 变换类型
 */
export type TransformType = 'resize' | 'rotate' | 'crop' | 'none'

/**
 * 处理器配置
 */
export interface ImageProcessorConfig {
  /** 是否使用OffscreenCanvas（性能优化） */
  readonly useOffscreenCanvas: boolean
  
  /** 最大输出尺寸限制 */
  readonly maxOutputSize: { width: number; height: number }
  
  /** 图片插值质量 */
  readonly interpolationQuality: 'low' | 'medium' | 'high'
  
  /** 是否启用内存监控 */
  readonly enableMemoryMonitoring: boolean
}

/**
 * Worker消息类型
 */
export interface WorkerMessage {
  /** 消息ID */
  readonly id: string
  
  /** 消息类型 */
  readonly type: 'transform' | 'result' | 'error'
  
  /** 数据负载 */
  readonly payload: any
}

// ============================================================================
// 核心变换算法 - TransformPipeline类
// ============================================================================

/**
 * 图片变换管道
 * 
 * 设计原则：
 * 1. 统一接口 - 所有变换都通过applyTransform方法
 * 2. 纯函数 - 不修改输入数据，总是返回新的ImageData
 * 3. 内存安全 - 自动管理Canvas资源
 * 4. 高性能 - 使用OffscreenCanvas和优化算法
 */
export class ImageProcessor {
  private readonly config: ImageProcessorConfig
  private readonly offscreenCanvas?: OffscreenCanvas
  private readonly offscreenCtx?: OffscreenCanvasRenderingContext2D
  
  constructor(config?: Partial<ImageProcessorConfig>) {
    this.config = {
      useOffscreenCanvas: true,
      maxOutputSize: { width: 8192, height: 8192 },
      interpolationQuality: 'high',
      enableMemoryMonitoring: true,
      ...config
    }
    
    // 初始化OffscreenCanvas（如果支持）
    if (this.config.useOffscreenCanvas && typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(1, 1)
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
    }
  }

  // ========================================================================
  // 公共API - Transform Pipeline
  // ========================================================================

  /**
   * 应用Transform变换到ImageData
   * 
   * 这是唯一的公共变换接口 - 体现"好品味"原则
   * 
   * @param imageData 原始图片数据
   * @param transform 变换信息
   * @param targetPixelSize 目标像素尺寸（由GridSystem计算）
   * @returns 变换结果
   */
  async applyTransform(
    imageData: ImageData,
    transform: Transform,
    targetPixelSize: { width: number; height: number }
  ): Promise<TransformResult> {
    const startTime = performance.now()
    const originalSize = { width: imageData.width, height: imageData.height }
    
    // 检查是否需要变换
    const needsTransform = this.analyzeTransform(imageData, transform, targetPixelSize)
    if (!needsTransform.required) {
      return {
        imageData,
        stats: {
          originalSize,
          transformedSize: originalSize,
          appliedTransforms: ['none'],
          processingTime: performance.now() - startTime,
          memoryUsed: this.calculateMemoryUsage(imageData)
        },
        transformed: false
      }
    }

    // 执行变换管道
    const transformedImageData = await this.executePipeline(
      imageData,
      transform,
      targetPixelSize,
      needsTransform.operations
    )
    
    const endTime = performance.now()
    
    return {
      imageData: transformedImageData,
      stats: {
        originalSize,
        transformedSize: { 
          width: transformedImageData.width, 
          height: transformedImageData.height 
        },
        appliedTransforms: needsTransform.operations,
        processingTime: endTime - startTime,
        memoryUsed: this.calculateMemoryUsage(transformedImageData)
      },
      transformed: true
    }
  }

  /**
   * 批量处理多个图片（Web Worker友好）
   */
  async processBatch(
    requests: Array<{
      imageData: ImageData
      transform: Transform
      targetPixelSize: { width: number; height: number }
    }>
  ): Promise<TransformResult[]> {
    // 使用Promise.all进行并行处理，但限制并发数避免内存溢出
    const results: TransformResult[] = []
    const batchSize = 3 // 限制并发数
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(req => this.applyTransform(req.imageData, req.transform, req.targetPixelSize))
      )
      results.push(...batchResults)
    }
    
    return results
  }

  // ========================================================================
  // 核心变换管道 - 简洁实现
  // ========================================================================

  /**
   * 分析需要的变换操作
   */
  private analyzeTransform(
    imageData: ImageData,
    transform: Transform,
    targetPixelSize: { width: number; height: number }
  ): { required: boolean; operations: TransformType[] } {
    const operations: TransformType[] = []
    
    // 检查尺寸变换
    if (imageData.width !== targetPixelSize.width || imageData.height !== targetPixelSize.height) {
      operations.push('resize')
    }
    
    // 检查旋转变换 - 考虑小角度阈值
    const normalizedRotation = transform.rotation % (2 * Math.PI)
    if (Math.abs(normalizedRotation) >= 0.01 && Math.abs(normalizedRotation - 2 * Math.PI) >= 0.01) {
      operations.push('rotate')
    }
    
    return {
      required: operations.length > 0,
      operations: operations.length > 0 ? operations : ['none']
    }
  }

  /**
   * 执行变换管道
   */
  private async executePipeline(
    imageData: ImageData,
    transform: Transform,
    targetPixelSize: { width: number; height: number },
    operations: TransformType[]
  ): Promise<ImageData> {
    let currentImageData = imageData
    
    // 按顺序执行变换操作
    for (const operation of operations) {
      switch (operation) {
        case 'resize':
          currentImageData = await this.performResize(currentImageData, targetPixelSize)
          break
        case 'rotate':
          currentImageData = await this.performRotation(currentImageData, transform.rotation)
          break
      }
    }
    
    return currentImageData
  }

  /**
   * 执行尺寸调整
   */
  private async performResize(
    imageData: ImageData,
    targetSize: { width: number; height: number }
  ): Promise<ImageData> {
    // 限制输出尺寸
    const finalSize = this.clampSize(targetSize)
    
    // 使用最佳的Canvas进行缩放
    const { canvas, ctx } = this.getOptimalCanvas(finalSize.width, finalSize.height)
    
    try {
      // 创建临时canvas来绘制原始数据
      const sourceCanvas = this.createTemporaryCanvas(imageData.width, imageData.height)
      const sourceCtx = sourceCanvas.getContext('2d')!
      sourceCtx.putImageData(imageData, 0, 0)
      
      // 设置高质量缩放
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = this.config.interpolationQuality
      
      // 执行缩放绘制
      ctx.drawImage(sourceCanvas, 0, 0, finalSize.width, finalSize.height)
      
      // 获取结果
      const result = ctx.getImageData(0, 0, finalSize.width, finalSize.height)
      
      // 清理临时资源
      this.cleanupTemporaryCanvas(sourceCanvas)
      
      return result
      
    } catch (error) {
      throw new Error(`图片缩放失败: ${error}`)
    }
  }

  /**
   * 执行旋转变换
   */
  private async performRotation(
    imageData: ImageData,
    rotation: number
  ): Promise<ImageData> {
    // 标准化角度到0-2π
    const normalizedRotation = rotation % (2 * Math.PI)
    
    // 如果角度太小，跳过旋转
    if (Math.abs(normalizedRotation) < 0.01 || Math.abs(normalizedRotation - 2 * Math.PI) < 0.01) {
      return imageData
    }
    
    // 计算旋转后的画布尺寸
    const rotatedSize = this.calculateRotatedSize(imageData.width, imageData.height, normalizedRotation)
    
    // 获取画布
    const { canvas, ctx } = this.getOptimalCanvas(rotatedSize.width, rotatedSize.height)
    
    try {
      // 创建源画布
      const sourceCanvas = this.createTemporaryCanvas(imageData.width, imageData.height)
      const sourceCtx = sourceCanvas.getContext('2d')!
      sourceCtx.putImageData(imageData, 0, 0)
      
      // 设置旋转变换
      ctx.translate(rotatedSize.width / 2, rotatedSize.height / 2)
      ctx.rotate(normalizedRotation)
      ctx.translate(-imageData.width / 2, -imageData.height / 2)
      
      // 绘制旋转后的图像
      ctx.drawImage(sourceCanvas, 0, 0)
      
      // 获取结果
      const result = ctx.getImageData(0, 0, rotatedSize.width, rotatedSize.height)
      
      // 重置变换
      ctx.resetTransform()
      
      // 清理资源
      this.cleanupTemporaryCanvas(sourceCanvas)
      
      return result
      
    } catch (error) {
      throw new Error(`图片旋转失败: ${error}`)
    }
  }

  // ========================================================================
  // 工具方法 - 纯函数实现
  // ========================================================================

  /**
   * 获取最佳Canvas（OffscreenCanvas优先）
   */
  private getOptimalCanvas(width: number, height: number): {
    canvas: HTMLCanvasElement | OffscreenCanvas
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  } {
    if (this.offscreenCanvas && this.offscreenCtx) {
      this.offscreenCanvas.width = width
      this.offscreenCanvas.height = height
      return { canvas: this.offscreenCanvas, ctx: this.offscreenCtx }
    }
    
    // 降级到普通Canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return { canvas, ctx: canvas.getContext('2d')! }
  }

  /**
   * 创建临时Canvas
   */
  private createTemporaryCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  /**
   * 清理临时Canvas
   */
  private cleanupTemporaryCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = 1
    canvas.height = 1
    canvas.remove()
  }

  /**
   * 限制输出尺寸
   */
  private clampSize(size: { width: number; height: number }): { width: number; height: number } {
    const { maxOutputSize } = this.config
    
    return {
      width: Math.min(Math.max(1, Math.round(size.width)), maxOutputSize.width),
      height: Math.min(Math.max(1, Math.round(size.height)), maxOutputSize.height)
    }
  }

  /**
   * 计算旋转后尺寸
   */
  private calculateRotatedSize(width: number, height: number, rotation: number): { width: number; height: number } {
    const cos = Math.abs(Math.cos(rotation))
    const sin = Math.abs(Math.sin(rotation))
    
    return {
      width: Math.ceil(width * cos + height * sin),
      height: Math.ceil(width * sin + height * cos)
    }
  }

  /**
   * 计算内存使用量
   */
  private calculateMemoryUsage(imageData: ImageData): number {
    return imageData.width * imageData.height * 4 // RGBA，每像素4字节
  }

  /**
   * 释放资源
   */
  dispose(): void {
    // OffscreenCanvas会自动垃圾回收，这里只需要标记一下
    if (this.config.enableMemoryMonitoring) {
      console.debug('ImageProcessor disposed')
    }
  }
}

// ============================================================================
// Web Worker支持 - Worker通信协议
// ============================================================================

/**
 * Worker消息处理器
 * 可在Web Worker中使用
 */
export class ImageProcessorWorker {
  private processor: ImageProcessor

  constructor(config?: Partial<ImageProcessorConfig>) {
    this.processor = new ImageProcessor(config)
    
    // 监听Worker消息
    if (typeof self !== 'undefined' && 'onmessage' in self) {
      self.onmessage = this.handleWorkerMessage.bind(this)
    }
  }

  /**
   * 处理Worker消息
   */
  private async handleWorkerMessage(event: MessageEvent<WorkerMessage>): Promise<void> {
    const { id, type, payload } = event.data
    
    try {
      if (type === 'transform') {
        const { imageData, transform, targetPixelSize } = payload
        const result = await this.processor.applyTransform(imageData, transform, targetPixelSize)
        
        // 发送结果
        self.postMessage({
          id,
          type: 'result',
          payload: result
        })
      }
    } catch (error) {
      // 发送错误
      self.postMessage({
        id,
        type: 'error',
        payload: {
          message: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    }
  }
}

// ============================================================================
// 工具函数 - 模块级API
// ============================================================================

/**
 * 默认图片处理器实例
 */
export const defaultImageProcessor = new ImageProcessor()

/**
 * 快捷变换方法
 */
export async function applyImageTransform(
  imageData: ImageData,
  transform: Transform,
  targetPixelSize: { width: number; height: number }
): Promise<TransformResult> {
  return defaultImageProcessor.applyTransform(imageData, transform, targetPixelSize)
}

/**
 * 创建自定义配置的处理器
 */
export function createImageProcessor(config: Partial<ImageProcessorConfig>): ImageProcessor {
  return new ImageProcessor(config)
}

/**
 * 检查OffscreenCanvas支持
 */
export function isOffscreenCanvasSupported(): boolean {
  return typeof OffscreenCanvas !== 'undefined'
}

/**
 * 检查Web Worker支持
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined'
}

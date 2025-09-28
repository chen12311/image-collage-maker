/**
 * FileProcessor - 批量文件处理器
 * 
 * Linus哲学体现：
 * 1. 统一处理管道 - 消除文件类型特殊情况
 * 2. 简洁数据流 - File → ImageContent，一对一映射
 * 3. 零特殊情况 - 所有文件都走同一个处理流程
 * 4. 实用主义 - 解决真实的批量处理需求
 */

import type { ImageContent } from '../core/models'

// ============================================================================
// 类型定义 - "好品味"的数据结构
// ============================================================================

/**
 * 支持的文件类型
 */
export type SupportedFileType = 'image/jpeg' | 'image/png' | 'image/webp'

/**
 * 文件处理结果
 */
export interface ProcessingResult {
  /** 是否成功 */
  readonly success: boolean
  
  /** 原始文件 */
  readonly file: File
  
  /** 处理后的ImageContent（成功时） */
  readonly imageContent?: ImageContent
  
  /** 错误信息（失败时） */
  readonly error?: ProcessingError
  
  /** 处理统计 */
  readonly stats: ProcessingStats
}

/**
 * 处理错误
 */
export interface ProcessingError {
  /** 错误类型 */
  readonly type: 'validation' | 'compression' | 'thumbnail' | 'memory' | 'unknown'
  
  /** 错误消息 */
  readonly message: string
  
  /** 原始错误 */
  readonly originalError?: Error
}

/**
 * 处理统计
 */
export interface ProcessingStats {
  /** 原始文件大小（字节） */
  readonly originalSize: number
  
  /** 处理后文件大小（字节） */
  readonly processedSize: number
  
  /** 是否进行了压缩 */
  readonly compressed: boolean
  
  /** 处理耗时（毫秒） */
  readonly processingTime: number
  
  /** 缩略图大小（字节） */
  readonly thumbnailSize: number
}

/**
 * 文件处理配置
 */
export interface ProcessorConfig {
  /** 自动压缩阈值（字节），默认50MB */
  readonly compressionThreshold: number
  
  /** 压缩质量 (0-1)，默认0.8 */
  readonly compressionQuality: number
  
  /** 缩略图最大宽度，默认200px */
  readonly thumbnailMaxWidth: number
  
  /** 缩略图最大高度，默认200px */
  readonly thumbnailMaxHeight: number
  
  /** 最大并发处理数，默认4 */
  readonly maxConcurrency: number
  
  /** 单文件最大大小（字节），默认100MB */
  readonly maxFileSize: number
}

/**
 * 批量处理进度回调
 */
export type ProgressCallback = (progress: {
  /** 已处理文件数 */
  processed: number
  /** 总文件数 */
  total: number
  /** 当前处理的文件名 */
  currentFileName: string
  /** 处理进度 0-1 */
  percentage: number
}) => void

// ============================================================================
// 核心文件处理器 - FileProcessor类
// ============================================================================

/**
 * 文件处理器
 * 
 * 设计原则：
 * 1. 统一处理管道 - 所有文件都走相同流程
 * 2. 无副作用 - 不修改原始文件，返回新的ImageContent
 * 3. 错误隔离 - 单个文件失败不影响其他文件
 * 4. 内存友好 - 处理大文件时自动释放内存
 */
export class FileProcessor {
  private readonly config: ProcessorConfig
  
  constructor(config?: Partial<ProcessorConfig>) {
    this.config = {
      compressionThreshold: 50 * 1024 * 1024, // 50MB
      compressionQuality: 0.8,
      thumbnailMaxWidth: 200,
      thumbnailMaxHeight: 200,
      maxConcurrency: 4,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      ...config
    }
  }

  // ========================================================================
  // 公共API - 批量处理接口
  // ========================================================================

  /**
   * 批量处理文件
   * 
   * @param files 要处理的文件数组
   * @param onProgress 进度回调（可选）
   * @returns 处理结果数组，与输入文件一一对应
   */
  async processFiles(
    files: File[], 
    onProgress?: ProgressCallback
  ): Promise<ProcessingResult[]> {
    if (files.length === 0) {
      return []
    }

    // 分批处理，避免内存占用过高
    const results: ProcessingResult[] = []
    const batchSize = this.config.maxConcurrency
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      
      // 并行处理当前批次
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex
        
        // 通知进度
        onProgress?.({
          processed: globalIndex,
          total: files.length,
          currentFileName: file.name,
          percentage: globalIndex / files.length
        })
        
        return this.processSingleFile(file)
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    // 最终进度通知
    onProgress?.({
      processed: files.length,
      total: files.length,
      currentFileName: '',
      percentage: 1
    })

    return results
  }

  /**
   * 处理单个文件
   * 
   * @param file 要处理的文件
   * @returns 处理结果
   */
  async processSingleFile(file: File): Promise<ProcessingResult> {
    const startTime = performance.now()
    
    try {
      // 第一步：文件验证
      const validationResult = this.validateFile(file)
      if (!validationResult.isValid) {
        return this.createFailureResult(file, {
          type: 'validation',
          message: validationResult.error!,
          originalError: new Error(validationResult.error!)
        }, startTime)
      }

      // 第二步：加载图片数据
      const imageData = await this.loadImageData(file)
      
      // 第三步：生成缩略图
      const thumbnail = await this.generateThumbnail(imageData)
      
      // 第四步：压缩处理（如果需要）
      const { compressedImageData, compressed } = await this.compressIfNeeded(file, imageData)
      
      // 第五步：创建ImageContent
      const imageContent: ImageContent = {
        file,
        imageData: compressedImageData,
        thumbnail,
        originalSize: {
          width: imageData.width,
          height: imageData.height
        },
        fileSize: file.size,
        mimeType: file.type as SupportedFileType
      }

      // 计算处理统计
      const endTime = performance.now()
      const stats: ProcessingStats = {
        originalSize: file.size,
        processedSize: this.estimateImageDataSize(compressedImageData),
        compressed,
        processingTime: endTime - startTime,
        thumbnailSize: this.estimateImageDataSize(thumbnail)
      }

      return {
        success: true,
        file,
        imageContent,
        stats
      }

    } catch (error) {
      return this.createFailureResult(file, {
        type: 'unknown',
        message: error instanceof Error ? error.message : '未知错误',
        originalError: error instanceof Error ? error : new Error(String(error))
      }, startTime)
    }
  }

  // ========================================================================
  // 核心处理步骤 - 简洁实现
  // ========================================================================

  /**
   * 验证文件
   */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // 检查文件大小
    if (file.size > this.config.maxFileSize) {
      return {
        isValid: false,
        error: `文件大小超过限制：${this.formatFileSize(file.size)} > ${this.formatFileSize(this.config.maxFileSize)}`
      }
    }

    // 检查文件类型
    const supportedTypes: SupportedFileType[] = ['image/jpeg', 'image/png', 'image/webp']
    if (!supportedTypes.includes(file.type as SupportedFileType)) {
      return {
        isValid: false,
        error: `不支持的文件类型：${file.type}，支持的类型：${supportedTypes.join(', ')}`
      }
    }

    // 检查文件名
    if (!file.name || file.name.trim() === '') {
      return {
        isValid: false,
        error: '文件名不能为空'
      }
    }

    return { isValid: true }
  }

  /**
   * 加载图片数据
   */
  private async loadImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        try {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          // 清理资源
          img.remove()
          canvas.remove()
          URL.revokeObjectURL(img.src)
          
          resolve(imageData)
        } catch (error) {
          reject(new Error(`加载图片数据失败: ${error}`))
        }
      }

      img.onerror = () => {
        reject(new Error('图片加载失败：文件可能已损坏'))
      }

      // 使用URL.createObjectURL而不是FileReader，更高效
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 生成缩略图
   */
  private async generateThumbnail(imageData: ImageData): Promise<ImageData> {
    const { thumbnailMaxWidth, thumbnailMaxHeight } = this.config
    
    // 计算缩略图尺寸，保持宽高比
    const scale = Math.min(
      thumbnailMaxWidth / imageData.width,
      thumbnailMaxHeight / imageData.height,
      1 // 不放大
    )
    
    const thumbnailWidth = Math.floor(imageData.width * scale)
    const thumbnailHeight = Math.floor(imageData.height * scale)
    
    // 如果不需要缩放，直接返回原图
    if (scale === 1) {
      return imageData
    }

    // 创建缩略图
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = thumbnailWidth
    canvas.height = thumbnailHeight
    
    // 先将ImageData绘制到临时canvas
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    tempCtx.putImageData(imageData, 0, 0)
    
    // 绘制缩略图（使用高质量缩放）
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(tempCanvas, 0, 0, thumbnailWidth, thumbnailHeight)
    
    const thumbnailImageData = ctx.getImageData(0, 0, thumbnailWidth, thumbnailHeight)
    
    // 清理资源
    canvas.remove()
    tempCanvas.remove()
    
    return thumbnailImageData
  }

  /**
   * 压缩处理（如果需要）
   */
  private async compressIfNeeded(
    file: File, 
    imageData: ImageData
  ): Promise<{ compressedImageData: ImageData; compressed: boolean }> {
    // 检查是否需要压缩
    if (file.size <= this.config.compressionThreshold) {
      return { compressedImageData: imageData, compressed: false }
    }

    try {
      // 创建压缩canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = imageData.width
      canvas.height = imageData.height
      ctx.putImageData(imageData, 0, 0)
      
      // 转换为压缩后的Blob
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('压缩失败'))
            }
          },
          'image/jpeg', // 统一压缩为JPEG格式
          this.config.compressionQuality
        )
      })
      
      // 将压缩后的Blob转回ImageData
      const compressedImage = new Image()
      const compressedImageData = await new Promise<ImageData>((resolve, reject) => {
        compressedImage.onload = () => {
          const compressedCanvas = document.createElement('canvas')
          const compressedCtx = compressedCanvas.getContext('2d')!
          
          compressedCanvas.width = compressedImage.naturalWidth
          compressedCanvas.height = compressedImage.naturalHeight
          compressedCtx.drawImage(compressedImage, 0, 0)
          
          const result = compressedCtx.getImageData(0, 0, compressedCanvas.width, compressedCanvas.height)
          
          // 清理资源
          compressedImage.remove()
          compressedCanvas.remove()
          URL.revokeObjectURL(compressedImage.src)
          
          resolve(result)
        }
        
        compressedImage.onerror = () => reject(new Error('压缩图片加载失败'))
        compressedImage.src = URL.createObjectURL(compressedBlob)
      })
      
      // 清理资源
      canvas.remove()
      
      return { compressedImageData, compressed: true }
      
    } catch (error) {
      console.warn('图片压缩失败，使用原始数据:', error)
      return { compressedImageData: imageData, compressed: false }
    }
  }

  // ========================================================================
  // 工具方法 - 纯函数实现
  // ========================================================================

  /**
   * 创建失败结果
   */
  private createFailureResult(
    file: File, 
    error: ProcessingError, 
    startTime: number
  ): ProcessingResult {
    const endTime = performance.now()
    
    return {
      success: false,
      file,
      error,
      stats: {
        originalSize: file.size,
        processedSize: 0,
        compressed: false,
        processingTime: endTime - startTime,
        thumbnailSize: 0
      }
    }
  }

  /**
   * 估算ImageData的内存大小
   */
  private estimateImageDataSize(imageData: ImageData): number {
    return imageData.width * imageData.height * 4 // RGBA，每像素4字节
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
}

// ============================================================================
// 工具函数 - 模块级API
// ============================================================================

/**
 * 默认文件处理器实例
 */
export const defaultFileProcessor = new FileProcessor()

/**
 * 快捷处理方法 - 使用默认配置
 */
export async function processFiles(
  files: File[], 
  onProgress?: ProgressCallback
): Promise<ProcessingResult[]> {
  return defaultFileProcessor.processFiles(files, onProgress)
}

/**
 * 快捷单文件处理方法
 */
export async function processSingleFile(file: File): Promise<ProcessingResult> {
  return defaultFileProcessor.processSingleFile(file)
}

/**
 * 创建自定义配置的处理器
 */
export function createFileProcessor(config: Partial<ProcessorConfig>): FileProcessor {
  return new FileProcessor(config)
}

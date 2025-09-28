/**
 * ExportManager - 图片导出管理器
 * 
 * Linus哲学体现：
 * - 做一件事并做好：管理图片导出流程
 * - 简单直接：包装CanvasRenderer的导出功能
 * - 避免重复：复用已有的渲染逻辑
 */

import type { Element } from '../core/models/Element'
import type { GridConfig } from '../core/models/GridConfig'
import { CanvasRenderer, RendererUtils } from './CanvasRenderer'

/**
 * 导出格式
 */
export type ExportFormat = 'png' | 'jpeg'

/**
 * 导出配置
 */
export interface ExportConfig {
  /** 导出格式 */
  format: ExportFormat
  
  /** 图片质量 (0-1, 仅用于JPEG) */
  quality?: number
  
  /** 背景色 */
  backgroundColor?: string
  
  /** 文件名（不含扩展名） */
  filename?: string
}

/**
 * 导出结果
 */
export interface ExportResult {
  /** 导出成功 */
  success: boolean
  
  /** 文件名 */
  filename: string
  
  /** 文件大小（字节） */
  fileSize: number
  
  /** 导出耗时（毫秒） */
  exportTime: number
  
  /** 图片数据URL */
  dataURL?: string
  
  /** 错误信息 */
  error?: string
}

/**
 * 导出进度回调
 */
export type ExportProgressCallback = (progress: number, stage: string) => void

/**
 * 导出管理器
 * 
 * 简单而直接的导出管理，不过度设计
 */
export class ExportManager {
  /**
   * 导出图片
   * 
   * @param elements 元素数组
   * @param config 网格配置
   * @param exportConfig 导出配置
   * @param onProgress 进度回调
   * @returns 导出结果
   */
  static async exportImage(
    elements: Element[],
    config: GridConfig,
    exportConfig: ExportConfig,
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    const startTime = performance.now()
    
    try {
      // 步骤1: 渲染到Canvas
      onProgress?.(10, '开始渲染...')
      
      const renderResult = CanvasRenderer.render(elements, config, {
        mode: 'export',
        antiAlias: true,
        quality: exportConfig.quality || 0.95,
        backgroundColor: exportConfig.backgroundColor || '#ffffff'
      })
      
      if (!renderResult.success) {
        throw new Error(renderResult.error || '渲染失败')
      }
      
      onProgress?.(50, '渲染完成，正在导出...')
      
      // 步骤2: 导出为数据URL
      const dataURL = RendererUtils.exportToDataURL(
        renderResult.canvas,
        exportConfig.format,
        exportConfig.quality
      )
      
      onProgress?.(80, '正在计算文件大小...')
      
      // 步骤3: 计算文件大小（估算）
      const fileSize = this.estimateFileSize(dataURL)
      
      onProgress?.(100, '导出完成')
      
      const exportTime = performance.now() - startTime
      const filename = this.generateFilename(exportConfig)
      
      return {
        success: true,
        filename,
        fileSize,
        exportTime,
        dataURL
      }
    } catch (error) {
      const exportTime = performance.now() - startTime
      
      return {
        success: false,
        filename: '',
        fileSize: 0,
        exportTime,
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  /**
   * 导出并下载图片
   * 
   * @param elements 元素数组
   * @param config 网格配置
   * @param exportConfig 导出配置
   * @param onProgress 进度回调
   * @returns 导出结果
   */
  static async exportAndDownload(
    elements: Element[],
    config: GridConfig,
    exportConfig: ExportConfig,
    onProgress?: ExportProgressCallback
  ): Promise<ExportResult> {
    const result = await this.exportImage(elements, config, exportConfig, onProgress)
    
    if (result.success && result.dataURL) {
      this.downloadImage(result.dataURL, result.filename)
    }
    
    return result
  }

  /**
   * 导出为Blob
   * 
   * @param elements 元素数组
   * @param config 网格配置
   * @param exportConfig 导出配置
   * @returns Promise<Blob | null>
   */
  static async exportToBlob(
    elements: Element[],
    config: GridConfig,
    exportConfig: ExportConfig
  ): Promise<Blob | null> {
    const renderResult = CanvasRenderer.render(elements, config, {
      mode: 'export',
      antiAlias: true,
      quality: exportConfig.quality || 0.95,
      backgroundColor: exportConfig.backgroundColor || '#ffffff'
    })
    
    if (!renderResult.success) {
      return null
    }
    
    return RendererUtils.exportToBlob(
      renderResult.canvas,
      exportConfig.format,
      exportConfig.quality
    )
  }

  /**
   * 下载图片
   * 
   * 创建临时下载链接并触发下载
   * 
   * @param dataURL 图片数据URL
   * @param filename 文件名
   */
  private static downloadImage(dataURL: string, filename: string): void {
    const link = document.createElement('a')
    link.href = dataURL
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 生成文件名
   * 
   * @param config 导出配置
   * @returns 文件名
   */
  private static generateFilename(config: ExportConfig): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const baseName = config.filename || `imagebatch-${timestamp}`
    const extension = config.format === 'png' ? 'png' : 'jpg'
    
    return `${baseName}.${extension}`
  }

  /**
   * 估算文件大小
   * 
   * 基于data URL长度的粗略估算
   * 
   * @param dataURL 数据URL
   * @returns 估算的文件大小（字节）
   */
  private static estimateFileSize(dataURL: string): number {
    // 移除data:image/xxx;base64,前缀
    const base64Data = dataURL.split(',')[1] || ''
    
    // Base64编码大约比原始数据大33%
    return Math.round((base64Data.length * 3) / 4)
  }
}

/**
 * 导出预设配置
 */
export const ExportPresets = {
  /** 高质量PNG */
  highQualityPNG: (): ExportConfig => ({
    format: 'png',
    backgroundColor: '#ffffff'
  }),

  /** 高质量JPEG */
  highQualityJPEG: (): ExportConfig => ({
    format: 'jpeg',
    quality: 0.95,
    backgroundColor: '#ffffff'
  }),

  /** 中等质量JPEG（较小文件） */
  mediumQualityJPEG: (): ExportConfig => ({
    format: 'jpeg',
    quality: 0.8,
    backgroundColor: '#ffffff'
  }),

  /** 透明背景PNG */
  transparentPNG: (): ExportConfig => ({
    format: 'png'
    // 不设置backgroundColor，保持透明
  })
} as const

/**
 * Element - 统一元素模型
 * 
 * Linus哲学体现：
 * - 消除图片/文字特殊情况，使用统一接口
 * - 不可变数据结构，避免副作用  
 * - 组合而非继承，简化设计
 */

import type { Transform } from './Transform'

/**
 * 元素类型枚举
 */
export type ElementType = 'image' | 'text'

/**
 * 图片内容数据
 */
export interface ImageContent {
  /** 原始文件引用 */
  readonly file: File
  
  /** 图片数据（用于Canvas渲染） */
  readonly imageData: ImageData
  
  /** 缩略图（用于预览，降低内存占用） */
  readonly thumbnail: ImageData
  
  /** 原始尺寸 */
  readonly originalSize: { width: number; height: number }
  
  /** 文件大小（字节） */
  readonly fileSize: number
  
  /** MIME类型 */
  readonly mimeType: string
}

/**
 * 文字内容数据
 */
export interface TextContent {
  /** 文字内容 */
  readonly text: string
  
  /** 字体家族 */
  readonly fontFamily: string
  
  /** 字体大小（像素） */
  readonly fontSize: number
  
  /** 字体颜色（CSS颜色值） */
  readonly color: string
  
  /** 文字对齐 */
  readonly textAlign: 'left' | 'center' | 'right'
  
  /** 字体粗细 */
  readonly fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  
  /** 行高 */
  readonly lineHeight: number
}

/**
 * 元素样式配置
 */
export interface ElementStyle {
  /** 透明度 (0-1) */
  readonly opacity: number
  
  /** 边框宽度（像素） */
  readonly borderWidth: number
  
  /** 边框颜色 */
  readonly borderColor: string
  
  /** 边框圆角（像素） */
  readonly borderRadius: number
  
  /** 阴影配置 */
  readonly shadow: {
    readonly enabled: boolean
    readonly offsetX: number
    readonly offsetY: number
    readonly blur: number
    readonly color: string
  }
  
  /** 背景色（用于文字元素） */
  readonly backgroundColor: string
  
  /** 是否可见 */
  readonly visible: boolean
}

/**
 * 元素元数据
 */
export interface ElementMetadata {
  /** 创建时间戳 */
  readonly createdAt: number
  
  /** 最后更新时间戳 */
  readonly updatedAt: number
  
  /** 元素名称（用户可编辑） */
  readonly name: string
  
  /** 是否锁定（防止意外修改） */
  readonly locked: boolean
  
  /** 标签（用于分组和搜索） */
  readonly tags: readonly string[]
}

/**
 * 统一元素接口
 * 所有元素（图片、文字）都实现此接口
 */
export interface Element {
  /** 唯一标识符 */
  readonly id: string
  
  /** 元素类型 */
  readonly type: ElementType
  
  /** 内容数据（图片或文字） */
  readonly content: ImageContent | TextContent
  
  /** 变换信息（位置、尺寸、旋转等） */
  readonly transform: Transform
  
  /** 样式配置 */
  readonly style: ElementStyle
  
  /** 元数据 */
  readonly metadata: ElementMetadata
}

/**
 * Element工厂和更新方法
 * 提供不可变数据操作
 */
export class ElementBuilder {
  /**
   * 创建图片元素
   */
  static createImage(
    id: string,
    imageContent: ImageContent,
    transform: Transform,
    style?: Partial<ElementStyle>,
    metadata?: Partial<ElementMetadata>
  ): Element {
    return {
      id,
      type: 'image',
      content: imageContent,
      transform,
      style: this.createDefaultStyle(style),
      metadata: this.createDefaultMetadata(metadata, `图片 ${id}`)
    }
  }

  /**
   * 创建文字元素
   */
  static createText(
    id: string,
    textContent: TextContent,
    transform: Transform,
    style?: Partial<ElementStyle>,
    metadata?: Partial<ElementMetadata>
  ): Element {
    return {
      id,
      type: 'text',
      content: textContent,
      transform,
      style: this.createDefaultStyle(style),
      metadata: this.createDefaultMetadata(metadata, `文字 ${id}`)
    }
  }

  /**
   * 更新变换信息
   */
  static withTransform(element: Element, newTransform: Transform): Element {
    return {
      ...element,
      transform: newTransform,
      metadata: {
        ...element.metadata,
        updatedAt: Date.now()
      }
    }
  }

  /**
   * 更新样式
   */
  static withStyle(element: Element, styleUpdates: Partial<ElementStyle>): Element {
    return {
      ...element,
      style: { ...element.style, ...styleUpdates },
      metadata: {
        ...element.metadata,
        updatedAt: Date.now()
      }
    }
  }

  /**
   * 更新内容（图片或文字）
   */
  static withContent(element: Element, newContent: ImageContent | TextContent): Element {
    return {
      ...element,
      content: newContent,
      metadata: {
        ...element.metadata,
        updatedAt: Date.now()
      }
    }
  }

  /**
   * 更新元数据
   */
  static withMetadata(element: Element, metadataUpdates: Partial<ElementMetadata>): Element {
    return {
      ...element,
      metadata: {
        ...element.metadata,
        ...metadataUpdates,
        updatedAt: Date.now()
      }
    }
  }

  /**
   * 复制元素（生成新ID）
   */
  static clone(element: Element, newId: string): Element {
    return {
      ...element,
      id: newId,
      metadata: {
        ...element.metadata,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: `${element.metadata.name} 副本`
      }
    }
  }

  /**
   * 创建默认样式
   */
  private static createDefaultStyle(overrides?: Partial<ElementStyle>): ElementStyle {
    return {
      opacity: 1,
      borderWidth: 0,
      borderColor: '#000000',
      borderRadius: 0,
      shadow: {
        enabled: false,
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        color: '#000000'
      },
      backgroundColor: 'transparent',
      visible: true,
      ...overrides
    }
  }

  /**
   * 创建默认元数据
   */
  private static createDefaultMetadata(
    overrides?: Partial<ElementMetadata>,
    defaultName = '新元素'
  ): ElementMetadata {
    const now = Date.now()
    return {
      createdAt: now,
      updatedAt: now,
      name: defaultName,
      locked: false,
      tags: [],
      ...overrides
    }
  }
}

/**
 * Element工具方法
 */
export class ElementUtils {
  /**
   * 检查是否为图片元素
   */
  static isImage(element: Element): element is Element & { content: ImageContent } {
    return element.type === 'image'
  }

  /**
   * 检查是否为文字元素
   */
  static isText(element: Element): element is Element & { content: TextContent } {
    return element.type === 'text'
  }

  /**
   * 获取元素显示名称
   */
  static getDisplayName(element: Element): string {
    if (this.isImage(element)) {
      return element.content.file.name
    }
    if (this.isText(element)) {
      const text = element.content.text
      return text.length > 20 ? `${text.slice(0, 20)}...` : text
    }
    return element.metadata.name
  }

  /**
   * 计算元素内存占用（估算）
   */
  static estimateMemoryUsage(element: Element): number {
    if (this.isImage(element)) {
      const { imageData, thumbnail } = element.content
      return (
        imageData.width * imageData.height * 4 + // 主图 RGBA
        thumbnail.width * thumbnail.height * 4    // 缩略图 RGBA
      )
    }
    return element.content.text.length * 2 // 文字按字符估算
  }

  /**
   * 验证元素数据完整性
   */
  static validate(element: Element): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!element.id || element.id.trim() === '') {
      errors.push('元素ID不能为空')
    }

    if (!element.content) {
      errors.push('元素内容不能为空')
    }

    if (this.isImage(element)) {
      if (!element.content.imageData) {
        errors.push('图片元素缺少imageData')
      }
      if (!element.content.file) {
        errors.push('图片元素缺少原始文件')
      }
    }

    if (this.isText(element)) {
      if (!element.content.text || element.content.text.trim() === '') {
        errors.push('文字元素内容不能为空')
      }
      if (element.content.fontSize <= 0) {
        errors.push('字体大小必须大于0')
      }
    }

    if (element.style.opacity < 0 || element.style.opacity > 1) {
      errors.push('透明度必须在0-1范围内')
    }

    if (element.style.borderWidth < 0) {
      errors.push('边框宽度不能为负数')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * 常用元素预设
 */
export const ElementPresets = {
  /** 默认文字样式 */
  defaultTextStyle: (): Partial<ElementStyle> => ({
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4
  }),

  /** 强调文字样式 */
  highlightTextStyle: (): Partial<ElementStyle> => ({
    backgroundColor: '#ffeb3b',
    borderWidth: 2,
    borderColor: '#f57c00',
    borderRadius: 8,
    shadow: {
      enabled: true,
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: 'rgba(0,0,0,0.2)'
    }
  }),

  /** 图片阴影样式 */
  imageShadowStyle: (): Partial<ElementStyle> => ({
    shadow: {
      enabled: true,
      offsetX: 0,
      offsetY: 4,
      blur: 8,
      color: 'rgba(0,0,0,0.15)'
    },
    borderRadius: 4
  }),

  /** 标题文字内容 */
  titleText: (text = '标题'): TextContent => ({
    text,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 32,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 1.2
  }),

  /** 正文文字内容 */
  bodyText: (text = '正文内容'): TextContent => ({
    text,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 16,
    color: '#333333',
    textAlign: 'left',
    fontWeight: 'normal',
    lineHeight: 1.5
  })
} as const

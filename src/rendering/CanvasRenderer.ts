/**
 * Canvas渲染器
 * 
 * 基于demo的renderCanvas函数，实现完整的Canvas渲染逻辑
 */

import type { ImageElement, TextElement, CanvasState } from '@/core/models'
import type { LayoutResult, ComputedCell } from '@/layout/LayoutEngine'
import { i18n } from '@/i18n'

/**
 * 渲染选项
 */
export interface RenderOptions {
  /** Canvas上下文 */
  readonly ctx: CanvasRenderingContext2D
  
  /** 布局计算结果 */
  readonly layout: LayoutResult
  
  /** 图片列表 */
  readonly images: readonly ImageElement[]
  
  /** 文字列表 */
  readonly texts: readonly TextElement[]
  
  /** 画布状态 */
  readonly state: CanvasState
}

/**
 * 图片绘制信息
 */
interface ImageDrawInfo {
  /** 源X */
  sx: number
  /** 源Y */
  sy: number
  /** 源宽度 */
  sw: number
  /** 源高度 */
  sh: number
  /** 目标X */
  dx: number
  /** 目标Y */
  dy: number
  /** 目标宽度 */
  dw: number
  /** 目标高度 */
  dh: number
}

/**
 * Canvas渲染器
 */
export class CanvasRenderer {
  /** 背景图片缓存 */
  private static bgImageCache: Map<string, HTMLImageElement> = new Map()
  
  /**
   * 渲染完整画布
   */
  static async render(options: RenderOptions): Promise<void> {
    const { ctx, layout, images, texts, state } = options
    
    // 清空画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // 1. 绘制背景（可能是异步的）
    await this.renderBackground(ctx, state)
    
    // 2. 绘制图片网格
    this.renderImages(ctx, layout, images, state)
    
    // 3. 绘制文字
    this.renderTexts(ctx, texts, state)
  }
  
  /**
   * 绘制背景
   * 支持纯色和图片两种模式
   */
  private static async renderBackground(
    ctx: CanvasRenderingContext2D,
    state: CanvasState
  ): Promise<void> {
    const { background } = state
    const { width, height } = ctx.canvas
    
    ctx.save()
    
    if (background.type === 'color') {
      // 纯色背景
      ctx.globalAlpha = background.opacity / 100
      ctx.fillStyle = background.color
      ctx.fillRect(0, 0, width, height)
    } else if (background.type === 'image' && background.image) {
      // 图片背景
      try {
        const img = await this.loadBackgroundImage(background.image.url)
        const { opacity, blur, brightness, contrast } = background.image.effects
        
        // 应用效果
        ctx.globalAlpha = opacity / 100
        ctx.filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%)`
        
        // 拉伸填充模式
        ctx.drawImage(img, 0, 0, width, height)
        
        // 重置滤镜
        ctx.filter = 'none'
      } catch (error) {
        console.error('Background image loading failed:', error)
        // 降级：绘制纯色背景
        ctx.globalAlpha = background.opacity / 100
        ctx.fillStyle = background.color
        ctx.fillRect(0, 0, width, height)
      }
    }
    
    ctx.restore()
  }
  
  /**
   * 加载背景图片（带缓存）
   */
  private static loadBackgroundImage(url: string): Promise<HTMLImageElement> {
    // 检查缓存
    const cached = this.bgImageCache.get(url)
    if (cached && cached.complete) {
      return Promise.resolve(cached)
    }
    
    // 加载新图片
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.bgImageCache.set(url, img)
        resolve(img)
      }
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      img.src = url
    })
  }
  
  /**
   * 绘制图片网格
   * 参考demo中的图片绘制逻辑
   */
  private static renderImages(
    ctx: CanvasRenderingContext2D,
    layout: LayoutResult,
    images: readonly ImageElement[],
    state: CanvasState
  ): void {
    layout.cells.forEach((cell, index) => {
      // 检查该位置是否有图片（考虑稀疏数组的情况）
      const image = images[index]
      if (image && image !== null) {
        // 有图片，绘制图片
        this.renderImage(ctx, cell, image, state)
      } else {
        // 无图片（undefined或null），绘制占位框
        this.renderPlaceholder(ctx, cell, index, state)
      }
    })
  }
  
  /**
   * 绘制单张图片
   * 使用cover模式（保持比例，居中裁剪）
   */
  private static renderImage(
    ctx: CanvasRenderingContext2D,
    cell: ComputedCell,
    image: ImageElement,
    state: CanvasState
  ): void {
    const { layout, opacity } = state
    const { x, y, width, height } = cell
    const { transform } = image
    
    ctx.save()
    
    // 应用透明度（全局 * 图片）
    ctx.globalAlpha = (opacity.global / 100) * (opacity.image / 100)
    
    // 如果有圆角，先裁剪路径
    if (layout.radius > 0) {
      this.roundRect(ctx, x, y, width, height, layout.radius)
      ctx.clip()
    }
    
    // 应用图片变换（翻转和旋转）
    if (transform.rotation !== 0 || transform.flipH || transform.flipV) {
      // 移动到单元格中心
      ctx.translate(x + width / 2, y + height / 2)
      
      // 应用旋转
      if (transform.rotation !== 0) {
        ctx.rotate((transform.rotation * Math.PI) / 180)
      }
      
      // 应用翻转
      const scaleX = transform.flipH ? -1 : 1
      const scaleY = transform.flipV ? -1 : 1
      if (scaleX !== 1 || scaleY !== 1) {
        ctx.scale(scaleX, scaleY)
      }
      
      // 移回原点
      ctx.translate(-width / 2, -height / 2)
      
      // 根据适应模式计算绘制参数（相对于变换后的坐标系）
      const drawInfo = this.calculateDrawInfo(image, {
        ...cell,
        x: 0,
        y: 0
      })
      
      // 绘制图片
      if (drawInfo) {
        ctx.drawImage(
          image.image,
          drawInfo.sx,
          drawInfo.sy,
          drawInfo.sw,
          drawInfo.sh,
          drawInfo.dx,
          drawInfo.dy,
          drawInfo.dw,
          drawInfo.dh
        )
      }
    } else {
      // 无变换，根据适应模式绘制
      const drawInfo = this.calculateDrawInfo(image, cell)
      
      // 绘制图片
      if (drawInfo) {
        ctx.drawImage(
          image.image,
          drawInfo.sx,
          drawInfo.sy,
          drawInfo.sw,
          drawInfo.sh,
          drawInfo.dx,
          drawInfo.dy,
          drawInfo.dw,
          drawInfo.dh
        )
      }
    }
    
    ctx.restore()
  }
  
  /**
   * 根据适应模式计算绘制参数
   */
  private static calculateDrawInfo(
    image: ImageElement,
    cell: ComputedCell
  ): ImageDrawInfo | null {
    switch (image.fitMode) {
      case 'cover':
        return this.calculateCoverDraw(image, cell)
      case 'contain':
        return this.calculateContainDraw(image, cell)
      case 'fill':
        return this.calculateFillDraw(image, cell)
      default:
        return this.calculateContainDraw(image, cell)
    }
  }
  
  /**
   * 计算cover模式的绘制参数（裁剪填充）
   * 图片保持比例，填满单元格，超出部分裁剪
   */
  private static calculateCoverDraw(
    image: ImageElement,
    cell: ComputedCell
  ): ImageDrawInfo | null {
    const imgRatio = image.width / image.height
    const cellRatio = cell.width / cell.height
    
    if (imgRatio > cellRatio) {
      // 图片更宽，高度填满，宽度居中裁剪
      const scale = cell.height / image.height
      const scaledWidth = image.width * scale
      const offsetX = (scaledWidth - cell.width) / 2 / scale
      
      return {
        sx: offsetX,
        sy: 0,
        sw: image.width - offsetX * 2,
        sh: image.height,
        dx: cell.x,
        dy: cell.y,
        dw: cell.width,
        dh: cell.height
      }
    } else {
      // 图片更高，宽度填满，高度居中裁剪
      const scale = cell.width / image.width
      const scaledHeight = image.height * scale
      const offsetY = (scaledHeight - cell.height) / 2 / scale
      
      return {
        sx: 0,
        sy: offsetY,
        sw: image.width,
        sh: image.height - offsetY * 2,
        dx: cell.x,
        dy: cell.y,
        dw: cell.width,
        dh: cell.height
      }
    }
  }
  
  /**
   * 计算contain模式的绘制参数（完整显示）
   * 图片保持比例，完整显示在单元格内，不裁剪
   */
  private static calculateContainDraw(
    image: ImageElement,
    cell: ComputedCell
  ): ImageDrawInfo | null {
    const imgRatio = image.width / image.height
    const cellRatio = cell.width / cell.height
    
    if (imgRatio > cellRatio) {
      // 图片更宽，宽度填满，高度居中留白
      const scale = cell.width / image.width
      const scaledHeight = image.height * scale
      const offsetY = (cell.height - scaledHeight) / 2
      
      return {
        sx: 0,
        sy: 0,
        sw: image.width,
        sh: image.height,
        dx: cell.x,
        dy: cell.y + offsetY,
        dw: cell.width,
        dh: scaledHeight
      }
    } else {
      // 图片更高，高度填满，宽度居中留白
      const scale = cell.height / image.height
      const scaledWidth = image.width * scale
      const offsetX = (cell.width - scaledWidth) / 2
      
      return {
        sx: 0,
        sy: 0,
        sw: image.width,
        sh: image.height,
        dx: cell.x + offsetX,
        dy: cell.y,
        dw: scaledWidth,
        dh: cell.height
      }
    }
  }
  
  /**
   * 计算fill模式的绘制参数（拉伸填充）
   * 图片拉伸填满单元格，不保持比例
   */
  private static calculateFillDraw(
    image: ImageElement,
    cell: ComputedCell
  ): ImageDrawInfo | null {
    return {
      sx: 0,
      sy: 0,
      sw: image.width,
      sh: image.height,
      dx: cell.x,
      dy: cell.y,
      dw: cell.width,
      dh: cell.height
    }
  }
  
  /**
   * 绘制占位框
   * 参考demo中的占位框逻辑
   */
  private static renderPlaceholder(
    ctx: CanvasRenderingContext2D,
    cell: ComputedCell,
    index: number,
    state: CanvasState
  ): void {
    const { x, y, width, height } = cell
    const { radius } = state.layout
    
    ctx.save()
    
    // 绘制虚线边框
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    
    if (radius > 0) {
      this.roundRect(ctx, x + 1, y + 1, width - 2, height - 2, radius)
      ctx.stroke()
    } else {
      ctx.strokeRect(x + 1, y + 1, width - 2, height - 2)
    }
    
    ctx.setLineDash([])
    
    // 绘制提示文字
    ctx.fillStyle = '#999'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(i18n.global.t('canvas.emptySlotPosition', { position: index + 1 }), x + width / 2, y + height / 2 - 10)
    
    ctx.font = '12px Arial'
    ctx.fillText(i18n.global.t('canvas.emptySlotHint'), x + width / 2, y + height / 2 + 10)
    
    ctx.restore()
  }
  
  /**
   * 绘制所有文字
   */
  private static renderTexts(
    ctx: CanvasRenderingContext2D,
    texts: readonly TextElement[],
    state: CanvasState
  ): void {
    texts.forEach(text => {
      if (text.visible) {
        this.renderText(ctx, text, state)
      }
    })
  }
  
  /**
   * 绘制单个文字
   */
  private static renderText(
    ctx: CanvasRenderingContext2D,
    text: TextElement,
    state: CanvasState
  ): void {
    const { position, style, content } = text
    
    ctx.save()
    
    // 应用全局透明度
    ctx.globalAlpha = state.opacity.global / 100
    
    // 设置字体样式
    ctx.fillStyle = style.color
    ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
    ctx.textAlign = style.textAlign
    ctx.textBaseline = style.textBaseline
    
    // 绘制文字
    ctx.fillText(content, position.x, position.y)
    
    ctx.restore()
  }
  
  /**
   * 绘制圆角矩形路径
   * 参考demo中的roundRect函数
   */
  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
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
  }
  
  /**
   * 导出为DataURL
   */
  static toDataURL(
    canvas: HTMLCanvasElement,
    format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
    quality: number = 1.0
  ): string {
    return canvas.toDataURL(format, quality)
  }
  
  /**
   * 导出为Blob
   */
  static toBlob(
    canvas: HTMLCanvasElement,
    format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
    quality: number = 1.0
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, format, quality)
    })
  }
}

/**
 * 快捷渲染函数
 */
export function renderCanvas(options: RenderOptions): Promise<void> {
  return CanvasRenderer.render(options)
}


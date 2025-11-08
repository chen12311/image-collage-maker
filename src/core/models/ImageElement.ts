/**
 * 图片元素模型
 * 
 * 表示上传到画布的图片及其相关属性
 */

/**
 * 图片适应模式
 */
export type ImageFitMode = 'cover' | 'contain' | 'fill'

/**
 * 图片变换配置
 */
export interface ImageTransform {
  /** 水平翻转 */
  flipH: boolean
  
  /** 垂直翻转 */
  flipV: boolean
  
  /** 旋转角度 */
  rotation: 0 | 90 | 180 | 270
}

/**
 * 图片元素接口
 */
export interface ImageElement {
  /** 唯一标识 */
  readonly id: string
  
  /** 图片源（Data URL或Blob URL） */
  readonly src: string
  
  /** HTMLImageElement实例（用于Canvas绘制） */
  readonly image: HTMLImageElement
  
  /** 原始宽度 */
  readonly width: number
  
  /** 原始高度 */
  readonly height: number
  
  /** 文件名 */
  readonly fileName: string
  
  /** 文件大小（字节） */
  readonly fileSize: number
  
  /** 上传时间戳 */
  readonly timestamp: number
  
  /** 在布局中的索引位置 */
  index: number
  
  /** 图片变换状态 */
  transform: ImageTransform
  
  /** 图片适应模式 */
  fitMode: ImageFitMode
}

/**
 * 创建图片元素
 */
export async function createImageElement(
  file: File,
  index: number = 0
): Promise<ImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    reader.onload = (e) => {
      const src = e.target?.result as string
      const img = new Image()
      
      img.onload = () => {
        resolve({
          id,
          src,
          image: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          fileName: file.name,
          fileSize: file.size,
          timestamp: Date.now(),
          index,
          transform: {
            flipH: false,
            flipV: false,
            rotation: 0
          },
          fitMode: 'contain' // 默认使用 contain 模式，完整显示图片
        })
      }
      
      img.onerror = () => {
        reject(new Error(`图片加载失败: ${file.name}`))
      }
      
      img.src = src
    }
    
    reader.onerror = () => {
      reject(new Error(`文件读取失败: ${file.name}`))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 批量创建图片元素
 */
export async function createImageElements(files: File[]): Promise<ImageElement[]> {
  const promises = files.map((file, index) => createImageElement(file, index))
  return Promise.all(promises)
}

/**
 * 计算图片比例
 */
export function getImageAspectRatio(element: ImageElement): number {
  return element.width / element.height
}


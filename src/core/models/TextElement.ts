/**
 * 文字元素模型
 * 
 * 表示添加到画布上的文字及其样式
 */

/**
 * 文字元素接口
 */
export interface TextElement {
  /** 唯一标识 */
  readonly id: string
  
  /** 文字内容 */
  content: string
  
  /** 位置 - 相对于画布的绝对坐标 */
  position: {
    x: number
    y: number
  }
  
  /** 样式 */
  style: {
    /** 字体大小（像素） */
    fontSize: number
    
    /** 字体系列 */
    fontFamily: string
    
    /** 文字颜色 */
    color: string
    
    /** 字体粗细 */
    fontWeight: 'normal' | 'bold'
    
    /** 文字对齐 */
    textAlign: 'left' | 'center' | 'right'
    
    /** 垂直对齐 */
    textBaseline: 'top' | 'middle' | 'bottom'
  }
  
  /** 是否可见 */
  visible: boolean
  
  /** 是否被选中（用于编辑） */
  selected: boolean
  
  /** 创建时间戳 */
  readonly timestamp: number
}

/**
 * 默认文字样式
 */
export const DEFAULT_TEXT_STYLE: TextElement['style'] = {
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  color: '#000000',
  fontWeight: 'normal',
  textAlign: 'center',
  textBaseline: 'middle'
}

/**
 * 创建文字元素
 */
export function createTextElement(
  content: string,
  x: number,
  y: number,
  style?: Partial<TextElement['style']>
): TextElement {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    position: { x, y },
    style: {
      ...DEFAULT_TEXT_STYLE,
      ...style
    },
    visible: true,
    selected: false,
    timestamp: Date.now()
  }
}

/**
 * 克隆文字元素
 */
export function cloneTextElement(element: TextElement): TextElement {
  return {
    ...element,
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    position: { ...element.position },
    style: { ...element.style }
  }
}

/**
 * 更新文字元素位置
 */
export function updateTextPosition(
  element: TextElement,
  x: number,
  y: number
): TextElement {
  return {
    ...element,
    position: { x, y }
  }
}

/**
 * 更新文字元素样式
 */
export function updateTextStyle(
  element: TextElement,
  style: Partial<TextElement['style']>
): TextElement {
  return {
    ...element,
    style: {
      ...element.style,
      ...style
    }
  }
}


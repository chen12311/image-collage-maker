/**
 * 核心数据模型入口文件
 * 
 * 导出所有核心接口和类，提供统一的数据模型API
 */

// 网格配置相关
export type {
  GridConfig,
  GridCoord,
  PixelCoord,
  Size,
  LayoutMode
} from './GridConfig'

export { 
  GridConfigBuilder,
  detectLayoutMode
} from './GridConfig'

// 变换相关
export type { Transform } from './Transform'

export { 
  TransformBuilder,
  TransformPresets
} from './Transform'

// 元素相关
export type {
  Element,
  ElementType,
  ImageContent,
  TextContent,
  ElementStyle,
  ElementMetadata
} from './Element'

export {
  ElementBuilder,
  ElementUtils,
  ElementPresets
} from './Element'

# ImageBatch - 在线图片拼接工具 - Design Document

## Overview

### 设计哲学 (Design Philosophy - "好品味"原则)

**"Bad programmers worry about the code. Good programmers worry about data structures."**

ImageBatch 的设计完全围绕一个核心洞察：**所有拼接模式都是网格布局的特殊情况**。

- **横向拼接** = 1×N 网格
- **纵向拼接** = N×1 网格  
- **网格拼接** = M×N 网格

通过这种统一抽象，我们消除了所有特殊情况处理，代码变得简洁优雅。

### 核心设计原则

1. **统一元素模型**：图片和文字使用相同的变换接口
2. **网格坐标系统**：用逻辑坐标替代像素计算，简化布局算法
3. **管道式渲染**：文件→解析→布局→渲染→导出，清晰的数据流
4. **零特殊情况**：没有 if/else 分支处理不同拼接模式
5. **实用主义**：优先解决用户真实需求，避免过度工程化

### 技术选型理由

- **Vue 3 + TypeScript**：类型安全 + 组合式API，代码可维护性高
- **Canvas + OffscreenCanvas**：高性能渲染，不阻塞UI线程
- **零重依赖**：除Vue外不引入第三方库，保持代码可控
- **Web Worker**：图片处理在后台线程，保证UI响应性

## Architecture

### 分层架构 (Layered Architecture - 简洁但不简单)

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer (Vue)                    │  
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ FileUpload  │ │ GridPreview │ │ ExportPanel │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
├─────────────────────────────────────────────────────┤
│                Layout Engine (网格引擎)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │  
│  │ GridLayout  │ │ Element     │ │ Transform   │     │
│  │ Manager     │ │ Manager     │ │ Calculator  │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
├─────────────────────────────────────────────────────┤
│              Rendering Pipeline (Canvas)            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Image       │ │ Canvas      │ │ Export      │     │
│  │ Processor   │ │ Renderer    │ │ Manager     │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
├─────────────────────────────────────────────────────┤
│                Data Layer (数据层)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Element     │ │ Grid        │ │ Canvas      │     │  
│  │ Store       │ │ State       │ │ State       │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 核心组件设计 (Core Components)

**1. GridLayoutManager (网格布局管理器)**
- **职责**：统一处理所有布局模式，消除特殊情况
- **输入**：元素数组 + 布局配置
- **输出**：网格坐标 + 像素位置
- **核心算法**：网格映射函数，O(1)复杂度

**2. ElementManager (元素管理器)**  
- **职责**：统一管理图片和文字元素
- **特色**：使用相同的Transform接口，零类型判断
- **操作**：添加、删除、排序、变换

**3. CanvasRenderer (Canvas渲染器)**
- **职责**：高性能图像渲染和导出
- **技术**：OffscreenCanvas + Web Worker
- **优化**：分片渲染、内存池、缓存策略

**4. ImageProcessor (图片处理器)**
- **职责**：文件解析、格式转换、大小调整
- **边界处理**：文件验证、内存限制、错误恢复
- **性能**：流式处理、压缩算法

### 数据流设计 (Data Flow - 单向流动)

```
用户操作 → State变更 → Layout计算 → Canvas渲染 → UI更新
    ↓
  文件上传 → 图片解析 → 元素创建 → 网格布局 → 实时预览
    ↓  
  参数调整 → Layout重算 → 增量渲染 → 预览更新
    ↓
  导出操作 → 全量渲染 → 图片生成 → 文件下载
```

## Components and Interfaces

### 核心接口定义 (Interface Design - "好品味"体现)

#### 1. 统一元素接口 (Element Interface)
```typescript
// 统一元素模型 - 消除图片/文字特殊情况
interface Element {
  readonly id: string
  readonly type: 'image' | 'text'
  content: ImageContent | TextContent
  transform: Transform
  style: ElementStyle
}

interface Transform {
  readonly gridX: number      // 网格坐标，不是像素
  readonly gridY: number  
  readonly gridWidth: number  // 占用网格单元数
  readonly gridHeight: number
  rotation: number           // 弧度值
}

interface ElementStyle {
  opacity: number           // 0-1
  borderWidth: number      // 像素值
  borderColor: string      // CSS颜色
  borderRadius: number     // 像素值
}
```

#### 2. 网格布局引擎 (Grid Layout Engine)
```typescript
interface GridLayoutManager {
  // 核心方法 - 零特殊情况处理
  layout(elements: Element[], config: GridConfig): LayoutResult
  
  // 工具方法 - 坐标转换
  gridToPixel(gridCoord: GridCoord, config: GridConfig): PixelCoord
  pixelToGrid(pixelCoord: PixelCoord, config: GridConfig): GridCoord
  
  // 布局验证
  validateLayout(elements: Element[], config: GridConfig): ValidationResult
}

interface GridConfig {
  readonly rows: number
  readonly cols: number  
  readonly cellWidth: number   // 单元格宽度(px)
  readonly cellHeight: number  // 单元格高度(px)
  readonly spacing: number     // 间距(px)
}

interface LayoutResult {
  readonly elements: PositionedElement[]
  readonly canvasSize: { width: number, height: number }
  readonly metadata: LayoutMetadata
}
```

#### 3. Canvas渲染管道 (Rendering Pipeline)
```typescript
interface CanvasRenderer {
  // 主渲染方法 - 简洁接口
  render(layout: LayoutResult, options: RenderOptions): Promise<CanvasImageData>
  
  // 预览渲染 - 低质量快速渲染
  renderPreview(layout: LayoutResult, maxSize: number): Promise<CanvasImageData>
  
  // 导出渲染 - 高质量完整渲染  
  renderExport(layout: LayoutResult, format: ExportFormat): Promise<Blob>
}

interface RenderOptions {
  readonly quality: 'preview' | 'export'
  readonly maxWidth: number
  readonly maxHeight: number
  readonly backgroundColor: string
  readonly useWebWorker: boolean
}

interface ExportFormat {
  readonly type: 'png' | 'jpeg'
  readonly quality: number  // 0-1, 仅用于JPEG
  readonly compression: boolean
}
```

#### 4. 图片处理接口 (Image Processing)
```typescript
interface ImageProcessor {
  // 文件处理 - 统一接口
  processFile(file: File): Promise<ProcessResult>
  
  // 批量处理
  processFiles(files: File[]): Promise<ProcessResult[]>
  
  // 图片变换
  transform(imageData: ImageData, transform: Transform): Promise<ImageData>
}

interface ProcessResult {
  readonly element: Element | null
  readonly error: ProcessError | null
  readonly metadata: ImageMetadata
}

interface ImageMetadata {
  readonly originalSize: { width: number, height: number }
  readonly fileSize: number
  readonly format: string
  readonly isCompressed: boolean
}
```

### Vue组件接口 (Vue Component Interfaces)

#### 1. 主应用组件
```typescript
// App.vue - 最小状态管理
interface AppState {
  elements: Element[]
  gridConfig: GridConfig
  renderOptions: RenderOptions
  uiState: UIState
}

interface UIState {
  readonly isProcessing: boolean
  readonly currentTool: 'upload' | 'layout' | 'export'
  readonly previewMode: boolean
}
```

#### 2. 核心组件
```typescript
// FileUpload.vue
interface FileUploadProps {
  accept: string[]
  multiple: boolean
  maxFiles: number
}

interface FileUploadEmits {
  filesSelected: (files: File[]) => void
  filesProcessed: (elements: Element[]) => void
}

// GridPreview.vue
interface GridPreviewProps {
  elements: Element[]
  gridConfig: GridConfig
  interactive: boolean
}

interface GridPreviewEmits {
  elementMoved: (elementId: string, newTransform: Transform) => void
  layoutChanged: (newConfig: GridConfig) => void
}

// ExportPanel.vue
interface ExportPanelProps {
  layout: LayoutResult
  formats: ExportFormat[]
}

interface ExportPanelEmits {
  export: (format: ExportFormat) => void
  previewRequested: () => void
}
```

## Data Models

### 核心数据模型 (Core Data Models - 数据结构优先)

#### 1. 统一元素数据模型
```typescript
// 基础元素类型 - 不可变数据结构
class Element {
  constructor(
    public readonly id: string,
    public readonly type: 'image' | 'text',
    public readonly content: ImageContent | TextContent,
    public readonly transform: Transform,
    public readonly style: ElementStyle,
    public readonly metadata: ElementMetadata
  ) {}
  
  // 不可变更新方法
  withTransform(newTransform: Partial<Transform>): Element {
    return new Element(
      this.id,
      this.type, 
      this.content,
      { ...this.transform, ...newTransform },
      this.style,
      this.metadata
    )
  }
  
  withStyle(newStyle: Partial<ElementStyle>): Element {
    return new Element(
      this.id,
      this.type,
      this.content, 
      this.transform,
      { ...this.style, ...newStyle },
      this.metadata
    )
  }
}

// 图片内容数据
interface ImageContent {
  readonly imageData: ImageData
  readonly originalFile: File
  readonly thumbnail: ImageData  // 预览用小图
}

// 文字内容数据  
interface TextContent {
  readonly text: string
  readonly fontFamily: string
  readonly fontSize: number
  readonly color: string
  readonly alignment: 'left' | 'center' | 'right'
}
```

#### 2. 网格系统数学模型
```typescript
// 网格坐标系统 - 核心算法
class GridSystem {
  constructor(
    public readonly rows: number,
    public readonly cols: number,
    public readonly cellWidth: number,
    public readonly cellHeight: number,
    public readonly spacing: number
  ) {}
  
  // 网格坐标到像素坐标 - O(1)算法
  gridToPixel(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * (this.cellWidth + this.spacing),
      y: gridY * (this.cellHeight + this.spacing)
    }
  }
  
  // 像素坐标到网格坐标
  pixelToGrid(pixelX: number, pixelY: number): { gridX: number, gridY: number } {
    return {
      gridX: Math.floor(pixelX / (this.cellWidth + this.spacing)),
      gridY: Math.floor(pixelY / (this.cellHeight + this.spacing))
    }
  }
  
  // 计算元素实际像素尺寸
  calculateElementSize(gridWidth: number, gridHeight: number): { width: number, height: number } {
    return {
      width: gridWidth * this.cellWidth + (gridWidth - 1) * this.spacing,
      height: gridHeight * this.cellHeight + (gridHeight - 1) * this.spacing
    }
  }
  
  // 计算总画布尺寸
  calculateCanvasSize(): { width: number, height: number } {
    return {
      width: this.cols * this.cellWidth + (this.cols - 1) * this.spacing,
      height: this.rows * this.cellHeight + (this.rows - 1) * this.spacing
    }
  }
}
```

#### 3. 布局引擎核心算法
```typescript
// 布局引擎 - 零特殊情况处理
class LayoutEngine {
  private gridSystem: GridSystem
  
  constructor(gridConfig: GridConfig) {
    this.gridSystem = new GridSystem(
      gridConfig.rows,
      gridConfig.cols, 
      gridConfig.cellWidth,
      gridConfig.cellHeight,
      gridConfig.spacing
    )
  }
  
  // 主布局算法 - 统一处理所有模式
  layout(elements: Element[]): LayoutResult {
    const positionedElements: PositionedElement[] = []
    
    // 自动布局算法：贪心策略填充网格
    let currentRow = 0
    let currentCol = 0
    
    for (const element of elements) {
      // 计算元素位置
      const pixelPos = this.gridSystem.gridToPixel(currentCol, currentRow)
      const pixelSize = this.gridSystem.calculateElementSize(
        element.transform.gridWidth,
        element.transform.gridHeight
      )
      
      const positionedElement: PositionedElement = {
        element,
        pixelPosition: pixelPos,
        pixelSize: pixelSize,
        renderOrder: positionedElements.length
      }
      
      positionedElements.push(positionedElement)
      
      // 更新网格位置 - 简单的行优先策略
      currentCol += element.transform.gridWidth
      if (currentCol >= this.gridSystem.cols) {
        currentCol = 0
        currentRow += element.transform.gridHeight
      }
    }
    
    return {
      elements: positionedElements,
      canvasSize: this.gridSystem.calculateCanvasSize(),
      metadata: {
        gridSystem: this.gridSystem,
        totalElements: elements.length,
        layoutMode: this.detectLayoutMode()
      }
    }
  }
  
  // 自动检测布局模式 - 统一算法的副产品
  private detectLayoutMode(): 'horizontal' | 'vertical' | 'grid' {
    if (this.gridSystem.rows === 1) return 'horizontal'
    if (this.gridSystem.cols === 1) return 'vertical'
    return 'grid'
  }
}
```

#### 4. 状态管理模型
```typescript
// 应用状态 - 使用Vue的响应式系统
interface AppStore {
  // 核心数据
  readonly elements: Ref<Element[]>
  readonly gridConfig: Ref<GridConfig>
  readonly canvasState: Ref<CanvasState>
  
  // UI状态
  readonly uiState: Ref<UIState>
  readonly errorState: Ref<ErrorState>
  
  // 计算属性
  readonly layout: ComputedRef<LayoutResult>
  readonly canExport: ComputedRef<boolean>
  readonly memoryUsage: ComputedRef<number>
}

// Canvas状态模型
interface CanvasState {
  readonly previewImage: ImageData | null
  readonly exportImage: Blob | null
  readonly isRendering: boolean
  readonly renderProgress: number  // 0-1
}

// 错误状态模型
interface ErrorState {
  readonly fileErrors: FileError[]
  readonly renderErrors: RenderError[]
  readonly systemErrors: SystemError[]
}

interface FileError {
  readonly fileId: string
  readonly fileName: string
  readonly errorType: 'size_limit' | 'format_unsupported' | 'corrupted'
  readonly message: string
  readonly timestamp: number
}
```

#### 5. 性能优化数据结构
```typescript
// 内存池 - 减少GC压力
class ImageDataPool {
  private pool: Map<string, ImageData[]> = new Map()
  
  acquire(width: number, height: number): ImageData {
    const key = `${width}x${height}`
    const poolArray = this.pool.get(key) || []
    
    if (poolArray.length > 0) {
      return poolArray.pop()!
    }
    
    return new ImageData(width, height)
  }
  
  release(imageData: ImageData): void {
    const key = `${imageData.width}x${imageData.height}`
    const poolArray = this.pool.get(key) || []
    
    if (poolArray.length < 10) {  // 限制池大小
      poolArray.push(imageData)
      this.pool.set(key, poolArray)
    }
  }
}

// 缓存系统 - LRU策略
class RenderCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 50
  
  get(key: string): ImageData | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // 更新访问时间
    entry.lastAccessed = Date.now()
    return entry.imageData
  }
  
  set(key: string, imageData: ImageData): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }
    
    this.cache.set(key, {
      imageData,
      lastAccessed: Date.now(),
      size: imageData.width * imageData.height * 4  // RGBA
    })
  }
  
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

interface CacheEntry {
  imageData: ImageData
  lastAccessed: number
  size: number
}
```

## Error Handling

### 错误处理策略 (Error Handling - "简单可靠"原则)

#### 1. 分层错误处理 (Layered Error Handling)

**文件处理层错误**
```typescript
// 文件处理错误 - 宽容策略
class FileProcessor {
  async processFiles(files: File[]): Promise<ProcessResult[]> {
    const results: ProcessResult[] = []
    
    for (const file of files) {
      try {
        const element = await this.processFile(file)
        results.push({ element, error: null, metadata: element.metadata })
      } catch (error) {
        // 单个文件错误不影响其他文件
        const fileError = this.createFileError(file, error)
        results.push({ element: null, error: fileError, metadata: null })
        
        // 记录但不中断处理
        console.warn(`文件处理失败: ${file.name}`, error)
      }
    }
    
    return results
  }
  
  private createFileError(file: File, error: unknown): FileError {
    if (file.size > 50 * 1024 * 1024) {
      return {
        type: 'size_limit',
        message: `文件 ${file.name} 大小超过50MB限制`,
        canRetry: false,
        suggestion: '请压缩图片后重试'
      }
    }
    
    if (!this.isSupportedFormat(file.type)) {
      return {
        type: 'format_unsupported', 
        message: `不支持的文件格式: ${file.type}`,
        canRetry: false,
        suggestion: '请使用JPG、PNG或WebP格式'
      }
    }
    
    return {
      type: 'unknown',
      message: '文件处理失败',
      canRetry: true,
      suggestion: '请重试或联系技术支持'
    }
  }
}
```

**渲染层错误处理**
```typescript
// Canvas渲染错误 - 降级策略
class CanvasRenderer {
  async render(layout: LayoutResult, options: RenderOptions): Promise<RenderResult> {
    try {
      // 首先尝试高质量渲染
      return await this.renderHighQuality(layout, options)
    } catch (error) {
      console.warn('高质量渲染失败，尝试降级渲染', error)
      
      try {
        // 降级到中等质量
        return await this.renderMediumQuality(layout, options)
      } catch (fallbackError) {
        console.warn('中等质量渲染失败，使用基础渲染', fallbackError)
        
        // 最后降级到基础渲染
        return await this.renderBasicQuality(layout, options)
      }
    }
  }
  
  private async renderHighQuality(layout: LayoutResult, options: RenderOptions): Promise<RenderResult> {
    // 使用OffscreenCanvas + Web Worker
    if (!this.supportsOffscreenCanvas()) {
      throw new Error('OffscreenCanvas not supported')
    }
    // 高质量渲染逻辑...
  }
  
  private async renderMediumQuality(layout: LayoutResult, options: RenderOptions): Promise<RenderResult> {
    // 使用主线程Canvas，降低分辨率
    const scaleFactor = 0.75
    // 中等质量渲染逻辑...
  }
  
  private async renderBasicQuality(layout: LayoutResult, options: RenderOptions): Promise<RenderResult> {
    // 最基础的Canvas渲染，确保一定成功
    const scaleFactor = 0.5
    // 基础渲染逻辑...
  }
}
```

#### 2. 内存管理错误处理
```typescript
// 内存监控和自动降级
class MemoryManager {
  private memoryThreshold = 0.8  // 80%内存使用率阈值
  
  checkMemoryUsage(): MemoryStatus {
    // @ts-ignore - 实验性API
    if (performance.memory) {
      // @ts-ignore
      const used = performance.memory.usedJSHeapSize
      // @ts-ignore  
      const total = performance.memory.totalJSHeapSize
      const usage = used / total
      
      return {
        usage,
        status: usage > this.memoryThreshold ? 'high' : 'normal',
        recommendation: this.getMemoryRecommendation(usage)
      }
    }
    
    return { usage: 0, status: 'unknown', recommendation: null }
  }
  
  private getMemoryRecommendation(usage: number): string | null {
    if (usage > 0.9) {
      return '内存使用率过高，建议减少图片数量或降低图片质量'
    }
    if (usage > 0.8) {
      return '内存使用率较高，将自动压缩图片以保证性能'
    }
    return null
  }
  
  // 自动垃圾回收触发
  async performMemoryCleanup(): Promise<void> {
    // 清理缓存
    this.renderCache.clear()
    this.imageDataPool.clear()
    
    // 强制垃圾回收（如果可用）
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc()
    }
  }
}
```

#### 3. 用户友好的错误提示
```typescript
// 错误展示组件
interface ErrorDisplayProps {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
}

// 错误分类和用户消息
class ErrorMessageGenerator {
  static getUserMessage(error: AppError): UserMessage {
    switch (error.type) {
      case 'file_too_large':
        return {
          title: '文件过大',
          message: '图片文件超过50MB限制，请压缩后重试',
          severity: 'warning',
          actions: ['重新选择文件', '了解压缩方法']
        }
        
      case 'memory_limit':
        return {
          title: '内存不足',
          message: '设备内存不足，已自动降低图片质量',
          severity: 'info', 
          actions: ['继续使用', '减少图片数量']
        }
        
      case 'render_timeout':
        return {
          title: '处理超时',
          message: '图片处理时间过长，请减少图片数量或尺寸',
          severity: 'error',
          actions: ['重试', '调整设置']
        }
        
      default:
        return {
          title: '操作失败',
          message: '发生未知错误，请重试',
          severity: 'error',
          actions: ['重试', '刷新页面']
        }
    }
  }
}
```

#### 4. 系统恢复策略
```typescript
// 自动恢复机制
class SystemRecovery {
  private maxRetryAttempts = 3
  private retryDelay = 1000  // 1秒
  
  async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.maxRetryAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`${context} 失败 (尝试 ${attempt}/${this.maxRetryAttempts})`, error)
        
        if (attempt < this.maxRetryAttempts) {
          await this.delay(this.retryDelay * attempt)  // 指数退避
        }
      }
    }
    
    throw new Error(`${context} 重试${this.maxRetryAttempts}次后仍然失败: ${lastError.message}`)
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 状态一致性检查
class StateValidator {
  validateAppState(state: AppState): ValidationResult {
    const errors: string[] = []
    
    // 检查元素数据完整性
    for (const element of state.elements) {
      if (!element.id || !element.content) {
        errors.push(`元素 ${element.id} 数据不完整`)
      }
    }
    
    // 检查网格配置合理性
    if (state.gridConfig.rows <= 0 || state.gridConfig.cols <= 0) {
      errors.push('网格配置无效')
    }
    
    // 检查内存使用情况
    const memoryStatus = this.memoryManager.checkMemoryUsage()
    if (memoryStatus.status === 'high') {
      errors.push('内存使用率过高，可能影响性能')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: memoryStatus.recommendation ? [memoryStatus.recommendation] : []
    }
  }
}
```

## Testing Strategy

### 测试策略 (Testing Strategy - "测试关键算法，不追求覆盖率")

#### 1. 核心算法单元测试 (Core Algorithm Tests)

**网格系统数学函数测试**
```typescript
// 测试最重要的算法 - 网格坐标转换
describe('GridSystem', () => {
  const grid = new GridSystem(3, 4, 100, 100, 20)
  
  test('网格坐标到像素坐标转换', () => {
    // 测试边界情况
    expect(grid.gridToPixel(0, 0)).toEqual({ x: 0, y: 0 })
    expect(grid.gridToPixel(1, 0)).toEqual({ x: 120, y: 0 })  // 100 + 20 spacing
    expect(grid.gridToPixel(0, 1)).toEqual({ x: 0, y: 120 })
    expect(grid.gridToPixel(3, 2)).toEqual({ x: 360, y: 240 })
  })
  
  test('像素坐标到网格坐标转换', () => {
    // 确保往返转换一致性
    const testCases = [
      { gridX: 0, gridY: 0 },
      { gridX: 1, gridY: 1 }, 
      { gridX: 3, gridY: 2 }
    ]
    
    testCases.forEach(({ gridX, gridY }) => {
      const pixel = grid.gridToPixel(gridX, gridY)
      const backToGrid = grid.pixelToGrid(pixel.x, pixel.y)
      expect(backToGrid).toEqual({ gridX, gridY })
    })
  })
  
  test('画布尺寸计算', () => {
    // 3x4网格，单元100x100，间距20
    // 宽度: 4*100 + 3*20 = 460
    // 高度: 3*100 + 2*20 = 340
    expect(grid.calculateCanvasSize()).toEqual({ 
      width: 460, 
      height: 340 
    })
  })
})
```

**布局引擎核心逻辑测试**
```typescript
describe('LayoutEngine', () => {
  test('横向布局 (1×N网格)', () => {
    const config = { rows: 1, cols: 3, cellWidth: 100, cellHeight: 100, spacing: 10 }
    const engine = new LayoutEngine(config)
    
    const elements = [
      createMockElement('1', { gridWidth: 1, gridHeight: 1 }),
      createMockElement('2', { gridWidth: 1, gridHeight: 1 }),
      createMockElement('3', { gridWidth: 1, gridHeight: 1 })
    ]
    
    const result = engine.layout(elements)
    
    // 验证所有元素在同一行
    expect(result.elements.every(e => e.pixelPosition.y === 0)).toBe(true)
    
    // 验证间距正确
    expect(result.elements[1].pixelPosition.x).toBe(110)  // 100 + 10
    expect(result.elements[2].pixelPosition.x).toBe(220)  // 200 + 20
  })
  
  test('纵向布局 (N×1网格)', () => {
    const config = { rows: 3, cols: 1, cellWidth: 100, cellHeight: 100, spacing: 10 }
    const engine = new LayoutEngine(config)
    
    const elements = [
      createMockElement('1', { gridWidth: 1, gridHeight: 1 }),
      createMockElement('2', { gridWidth: 1, gridHeight: 1 })
    ]
    
    const result = engine.layout(elements)
    
    // 验证所有元素在同一列
    expect(result.elements.every(e => e.pixelPosition.x === 0)).toBe(true)
    
    // 验证垂直间距
    expect(result.elements[1].pixelPosition.y).toBe(110)
  })
  
  test('网格布局模式检测', () => {
    // 测试布局模式自动检测逻辑
    expect(new LayoutEngine({ rows: 1, cols: 5 }).detectLayoutMode()).toBe('horizontal')
    expect(new LayoutEngine({ rows: 5, cols: 1 }).detectLayoutMode()).toBe('vertical')
    expect(new LayoutEngine({ rows: 3, cols: 3 }).detectLayoutMode()).toBe('grid')
  })
})
```

#### 2. 边界情况测试 (Edge Case Tests)

**文件处理边界测试**
```typescript
describe('FileProcessor边界情况', () => {
  test('超大文件处理', async () => {
    const largeMockFile = createMockFile('large.jpg', 60 * 1024 * 1024)  // 60MB
    const processor = new FileProcessor()
    
    const results = await processor.processFiles([largeMockFile])
    
    expect(results[0].element).toBeNull()
    expect(results[0].error?.type).toBe('size_limit')
    expect(results[0].error?.canRetry).toBe(false)
  })
  
  test('损坏文件处理', async () => {
    const corruptedFile = createCorruptedImageFile()
    const processor = new FileProcessor()
    
    const results = await processor.processFiles([corruptedFile])
    
    expect(results[0].element).toBeNull()
    expect(results[0].error?.type).toBe('corrupted')
  })
  
  test('混合文件批处理', async () => {
    const files = [
      createMockFile('good.jpg', 1024),      // 正常文件
      createMockFile('large.jpg', 60 * 1024 * 1024),  // 过大文件  
      createMockFile('good2.png', 2048)      // 正常文件
    ]
    
    const results = await processor.processFiles(files)
    
    // 确保一个文件失败不影响其他文件
    expect(results[0].element).not.toBeNull()  // 第一个成功
    expect(results[1].element).toBeNull()       // 第二个失败
    expect(results[2].element).not.toBeNull()  // 第三个成功
  })
})
```

**内存限制测试**
```typescript
describe('内存管理', () => {
  test('内存使用率监控', () => {
    const memoryManager = new MemoryManager()
    
    // 模拟高内存使用
    jest.spyOn(performance, 'memory', 'get').mockReturnValue({
      usedJSHeapSize: 90 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024
    })
    
    const status = memoryManager.checkMemoryUsage()
    
    expect(status.status).toBe('high')
    expect(status.recommendation).toContain('内存使用率过高')
  })
})
```

#### 3. 性能基准测试 (Performance Tests)

```typescript
describe('性能基准测试', () => {
  test('10张1MB图片处理性能', async () => {
    const files = Array.from({ length: 10 }, (_, i) => 
      createMockFile(`image${i}.jpg`, 1024 * 1024)
    )
    
    const startTime = performance.now()
    const results = await processor.processFiles(files)
    const endTime = performance.now()
    
    const processingTime = endTime - startTime
    
    // 需求：10张1MB图片处理时间 < 5秒  
    expect(processingTime).toBeLessThan(5000)
    expect(results.filter(r => r.element).length).toBe(10)
  })
  
  test('大分辨率图片渲染性能', async () => {
    const layout = createMockLayout(2000, 3000)  // 2K×3K分辨率
    const renderer = new CanvasRenderer()
    
    const startTime = performance.now()
    await renderer.renderExport(layout, { type: 'png', quality: 1 })
    const endTime = performance.now()
    
    // 需求：2000px宽度图片导出时间 < 3秒
    expect(endTime - startTime).toBeLessThan(3000)
  })
})
```

#### 4. 集成测试关键路径 (Integration Tests)

```typescript
describe('完整用户流程', () => {
  test('图片上传→布局→导出完整流程', async () => {
    const app = new App()
    
    // 1. 上传文件
    const files = [
      createMockFile('img1.jpg', 1024),
      createMockFile('img2.jpg', 1024)
    ]
    
    await app.uploadFiles(files)
    expect(app.elements.length).toBe(2)
    
    // 2. 设置布局
    app.setGridConfig({ rows: 1, cols: 2, cellWidth: 200, cellHeight: 200, spacing: 10 })
    
    // 3. 导出
    const exportBlob = await app.exportImage({ type: 'png', quality: 1 })
    
    expect(exportBlob).toBeInstanceOf(Blob)
    expect(exportBlob.type).toBe('image/png')
  })
})
```

#### 5. 手动测试清单 (Manual Testing Checklist)

**基础功能验证**
- [ ] 文件拖拽上传工作正常
- [ ] 文件点击选择工作正常  
- [ ] 图片预览显示正确
- [ ] 布局切换（横向/纵向/网格）工作正常
- [ ] 间距调节滑块响应正确
- [ ] 导出PNG格式功能正常
- [ ] 导出JPG格式功能正常

**边界情况验证**
- [ ] 上传超大文件显示错误提示
- [ ] 上传非图片文件显示错误提示
- [ ] 设备内存不足时自动降级处理
- [ ] 网络断开后离线功能正常
- [ ] 浏览器标签页切换后状态保持

**性能验证**
- [ ] 10张图片同时上传不卡顿
- [ ] 实时预览拖拽排序流畅(60FPS)
- [ ] 大图导出过程显示进度
- [ ] 移动端触摸操作响应及时

**兼容性验证**  
- [ ] Chrome浏览器功能完整
- [ ] Safari浏览器功能完整
- [ ] Firefox浏览器功能完整
- [ ] 移动端Safari功能正常
- [ ] 移动端Chrome功能正常

#### 6. 测试自动化配置

```typescript
// Jest配置 - 专注核心算法
module.exports = {
  testMatch: [
    '**/tests/unit/**/*.test.ts',      // 单元测试
    '**/tests/integration/**/*.test.ts' // 集成测试
  ],
  collectCoverageFrom: [
    'src/core/**/*.ts',     // 只统计核心算法覆盖率
    'src/layout/**/*.ts',   // 布局引擎覆盖率
    '!src/**/*.d.ts',
    '!src/ui/**/*.ts'       // UI组件不强制覆盖率
  ],
  coverageThreshold: {
    global: {
      branches: 80,         // 分支覆盖率80%即可
      functions: 85,        // 函数覆盖率85%
      lines: 80,           // 行覆盖率80%
      statements: 80       // 语句覆盖率80%
    }
  }
}
```

### 测试哲学总结

**"测试核心算法，忽略琐碎细节"**
- 重点测试网格系统、布局引擎等核心数学算法
- 重点测试边界情况和错误处理逻辑
- 重点测试性能关键路径
- 不为UI组件的细枝末节写过多测试
- 用手动测试覆盖用户体验相关的测试

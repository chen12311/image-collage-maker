# ImageProcessor - 图片变换处理器

## Linus哲学体现

> "好品味就是能够分辨什么时候代码是错误的" - Linus Torvalds

ImageProcessor实现了以下Linus核心原则：

1. **Transform Pipeline** - 统一接口消除特殊情况
2. **OffscreenCanvas** - 内存安全的高性能处理 
3. **Zero if/else** - 所有变换都走同一个管道
4. **实用主义** - 解决真实的图片处理需求

## 核心特性

- ✅ **统一Transform接口** - 消除图片/文字特殊情况
- ✅ **高性能渲染** - OffscreenCanvas + 自动降级
- ✅ **内存优化** - 自动资源管理和垃圾回收
- ✅ **Web Worker支持** - 后台处理不阻塞UI
- ✅ **零特殊情况** - 所有变换都使用相同算法

## 基础用法

```typescript
import { ImageProcessor, applyImageTransform } from './ImageProcessor'
import { TransformBuilder } from '../core/models'

// 1. 基础变换
const processor = new ImageProcessor()
const result = await processor.applyTransform(
  imageData,
  TransformBuilder.create(0, 0, 2, 2, Math.PI / 4, 0), // 2x放大 + 45度旋转
  { width: 200, height: 200 }
)

// 2. 快捷方法
const quickResult = await applyImageTransform(
  imageData,
  transform,
  targetSize
)

// 3. 批量处理
const results = await processor.processBatch([
  { imageData: img1, transform: transform1, targetPixelSize: size1 },
  { imageData: img2, transform: transform2, targetPixelSize: size2 }
])
```

## 高级配置

```typescript
import { createImageProcessor } from './ImageProcessor'

// 自定义配置
const processor = createImageProcessor({
  useOffscreenCanvas: true,        // 高性能渲染
  maxOutputSize: { width: 4096, height: 4096 }, // 输出限制
  interpolationQuality: 'high',    // 图片质量
  enableMemoryMonitoring: true     // 内存监控
})
```

## Web Worker使用

```typescript
// worker.ts
import { ImageProcessorWorker } from './ImageProcessor'

// 初始化Worker处理器
new ImageProcessorWorker({
  useOffscreenCanvas: true,
  interpolationQuality: 'high'
})

// 主线程发送任务
worker.postMessage({
  id: 'task-1',
  type: 'transform',
  payload: {
    imageData: myImageData,
    transform: myTransform,
    targetPixelSize: { width: 200, height: 200 }
  }
})
```

## 变换类型

### 尺寸调整
```typescript
// 放大到200x200
const transform = TransformBuilder.create(0, 0, 2, 2, 0, 0)
const targetSize = { width: 200, height: 200 }
```

### 旋转变换
```typescript
// 旋转90度
const transform = TransformBuilder.withRotation(
  TransformBuilder.create(0, 0, 1, 1, 0, 0),
  Math.PI / 2
)
```

### 复合变换
```typescript
// 缩放 + 旋转 + 位移
const transform = TransformBuilder.create(
  1, 1,           // 位置 (gridX, gridY)
  2, 2,           // 尺寸 (gridWidth, gridHeight)  
  Math.PI / 4,    // 旋转45度
  1               // Z层级
)
```

## 性能监控

```typescript
const result = await processor.applyTransform(imageData, transform, targetSize)

console.log('变换统计:', {
  原始尺寸: result.stats.originalSize,
  变换后尺寸: result.stats.transformedSize,
  应用的变换: result.stats.appliedTransforms,
  处理时间: result.stats.processingTime + 'ms',
  内存使用: result.stats.memoryUsed + ' bytes'
})
```

## 错误处理

```typescript
try {
  const result = await processor.applyTransform(imageData, transform, targetSize)
} catch (error) {
  if (error.message.includes('图片缩放失败')) {
    // 处理缩放错误
  } else if (error.message.includes('图片旋转失败')) {
    // 处理旋转错误
  }
}
```

## 最佳实践

### 1. 内存管理
```typescript
// 处理完成后清理资源
processor.dispose()

// 批量处理时限制并发
const results = await processor.processBatch(largeImageList) // 自动分批
```

### 2. 性能优化  
```typescript
// 小角度旋转会自动跳过 (< 0.01弧度)
const noRotation = TransformBuilder.create(0, 0, 1, 1, 0.005, 0) // 被忽略

// 相同尺寸不会触发缩放
const noResize = await processor.applyTransform(
  imageData, 
  transform, 
  { width: imageData.width, height: imageData.height }
)
```

### 3. 兼容性检查
```typescript
import { isOffscreenCanvasSupported, isWorkerSupported } from './ImageProcessor'

if (isOffscreenCanvasSupported()) {
  // 使用高性能模式
  processor = createImageProcessor({ useOffscreenCanvas: true })
} else {
  // 降级到普通Canvas
  processor = createImageProcessor({ useOffscreenCanvas: false })
}
```

## 设计原则

遵循Linus Torvalds的代码哲学：

- **好品味** - 统一的Transform接口消除特殊情况
- **Never break userspace** - 向前兼容的API设计
- **实用主义** - 解决真实的图片处理需求  
- **简洁性** - 核心逻辑不超过3层缩进

> "如果你需要超过3层缩进，你就已经完蛋了，应该修复你的程序。" - Linus Torvalds

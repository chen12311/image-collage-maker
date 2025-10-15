# 画布计算问题测试报告

## 📋 测试概述

**测试日期**: 2025-10-15
**测试工具**: Playwright MCP
**测试目标**: 验证画布大小、图片大小、交互热区的计算问题

## 🔍 问题诊断

### 1. Canvas 元素计算

```
Canvas 实际尺寸（width/height属性）: 800 × 800px
Canvas 应用的变换: scale(0.92)
Canvas 实际显示大小: 736 × 736px (800 * 0.92)
Canvas 位置: left=226.5px, top=196px
```

**状态**: ✅ Canvas 自身计算正常

### 2. TextInteractionLayer 计算

```
Layer 设置尺寸: 800 × 800px
Layer 应用的变换: none (无)
Layer 实际显示大小: 800 × 800px
Layer 位置: left=194.5px, top=164px
```

**问题**: ❌ Layer 比 Canvas 实际显示大 64px（800 - 736）

### 3. 位置偏差分析

```
Canvas 位置: left=226.5, top=196
TextLayer 位置: left=194.5, top=164
水平偏差: -32px (TextLayer 偏左)
垂直偏差: -32px (TextLayer 偏上)
```

**原因**: Canvas 因 scale 变换缩小后会在父容器中居中，产生32px的偏移（(800-736)/2 = 32）

### 4. 文字交互热区测试

添加文字"测试文字"后：

```
TextZone 样式位置: left=328px, top=372.8px (相对TextLayer)
TextZone 实际位置: left=522.5px, top=536.8px (绝对位置)
TextZone 相对Canvas偏移: 296px (水平), 340.8px (垂直)
```

**问题**: ❌ 热区位置严重偏移，与 Canvas 上文字实际位置不匹配

## 🐛 根本原因

**核心问题**: TextInteractionLayer 没有同步应用 Canvas 的 scale 变换

1. Canvas 应用了 `transform: scale(0.92)`
2. TextInteractionLayer 使用绝对尺寸 `width: 800px, height: 800px`
3. TextInteractionLayer 没有应用相同的 scale 变换
4. 导致尺寸和位置都不匹配

## 💡 解决方案

### 方案：同步 Canvas 的 scale 变换

**修改文件**: `src/components/Canvas/TextInteractionLayer.vue`

**需要修改的代码**:

```vue
<!-- 当前代码 -->
<div 
  class="text-interaction-layer" 
  :style="layerStyle"
>

<!-- 修改为 -->
<div 
  class="text-interaction-layer" 
  :style="layerStyle"
>

<!-- layerStyle 需要包含 transform -->
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `scale(${store.canvasScale})`,  // 同步 Canvas 的 scale
  transformOrigin: 'center center'           // 与 Canvas 相同的变换原点
}))
```

### 可能需要调整的点

1. **坐标转换**: 拖拽时需要考虑 scale 的影响
2. **CanvasInteractionLayer**: 可能也需要同样的修复
3. **鼠标事件坐标**: 需要除以 scale 来转换到 Canvas 坐标系

## 📸 测试截图

- `canvas-problem-before-fix.png`: 修复前的画布状态
- `text-hotzone-problem.png`: 文字热区错位问题演示

## 🎯 验证清单

修复后需要验证：

- [ ] TextLayer 尺寸与 Canvas 显示尺寸一致
- [ ] TextLayer 位置与 Canvas 位置对齐
- [ ] 文字热区位置与 Canvas 上文字位置精确匹配
- [ ] 文字拖拽功能正常
- [ ] 多种画布尺寸下都工作正常
- [ ] 窗口大小变化时缩放自适应正常

## 📝 额外发现

### CanvasInteractionLayer 可能也有同样的问题

需要检查 `src/components/Canvas/CanvasInteractionLayer.vue` 是否也需要应用相同的修复。

### 图片热区计算

如果有图片交互功能，也需要确保图片的热区计算考虑了 scale 因素。


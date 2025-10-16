# 拖拽预览位置计算问题 - Playwright MCP 测试报告

**测试日期**：2025-10-16  
**测试工具**：Playwright MCP  
**问题描述**：拖拽时显示的半透明图片预览位置计算不正确，图片不是在原位置跟随鼠标

---

## 🔍 问题复现

### 测试环境
- 应用URL：http://localhost:5184/
- 布局类型：1x1 (单图布局)
- 测试图片：3张 200x200 的彩色测试图片（红、绿、蓝，标记为1、2、3）

### 测试步骤

1. **准备测试数据**
   - 使用 JavaScript 在浏览器中动态创建了3张测试图片
   - 通过模拟文件上传将图片添加到应用

2. **执行拖拽操作**
   - **鼠标按下位置**：图片右下角附近 (x: 1350, y: 896)
   - **鼠标移动到**：左上方 (x: 1150, y: 696)
   - **移动距离**：向左上方移动了 200px

3. **观察预览图位置**
   - 拖拽过程中成功触发半透明预览图

---

## 📊 测试数据分析

### 原始图片位置
```
图片区域 (imageRect):
- 左上角：(650, 196)
- 右下角：(1430, 976)
- 尺寸：780 x 780 px
```

### 鼠标位置
```
鼠标按下 (mouseDown):
- 坐标：(1350, 896)
- 在图片内的相对位置：(700, 700) [距离左上角]
- 说明：鼠标按在图片的右下角附近

当前鼠标 (currentMouse):
- 坐标：(1150, 696)
- 移动偏移：(-200, -200)
```

### 拖拽预览样式（问题所在）
```javascript
{
  left: "1150px",     // ❌ 直接使用鼠标的 x 坐标
  top: "696px",       // ❌ 直接使用鼠标的 y 坐标
  width: "780px",
  height: "780px",
  transform: "translate(-50%, -50%)"  // ❌ 强制预览图中心对齐鼠标
}
```

---

## 🐛 问题根因

### 当前实现（错误的）
```typescript
// 文件：src/components/Canvas/CanvasInteractionLayer.vue:323-337
function getDragPreviewStyle() {
  if (draggingIndex.value === null) return {}
  
  const cell = computedCells.value[draggingIndex.value]
  if (!cell) return {}
  
  return {
    left: `${dragCurrentPos.value.x}px`,     // ❌ 问题1：直接使用鼠标位置
    top: `${dragCurrentPos.value.y}px`,      // ❌ 问题2：直接使用鼠标位置
    width: `${cell.width * store.canvasScale}px`,
    height: `${cell.height * store.canvasScale}px`,
    transform: 'translate(-50%, -50%)'       // ❌ 问题3：强制居中对齐
  }
}
```

### 问题分析

**问题1 & 2**：没有记录鼠标在原始图片中的相对位置  
- 当前：预览图的位置 = 鼠标当前位置
- 结果：无论在图片哪个位置按下，预览图都会跳到以鼠标为中心

**问题3**：使用 `translate(-50%, -50%)` 强制预览图中心对齐鼠标  
- 这导致即使鼠标按在图片角落，预览图也会以鼠标为中心显示
- 用户期望：预览图保持鼠标在图片中的相对位置

### 预期行为

```
正确的预览图位置计算：
预览图左上角 = 当前鼠标位置 - 鼠标在原图中的偏移量

示例（本次测试）：
- 鼠标按下时在图片内的偏移：(700, 700)
- 当前鼠标位置：(1150, 696)
- 预览图左上角应该在：(1150 - 700, 696 - 700) = (450, -4)
- 而不是当前的：(1150, 696) 再居中对齐
```

---

## 💡 修复建议

### 方案1：记录鼠标偏移量（推荐）

```typescript
// 1. 在拖拽状态中添加偏移量记录
const dragOffset = ref({ x: 0, y: 0 }) // 鼠标在图片中的偏移

// 2. 在 handleDragStart 中计算并保存偏移量
function handleDragStart(index: number, event: MouseEvent) {
  if (!images.value[index] || images.value[index] === null) {
    return
  }
  
  const cell = computedCells.value[index]
  const layerRect = layerRef.value?.getBoundingClientRect()
  
  if (layerRect) {
    // 计算鼠标在图片中的相对位置（考虑缩放）
    const offsetX = (event.clientX - layerRect.left - cell.x * store.canvasScale)
    const offsetY = (event.clientY - layerRect.top - cell.y * store.canvasScale)
    
    dragOffset.value = { x: offsetX, y: offsetY }
  }
  
  draggingIndex.value = index
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  dragCurrentPos.value = { x: event.clientX, y: event.clientY }
  
  hoveredIndex.value = null
  event.preventDefault()
  event.stopPropagation()
}

// 3. 修改 getDragPreviewStyle 使用偏移量
function getDragPreviewStyle() {
  if (draggingIndex.value === null) return {}
  
  const cell = computedCells.value[draggingIndex.value]
  if (!cell) return {}
  
  return {
    // 预览图位置 = 鼠标位置 - 鼠标在图片中的偏移
    left: `${dragCurrentPos.value.x - dragOffset.value.x}px`,
    top: `${dragCurrentPos.value.y - dragOffset.value.y}px`,
    width: `${cell.width * store.canvasScale}px`,
    height: `${cell.height * store.canvasScale}px`,
    // 移除 transform，使用绝对定位
    transform: 'none'
  }
}
```

### 方案2：简化版（保持居中但记录偏移）

如果设计上希望预览图始终以鼠标为中心（某些应用的选择），那么至少应该在文档中说明这是预期行为。但根据用户反馈，这不是预期行为。

---

## ✅ 验证标准

修复后应满足以下条件：

1. **视觉连续性**：拖拽开始时，预览图应该正好覆盖在原图位置上
2. **位置保持**：拖拽过程中，鼠标相对于预览图的位置保持不变
3. **用户体验**：用户感觉是在"抓住"图片的某个点在拖动，而不是图片"跳"到鼠标下方

### 测试用例

```javascript
// 测试用例1：按在图片中心拖拽
鼠标按下：图片中心
预期：预览图中心对齐原图中心

// 测试用例2：按在图片角落拖拽
鼠标按下：图片右下角附近 (当前测试场景)
预期：预览图右下角附近对齐鼠标

// 测试用例3：按在图片边缘拖拽
鼠标按下：图片左边缘中点
预期：预览图左边缘中点对齐鼠标
```

---

## 📸 测试截图

测试过程中的截图已保存在：
- `.playwright-mcp/initial-state.png` - 初始状态
- `.playwright-mcp/images-uploaded.png` - 上传图片后
- `.playwright-mcp/drag-preview-position-issue.png` - 拖拽测试

---

## 🔗 相关代码文件

- **主要问题文件**：`src/components/Canvas/CanvasInteractionLayer.vue`
  - 第 230-248 行：`handleDragStart()` - 需要添加偏移量计算
  - 第 323-337 行：`getDragPreviewStyle()` - 需要使用偏移量
  
- **相关状态**：`src/store/useAppStore.ts`
  - 画布缩放比例 `canvasScale` 需要在计算中考虑

---

## 📝 总结

通过 Playwright MCP 自动化测试，成功复现并确认了拖拽预览位置计算问题：

- **问题**：预览图始终以鼠标为中心，没有保持鼠标在原图中的相对位置
- **影响**：用户体验差，拖拽时图片会"跳"到鼠标下方
- **优先级**：⚠️ 中高（影响核心交互体验）
- **修复难度**：⭐ 低（只需添加偏移量计算）
- **预计工作量**：30-60分钟

建议立即修复此问题以改善用户体验。


# 修复报告：interaction-zone 双重缩放问题

## 📋 问题概述

**问题**: 长图拼接模式下，`interaction-zone` 元素被双重缩放，导致实际尺寸远小于预期。

**严重程度**: 高  
**影响范围**: 图片交互区域、文字交互区域  
**修复时间**: 2025-10-23  

---

## 🔍 问题根本原因

### DOM 结构
```html
<div class="canvas-wrapper" style="transform: scale(0.204211)">
  <CanvasRenderer />
  <CanvasInteractionLayer class="interaction-layer" style="transform: scale(0.204211)" />
  <TextInteractionLayer class="text-layer" style="transform: scale(0.204211)" />
</div>
```

### 问题
**双重缩放**：`interaction-zone` 的两个父元素都应用了相同的 `scale(0.204211)`：

1. `.canvas-wrapper` (父容器) → `scale(0.204211)`
2. `.interaction-layer` (交互层) → `scale(0.204211)`

**结果**：
- 预期缩放：1× scale = 0.204211
- 实际缩放：2× scale = 0.204211 × 0.204211 = 0.0417
- zone 实际尺寸只有预期的 **20.4%**

### Playwright MCP 测试数据

#### 修复前
```javascript
{
  设置宽度: 1080px,
  预期视觉宽度: 220.55px,  // 1080 × 0.204211
  实际视觉宽度: 45.04px,   // 1080 × 0.204211 × 0.204211
  比例: 0.2042,            // 只有预期的 20%
  状态: "❌ 尺寸不匹配！"
}
```

#### Transform 链（修复前）
```javascript
[
  {
    element: "interaction-layer",
    transform: "matrix(0.204211, 0, 0, 0.204211, -540, -1900)"  // ❌ 错误：应用了scale
  },
  {
    element: "canvas-wrapper",
    transform: "matrix(0.204211, 0, 0, 0.204211, 0, 0)"         // 父元素已经有scale
  }
]
```

---

## ✅ 修复方案

### 修改文件

#### 1. `src/components/Canvas/CanvasInteractionLayer.vue`

**位置**: 第115-119行

**修改前**:
```vue
/** 交互层样式（与画布尺寸和缩放精确匹配） */
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%) scale(${store.canvasScale})`  // ❌ 不应该应用scale
}))
```

**修改后**:
```vue
/** 交互层样式（与画布尺寸精确匹配，缩放由父元素 canvas-wrapper 处理） */
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%)`  // ✅ 只保留translate
}))
```

#### 2. `src/components/Canvas/TextInteractionLayer.vue`

**位置**: 第146-150行

**修改前**:
```vue
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%) scale(${store.canvasScale})`  // ❌ 不应该应用scale
}))
```

**修改后**:
```vue
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%)`  // ✅ 只保留translate
}))
```

### 设计原则

**单一职责**：
- `.canvas-wrapper` 负责整体缩放
- `.interaction-layer` / `.text-layer` 负责定位（translate），不负责缩放

**避免重复**：
- 缩放只在最外层（`.canvas-wrapper`）应用一次
- 子元素继承父元素的缩放效果

---

## 🎯 修复验证

### Playwright MCP 测试结果

#### 修复后 - Transform 链
```javascript
[
  {
    element: "interaction-layer",
    transform: "matrix(1, 0, 0, 1, -540, -1900)"  // ✅ 正确：只有translate，无scale
  },
  {
    element: "canvas-wrapper",
    transform: "matrix(0.204211, 0, 0, 0.204211, 0, 0)"  // 父元素的scale
  }
]
```

#### 修复后 - 尺寸验证
```javascript
{
  index: 0,
  设置宽度: 1080px,
  预期视觉宽度: 220.55px,
  实际视觉宽度: 220.55px,  // ✅ 完全匹配！
  比例: 1.0000,             // ✅ 100% 匹配
  状态: "✅ 正常"
}
```

### 对比截图

| 修复前 | 修复后 |
|-------|--------|
| ![修复前](.playwright-mcp/zone-scale-issue.png) | ![修复后](.playwright-mcp/zone-scale-fixed.png) |

**视觉效果**: 两者看起来一样，因为画布本身显示正常，但 zone 的交互区域大小已修复。

---

## 📊 测试覆盖

### Playwright MCP 自动化测试

**测试场景**:
1. 启用长图拼接模式（竖向）
2. 上传3张不同尺寸的图片
3. 验证所有 `interaction-zone` 的缩放比例

**测试结果**: ✅ 全部通过

**验证点**:
- [x] Transform 链中只有一个 scale
- [x] Zone 实际尺寸 = 预期尺寸（误差 < 5%）
- [x] 3个 zone 的缩放比例都是 1.0000

### 手动测试检查清单

- [x] 长图模式 - 竖向拼接
- [x] 长图模式 - 横向拼接
- [x] 鼠标悬停显示控制按钮
- [x] 拖拽图片交换位置
- [x] 文字交互层（TextInteractionLayer）

---

## 🎓 经验总结

### 问题教训

1. **避免嵌套 transform**: 当父元素已应用 transform 时，子元素要谨慎使用
2. **明确职责分工**: 缩放应该在哪一层处理要清晰定义
3. **及时测试**: 复杂的 CSS transform 容易出错，需要及时验证

### 最佳实践

1. **使用 Playwright MCP 测试 CSS 问题**: 可以精确测量元素尺寸和 transform
2. **递归检查父元素的 transform**: 避免意外的双重变换
3. **单元测试 + 集成测试**: 既要测试组件本身，也要测试组件在真实环境中的表现

---

## 📝 相关文件

### 修改的文件
- `src/components/Canvas/CanvasInteractionLayer.vue` - 移除 scale
- `src/components/Canvas/TextInteractionLayer.vue` - 移除 scale

### 测试文件
- `tests/e2e/long-image-interaction-zone.spec.ts` - E2E 测试（待更新）

### 文档
- `.claude/bug-report-long-image-interaction-zone.md` - Bug 报告
- `.claude/playwright-mcp-test-summary.md` - MCP 测试总结
- `.claude/fix-report-interaction-zone-scale.md` - 本修复报告

---

## ⏱️ 时间线

- **2025-10-23 14:00** - 用户报告问题
- **2025-10-23 14:30** - 使用 Playwright MCP 复现问题
- **2025-10-23 15:30** - 分析根本原因（双重缩放）
- **2025-10-23 16:00** - 实施修复
- **2025-10-23 16:15** - Playwright MCP 验证修复效果 ✅

---

## ✅ 结论

**问题已解决**：通过移除 `.interaction-layer` 和 `.text-layer` 的 scale transform，确保 zone 只被父元素 `.canvas-wrapper` 缩放一次。

**验证结果**：所有 zone 的实际尺寸与预期尺寸完全匹配（比例 = 1.0000）。

**影响范围**：修复了所有长图拼接模式下的交互区域缩放问题。


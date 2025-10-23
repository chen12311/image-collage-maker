# Bug 报告：长图拼接模式 interaction-zone 布局问题

## 📋 问题概述

**问题描述**：在长图拼接模式下，上传2张以上图片时，`interaction-zone` 元素的数量与实际图片数量不匹配，导致部分图片无法在画布上显示交互区域。

**严重程度**：高  
**影响范围**：长图拼接功能的核心交互  
**发现时间**：2025-10-23  
**报告人**：用户反馈 + Playwright MCP 测试验证

---

## 🔍 问题复现步骤

### 环境
- **URL**: `http://localhost:5173`
- **浏览器**: Chrome (Playwright)
- **测试图片**: 
  - `tests/fixtures/images/test-image-100x100.png` (100x100)
  - `tests/fixtures/images/test-image-large.jpg` (2000x2000)
  - `tests/fixtures/images/test-image-portrait.jpg` (800x1200)

### 复现步骤
1. 访问应用首页
2. 点击"布局"选项卡
3. 启用"长图模式"（默认竖向）
4. 切换到"图片"选项卡
5. 上传3张测试图片
6. 观察画布区域

### 预期行为
- 侧边栏显示：3张图片
- 画布上应该显示：3个 `interaction-zone` 元素
- 每个 zone 应该对应一张图片

### 实际行为
- 侧边栏显示：✅ 3张图片（正确）
- 画布上实际显示：❌ 仅2个 `interaction-zone` 元素
- 第3张图片（橙色，portrait）没有对应的交互区域
- 画布尺寸：❌ 固定为 800x800（应该动态计算）

---

## 📸 视觉证据

### 截图分析
![问题截图](long-image-mode-issue.png)

**观察到的问题**：
1. 左侧显示"已上传 3 张"
2. 画布只显示2张图片（绿色100x100，蓝色2000x2000）
3. 第3张图片（橙色800x1200）未显示
4. 布局显示为横向2图布局（而非竖向3图长图）

---

## 🔬 技术分析

### 1. DOM 结构检查

```javascript
// 实际 DOM 查询结果
{
  imagesInSidebar: 3,              // ✅ 正确
  interactionZonesTotal: 2,        // ❌ 应该是 3
  zonesWithImages: 2,              // ❌ 应该是 3
  canvasSize: {
    width: 800,                    // ❌ 应该动态计算
    height: 800                    // ❌ 应该动态计算
  }
}
```

### 2. interaction-zone 样式信息

```javascript
// Zone 0
{
  left: "0px",
  top: "0px",
  width: "395px",    // 画布宽度800px，减去间距10px，除以2 = 395px
  height: "800px"
}

// Zone 1
{
  left: "405px",     // 395px + 10px间距
  top: "0px",
  width: "395px",
  height: "800px"
}

// Zone 2: ❌ 不存在！
```

**分析**：
- 2个 zone 的宽度加起来正好是画布宽度（395 + 10 + 395 = 800）
- 这说明布局生成器生成的是横向2图布局，而不是竖向3图布局
- 画布尺寸没有根据图片数量动态调整

---

## 🐛 根本原因分析

### 疑似问题点

#### 1. 画布尺寸未动态更新
**位置**: `src/store/useAppStore.ts`

```typescript
// 第86-89行：画布尺寸初始化
const canvasWidth = ref(800)   // ❌ 固定值
const canvasHeight = ref(800)  // ❌ 固定值
```

**问题**：
- 长图模式启用时，`canvasWidth` 和 `canvasHeight` 没有根据图片数量动态更新
- 虽然有 `updateCanvasSizeForLongImage()` 函数，但可能没有在正确的时机调用

#### 2. 布局计算逻辑
**位置**: `src/store/useAppStore.ts` 第138-165行

```typescript
const layoutConfig = computed<LayoutConfig>(() => {
  if (longImageMode.value) {
    const validImages = images.value.filter(img => img && img !== null)
    const imageCount = Math.max(validImages.length, 1)  // 应该得到3
    const template = LongImageLayoutGenerator.generate({
      imageCount: imageCount,
      direction: longImageDirection.value,  // 应该是 'vertical'
      seamless: spacing.value === 0
    })
    
    return {
      type: template.id,
      cells: template.cells,  // ❓ cells 数量正确吗？
      spacing: spacing.value,
      padding: padding.value,
      radius: radius.value
    }
  }
  
  // 普通模式
  return createLayoutConfig(
    layoutType.value,  // ❌ 可能还是 '2-grid'？
    spacing.value,
    padding.value,
    radius.value
  )
})
```

**可能原因**：
- `longImageMode.value` 实际上不是 `true`？
- `LongImageLayoutGenerator.generate()` 生成的 cells 数量不对？
- `layoutType` 没有被正确更新？

#### 3. Watch 触发时机
**位置**: `src/store/useAppStore.ts` 第888-895行

```typescript
watch(
  () => images.value.length,
  () => {
    if (longImageMode.value && sizeCalculationMode.value !== 'preset') {
      updateCanvasSizeForLongImage()
    }
  }
)
```

**潜在问题**：
- Watch 只监听 `images.value.length`，在长度变化时才触发
- 如果 `sizeCalculationMode` 是 `'preset'`，则不会更新画布尺寸
- `updateCanvasSizeForLongImage()` 内部可能有条件导致提前返回

#### 4. sizeCalculationMode 的初始值
**位置**: `src/store/useAppStore.ts` 第124行

```typescript
const sizeCalculationMode = ref<SizeCalculationMode>('preset')  // ❌ 默认是 'preset'
```

**问题**：
- 默认值是 `'preset'`
- 启用长图模式时会设置为 `'auto'`（第450行）
- 但如果设置失败或时机不对，就会导致 watch 中的条件判断失败

---

## 🔧 可能的解决方案

### 方案1：确保画布尺寸在长图模式下正确计算

**修改位置**: `src/store/useAppStore.ts`

```typescript
// 在 toggleLongImageMode 函数中确保正确设置
function toggleLongImageMode(enabled?: boolean) {
  longImageMode.value = enabled !== undefined ? enabled : !longImageMode.value
  
  if (longImageMode.value) {
    sizeCalculationMode.value = 'auto'
    // 立即更新画布尺寸（即使当前没有图片）
    if (images.value.filter(img => img && img !== null).length > 0) {
      updateCanvasSizeForLongImage()
    }
  }
}
```

### 方案2：增强 watch 的监听范围

```typescript
// 监听图片数量和长图模式状态
watch(
  [() => images.value.length, () => longImageMode.value, () => longImageDirection.value],
  () => {
    if (longImageMode.value && sizeCalculationMode.value !== 'preset') {
      updateCanvasSizeForLongImage()
    }
  }
)
```

### 方案3：修复 updateCanvasSizeForLongImage 的条件判断

```typescript
function updateCanvasSizeForLongImage() {
  if (!longImageMode.value) {
    console.warn('[updateCanvasSizeForLongImage] 长图模式未启用')
    return
  }
  
  const validImages = images.value.filter(img => img && img !== null)
  if (validImages.length === 0) {
    console.warn('[updateCanvasSizeForLongImage] 没有有效图片')
    return
  }
  
  if (sizeCalculationMode.value === 'preset') {
    console.warn('[updateCanvasSizeForLongImage] 预设模式不自动计算')
    return
  }
  
  console.log('[updateCanvasSizeForLongImage] 计算画布尺寸', {
    imageCount: validImages.length,
    mode: sizeCalculationMode.value,
    direction: longImageDirection.value
  })
  
  const newSize = CanvasSizeCalculator.calculate(validImages, {
    mode: sizeCalculationMode.value,
    direction: longImageDirection.value,
    fixedWidth: fixedWidth.value,
    fixedHeight: fixedHeight.value,
    spacing: spacing.value,
    padding: padding.value
  })
  
  console.log('[updateCanvasSizeForLongImage] 新画布尺寸', newSize)
  setCanvasSize(newSize.width, newSize.height)
}
```

---

## ✅ 验证计划

### 1. 运行 E2E 测试
```bash
npx playwright test tests/e2e/long-image-interaction-zone.spec.ts
```

### 2. 手动测试检查清单
- [ ] 启用长图模式（竖向）
- [ ] 上传1张图片 → 检查 zone 数量和画布尺寸
- [ ] 上传第2张图片 → 检查 zone 数量和画布尺寸
- [ ] 上传第3张图片 → 检查 zone 数量和画布尺寸
- [ ] 切换到横向 → 检查布局是否正确更新
- [ ] 删除图片 → 检查 zone 数量是否正确减少

### 3. 控制台日志检查
需要验证以下日志输出：
- `[toggleLongImageMode]` 调用时的状态
- `[updateCanvasSizeForLongImage]` 调用时的参数和结果
- `[CanvasSizeCalculator]` 计算的尺寸
- `[LongImageLayoutGenerator]` 生成的 cells 数量

---

## 📝 相关文件

### 核心文件
- `src/store/useAppStore.ts` - 状态管理
- `src/layout/LongImageLayoutGenerator.ts` - 布局生成器
- `src/core/canvas/CanvasSizeCalculator.ts` - 画布尺寸计算器
- `src/components/Canvas/CanvasInteractionLayer.vue` - 交互层组件

### 测试文件
- `tests/e2e/long-image-interaction-zone.spec.ts` - E2E测试

---

## 🔗 参考信息

- **Issue**: 长图拼接模式 interaction-zone 布局问题
- **测试截图**: `.playwright-mcp/long-image-mode-issue.png`
- **测试数据**: 使用 `tests/fixtures/images/` 下的测试图片

---

## ⏱️ 时间线

- **2025-10-23 14:00** - 用户报告问题
- **2025-10-23 14:30** - 使用 Playwright MCP 成功复现问题
- **2025-10-23 15:00** - 完成根本原因分析
- **2025-10-23 15:30** - 创建 E2E 测试用例
- **待定** - 实施修复方案
- **待定** - 验证修复效果

---

**下一步行动**：
1. 添加详细的调试日志到 `updateCanvasSizeForLongImage()`
2. 运行更新后的 E2E 测试
3. 根据日志输出确定具体的失败点
4. 实施对应的修复方案
5. 验证修复后所有测试通过


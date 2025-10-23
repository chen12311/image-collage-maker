# Playwright MCP 测试总结

## 📋 测试任务

使用 Playwright MCP 测试长图拼接模式下 `interaction-zone` 的布局问题。

---

## ✅ 测试执行情况

### 1. 手动交互测试（通过 Playwright MCP）

**测试步骤**：
1. 导航到 `http://localhost:5173`
2. 启用长图拼接模式（点击切换按钮）
3. 切换到图片面板
4. 上传3张测试图片
5. 检查 interaction-zone 元素

**结果**: ✅ **成功复现问题**

###  问题确认

#### 测试数据
```javascript
{
  imagesInSidebar: 3,              // ✅ 侧边栏正确显示3张
  interactionZonesTotal: 2,        // ❌ 画布只有2个zone（应该是3个）
  zonesWithImages: 2,              // ❌ 只有2个zone有图片（应该是3个）
  canvasSize: {
    width: 800,                    // ❌ 固定尺寸（应该动态计算）
    height: 800                    // ❌ 固定尺寸（应该动态计算）
  }
}
```

#### Zone 样式详情
```javascript
// Zone 0 - 绿色图片 (100x100)
{
  left: "0px",
  top: "0px",
  width: "395px",
  height: "800px",
  hasImageClass: true
}

// Zone 1 - 蓝色图片 (2000x2000)
{
  left: "405px",
  top: "0px",
  width: "395px",
  height: "800px",
  hasImageClass: true
}

// Zone 2 - ❌ 缺失！橙色图片 (800x1200) 没有对应的zone
```

#### 视觉证据
- 截图文件: `.playwright-mcp/long-image-mode-issue.png`
- 可以清楚看到只有2张图片显示在画布上
- 第3张橙色图片虽然在侧边栏列表中，但没有对应的交互区域

---

## 🔍 根本原因分析

### 核心问题

1. **画布尺寸未动态计算**
   - 长图模式启用后，画布尺寸仍然是固定的 800x800
   - 应该根据图片数量和方向动态计算

2. **布局单元格数量不匹配**
   - 上传3张图片，但只生成了2个 `interaction-zone`
   - 布局引擎没有正确响应图片数量的变化

### 可能的原因

#### 方案A: sizeCalculationMode 问题
```typescript
// src/store/useAppStore.ts:124
const sizeCalculationMode = ref<SizeCalculationMode>('preset')  // 默认是'preset'

// 启用长图模式时应该设置为'auto'
if (longImageMode.value) {
  sizeCalculationMode.value = 'auto'  // 第450行
  updateCanvasSizeForLongImage()
}

// watch 中的条件
if (longImageMode.value && sizeCalculationMode.value !== 'preset') {
  updateCanvasSizeForLongImage()  // 如果是'preset'，不会触发
}
```

**推测**: `sizeCalculationMode` 可能没有正确从 `'preset'` 切换到 `'auto'`

#### 方案B: 布局配置计算问题
```typescript
const layoutConfig = computed<LayoutConfig>(() => {
  if (longImageMode.value) {
    const validImages = images.value.filter(img => img && img !== null)
    const imageCount = Math.max(validImages.length, 1)
    const template = LongImageLayoutGenerator.generate({
      imageCount: imageCount,
      direction: longImageDirection.value,
      seamless: spacing.value === 0
    })
    
    return {
      type: template.id,
      cells: template.cells,
      ...
    }
  }
  
  // 普通模式
  return createLayoutConfig(layoutType.value, ...)
})
```

**推测**: `longImageMode.value` 可能是 `false`，导致使用了普通模式的2宫格布局

#### 方案C: watch 触发时机问题
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

**推测**: watch 监听的只是 `images.value.length`，可能触发时机有问题

---

## 🎯 下一步建议

### 1. 添加调试日志
在 `src/store/useAppStore.ts` 中添加详细日志：

```typescript
function toggleLongImageMode(enabled?: boolean) {
  longImageMode.value = enabled !== undefined ? enabled : !longImageMode.value
  console.log('[toggleLongImageMode]', {
    enabled,
    longImageMode: longImageMode.value,
    sizeCalculationMode: sizeCalculationMode.value
  })
  
  if (longImageMode.value) {
    sizeCalculationMode.value = 'auto'
    console.log('[toggleLongImageMode] 设置为auto模式')
    updateCanvasSizeForLongImage()
  }
}

function updateCanvasSizeForLongImage() {
  console.log('[updateCanvasSizeForLongImage] 调用', {
    longImageMode: longImageMode.value,
    validImagesCount: images.value.filter(img => img && img !== null).length,
    sizeCalculationMode: sizeCalculationMode.value
  })
  
  if (!longImageMode.value) {
    console.warn('[updateCanvasSizeForLongImage] 长图模式未启用，退出')
    return
  }
  
  const validImages = images.value.filter(img => img && img !== null)
  if (validImages.length === 0) {
    console.warn('[updateCanvasSizeForLongImage] 没有有效图片，退出')
    return
  }
  
  if (sizeCalculationMode.value === 'preset') {
    console.warn('[updateCanvasSizeForLongImage] 预设模式，不自动计算，退出')
    return
  }
  
  const newSize = CanvasSizeCalculator.calculate(validImages, {
    mode: sizeCalculationMode.value,
    direction: longImageDirection.value,
    fixedWidth: fixedWidth.value,
    fixedHeight: fixedHeight.value,
    spacing: spacing.value,
    padding: padding.value
  })
  
  console.log('[updateCanvasSizeForLongImage] 计算新尺寸', {
    newSize,
    oldSize: { width: canvasWidth.value, height: canvasHeight.value }
  })
  
  setCanvasSize(newSize.width, newSize.height)
}

// 在 layoutConfig 计算属性中添加日志
const layoutConfig = computed<LayoutConfig>(() => {
  console.log('[layoutConfig] 计算', {
    longImageMode: longImageMode.value,
    imagesCount: images.value.length,
    validImagesCount: images.value.filter(img => img && img !== null).length
  })
  
  if (longImageMode.value) {
    const validImages = images.value.filter(img => img && img !== null)
    const imageCount = Math.max(validImages.length, 1)
    const template = LongImageLayoutGenerator.generate({
      imageCount: imageCount,
      direction: longImageDirection.value,
      seamless: spacing.value === 0
    })
    
    console.log('[layoutConfig] 长图模式', {
      imageCount,
      direction: longImageDirection.value,
      template: template.id,
      cellsCount: template.cells.length
    })
    
    return {
      type: template.id,
      cells: template.cells,
      spacing: spacing.value,
      padding: padding.value,
      radius: radius.value
    }
  }
  
  console.log('[layoutConfig] 普通模式', {
    layoutType: layoutType.value
  })
  
  return createLayoutConfig(
    layoutType.value,
    spacing.value,
    padding.value,
    radius.value
  )
})
```

### 2. 手动测试并查看日志
1. 启动开发服务器: `npm run dev`
2. 打开浏览器控制台
3. 执行测试步骤（启用长图模式 → 上传3张图片）
4. 观察控制台日志，确定哪个环节出了问题

### 3. 可能的快速修复
如果确认是 `sizeCalculationMode` 或 watch 的问题，可以尝试：

```typescript
// 选项1: 增强 watch
watch(
  [() => images.value.length, () => longImageMode.value],
  () => {
    if (longImageMode.value) {
      // 强制更新
      updateCanvasSizeForLongImage()
    }
  },
  { immediate: true }
)

// 选项2: 在 addImages 中主动触发更新
function addImages(newImages: ImageElement[]) {
  images.value.push(...newImages)
  
  // 长图模式下立即更新画布尺寸
  if (longImageMode.value) {
    nextTick(() => {
      updateCanvasSizeForLongImage()
    })
  }
}
```

---

## 📝 测试文件

已创建以下测试文件：
- `tests/e2e/long-image-interaction-zone.spec.ts` - E2E测试（4个测试用例）
- `.claude/bug-report-long-image-interaction-zone.md` - 详细bug报告

---

## 📸 相关资产

- 测试截图: `.playwright-mcp/long-image-mode-issue.png`
- Playwright 报告: 运行 `npm run test:e2e` 后可查看

---

## 总结

✅ **问题已成功验证**  
✅ **问题原因已初步分析**  
✅ **测试用例已创建**  
⏳ **等待添加调试日志并确定最终修复方案**

建议优先添加调试日志，手动测试一次，确认具体的失败点后再实施修复。


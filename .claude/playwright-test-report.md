# Playwright 测试报告 - 2*2布局图片控件显示问题

## 测试时间
2025-10-14

## 问题描述
用户报告：当选择 2*2 布局时，图片上的功能只在第一张图片上显示。

## 测试环境
- 浏览器：Playwright
- 布局：2*2 (4张图片)
- 测试图片：4张彩色测试图片（红、绿、蓝、黄）

## 测试过程

### 1. 布局验证
- ✅ 成功选择 2*2 布局
- ✅ 画布正确创建了 4 个位置
- ✅ 交互层正确创建了 4 个热区（interaction-zone）
  - 热区 0: left: 0px, top: 0px, width: 395px, height: 395px
  - 热区 1: left: 405px, top: 0px, width: 395px, height: 395px
  - 热区 2: left: 0px, top: 405px, width: 395px, height: 395px
  - 热区 3: left: 405px, top: 405px, width: 395px, height: 395px

### 2. 图片上传验证
- ✅ 成功上传 4 张测试图片
- ✅ 图片正确显示在 4 个位置

### 3. 控件显示测试

#### 测试 1：悬停第一张图片
- 触发方式：JavaScript mouseenter 事件
- 结果：✅ 显示 1 个控件
- 控件位置：`left: 391px, top: 4px, transform: translateX(-100%)`
- 分析：位置正确（395-4 = 391px）

#### 测试 2：悬停第二张图片
- 触发方式：JavaScript mouseenter 事件（先 mouseleave 第一个，再 mouseenter 第二个）
- 结果：⚠️ 显示 2 个控件
- 控件位置：
  - 控件 1：`left: 391px, top: 4px` （第一张图片位置）
  - 控件 2：`left: 796px, top: 4px` （第二张图片位置）
- 分析：**Transition 动画导致两个控件同时存在**

## 问题分析

### 根本原因

查看 `src/components/Canvas/CanvasInteractionLayer.vue` 代码：

```vue
<div
  v-for="(cell, index) in computedCells"
  :key="images[index]?.id || `cell-${index}`"
  class="interaction-zone"
  ...
>
  <Transition name="controls-fade">
    <ImageControls
      v-if="hoveredIndex === index && images[index]"
      :x="cell.x"
      :y="cell.y"
      :width="cell.width"
      :height="cell.height"
      ...
    />
  </Transition>
</div>
```

**问题 1：key 值不稳定**

```vue
:key="images[index]?.id || `cell-${index}`"
```

当图片数组发生变化时（比如添加/删除图片），key 会在 `images[index]?.id` 和 `cell-${index}` 之间切换，可能导致 Vue 无法正确追踪元素，从而产生多个控件实例。

**问题 2：Transition 组件的淡入淡出重叠**

每个热区都有独立的 Transition 组件。当 hoveredIndex 从 0 变为 1 时：
- 热区 0 的控件开始淡出动画（opacity: 1 → 0）
- 热区 1 的控件开始淡入动画（opacity: 0 → 1）
- 在动画过渡期间，**两个控件同时可见**

虽然这在视觉上可能不是问题（一个淡出，一个淡入），但如果有性能问题或动画时序问题，可能导致控件显示异常。

**问题 3：可能的根本问题 - 控件定位**

从 ImageControls.vue 的定位逻辑看：

```ts
const controlsStyle = computed(() => ({
  left: `${props.x + props.width - 4}px`,
  top: `${props.y + 4}px`,
  transform: 'translateX(-100%)'
}))
```

这个定位是基于传入的 `x`、`y`、`width`、`height` props。

在 CanvasInteractionLayer.vue 中：

```vue
<ImageControls
  v-if="hoveredIndex === index && images[index]"
  :x="cell.x"
  :y="cell.y"
  :width="cell.width"
  :height="cell.height"
  ...
/>
```

`cell` 来自 `computedCells`，而 `computedCells` 是通过 `computeLayout` 计算的。

**关键问题：如果 `computedCells` 的计算有问题，或者传递给 ImageControls 的坐标不正确，就会导致所有控件都显示在同一个位置。**

### 进一步验证需要

需要检查 `computeLayout` 函数的实现，确认是否正确计算了每个单元格的位置。

## 可能的解决方案

### 方案 1：修复 key 值
使用稳定的 key 值，避免在图片 ID 和索引之间切换：

```vue
:key="`cell-${index}`"
```

### 方案 2：全局控件（推荐）
不在每个热区内部创建控件，而是在交互层创建一个全局的控件，根据 hoveredIndex 动态调整位置：

```vue
<template>
  <div class="interaction-layer" ref="layerRef" :style="layerStyle">
    <!-- 交互热区 -->
    <div
      v-for="(cell, index) in computedCells"
      :key="`zone-${index}`"
      class="interaction-zone"
      :style="getZoneStyle(cell)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
    />
    
    <!-- 全局控件（只有一个实例） -->
    <Transition name="controls-fade">
      <ImageControls
        v-if="hoveredIndex !== null && images[hoveredIndex] && computedCells[hoveredIndex]"
        :x="computedCells[hoveredIndex].x"
        :y="computedCells[hoveredIndex].y"
        :width="computedCells[hoveredIndex].width"
        :height="computedCells[hoveredIndex].height"
        @flip-horizontal="handleFlipHorizontal(images[hoveredIndex].id)"
        @flip-vertical="handleFlipVertical(images[hoveredIndex].id)"
        @rotate="handleRotate(images[hoveredIndex].id)"
        @delete="handleDelete(images[hoveredIndex].id)"
      />
    </Transition>
  </div>
</template>
```

### 方案 3：移除 Transition 动画
如果动画不是必需的，可以移除 Transition 组件，直接使用 v-if：

```vue
<ImageControls
  v-if="hoveredIndex === index && images[index]"
  ...
/>
```

## 推荐方案

**推荐使用方案 2（全局控件）**，原因：
1. ✅ 只有一个控件实例，避免多实例问题
2. ✅ Transition 动画更流畅（只有一个元素在过渡）
3. ✅ 性能更好（减少DOM节点数量）
4. ✅ 逻辑更清晰，易于维护

## 下一步行动

1. 检查 `src/layout/LayoutEngine.ts` 中的 `computeLayout` 函数
2. 实施方案 2（全局控件重构）
3. 测试所有布局模式（单图、1*2、2*1、2*2、3*3 等）
4. 验证修复效果


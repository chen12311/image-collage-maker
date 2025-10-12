<template>
  <div class="layout-panel">
    <!-- 布局选择器 -->
    <div class="tool-section">
      <div class="section-header">
        <Icon name="grid" size="sm" />
        <h3 class="section-title">选择布局</h3>
      </div>
      <div class="layout-grid">
        <div
          v-for="layout in layouts"
          :key="layout.type"
          class="layout-item hover-lift"
          :class="{ active: store.layoutType === layout.type }"
          @click="selectLayout(layout.type)"
        >
          <div :class="`layout-preview grid-${layout.type}`">
            <div v-for="i in layout.type" :key="i" class="layout-cell"></div>
          </div>
          <Transition name="scale">
            <div v-if="store.layoutType === layout.type" class="layout-check">
              <Icon name="check" size="sm" />
            </div>
          </Transition>
        </div>
      </div>
    </div>
    
    <!-- 布局参数 -->
    <div class="tool-section">
      <div class="section-header">
        <Icon name="settings" size="sm" />
        <h3 class="section-title">布局参数</h3>
      </div>
      
      <!-- 间距 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">间距</label>
          <span class="control-value">{{ store.spacing }}px</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="50"
          :value="store.spacing"
          @input="onSpacingChange"
        >
      </div>
      
      <!-- 边距 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">边距</label>
          <span class="control-value">{{ store.padding }}px</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="100"
          :value="store.padding"
          @input="onPaddingChange"
        >
      </div>
      
      <!-- 圆角 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">圆角</label>
          <span class="control-value">{{ store.radius }}px</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="50"
          :value="store.radius"
          @input="onRadiusChange"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/Common/Icon.vue'
import type { LayoutType } from '@/core/models'

const store = useAppStore()

/** 布局选项 */
const layouts: Array<{ type: LayoutType }> = [
  { type: 1 },
  { type: 2 },
  { type: 3 },
  { type: 4 }
]

/** 选择布局 */
function selectLayout(type: LayoutType) {
  store.setLayoutType(type)
}

/** 间距变化 */
function onSpacingChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setSpacing(value)
}

/** 边距变化 */
function onPaddingChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setPadding(value)
}

/** 圆角变化 */
function onRadiusChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setRadius(value)
}
</script>

<style scoped>
.layout-panel {
  animation: fade-in var(--duration-base) var(--ease-out);
}

.tool-section {
  margin-bottom: var(--spacing-6);
}

.tool-section:last-child {
  margin-bottom: 0;
}

/* 分组标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  color: var(--color-neutral-700);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

/* 布局网格 */
.layout-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
}

.layout-item {
  position: relative;
  aspect-ratio: 1;
  padding: var(--spacing-4);
  background: var(--color-neutral-0);
  border: 2px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-item:hover {
  border-color: var(--color-primary-400);
  transform: translateY(-2px);
}

.layout-item.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-primary);
}

.layout-preview {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 3px;
  transition: var(--transition-transform);
}

.layout-item:hover .layout-preview {
  transform: scale(1.05);
}

.layout-preview.grid-1 {
  grid-template-columns: 1fr;
}

.layout-preview.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.layout-preview.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.layout-preview.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.layout-cell {
  background: var(--color-neutral-300);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.layout-item.active .layout-cell {
  background: var(--color-primary-400);
}

.layout-item:hover .layout-cell {
  background: var(--color-primary-300);
}

/* 选中标记 */
.layout-check {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

/* 控件样式 */
.control-group {
  margin-bottom: var(--spacing-5);
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.control-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
  font-family: var(--font-family-mono);
  min-width: 48px;
  text-align: right;
}

.control-slider {
  width: 100%;
}

/* 缩放动画 */
.scale-enter-active {
  animation: scale-in var(--duration-fast) var(--ease-bounce);
}

.scale-leave-active {
  animation: scale-out var(--duration-fast) var(--ease-in);
}
</style>


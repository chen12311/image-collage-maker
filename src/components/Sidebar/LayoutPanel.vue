<template>
  <div class="layout-panel">
    <!-- 布局参数 -->
    <div class="tool-section">
      <div class="section-header">
        <Icon name="settings" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.layout.layoutParams') }}</h3>
      </div>
      
      <!-- 间距 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">{{ $t('sidebar.layout.spacing') }}</label>
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
          <label class="control-label">{{ $t('sidebar.layout.padding') }}</label>
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
          <label class="control-label">{{ $t('sidebar.layout.radius') }}</label>
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
    
    <!-- 布局选择器 -->
    <div class="tool-section layout-selector-section">
      <div class="section-header">
        <Icon name="grid" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.layout.selectLayout') }}</h3>
      </div>
      <div class="layout-grid">
        <div
          v-for="layout in layouts"
          :key="layout.id"
          class="layout-item hover-lift"
          :class="{ active: store.layoutType === layout.id }"
          @click="selectLayout(layout.id)"
        >
          <div class="layout-preview">
            <div
              v-for="(cell, index) in layout.cells"
              :key="index"
              class="layout-cell"
              :style="getCellStyle(cell)"
            ></div>
          </div>
          <Transition name="scale">
            <div v-if="store.layoutType === layout.id" class="layout-check">
              <Icon name="check" size="sm" />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/Common/Icon.vue'
import { LAYOUT_TEMPLATES } from '@/core/models'
import type { Cell } from '@/core/models'

const store = useAppStore()

/** 所有布局选项 */
const layouts = LAYOUT_TEMPLATES

/** 选择布局 */
function selectLayout(id: string) {
  store.setLayoutType(id)
}

/** 获取单元格样式 */
function getCellStyle(cell: Cell): Record<string, string> {
  const [x, y, w, h] = cell
  
  return {
    position: 'absolute',
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${w * 100}%`,
    height: `${h * 100}%`,
    padding: '1px'
  }
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
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: fade-in var(--duration-base) var(--ease-out);
}

.tool-section {
  margin-bottom: var(--spacing-5);
}

.tool-section:last-child {
  margin-bottom: 0;
}

/* 布局选择器区域 - 延长到底部 */
.layout-selector-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2);
  flex: 1;
  overflow-y: auto;
  padding-right: var(--spacing-2);
  align-content: start;
}

/* 自定义滚动条 */
.layout-grid::-webkit-scrollbar {
  width: 6px;
}

.layout-grid::-webkit-scrollbar-track {
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
}

.layout-grid::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
}

.layout-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-400);
}

.layout-item {
  position: relative;
  aspect-ratio: 1;
  padding: var(--spacing-2);
  background: var(--color-neutral-0);
  border: 2px solid var(--border-color-base);
  border-radius: var(--radius-sm);
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
  position: relative;
  width: 100%;
  height: 100%;
  transition: var(--transition-transform);
}

.layout-item:hover .layout-preview {
  transform: scale(1.05);
}

.layout-cell {
  box-sizing: border-box;
  transition: var(--transition-fast);
}

.layout-cell::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-neutral-300);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.layout-item.active .layout-cell::before {
  background: var(--color-primary-400);
}

.layout-item:hover .layout-cell::before {
  background: var(--color-primary-300);
}

/* 选中标记 */
.layout-check {
  position: absolute;
  top: var(--spacing-1);
  right: var(--spacing-1);
  width: 20px;
  height: 20px;
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
  margin-bottom: var(--spacing-4);
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

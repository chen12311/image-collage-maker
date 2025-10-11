<template>
  <div class="layout-panel">
    <!-- 布局选择器 -->
    <div class="tool-section">
      <div class="tool-section-title">选择布局</div>
      <div class="layout-grid">
        <div
          v-for="layout in layouts"
          :key="layout.type"
          class="layout-item"
          :class="{ active: store.layoutType === layout.type }"
          @click="store.setLayoutType(layout.type)"
        >
          <div :class="`layout-preview grid-${layout.type}`">
            <div v-for="i in layout.type" :key="i" class="layout-cell"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 布局参数 -->
    <div class="tool-section">
      <div class="tool-section-title">布局参数</div>
      
      <!-- 间距 -->
      <div class="control-group">
        <label class="control-label">间距</label>
        <div class="control-row">
          <input
            type="range"
            class="control-input"
            min="0"
            max="50"
            :value="store.spacing"
            @input="onSpacingChange"
          >
          <span class="control-value">{{ store.spacing }}px</span>
        </div>
      </div>
      
      <!-- 边距 -->
      <div class="control-group">
        <label class="control-label">边距</label>
        <div class="control-row">
          <input
            type="range"
            class="control-input"
            min="0"
            max="100"
            :value="store.padding"
            @input="onPaddingChange"
          >
          <span class="control-value">{{ store.padding }}px</span>
        </div>
      </div>
      
      <!-- 圆角 -->
      <div class="control-group">
        <label class="control-label">圆角</label>
        <div class="control-row">
          <input
            type="range"
            class="control-input"
            min="0"
            max="50"
            :value="store.radius"
            @input="onRadiusChange"
          >
          <span class="control-value">{{ store.radius }}px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/useAppStore'
import type { LayoutType } from '@/core/models'

const store = useAppStore()

/** 布局选项 */
const layouts: Array<{ type: LayoutType }> = [
  { type: 1 },
  { type: 2 },
  { type: 3 },
  { type: 4 }
]

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
  /* 继承父容器样式 */
}

.tool-section {
  margin-bottom: 20px;
}

.tool-section-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

/* 布局网格 */
.layout-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.layout-item {
  aspect-ratio: 1;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background: white;
}

.layout-item:hover {
  border-color: #1890ff;
}

.layout-item.active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.layout-preview {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 2px;
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
  background: #d0d0d0;
  border-radius: 2px;
}

/* 控件样式 */
.control-group {
  margin-bottom: 12px;
}

.control-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  display: block;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-input {
  flex: 1;
  height: 6px;
  padding: 0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.control-value {
  font-size: 12px;
  color: #999;
  min-width: 40px;
  text-align: right;
}
</style>


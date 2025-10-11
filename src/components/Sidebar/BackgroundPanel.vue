<template>
  <div class="background-panel">
    <div class="tool-section">
      <!-- 背景颜色 -->
      <div class="control-group">
        <label class="control-label">背景颜色</label>
        <div class="color-picker-wrapper">
          <div
            class="color-preview"
            :style="{ background: store.bgColor }"
            @click="triggerColorPicker"
          ></div>
          <input
            ref="colorInput"
            type="color"
            :value="store.bgColor"
            @input="onColorChange"
            style="display: none"
          >
          <span class="color-value">{{ store.bgColor }}</span>
        </div>
      </div>
      
      <!-- 背景透明度 -->
      <div class="control-group">
        <label class="control-label">透明度</label>
        <div class="control-row">
          <input
            type="range"
            class="control-input"
            min="0"
            max="100"
            :value="store.bgOpacity"
            @input="onOpacityChange"
          >
          <span class="control-value">{{ store.bgOpacity }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'

const store = useAppStore()
const colorInput = ref<HTMLInputElement>()

/** 触发颜色选择器 */
function triggerColorPicker() {
  colorInput.value?.click()
}

/** 颜色变化 */
function onColorChange(e: Event) {
  const color = (e.target as HTMLInputElement).value
  store.setBgColor(color)
}

/** 透明度变化 */
function onOpacityChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setBgOpacity(value)
}
</script>

<style scoped>
.background-panel {
  /* 继承父容器样式 */
}

.tool-section {
  margin-bottom: 20px;
}

.control-group {
  margin-bottom: 12px;
}

.control-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  display: block;
}

/* 颜色选择器 */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.color-preview:hover {
  border-color: #1890ff;
}

.color-value {
  font-size: 12px;
  color: #666;
}

/* 控件行 */
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


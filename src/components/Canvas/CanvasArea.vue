<template>
  <div class="canvas-area">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <label>画布尺寸:</label>
      <select :value="currentPreset" @change="onPresetChange">
        <option value="800x800">800 × 800</option>
        <option value="1000x1000">1000 × 1000</option>
        <option value="1200x1200">1200 × 1200</option>
        <option value="1080x1920">1080 × 1920 (竖屏)</option>
        <option value="1920x1080">1920 × 1080 (横屏)</option>
        <option value="custom">自定义</option>
      </select>
      
      <input
        v-if="currentPreset === 'custom'"
        v-model.number="customWidth"
        type="number"
        placeholder="宽"
        class="custom-input"
        @change="onCustomSizeChange"
      >
      <input
        v-if="currentPreset === 'custom'"
        v-model.number="customHeight"
        type="number"
        placeholder="高"
        class="custom-input"
        @change="onCustomSizeChange"
      >
      
      <button class="btn export-btn" @click="exportImage">导出图片</button>
    </div>
    
    <!-- 画布容器 -->
    <div class="canvas-container">
      <CanvasRenderer ref="canvasRenderer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import CanvasRenderer from './CanvasRenderer.vue'

const store = useAppStore()
const canvasRenderer = ref<InstanceType<typeof CanvasRenderer>>()

/** 当前预设 */
const currentPreset = ref('800x800')

/** 自定义尺寸 */
const customWidth = ref(800)
const customHeight = ref(800)

/** 预设变化 */
function onPresetChange(e: Event) {
  const preset = (e.target as HTMLSelectElement).value
  currentPreset.value = preset
  
  if (preset !== 'custom') {
    store.usePresetSize(preset)
  }
}

/** 自定义尺寸变化 */
function onCustomSizeChange() {
  store.setCanvasSize(customWidth.value, customHeight.value)
}

/** 导出图片 */
function exportImage() {
  const canvas = canvasRenderer.value?.getCanvas()
  if (!canvas) {
    alert('画布未初始化')
    return
  }
  
  const link = document.createElement('a')
  link.download = `拼接图片_${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
.canvas-area {
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.canvas-toolbar {
  background: white;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.canvas-toolbar label {
  font-size: 13px;
  color: #666;
}

.canvas-toolbar select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}

.custom-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}

.btn {
  padding: 6px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.btn:hover {
  background: #40a9ff;
}

.export-btn {
  margin-left: auto;
}

.canvas-container {
  flex: 1;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;
}
</style>


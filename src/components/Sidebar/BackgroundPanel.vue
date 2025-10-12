<template>
  <div class="background-panel">
    <div class="tool-section">
      <div class="section-header">
        <Icon name="background" size="sm" />
        <h3 class="section-title">背景设置</h3>
      </div>
      
      <!-- 背景颜色 -->
      <div class="control-group">
        <label class="control-label">背景颜色</label>
        <div class="color-grid">
          <div
            v-for="color in presetColors"
            :key="color"
            :class="['color-item', { active: store.bgColor === color }]"
            :style="{ background: color }"
            @click="store.setBgColor(color)"
          >
            <Icon v-if="store.bgColor === color" name="check" size="sm" />
          </div>
          <div class="color-item color-picker-trigger" @click="triggerColorPicker">
            <input
              ref="colorInput"
              type="color"
              :value="store.bgColor"
              @input="onColorChange"
              style="display: none"
            >
            <div class="color-picker-preview" :style="{ background: store.bgColor }"></div>
            <span class="color-picker-plus">+</span>
          </div>
        </div>
      </div>
      
      <!-- 背景透明度 */
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">背景透明度</label>
          <span class="control-value">{{ store.bgOpacity }}%</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="100"
          :value="store.bgOpacity"
          @input="onOpacityChange"
        >
      </div>
      
      <!-- 快捷预设 -->
      <div class="control-group">
        <label class="control-label">快捷预设</label>
        <div class="preset-grid">
          <button
            v-for="preset in presets"
            :key="preset.name"
            class="preset-item"
            @click="applyPreset(preset)"
          >
            <div class="preset-preview" :style="{ background: preset.color }"></div>
            <span class="preset-name">{{ preset.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/Common/Icon.vue'

const store = useAppStore()
const colorInput = ref<HTMLInputElement>()

/** 预设颜色 */
const presetColors = [
  '#FFFFFF', '#F5F5F5', '#E8E8E8', '#D9D9D9',
  '#000000', '#262626', '#434343', '#595959',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'
]

/** 背景预设 */
interface Preset {
  name: string
  color: string
  opacity?: number
}

const presets: Preset[] = [
  { name: '纯白', color: '#FFFFFF', opacity: 100 },
  { name: '浅灰', color: '#F5F5F5', opacity: 100 },
  { name: '透明', color: '#FFFFFF', opacity: 0 },
  { name: '深色', color: '#1F1F1F', opacity: 100 }
]

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

/** 应用预设 */
function applyPreset(preset: Preset) {
  store.setBgColor(preset.color)
  if (preset.opacity !== undefined) {
    store.setBgOpacity(preset.opacity)
  }
}
</script>

<style scoped>
.background-panel {
  animation: fade-in var(--duration-base) var(--ease-out);
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

/* 分组标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-neutral-700);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

/* 控件组 */
.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.control-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
  font-family: var(--font-family-mono);
}

/* 颜色网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2);
}

.color-item {
  aspect-ratio: 1;
  border: 2px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-0);
  position: relative;
  overflow: hidden;
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.color-item.active {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-primary);
}

.color-item Icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* 自定义颜色选择器 */
.color-picker-trigger {
  background: linear-gradient(135deg, 
    #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, 
    #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%);
  position: relative;
}

.color-picker-preview {
  position: absolute;
  inset: 4px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-neutral-0);
}

.color-picker-plus {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-0);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 预设网格 */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-2);
}

.preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.preset-item:hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.preset-preview {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color-base);
}

.preset-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}
</style>

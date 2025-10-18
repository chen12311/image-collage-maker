<template>
  <div class="background-panel">
    <div class="tool-section">
      <div class="section-header">
        <Icon name="background" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.background.title') }}</h3>
      </div>
      
      <!-- 类型切换 -->
      <div class="control-group">
        <div class="type-tabs">
          <button
            :class="['type-tab', { active: store.bgType === 'color' }]"
            @click="store.setBgType('color')"
          >
            <Icon name="palette" size="sm" />
            <span>{{ $t('sidebar.background.solidColor') }}</span>
          </button>
          <button
            :class="['type-tab', { active: store.bgType === 'image' }]"
            @click="store.setBgType('image')"
          >
            <Icon name="image" size="sm" />
            <span>{{ $t('sidebar.background.image') }}</span>
          </button>
        </div>
      </div>
      
      <!-- 纯色模式 -->
      <template v-if="store.bgType === 'color'">
        <!-- 背景颜色 -->
        <div class="control-group">
          <label class="control-label">{{ $t('sidebar.background.bgColor') }}</label>
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
        
        <!-- 背景透明度 -->
        <div class="control-group">
          <div class="control-label-row">
            <label class="control-label">{{ $t('sidebar.background.bgOpacity') }}</label>
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
          <label class="control-label">{{ $t('sidebar.background.quickPresets') }}</label>
          <div class="preset-grid">
            <button
              v-for="preset in presets"
              :key="preset.key"
              class="preset-item"
              @click="applyPreset(preset)"
            >
              <div class="preset-preview" :style="{ background: preset.color }"></div>
              <span class="preset-name">{{ $t(`sidebar.background.${preset.key}`) }}</span>
            </button>
          </div>
        </div>
      </template>
      
      <!-- 图片模式 -->
      <template v-else>
        <!-- 上传区域 -->
        <div v-if="!store.bgImageUrl" class="control-group">
          <div
            :class="['upload-area', { 'upload-dragging': isDragging }]"
            @click="triggerUpload"
            @drop="onDrop"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @dragend="isDragging = false"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onFileChange"
            >
            <div class="upload-icon">
              <Icon :name="isDragging ? 'download' : 'upload'" size="lg" />
            </div>
            <div class="upload-text">
              <p class="upload-primary">{{ isDragging ? $t('sidebar.background.releaseToUpload') : $t('sidebar.background.clickOrDragImage') }}</p>
              <p class="upload-secondary">{{ $t('sidebar.background.supportedImageFormats') }}</p>
            </div>
          </div>
        </div>
        
        <!-- 图片预览 -->
        <div v-else class="control-group">
          <label class="control-label">{{ $t('sidebar.background.bgImage') }}</label>
          <div class="image-preview-container">
            <img :src="store.bgImageUrl" alt="背景图片" class="image-preview">
            <button class="image-remove" @click="removeBgImage">
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </div>
        
        <!-- 图片效果 -->
        <template v-if="store.bgImageUrl">
          <!-- 透明度 -->
          <div class="control-group">
            <div class="control-label-row">
              <label class="control-label">{{ $t('sidebar.background.opacity') }}</label>
              <span class="control-value">{{ store.bgImageEffects.opacity }}%</span>
            </div>
            <input
              type="range"
              class="control-slider"
              min="0"
              max="100"
              :value="store.bgImageEffects.opacity"
              @input="onImageOpacityChange"
            >
          </div>
          
          <!-- 模糊 -->
          <div class="control-group">
            <div class="control-label-row">
              <label class="control-label">{{ $t('sidebar.background.blur') }}</label>
              <span class="control-value">{{ store.bgImageEffects.blur }}px</span>
            </div>
            <input
              type="range"
              class="control-slider"
              min="0"
              max="20"
              :value="store.bgImageEffects.blur"
              @input="onBlurChange"
            >
          </div>
          
          <!-- 亮度 -->
          <div class="control-group">
            <div class="control-label-row">
              <label class="control-label">{{ $t('sidebar.background.brightness') }}</label>
              <span class="control-value">{{ store.bgImageEffects.brightness }}%</span>
            </div>
            <input
              type="range"
              class="control-slider"
              min="0"
              max="200"
              :value="store.bgImageEffects.brightness"
              @input="onBrightnessChange"
            >
          </div>
          
          <!-- 对比度 -->
          <div class="control-group">
            <div class="control-label-row">
              <label class="control-label">{{ $t('sidebar.background.contrast') }}</label>
              <span class="control-value">{{ store.bgImageEffects.contrast }}%</span>
            </div>
            <input
              type="range"
              class="control-slider"
              min="0"
              max="200"
              :value="store.bgImageEffects.contrast"
              @input="onContrastChange"
            >
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/Common/Icon.vue'
import { toast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const store = useAppStore()
const { t } = useI18n()
const colorInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

/** 预设颜色 */
const presetColors = [
  '#FFFFFF', '#F5F5F5', '#E8E8E8', '#D9D9D9',
  '#000000', '#262626', '#434343', '#595959',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'
]

/** 背景预设 */
interface Preset {
  key: string
  color: string
  opacity?: number
}

const presets: Preset[] = [
  { key: 'pureWhite', color: '#FFFFFF', opacity: 100 },
  { key: 'lightGray', color: '#F5F5F5', opacity: 100 },
  { key: 'transparent', color: '#FFFFFF', opacity: 0 },
  { key: 'dark', color: '#1F1F1F', opacity: 100 }
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

/** 触发文件选择 */
function triggerUpload() {
  fileInput.value?.click()
}

/** 文件选择变化 */
async function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    await handleFile(files[0])
    // 清空input，允许重复选择同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

/** 拖拽放置 */
async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await handleFile(files[0])
  }
}

/** 处理文件 */
async function handleFile(file: File) {
  try {
    if (!file.type.startsWith('image/')) {
      toast.warning(t('toast.pleaseSelectImage'))
      return
    }
    
    // 读取为 Data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      if (url) {
        store.setBgImage(url)
        toast.success(t('toast.bgImageUploaded'))
      }
    }
    reader.onerror = () => {
      toast.error(t('toast.bgImageReadError'))
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('图片处理失败:', error)
    toast.error(t('toast.bgImageProcessError'))
  }
}

/** 删除背景图片 */
function removeBgImage() {
  store.clearBgImage()
  toast.info(t('toast.bgImageCleared'))
}

/** 图片透明度变化 */
function onImageOpacityChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setBgImageOpacity(value)
}

/** 模糊变化 */
function onBlurChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setBgImageBlur(value)
}

/** 亮度变化 */
function onBrightnessChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setBgImageBrightness(value)
}

/** 对比度变化 */
function onContrastChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setBgImageContrast(value)
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

/* 类型切换 */
.type-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2);
  padding: 4px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-md);
}

.type-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-fast);
}

.type-tab:hover {
  color: var(--color-neutral-800);
  background: var(--color-neutral-200);
}

.type-tab.active {
  background: var(--color-neutral-0);
  color: var(--color-primary-500);
  box-shadow: var(--shadow-sm);
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

/* 上传区域 */
.upload-area {
  position: relative;
  padding: var(--spacing-6);
  border: 2px dashed var(--border-color-base);
  border-radius: var(--radius-lg);
  background: var(--color-neutral-50);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-info-bg) 100%);
  opacity: 0;
  transition: var(--transition-base);
}

.upload-area:hover {
  border-color: var(--color-primary-400);
  background: var(--color-neutral-0);
}

.upload-area:hover::before {
  opacity: 0.3;
}

.upload-area.upload-dragging {
  border-color: var(--color-primary-500);
  border-style: solid;
  background: var(--color-primary-50);
  transform: scale(1.02);
}

.upload-area.upload-dragging::before {
  opacity: 1;
}

.upload-icon {
  position: relative;
  z-index: 1;
  color: var(--color-primary-500);
  transition: var(--transition-transform);
}

.upload-area:hover .upload-icon {
  transform: translateY(-4px);
}

.upload-area.upload-dragging .upload-icon {
  animation: bounce var(--duration-slower) var(--ease-in-out) infinite;
}

.upload-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.upload-primary {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
}

.upload-secondary {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
}

/* 图片预览 */
.image-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color-base);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-remove {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-error);
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.image-preview-container:hover .image-remove {
  opacity: 1;
  transform: scale(1);
}

.image-remove:hover {
  background: var(--color-error);
  color: var(--color-neutral-0);
  transform: scale(1.1);
}

/* 滑块 */
.control-slider {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-neutral-200);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.control-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-primary-500);
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.control-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: var(--shadow-md);
}

.control-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-primary-500);
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.control-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: var(--shadow-md);
}
</style>

<template>
  <div class="text-panel">
    <div class="tool-section">
      <div class="section-header">
        <Icon name="text" size="sm" />
        <h3 class="section-title">添加文字</h3>
      </div>
      
      <!-- 文字输入 -->
      <div class="control-group">
        <label class="control-label">文字内容</label>
        <textarea
          v-model="textContent"
          class="text-input"
          placeholder="输入要添加到画布的文字..."
          rows="3"
        ></textarea>
      </div>
      
      <!-- 字体大小 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">字体大小</label>
          <span class="control-value">{{ fontSize }}px</span>
        </div>
        <input
          v-model.number="fontSize"
          type="range"
          class="control-slider"
          min="12"
          max="120"
        >
      </div>
      
      <!-- 文字颜色 -->
      <div class="control-group">
        <label class="control-label">文字颜色</label>
        <div class="color-grid">
          <div
            v-for="color in presetColors"
            :key="color"
            :class="['color-item', { active: textColor === color }]"
            :style="{ background: color }"
            @click="textColor = color"
          >
            <Icon v-if="textColor === color" name="check" size="sm" />
          </div>
          <div class="color-item color-picker-trigger" @click="triggerColorPicker">
            <input
              ref="colorInput"
              type="color"
              v-model="textColor"
              style="display: none"
            >
            <div class="color-picker-preview" :style="{ background: textColor }"></div>
            <span class="color-picker-plus">+</span>
          </div>
        </div>
      </div>
      
      <!-- 添加按钮 -->
      <Button
        variant="primary"
        size="md"
        icon="text"
        block
        @click="addText"
      >
        添加文字
      </Button>
      
      <!-- 文字列表 -->
      <div v-if="store.hasTexts" class="text-list-section">
        <div class="section-header">
          <span class="text-count">已添加 {{ store.texts.length }} 个</span>
          <Button
            variant="text"
            size="sm"
            @click="clearAllTexts"
          >
            清空
          </Button>
        </div>
        
        <TransitionGroup name="text-list" tag="div" class="text-list">
          <div
            v-for="text in store.texts"
            :key="text.id"
            :class="['text-item', { selected: text.selected }]"
            @click="store.selectText(text.id)"
          >
            <div class="text-preview">
              <div class="text-color-indicator" :style="{ background: text.color }"></div>
              <span class="text-content">{{ text.content }}</span>
            </div>
            <button class="text-remove" @click.stop="removeText(text.id)">
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createTextElement } from '@/core/models'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import { toast } from '@/composables/useToast'

const store = useAppStore()
const colorInput = ref<HTMLInputElement>()

/** 文字内容 */
const textContent = ref('')

/** 字体大小 */
const fontSize = ref(32)

/** 文字颜色 */
const textColor = ref('#000000')

/** 预设颜色 */
const presetColors = [
  '#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F',
  '#B19CD9', '#FF85A2'
]

/** 触发颜色选择器 */
function triggerColorPicker() {
  colorInput.value?.click()
}

/** 添加文字 */
function addText() {
  if (!textContent.value.trim()) {
    toast.warning('请输入文字内容')
    return
  }
  
  // 在画布中心添加文字
  const x = store.canvasWidth / 2
  const y = store.canvasHeight / 2
  
  const text = createTextElement(textContent.value, x, y, {
    fontSize: fontSize.value,
    color: textColor.value
  })
  
  store.addText(text)
  toast.success('文字已添加')
  
  // 清空输入
  textContent.value = ''
}

/** 删除文字 */
function removeText(id: string) {
  store.removeText(id)
  toast.info('已删除文字')
}

/** 清空所有文字 */
function clearAllTexts() {
  if (confirm('确定要清空所有文字吗？')) {
    store.clearTexts()
    toast.info('已清空所有文字')
  }
}
</script>

<style scoped>
.text-panel {
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
  justify-content: space-between;
  gap: var(--spacing-2);
  color: var(--color-neutral-700);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  flex: 1;
}

.text-count {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
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

/* 文字输入框 */
.text-input {
  width: 100%;
  padding: var(--spacing-3);
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-800);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  resize: vertical;
  transition: var(--transition-base);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

/* 颜色网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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

.color-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  transition: var(--transition-fast);
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
  position: relative;
  z-index: 1;
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

/* 文字列表 */
.text-list-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.text-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.text-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.text-item:hover {
  border-color: var(--color-primary-400);
  background: var(--color-neutral-50);
  transform: translateX(4px);
}

.text-item.selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-primary);
}

.text-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
  min-width: 0;
}

.text-color-indicator {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color-base);
  flex-shrink: 0;
}

.text-content {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.text-remove:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* 列表动画 */
.text-list-move {
  transition: transform var(--duration-base) var(--ease-out);
}

.text-list-enter-active {
  animation: slide-in-right var(--duration-base) var(--ease-out);
}

.text-list-leave-active {
  position: absolute;
  animation: slide-in-right var(--duration-base) var(--ease-in) reverse;
}
</style>

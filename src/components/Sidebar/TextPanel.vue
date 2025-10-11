<template>
  <div class="text-panel">
    <div class="tool-section">
      <!-- 文字输入 -->
      <div class="control-group">
        <label class="control-label">输入文字</label>
        <textarea
          v-model="textContent"
          class="text-input-area"
          placeholder="在画布上添加文字..."
        ></textarea>
      </div>
      
      <!-- 字体大小 -->
      <div class="control-group">
        <label class="control-label">字体大小</label>
        <input
          v-model.number="fontSize"
          type="number"
          class="control-input"
          min="12"
          max="200"
        >
      </div>
      
      <!-- 文字颜色 -->
      <div class="control-group">
        <label class="control-label">文字颜色</label>
        <div class="color-picker-wrapper">
          <div class="color-preview" :style="{ background: textColor }" @click="triggerColorPicker"></div>
          <input ref="colorInput" type="color" v-model="textColor" style="display: none">
          <span class="color-value">{{ textColor }}</span>
        </div>
      </div>
      
      <!-- 添加按钮 -->
      <button class="btn" @click="addText">添加文字</button>
      
      <!-- 文字列表 -->
      <div v-if="store.hasTexts" class="text-list">
        <div class="tool-section-title">已添加的文字</div>
        <div
          v-for="text in store.texts"
          :key="text.id"
          class="text-item"
          :class="{ selected: text.selected }"
          @click="store.selectText(text.id)"
        >
          <span class="text-content">{{ text.content }}</span>
          <button class="remove-btn" @click.stop="store.removeText(text.id)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createTextElement } from '@/core/models'

const store = useAppStore()
const colorInput = ref<HTMLInputElement>()

/** 文字内容 */
const textContent = ref('')

/** 字体大小 */
const fontSize = ref(24)

/** 文字颜色 */
const textColor = ref('#000000')

/** 触发颜色选择器 */
function triggerColorPicker() {
  colorInput.value?.click()
}

/** 添加文字 */
function addText() {
  if (!textContent.value.trim()) {
    alert('请输入文字内容')
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
  
  // 清空输入
  textContent.value = ''
}
</script>

<style scoped>
.text-panel {
  /* 继承父容器样式 */
}

.tool-section {
  margin-bottom: 20px;
}

.tool-section-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  margin-top: 20px;
  font-weight: 500;
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

.control-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.3s;
}

.control-input:focus {
  outline: none;
  border-color: #1890ff;
}

.text-input-area {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
}

.text-input-area:focus {
  outline: none;
  border-color: #1890ff;
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
}

.color-value {
  font-size: 12px;
  color: #666;
}

/* 按钮 */
.btn {
  width: 100%;
  padding: 8px 16px;
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

/* 文字列表 */
.text-list {
  margin-top: 16px;
}

.text-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.text-item:hover {
  border-color: #1890ff;
  background: #f0f7ff;
}

.text-item.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.text-content {
  flex: 1;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.8);
  color: white;
}
</style>


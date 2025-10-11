<template>
  <div class="properties">
    <div class="properties-title">透明度信息</div>
    
    <!-- 全局透明度 -->
    <div class="control-group">
      <label class="control-label">整体透明度</label>
      <div class="control-row">
        <input
          type="range"
          class="control-input"
          min="0"
          max="100"
          :value="store.globalOpacity"
          @input="onGlobalOpacityChange"
        >
        <span class="control-value">{{ store.globalOpacity }}%</span>
      </div>
    </div>
    
    <!-- 图片透明度 -->
    <div class="control-group">
      <label class="control-label">图片透明度</label>
      <div class="control-row">
        <input
          type="range"
          class="control-input"
          min="0"
          max="100"
          :value="store.imageOpacity"
          @input="onImageOpacityChange"
        >
        <span class="control-value">{{ store.imageOpacity }}%</span>
      </div>
    </div>
    
    <!-- 历史操作 -->
    <div class="history-section">
      <div class="properties-title">历史操作</div>
      <div class="history-buttons">
        <button
          class="btn btn-secondary"
          :disabled="!historyManager.canUndo"
          @click="undo"
          title="撤销 (Ctrl+Z)"
        >
          撤销
        </button>
        <button
          class="btn btn-secondary"
          :disabled="!historyManager.canRedo"
          @click="redo"
          title="重做 (Ctrl+Y)"
        >
          重做
        </button>
      </div>
      <div class="history-info">
        <span>撤销: {{ historyManager.undoCount }}</span>
        <span>重做: {{ historyManager.redoCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createHistoryManager } from '@/history/HistoryManager'

const store = useAppStore()

/** 历史管理器 */
const historyManager = createHistoryManager()

/** 全局透明度变化 */
function onGlobalOpacityChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setGlobalOpacity(value)
}

/** 图片透明度变化 */
function onImageOpacityChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setImageOpacity(value)
}

/** 撤销 */
function undo() {
  const state = historyManager.undo()
  if (state) {
    store.restoreState(state)
  }
}

/** 重做 */
function redo() {
  const state = historyManager.redo()
  if (state) {
    store.restoreState(state)
  }
}

/** 键盘快捷键 */
function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    redo()
  }
}

/** 监听状态变化，记录历史 */
watch(
  () => store.currentState,
  (newState) => {
    historyManager.push(newState)
  },
  { deep: true }
)

/** 组件挂载 */
onMounted(() => {
  // 记录初始状态
  historyManager.push(store.currentState)
  
  // 注册键盘事件
  window.addEventListener('keydown', handleKeydown)
})

/** 组件卸载 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.properties {
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.properties-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.control-group {
  margin-bottom: 16px;
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

.history-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.history-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-secondary {
  background: white;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover:not(:disabled) {
  color: #1890ff;
  border-color: #1890ff;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}
</style>


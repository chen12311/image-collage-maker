<template>
  <div class="properties">
    <!-- 透明度设置 -->
    <div class="properties-section">
      <div class="section-header">
        <Icon name="eye" size="sm" />
        <h3 class="section-title">透明度</h3>
      </div>
      
      <!-- 全局透明度 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">整体透明度</label>
          <span class="control-value">{{ store.globalOpacity }}%</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="100"
          :value="store.globalOpacity"
          @input="onGlobalOpacityChange"
        >
      </div>
      
      <!-- 图片透明度 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">图片透明度</label>
          <span class="control-value">{{ store.imageOpacity }}%</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="100"
          :value="store.imageOpacity"
          @input="onImageOpacityChange"
        >
      </div>
    </div>
    
    <div class="divider"></div>
    
    <!-- 历史操作 -->
    <div class="properties-section">
      <div class="section-header">
        <Icon name="undo" size="sm" />
        <h3 class="section-title">历史操作</h3>
      </div>
      
      <div class="history-buttons">
        <Tooltip content="撤销" placement="bottom" shortcut="Ctrl+Z">
          <Button
            variant="secondary"
            size="sm"
            icon="undo"
            :disabled="!historyManager.canUndo"
            @click="undo"
            block
          >
            撤销
          </Button>
        </Tooltip>
        <Tooltip content="重做" placement="bottom" shortcut="Ctrl+Y">
          <Button
            variant="secondary"
            size="sm"
            icon="redo"
            :disabled="!historyManager.canRedo"
            @click="redo"
            block
          >
            重做
          </Button>
        </Tooltip>
      </div>
      
      <div class="history-info">
        <div class="history-stat">
          <span class="stat-label">可撤销</span>
          <span class="stat-value">{{ historyManager.undoCount }}</span>
        </div>
        <div class="history-stat">
          <span class="stat-label">可重做</span>
          <span class="stat-value">{{ historyManager.redoCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <!-- 重置按钮 -->
    <Button
      variant="ghost"
      size="md"
      icon="trash"
      block
      @click="resetAll"
    >
      重置所有设置
    </Button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createHistoryManager } from '@/history/HistoryManager'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import Tooltip from '@/components/Common/Tooltip.vue'
import { toast } from '@/composables/useToast'
import { useKeyboard, SHORTCUTS } from '@/composables/useKeyboard'

const store = useAppStore()
const { registerShortcut } = useKeyboard()

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
    toast.info('已撤销')
  }
}

/** 重做 */
function redo() {
  const state = historyManager.redo()
  if (state) {
    store.restoreState(state)
    toast.info('已重做')
  }
}

/** 重置所有 */
function resetAll() {
  if (confirm('确定要重置所有设置吗？这将清空所有内容。')) {
    store.reset()
    historyManager.clear()
    historyManager.push(store.currentState)
    toast.success('已重置所有设置')
  }
}

/** 键盘快捷键 */
function handleKeydown(e: KeyboardEvent) {
  // 快捷键已在 useKeyboard 中全局注册
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

// 注册快捷键
registerShortcut({
  ...SHORTCUTS.UNDO,
  handler: () => undo()
})

registerShortcut({
  ...SHORTCUTS.REDO,
  handler: () => redo()
})
</script>

<style scoped>
.properties {
  height: 100%;
  padding: var(--spacing-5);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

/* 分组 */
.properties-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
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

.control-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.control-slider {
  width: 100%;
}

/* 历史按钮 */
.history-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2);
}

/* 历史信息 */
.history-info {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-3);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
}

.history-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
  font-family: var(--font-family-mono);
}

/* 分割线 */
.divider {
  height: 1px;
  background: var(--border-color-light);
}
</style>

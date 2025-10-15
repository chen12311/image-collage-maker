<template>
  <div class="settings-panel">
    <!-- 透明度设置 -->
    <div class="panel-section">
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
import { useAppStore } from '@/store/useAppStore'
import { createHistoryManager } from '@/history/HistoryManager'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import { toast } from '@/composables/useToast'

const store = useAppStore()
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

/** 重置所有 */
function resetAll() {
  if (confirm('确定要重置所有设置吗？这将清空所有内容。')) {
    store.reset()
    historyManager.clear()
    historyManager.push(store.currentState)
    toast.success('已重置所有设置')
  }
}
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

/* 分组 */
.panel-section {
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

/* 分割线 */
.divider {
  height: 1px;
  background: var(--border-color-light);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all var(--duration-fast) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>


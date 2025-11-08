<template>
  <div class="settings-panel">
    <!-- 透明度设置 -->
    <div class="panel-section">
      <div class="section-header">
        <Icon name="eye" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.settings.opacitySection') }}</h3>
      </div>
      
      <!-- 全局透明度 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">{{ $t('sidebar.settings.globalOpacity') }}</label>
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
          <label class="control-label">{{ $t('sidebar.settings.imageOpacity') }}</label>
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
    
    <!-- 图片适应模式 -->
    <div class="panel-section">
      <div class="section-header">
        <Icon name="image" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.settings.fitModeSection') }}</h3>
      </div>
      
      <div class="control-group">
        <label class="control-label">{{ $t('sidebar.settings.fitMode') }}</label>
        <Select
          :model-value="store.defaultFitMode"
          :options="fitModeOptions"
          @update:model-value="onFitModeChange"
        />
        <p class="control-hint">{{ getFitModeDescription(store.defaultFitMode) }}</p>
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
      {{ $t('sidebar.settings.resetAll') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createHistoryManager } from '@/history/HistoryManager'
import type { ImageFitMode } from '@/core/models'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import Select from '@/components/Common/Select.vue'
import { toast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const store = useAppStore()
const { t } = useI18n()
const historyManager = createHistoryManager()

/** 适应模式选项 */
const fitModeOptions = computed(() => [
  { value: 'contain', label: t('sidebar.settings.contain') },
  { value: 'cover', label: t('sidebar.settings.cover') },
  { value: 'fill', label: t('sidebar.settings.fill') }
])

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

/** 适应模式变化 */
function onFitModeChange(mode: string | number) {
  store.setDefaultFitMode(mode as ImageFitMode)
}

/** 获取适应模式描述 */
function getFitModeDescription(mode: ImageFitMode): string {
  switch (mode) {
    case 'cover':
      return t('sidebar.settings.coverDesc')
    case 'contain':
      return t('sidebar.settings.containDesc')
    case 'fill':
      return t('sidebar.settings.fillDesc')
    default:
      return ''
  }
}

/** 重置所有 */
function resetAll() {
  if (confirm(t('confirm.resetAll'))) {
    store.reset()
    historyManager.clear()
    historyManager.push(store.currentState)
    toast.success(t('toast.allReset'))
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

.control-hint {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
  line-height: 1.4;
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


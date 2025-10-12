<template>
  <div class="canvas-area">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <label class="toolbar-label">画布尺寸:</label>
        <select
          :value="currentPreset"
          @change="onPresetChange"
          class="toolbar-select"
        >
          <option value="800x800">800 × 800</option>
          <option value="1000x1000">1000 × 1000</option>
          <option value="1200x1200">1200 × 1200</option>
          <option value="1080x1920">1080 × 1920 (竖屏)</option>
          <option value="1920x1080">1920 × 1080 (横屏)</option>
          <option value="custom">自定义</option>
        </select>
        
        <Transition name="fade">
          <div v-if="currentPreset === 'custom'" class="custom-size-inputs">
            <input
              v-model.number="customWidth"
              type="number"
              placeholder="宽"
              class="size-input"
              @change="onCustomSizeChange"
            >
            <span class="size-separator">×</span>
            <input
              v-model.number="customHeight"
              type="number"
              placeholder="高"
              class="size-input"
              @change="onCustomSizeChange"
            >
          </div>
        </Transition>
      </div>
      
      <div class="toolbar-right">
        <Tooltip content="导出图片" placement="bottom" shortcut="Ctrl+S">
          <Button
            variant="primary"
            size="sm"
            icon="download"
            :loading="isExporting"
            @click="exportImage"
          >
            导出图片
          </Button>
        </Tooltip>
      </div>
    </div>
    
    <!-- 画布容器 -->
    <div class="canvas-container checkerboard">
      <div class="canvas-wrapper">
        <CanvasRenderer ref="canvasRenderer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import CanvasRenderer from './CanvasRenderer.vue'
import Button from '@/components/Common/Button.vue'
import Tooltip from '@/components/Common/Tooltip.vue'
import { toast } from '@/composables/useToast'
import { useKeyboard, SHORTCUTS } from '@/composables/useKeyboard'

const store = useAppStore()
const canvasRenderer = ref<InstanceType<typeof CanvasRenderer>>()
const { registerShortcut } = useKeyboard()

/** 当前预设 */
const currentPreset = ref('800x800')

/** 自定义尺寸 */
const customWidth = ref(800)
const customHeight = ref(800)

/** 导出中 */
const isExporting = ref(false)

/** 预设变化 */
function onPresetChange(e: Event) {
  const preset = (e.target as HTMLSelectElement).value
  currentPreset.value = preset
  
  if (preset !== 'custom') {
    store.usePresetSize(preset)
    toast.info(`画布尺寸已更改为 ${preset.replace('x', ' × ')}`)
  }
}

/** 自定义尺寸变化 */
function onCustomSizeChange() {
  if (customWidth.value > 0 && customHeight.value > 0) {
    store.setCanvasSize(customWidth.value, customHeight.value)
    toast.info(`画布尺寸已更改为 ${customWidth.value} × ${customHeight.value}`)
  }
}

/** 导出图片 */
async function exportImage() {
  const canvas = canvasRenderer.value?.getCanvas()
  if (!canvas) {
    toast.error('画布未初始化')
    return
  }
  
  if (store.images.length === 0) {
    toast.warning('请先上传图片')
    return
  }
  
  try {
    isExporting.value = true
    
    // 模拟导出延迟（给用户反馈）
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const link = document.createElement('a')
    link.download = `拼接图片_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
    
    toast.success('图片导出成功！')
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('图片导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

// 注册导出快捷键
registerShortcut({
  ...SHORTCUTS.SAVE,
  handler: () => exportImage()
})
</script>

<style scoped>
.canvas-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-5);
  gap: var(--spacing-4);
  background: var(--color-neutral-100);
}

/* 工具栏 */
.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
}

.toolbar-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
  white-space: nowrap;
}

.toolbar-select {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-800);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  outline: none;
}

.toolbar-select:hover {
  border-color: var(--color-primary-400);
}

.toolbar-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.custom-size-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.size-input {
  width: 80px;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  text-align: center;
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.size-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.size-separator {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-500);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* 画布容器 */
.canvas-container {
  flex: 1;
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: var(--spacing-6);
  min-height: 0;
}

.canvas-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xl);
  border-radius: var(--radius-sm);
  overflow: hidden;
  animation: fade-in var(--duration-base) var(--ease-out);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .canvas-area {
    padding: var(--spacing-3);
  }
  
  .canvas-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left {
    flex-wrap: wrap;
  }
  
  .toolbar-right {
    justify-content: stretch;
  }
  
  .toolbar-right Button {
    width: 100%;
  }
}
</style>

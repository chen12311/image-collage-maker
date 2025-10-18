<template>
  <div class="canvas-area">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <label class="toolbar-label">{{ $t('canvas.canvasSize') }}:</label>
        <Select
          v-model="currentPreset"
          :options="sizePresets"
          size="md"
        />
        
        <Transition name="fade">
          <div v-if="currentPreset === 'custom'" class="custom-size-inputs">
            <input
              v-model.number="customWidth"
              type="number"
              :placeholder="$t('canvas.customWidth')"
              class="size-input"
              @change="onCustomSizeChange"
            >
            <span class="size-separator">×</span>
            <input
              v-model.number="customHeight"
              type="number"
              :placeholder="$t('canvas.customHeight')"
              class="size-input"
              @change="onCustomSizeChange"
            >
          </div>
        </Transition>
        
        <!-- 分隔符 -->
        <div class="toolbar-divider"></div>
        
        <!-- 缩放比例 -->
        <div class="zoom-indicator">
          <Icon name="search" size="sm" />
          <span class="zoom-text">{{ $t('canvas.zoom') }}：{{ store.canvasScalePercent }}%</span>
        </div>
        
        <!-- 缩放控制按钮组 -->
        <div class="zoom-controls">
          <Tooltip :content="`${$t('canvas.zoomOut')} (Ctrl+-)`" placement="bottom">
            <button 
              class="zoom-btn" 
              :disabled="store.canvasScale <= 0.1"
              @click="store.zoomOut"
            >
              <Icon name="minus" size="sm" />
            </button>
          </Tooltip>
          
          <Tooltip :content="`${$t('canvas.zoomIn')} (Ctrl++)`" placement="bottom">
            <button 
              class="zoom-btn"
              :disabled="store.canvasScale >= 2"
              @click="store.zoomIn"
            >
              <Icon name="plus" size="sm" />
            </button>
          </Tooltip>
          
          <Tooltip :content="`${$t('canvas.resetZoom')} (Ctrl+0)`" placement="bottom">
            <button class="zoom-btn" @click="store.resetZoom">
              <Icon name="maximize" size="sm" />
            </button>
          </Tooltip>
          
          <Tooltip :content="$t('canvas.fitToView')" placement="bottom">
            <button 
              class="zoom-btn"
              :class="{ active: store.autoFit }"
              @click="store.fitToView"
            >
              <Icon name="fit" size="sm" />
            </button>
          </Tooltip>
          
          <div class="zoom-divider"></div>
          
          <Tooltip :content="$t('canvas.autoFit')" placement="bottom">
            <button 
              class="zoom-btn zoom-toggle"
              :class="{ active: store.autoFit }"
              @click="store.toggleAutoFit"
            >
              <Icon :name="store.autoFit ? 'lock' : 'unlock'" size="sm" />
            </button>
          </Tooltip>
        </div>
        
        <!-- 分隔符 -->
        <div class="toolbar-divider"></div>
        
        <!-- 导出格式 -->
        <label class="toolbar-label">导出格式:</label>
        <div class="format-selector">
          <button
            v-for="fmt in ['png', 'jpeg', 'webp']"
            :key="fmt"
            :class="['format-btn', { active: store.exportFormat === fmt }]"
            @click="store.setExportFormat(fmt as 'png' | 'jpeg' | 'webp')"
          >
            {{ fmt.toUpperCase() }}
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <!-- 撤销按钮 -->
        <Tooltip :content="$t('canvas.undo')" placement="bottom" shortcut="Ctrl+Z">
          <button class="toolbar-btn" :disabled="!store.canUndo" @click="store.undo">
            <Icon name="undo" size="md" />
          </button>
        </Tooltip>
        
        <!-- 重做按钮 -->
        <Tooltip :content="$t('canvas.redo')" placement="bottom" shortcut="Ctrl+Y">
          <button class="toolbar-btn" :disabled="!store.canRedo" @click="store.redo">
            <Icon name="redo" size="md" />
          </button>
        </Tooltip>
        
        <!-- 分隔符 -->
        <div class="toolbar-divider"></div>
        
        <!-- 导出按钮 -->
        <Tooltip :content="$t('canvas.export')" placement="bottom" shortcut="Ctrl+S">
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
    <div ref="canvasContainer" class="canvas-container checkerboard">
      <div 
        class="canvas-wrapper"
        :style="{ transform: `scale(${store.canvasScale})` }"
      >
        <CanvasRenderer ref="canvasRenderer" />
        <CanvasInteractionLayer />
        <TextInteractionLayer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import CanvasRenderer from './CanvasRenderer.vue'
import CanvasInteractionLayer from './CanvasInteractionLayer.vue'
import TextInteractionLayer from './TextInteractionLayer.vue'
import Button from '@/components/Common/Button.vue'
import Tooltip from '@/components/Common/Tooltip.vue'
import Icon from '@/components/Common/Icon.vue'
import Select, { type SelectOption } from '@/components/Common/Select.vue'
import { toast } from '@/composables/useToast'
import { useKeyboard, SHORTCUTS } from '@/composables/useKeyboard'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const store = useAppStore()
const { t } = useI18n()
const canvasRenderer = ref<InstanceType<typeof CanvasRenderer>>()
const canvasContainer = ref<HTMLDivElement>()
const { registerShortcut } = useKeyboard()

/** 画布尺寸预设选项 */
const sizePresets = computed<SelectOption[]>(() => [
  { label: '800 × 800', value: '800x800' },
  { label: '1000 × 1000', value: '1000x1000' },
  { label: '1200 × 1200', value: '1200x1200' },
  { label: t('canvas.preset1080x1920'), value: '1080x1920' },
  { label: t('canvas.preset1920x1080'), value: '1920x1080' },
  { label: t('canvas.presetCustom'), value: 'custom' }
])

/** 当前预设 */
const currentPreset = ref('800x800')

/** 自定义尺寸 */
const customWidth = ref(800)
const customHeight = ref(800)

/** 导出中 */
const isExporting = ref(false)

/** 监听预设变化 */
watch(currentPreset, (preset) => {
  if (preset !== 'custom') {
    store.usePresetSize(preset as string)
    toast.info(`${t('canvas.canvasSize')}: ${(preset as string).replace('x', ' × ')}`)
  }
})

/** 自定义尺寸变化 */
function onCustomSizeChange() {
  if (customWidth.value > 0 && customHeight.value > 0) {
    store.setCanvasSize(customWidth.value, customHeight.value)
    toast.info(`${t('canvas.canvasSize')}: ${customWidth.value} × ${customHeight.value}`)
  }
}

/** 导出图片 */
async function exportImage() {
  const canvas = canvasRenderer.value?.getCanvas()
  if (!canvas) {
    toast.error(t('canvas.canvasNotInitialized'))
    return
  }
  
  if (store.images.length === 0) {
    toast.warning(t('canvas.noImages'))
    return
  }
  
  try {
    isExporting.value = true
    
    // 模拟导出延迟（给用户反馈）
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 根据Store中的配置确定格式和质量
    const format = store.exportFormat === 'png' 
      ? 'image/png' 
      : store.exportFormat === 'jpeg' 
        ? 'image/jpeg' 
        : 'image/webp'
    
    // PNG使用1.0，JPEG/WebP使用0.92的固定质量
    const quality = store.exportFormat === 'png' ? 1.0 : 0.92
    const ext = store.exportFormat
    
    // 生成文件名
    const filename = `拼接图片_${store.canvasWidth}x${store.canvasHeight}_${Date.now()}.${ext}`
    
    // 导出
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL(format, quality)
    link.click()
    
    toast.success(`图片已导出为 ${ext.toUpperCase()} 格式！`)
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('图片导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

/** 滚轮缩放处理 */
function handleWheel(event: WheelEvent) {
  // 只在按住Ctrl/Cmd时触发缩放
  if (!event.ctrlKey && !event.metaKey) return
  
  event.preventDefault()
  
  // 关闭自动适配
  store.autoFit = false
  
  // 根据滚轮方向缩放（deltaY > 0 向下滚，缩小；< 0 向上滚，放大）
  const delta = event.deltaY > 0 ? -0.05 : 0.05
  const newScale = Math.max(0.1, Math.min(2, store.canvasScale + delta))
  store.setCanvasScale(newScale)
}

// 注册撤销/重做快捷键
registerShortcut({
  ...SHORTCUTS.UNDO,
  handler: () => store.undo()
})

registerShortcut({
  ...SHORTCUTS.REDO,
  handler: () => store.redo()
})

// 注册导出快捷键
registerShortcut({
  ...SHORTCUTS.SAVE,
  handler: () => exportImage()
})

// 注册缩放快捷键
registerShortcut({
  key: '=', // 实际是 +
  ctrl: true,
  description: t('canvas.zoomIn'),
  handler: () => store.zoomIn()
})

registerShortcut({
  key: '-',
  ctrl: true,
  description: t('canvas.zoomOut'),
  handler: () => store.zoomOut()
})

registerShortcut({
  key: '0',
  ctrl: true,
  description: t('canvas.resetZoom'),
  handler: () => store.resetZoom()
})

/** 组件挂载时绑定滚轮事件 */
onMounted(() => {
  const container = canvasContainer.value
  if (container) {
    container.addEventListener('wheel', handleWheel, { passive: false })
  }
})

/** 组件卸载时清理 */
onUnmounted(() => {
  const container = canvasContainer.value
  if (container) {
    container.removeEventListener('wheel', handleWheel)
  }
})
</script>

<style scoped>
.canvas-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-5);
  gap: var(--spacing-4);
  /* 透明背景棋盘格（类似 Photoshop） */
  background-color: var(--color-neutral-200);
  background-image: 
    linear-gradient(45deg, var(--color-neutral-300) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-neutral-300) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-neutral-300) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-neutral-300) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
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
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.custom-size-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.size-input {
  width: 70px;
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-mono);
  text-align: center;
  color: var(--color-neutral-800);
  background: var(--color-neutral-50);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.size-input:hover {
  border-color: var(--color-primary-400);
  background-color: var(--color-neutral-0);
}

.size-input:focus {
  border-color: var(--color-primary-500);
  background-color: var(--color-neutral-0);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.size-separator {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-500);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* 工具栏分隔符 */
.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color-light);
  margin: 0 var(--spacing-2);
}

/* 缩放指示器 */
.zoom-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.zoom-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-mono);
  color: var(--color-primary-600);
  white-space: nowrap;
}

/* 缩放控制按钮组 */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-2);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: var(--transition-fast);
}

.zoom-btn:hover:not(:disabled) {
  background: var(--color-neutral-100);
  color: var(--color-primary-500);
}

.zoom-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-btn.active {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
}

.zoom-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color-light);
  margin: 0 var(--spacing-1);
}

/* 格式选择器 */
.format-selector {
  display: flex;
  gap: var(--spacing-1);
}

.format-btn {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  text-transform: uppercase;
  min-width: 48px;
}

.format-btn:hover {
  border-color: var(--color-primary-400);
  background: var(--color-neutral-50);
  color: var(--color-primary-600);
}

.format-btn.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

/* 工具栏按钮（撤销/重做） */
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: var(--transition-fast);
}

.toolbar-btn:hover {
  background: var(--color-neutral-100);
  color: var(--color-primary-500);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn:disabled:hover {
  background: transparent;
  color: var(--color-neutral-600);
}

/* 画布容器 */
.canvas-container {
  flex: 1;
  /* 移除白色背景，让棋盘格透过来 */
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: var(--spacing-6);
  min-height: 0;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 移除阴影和圆角，让棋盘格清晰显示 */
  overflow: hidden;
  animation: fade-in var(--duration-base) var(--ease-out);
  transform-origin: center center;
  transition: transform 0.2s ease-out;
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
  
  .toolbar-divider {
    display: none;
  }
  
  .toolbar-right {
    justify-content: stretch;
  }
  
  .toolbar-right Button {
    width: 100%;
  }
}
</style>

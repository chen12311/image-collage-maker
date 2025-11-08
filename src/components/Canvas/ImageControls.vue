<template>
  <div class="image-controls" :style="controlsStyle">
    <div class="controls-toolbar">
      <Tooltip :content="$t('interaction.flipHorizontalTooltip')" placement="top">
        <button class="control-btn" @click="$emit('flip-horizontal')" :aria-label="$t('interaction.flipHorizontalTooltip')">
          <Icon name="flip-horizontal" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip :content="$t('interaction.flipVerticalTooltip')" placement="top">
        <button class="control-btn" @click="$emit('flip-vertical')" :aria-label="$t('interaction.flipVerticalTooltip')">
          <Icon name="flip-vertical" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip :content="$t('interaction.rotateTooltip')" placement="top">
        <button class="control-btn" @click="$emit('rotate')" :aria-label="$t('interaction.rotateTooltip')">
          <Icon name="rotate-cw" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip :content="fitModeTooltip" placement="top">
        <button class="control-btn" @click="cycleFitMode" :aria-label="fitModeTooltip">
          <Icon :name="fitModeIcon" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip :content="$t('interaction.cropTooltip')" placement="top">
        <button class="control-btn" @click="$emit('crop')" :aria-label="$t('interaction.cropTooltip')">
          <Icon name="crop" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip :content="$t('interaction.deleteTooltip')" placement="top">
        <button class="control-btn control-btn-danger" @click="$emit('delete')" :aria-label="$t('interaction.deleteTooltip')">
          <Icon name="trash" size="sm" />
        </button>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ImageFitMode } from '@/core/models'
import Icon from '@/components/Common/Icon.vue'
import Tooltip from '@/components/Common/Tooltip.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/** 组件属性 */
interface Props {
  /** X坐标 */
  x: number
  
  /** Y坐标 */
  y: number
  
  /** 宽度 */
  width: number
  
  /** 高度 */
  height: number
  
  /** 适应模式 */
  fitMode: ImageFitMode
}

const props = defineProps<Props>()

/** 事件定义 */
const emit = defineEmits<{
  'flip-horizontal': []
  'flip-vertical': []
  'rotate': []
  'crop': []
  'delete': []
  'change-fit-mode': [mode: ImageFitMode]
}>()

/** 控制器样式 */
const controlsStyle = computed(() => ({
  left: `${props.x + props.width - 4}px`,
  top: `${props.y + 4}px`,
  transform: 'translateX(-100%)'
}))

/** 适应模式图标 */
const fitModeIcon = computed(() => {
  switch (props.fitMode) {
    case 'cover':
      return 'maximize' // 裁剪填充
    case 'contain':
      return 'minimize' // 完整显示
    case 'fill':
      return 'maximize-2' // 拉伸填充
    default:
      return 'minimize'
  }
})

/** 适应模式提示 */
const fitModeTooltip = computed(() => {
  const modeName = t(`sidebar.settings.${props.fitMode}`)
  return `${t('sidebar.settings.fitMode')}: ${modeName}`
})

/** 循环切换适应模式 */
function cycleFitMode() {
  const modes: ImageFitMode[] = ['contain', 'cover', 'fill']
  const currentIndex = modes.indexOf(props.fitMode)
  const nextIndex = (currentIndex + 1) % modes.length
  emit('change-fit-mode', modes[nextIndex])
}
</script>

<style scoped>
.image-controls {
  position: absolute;
  pointer-events: auto;
  z-index: 10;
  animation: fade-in var(--duration-fast) var(--ease-out);
}

.controls-toolbar {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-0);
  cursor: pointer;
  transition: var(--transition-fast);
  outline: none;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}

.control-btn-danger:hover {
  background: var(--color-error);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-100%) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(-100%) translateY(0);
  }
}
</style>


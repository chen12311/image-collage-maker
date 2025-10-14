<template>
  <div class="image-controls" :style="controlsStyle">
    <div class="controls-toolbar">
      <Tooltip content="水平翻转" placement="top">
        <button class="control-btn" @click="$emit('flip-horizontal')" aria-label="水平翻转">
          <Icon name="flip-horizontal" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip content="垂直翻转" placement="top">
        <button class="control-btn" @click="$emit('flip-vertical')" aria-label="垂直翻转">
          <Icon name="flip-vertical" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip content="旋转 90°" placement="top">
        <button class="control-btn" @click="$emit('rotate')" aria-label="旋转">
          <Icon name="rotate-cw" size="sm" />
        </button>
      </Tooltip>
      
      <Tooltip content="删除图片" placement="top">
        <button class="control-btn control-btn-danger" @click="$emit('delete')" aria-label="删除">
          <Icon name="trash" size="sm" />
        </button>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/Common/Icon.vue'
import Tooltip from '@/components/Common/Tooltip.vue'

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
}

const props = defineProps<Props>()

/** 事件定义 */
defineEmits<{
  'flip-horizontal': []
  'flip-vertical': []
  'rotate': []
  'delete': []
}>()

/** 控制器样式 */
const controlsStyle = computed(() => ({
  left: `${props.x + props.width - 4}px`,
  top: `${props.y + 4}px`,
  transform: 'translateX(-100%)'
}))
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


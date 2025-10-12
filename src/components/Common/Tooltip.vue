<template>
  <div
    class="tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot />
    <Transition name="tooltip">
      <div
        v-if="showTooltip"
        ref="tooltipRef"
        :class="['tooltip', `tooltip-${placement}`]"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          {{ content }}
          <kbd v-if="shortcut" class="tooltip-shortcut">{{ shortcut }}</kbd>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/** Tooltip属性 */
interface Props {
  /** 提示内容 */
  content: string
  /** 位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** 快捷键 */
  shortcut?: string
  /** 延迟显示（毫秒） */
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  delay: 300
})

const showTooltip = ref(false)
const tooltipRef = ref<HTMLElement>()
let timeoutId: number | null = null

/** Tooltip样式 */
const tooltipStyle = computed(() => {
  // 这里可以根据需要动态计算位置
  return {}
})

/** 鼠标进入 */
function handleMouseEnter() {
  timeoutId = window.setTimeout(() => {
    showTooltip.value = true
  }, props.delay)
}

/** 鼠标离开 */
function handleMouseLeave() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  showTooltip.value = false
}
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: var(--z-index-tooltip);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-neutral-800);
  color: var(--color-neutral-0);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-tight);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
  pointer-events: none;
}

/* 位置 */
.tooltip-top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

/* 箭头 */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 4px solid transparent;
}

.tooltip-top .tooltip-arrow {
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--color-neutral-800);
}

.tooltip-bottom .tooltip-arrow {
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--color-neutral-800);
}

.tooltip-left .tooltip-arrow {
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--color-neutral-800);
}

.tooltip-right .tooltip-arrow {
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--color-neutral-800);
}

/* 内容 */
.tooltip-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* 快捷键 */
.tooltip-shortcut {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-style: normal;
  line-height: 1;
}

/* 动画 */
.tooltip-enter-active {
  animation: tooltip-in var(--duration-fast) var(--ease-out);
}

.tooltip-leave-active {
  animation: tooltip-out var(--duration-fast) var(--ease-in);
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes tooltip-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>


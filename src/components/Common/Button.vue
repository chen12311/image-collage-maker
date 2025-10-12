<template>
  <button
    :class="['btn', variantClass, sizeClass, { 'btn-loading': loading, 'btn-block': block }]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <Icon v-if="icon && !loading" :name="icon" :size="iconSize" class="btn-icon" />
    <span v-if="$slots.default" class="btn-text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

/** 按钮属性 */
interface Props {
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'text' | 'danger'
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 图标 */
  icon?: string
  /** 加载中 */
  loading?: boolean
  /** 禁用 */
  disabled?: boolean
  /** 块级按钮 */
  block?: boolean
  /** HTML type */
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

/** 变体类名 */
const variantClass = computed(() => `btn-${props.variant}`)

/** 尺寸类名 */
const sizeClass = computed(() => `btn-${props.size}`)

/** 图标尺寸 */
const iconSize = computed(() => {
  const sizeMap = { sm: 'sm', md: 'sm', lg: 'md' }
  return sizeMap[props.size] as 'sm' | 'md'
})

/** 处理点击 */
function handleClick(event: MouseEvent) {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-align: center;
  white-space: nowrap;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  outline: none;
  user-select: none;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

/* 尺寸 */
.btn-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
  min-height: 28px;
}

.btn-md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  min-height: 36px;
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  min-height: 44px;
}

/* 块级按钮 */
.btn-block {
  width: 100%;
}

/* 主按钮 */
.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
}

.btn-primary:active:not(:disabled) {
  background: var(--color-primary-700);
}

/* 次要按钮 */
.btn-secondary {
  background: var(--color-neutral-0);
  color: var(--color-neutral-700);
  border: 1px solid var(--border-color-base);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
  box-shadow: var(--shadow-base);
}

.btn-secondary:active:not(:disabled) {
  background: var(--color-neutral-50);
}

/* 幽灵按钮 */
.btn-ghost {
  background: transparent;
  color: var(--color-neutral-700);
  border: 1px solid var(--border-color-base);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-400);
}

.btn-ghost:active:not(:disabled) {
  background: var(--color-neutral-100);
}

/* 文字按钮 */
.btn-text {
  background: transparent;
  color: var(--color-neutral-700);
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);
}

.btn-text:hover:not(:disabled) {
  background: var(--color-neutral-100);
  color: var(--color-primary-500);
}

.btn-text:active:not(:disabled) {
  background: var(--color-neutral-200);
}

/* 危险按钮 */
.btn-danger {
  background: var(--color-error);
  color: var(--color-neutral-0);
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-error-light);
  box-shadow: var(--shadow-error);
}

/* 禁用状态 */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 加载中 */
.btn-loading {
  position: relative;
  pointer-events: none;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 图标 */
.btn-icon {
  flex-shrink: 0;
}

.btn-text {
  flex: 1;
}
</style>


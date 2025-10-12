<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="item in toasts"
          :key="item.id"
          :class="['toast', `toast-${item.type}`, { 'toast-visible': item.visible }]"
          @click="removeToast(item.id)"
        >
          <Icon :name="iconName(item.type)" size="md" class="toast-icon" />
          <span class="toast-message">{{ item.message }}</span>
          <button class="toast-close" @click.stop="removeToast(item.id)">
            <Icon name="close" size="sm" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type ToastType } from '@/composables/useToast'
import Icon from './Icon.vue'

const { toasts, removeToast } = useToast()

/** 获取图标名称 */
function iconName(type: ToastType): string {
  const iconMap: Record<ToastType, string> = {
    success: 'check',
    error: 'alert-circle',
    warning: 'alert-circle',
    info: 'info'
  }
  return iconMap[type]
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: var(--z-index-tooltip);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 320px;
  max-width: 480px;
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--color-neutral-0);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  cursor: pointer;
  transition: var(--transition-base);
  border-left: 4px solid currentColor;
}

.toast:hover {
  box-shadow: var(--shadow-xl);
  transform: translateX(-4px);
}

/* 类型样式 */
.toast-success {
  color: var(--color-success);
}

.toast-error {
  color: var(--color-error);
}

.toast-warning {
  color: var(--color-warning);
}

.toast-info {
  color: var(--color-info);
}

/* 图标 */
.toast-icon {
  flex-shrink: 0;
}

/* 消息 */
.toast-message {
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-800);
}

/* 关闭按钮 */
.toast-close {
  flex-shrink: 0;
  padding: var(--spacing-1);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-neutral-500);
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

/* Toast动画 */
.toast-enter-active {
  animation: toast-in var(--duration-base) var(--ease-bounce);
}

.toast-leave-active {
  animation: toast-out var(--duration-base) var(--ease-in);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .toast-container {
    left: var(--spacing-4);
    right: var(--spacing-4);
    top: var(--spacing-4);
  }

  .toast {
    min-width: auto;
    width: 100%;
  }
}
</style>


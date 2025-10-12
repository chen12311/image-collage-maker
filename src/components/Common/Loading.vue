<template>
  <!-- 全局Loading -->
  <Teleport v-if="type === 'global'" to="body">
    <Transition name="fade">
      <div v-if="visible" class="loading-overlay">
        <div class="loading-spinner-wrapper">
          <div class="loading-spinner"></div>
          <p v-if="text" class="loading-text">{{ text }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 内联Loading -->
  <div v-else-if="type === 'inline'" class="loading-inline">
    <div class="loading-spinner loading-spinner-inline"></div>
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>

  <!-- 骨架屏 -->
  <div v-else-if="type === 'skeleton'" class="skeleton-wrapper">
    <slot>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line" style="width: 60%;"></div>
    </slot>
  </div>
</template>

<script setup lang="ts">
/** Loading属性 */
interface Props {
  /** 类型 */
  type?: 'global' | 'inline' | 'skeleton'
  /** 是否显示 */
  visible?: boolean
  /** 提示文本 */
  text?: string
}

withDefaults(defineProps<Props>(), {
  type: 'inline',
  visible: true
})
</script>

<style scoped>
/* 全局Loading遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.loading-spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
}

/* 加载旋转器 */
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-neutral-200);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.loading-spinner-inline {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

/* 内联Loading */
.loading-inline {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* 提示文本 */
.loading-text {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  text-align: center;
}

/* 骨架屏 */
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-line {
  height: 16px;
  width: 100%;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>


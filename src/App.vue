<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-left">
        <button class="header-toggle-btn" @click="toggleSidebar" aria-label="切换侧边栏">
          <Icon name="menu" size="md" />
        </button>
        <h1 class="app-title">
          <Icon name="image" size="lg" />
          图片批量拼接工具
        </h1>
      </div>
      <div class="header-right">
        <Tooltip content="快捷键帮助" placement="bottom" shortcut="?">
          <button class="header-btn" @click="helpVisible = !helpVisible">
            <Icon name="help" size="md" />
          </button>
        </Tooltip>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="app-main">
      <!-- 左侧工具栏 -->
      <aside :class="['app-sidebar', { collapsed: sidebarCollapsed }]">
        <Sidebar />
      </aside>
      
      <!-- 中间画布区域 -->
      <main class="app-canvas">
        <CanvasArea />
      </main>
    </div>

    <!-- Toast通知 -->
    <Toast />

    <!-- 快捷键帮助面板 -->
    <Transition name="fade">
      <div v-if="helpVisible" class="help-overlay" @click="helpVisible = false">
        <div class="help-panel" @click.stop>
          <div class="help-header">
            <h2>快捷键帮助</h2>
            <button class="help-close" @click="helpVisible = false">
              <Icon name="close" size="md" />
            </button>
          </div>
          <div class="help-content">
            <div class="help-section">
              <h3>常用操作</h3>
              <div class="help-item">
                <span class="help-desc">撤销</span>
                <kbd class="help-key">Ctrl + Z</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">重做</span>
                <kbd class="help-key">Ctrl + Y</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">导出图片</span>
                <kbd class="help-key">Ctrl + S</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">删除选中</span>
                <kbd class="help-key">Delete</kbd>
              </div>
            </div>
            <div class="help-section">
              <h3>布局切换</h3>
              <div class="help-item">
                <span class="help-desc">切换到布局1-4</span>
                <kbd class="help-key">1-4</kbd>
              </div>
            </div>
            <div class="help-section">
              <h3>视图控制</h3>
              <div class="help-item">
                <span class="help-desc">切换侧边栏</span>
                <kbd class="help-key">Space</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import CanvasArea from './components/Canvas/CanvasArea.vue'
import Toast from './components/Common/Toast.vue'
import Icon from './components/Common/Icon.vue'
import Tooltip from './components/Common/Tooltip.vue'
import { useSidebar } from './composables/useResponsive'
import { useKeyboard, SHORTCUTS } from './composables/useKeyboard'
import { useAppStore } from './store/useAppStore'

const store = useAppStore()
const { sidebarCollapsed, toggleSidebar } = useSidebar()
const { registerShortcut } = useKeyboard()
const helpVisible = ref(false)

// 注册全局快捷键
registerShortcut({
  ...SHORTCUTS.TOGGLE_SIDEBAR,
  handler: () => toggleSidebar()
})

registerShortcut({
  ...SHORTCUTS.LAYOUT_1,
  handler: () => store.setLayoutType(1)
})

registerShortcut({
  ...SHORTCUTS.LAYOUT_2,
  handler: () => store.setLayoutType(2)
})

registerShortcut({
  ...SHORTCUTS.LAYOUT_3,
  handler: () => store.setLayoutType(3)
})

registerShortcut({
  ...SHORTCUTS.LAYOUT_4,
  handler: () => store.setLayoutType(4)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-neutral-100);
  overflow: hidden;
}

/* 顶部标题栏 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--spacing-4);
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-index-sticky);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-toggle-btn {
  display: none;
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

.header-toggle-btn:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-800);
}

.app-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.header-btn {
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

.header-btn:hover {
  background: var(--color-neutral-100);
  color: var(--color-primary-500);
}

.header-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.header-btn:disabled:hover {
  background: transparent;
  color: var(--color-neutral-600);
}

/* 主内容区 */
.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.app-sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--color-neutral-0);
  border-right: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: 0;
  border-right: none;
}

/* 画布区域 */
.app-canvas {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 快捷键帮助 */
.help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  padding: var(--spacing-4);
}

.help-panel {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: scale-in var(--duration-base) var(--ease-bounce);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-color-light);
}

.help-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
}

.help-close {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: var(--transition-fast);
}

.help-close:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-800);
}

.help-content {
  flex: 1;
  padding: var(--spacing-6);
  overflow-y: auto;
}

.help-section {
  margin-bottom: var(--spacing-6);
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  margin: 0 0 var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-700);
}

.help-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.help-item:hover {
  background: var(--color-neutral-50);
}

.help-desc {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
}

.help-key {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-style: normal;
  color: var(--color-neutral-700);
  background: var(--color-neutral-100);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

/* 响应式 */
@media (max-width: 1200px) {
  .header-toggle-btn {
    display: flex;
  }
  
  .app-sidebar {
    position: absolute;
    left: 0;
    top: var(--header-height);
    bottom: 0;
    z-index: var(--z-index-dropdown);
  }
  
  .app-sidebar.collapsed {
    left: calc(-1 * var(--sidebar-width));
  }
}

@media (max-width: 768px) {
  .app-title {
    font-size: var(--font-size-base);
  }
}
</style>


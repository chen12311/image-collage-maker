<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-left">
        <button class="header-toggle-btn" @click="toggleSidebar" :aria-label="$t('app.toggleSidebar')">
          <Icon name="menu" size="md" />
        </button>
        <h1 class="app-title">
          <Icon name="image" size="lg" />
          {{ $t('app.title') }}
        </h1>
      </div>
      <div class="header-right">
        <!-- 语言切换 -->
        <div class="language-switcher" @click="toggleLanguageMenu" ref="languageButton">
          <button class="header-btn-with-text">
            <span class="btn-text">{{ $t('language.name') }}</span>
            <Icon name="globe" size="md" />
          </button>
          <Transition name="dropdown">
            <div v-if="languageMenuVisible" class="language-menu" @click.stop>
              <button
                v-for="lang in availableLocales"
                :key="lang.value"
                :class="['language-item', { active: store.locale === lang.value }]"
                @click="switchLanguage(lang.value)"
              >
                <span>{{ lang.label }}</span>
                <Icon v-if="store.locale === lang.value" name="check" size="sm" />
              </button>
            </div>
          </Transition>
        </div>
        
        <Tooltip :content="$t('shortcuts.title')" placement="bottom" shortcut="?">
          <button class="header-btn-with-text" @click="helpVisible = !helpVisible">
            <span class="btn-text">{{ $t('shortcuts.help') }}</span>
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
            <h2>{{ $t('shortcuts.title') }}</h2>
            <button class="help-close" @click="helpVisible = false">
              <Icon name="close" size="md" />
            </button>
          </div>
          <div class="help-content">
            <div class="help-section">
              <h3>{{ $t('shortcuts.commonOps') }}</h3>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.undo') }}</span>
                <kbd class="help-key">{{ ctrlKey }} + Z</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.redo') }}</span>
                <kbd class="help-key">{{ ctrlKey }} + Y</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.export') }}</span>
                <kbd class="help-key">{{ ctrlKey }} + S</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.deleteSelected') }}</span>
                <kbd class="help-key">Delete</kbd>
              </div>
            </div>
            <div class="help-section">
              <h3>{{ $t('shortcuts.zoomControl') }}</h3>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.zoomIn') }}</span>
                <kbd class="help-key">{{ ctrlKey }} + =</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.zoomOut') }}</span>
                <kbd class="help-key">{{ ctrlKey }} + -</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.resetZoom') }}</span>
                <kbd class="help-key">{{ ctrlKey }} + 0</kbd>
              </div>
            </div>
            <div class="help-section">
              <h3>{{ $t('shortcuts.viewControl') }}</h3>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.toggleSidebar') }}</span>
                <kbd class="help-key">Space</kbd>
              </div>
              <div class="help-item">
                <span class="help-desc">{{ $t('shortcuts.showHelp') }}</span>
                <kbd class="help-key">?</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import CanvasArea from './components/Canvas/CanvasArea.vue'
import Toast from './components/Common/Toast.vue'
import Icon from './components/Common/Icon.vue'
import Tooltip from './components/Common/Tooltip.vue'
import { useSidebar } from './composables/useResponsive'
import { useKeyboard, SHORTCUTS } from './composables/useKeyboard'
import { useAppStore } from './store/useAppStore'
import { availableLocales, type Locale } from './locales'
import { updateAllSEOTags } from './utils/seo'

const store = useAppStore()
const { sidebarCollapsed, toggleSidebar } = useSidebar()
const { registerShortcut } = useKeyboard()
const helpVisible = ref(false)
const languageMenuVisible = ref(false)
const languageButton = ref<HTMLElement>()

/** 检测是否是 Mac 系统 */
const isMac = computed(() => {
  return navigator.platform.toUpperCase().includes('MAC')
})

/** 获取修饰键显示文本 */
const ctrlKey = computed(() => isMac.value ? '⌘' : 'Ctrl')

// 注册全局快捷键
registerShortcut({
  ...SHORTCUTS.TOGGLE_SIDEBAR,
  handler: () => toggleSidebar()
})

// 语言切换
function switchLanguage(locale: Locale) {
  store.setLocale(locale)
  languageMenuVisible.value = false
}

function toggleLanguageMenu() {
  languageMenuVisible.value = !languageMenuVisible.value
}

// 点击外部关闭语言菜单
function handleClickOutside(e: MouseEvent) {
  if (languageButton.value && !languageButton.value.contains(e.target as Node)) {
    languageMenuVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 初始化 SEO 标签（根据当前语言）
  updateAllSEOTags(store.locale)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

/* 语言切换器 */
.language-switcher {
  position: relative;
}

.language-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: var(--z-index-dropdown);
}

.language-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: transparent;
  border: none;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
}

.language-item:hover {
  background: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

.language-item.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  font-weight: var(--font-weight-semibold);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--duration-fast) var(--ease-out);
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
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

/* 带文字的按钮 */
.header-btn-with-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 36px;
  padding: 0 var(--spacing-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: var(--transition-fast);
}

.header-btn-with-text:hover {
  background: var(--color-neutral-100);
  color: var(--color-primary-500);
}

.header-btn-with-text .btn-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
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


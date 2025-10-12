<template>
  <div class="sidebar">
    <!-- 标签页切换 -->
    <div class="tool-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tool-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
        :aria-label="tab.label"
      >
        <Icon :name="tab.icon" size="md" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- 工具面板内容 -->
    <div class="tool-content">
      <Transition name="fade" mode="out-in">
        <LayoutPanel v-if="activeTab === 'layout'" key="layout" />
        <ImagePanel v-else-if="activeTab === 'image'" key="image" />
        <TextPanel v-else-if="activeTab === 'text'" key="text" />
        <BackgroundPanel v-else-if="activeTab === 'background'" key="background" />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Common/Icon.vue'
import LayoutPanel from './LayoutPanel.vue'
import ImagePanel from './ImagePanel.vue'
import TextPanel from './TextPanel.vue'
import BackgroundPanel from './BackgroundPanel.vue'

/** 标签页配置 */
interface Tab {
  id: string
  label: string
  icon: string
}

/** 标签页列表 */
const tabs: Tab[] = [
  { id: 'layout', label: '布局', icon: 'layout' },
  { id: 'image', label: '图片', icon: 'image' },
  { id: 'text', label: '文字', icon: 'text' },
  { id: 'background', label: '背景', icon: 'background' }
]

/** 当前激活的标签页 */
const activeTab = ref('layout')
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* 标签页 */
.tool-tabs {
  display: flex;
  flex-direction: column;
  width: 72px;
  flex-shrink: 0;
  background: var(--color-neutral-0);
  border-right: 1px solid var(--border-color-light);
}

.tool-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  padding: var(--spacing-3);
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  cursor: pointer;
  color: var(--color-neutral-600);
  transition: var(--transition-fast);
  position: relative;
}

.tool-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-primary-50);
  opacity: 0;
  transition: var(--transition-fast);
}

.tool-tab:hover::before {
  opacity: 1;
}

.tool-tab:hover {
  color: var(--color-primary-500);
}

.tool-tab.active {
  color: var(--color-primary-500);
  border-left-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.tool-tab.active::before {
  opacity: 0.5;
}

.tab-icon {
  position: relative;
  z-index: 1;
  transition: var(--transition-transform);
  flex-shrink: 0;
}

.tool-tab:hover .tab-icon {
  transform: scale(1.1);
}

.tab-label {
  position: relative;
  z-index: 1;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  text-align: center;
}

/* 工具内容 */
.tool-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-5);
  background: var(--color-neutral-0);
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
</style>


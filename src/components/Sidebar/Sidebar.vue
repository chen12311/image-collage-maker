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
      >
        {{ tab.label }}
      </button>
    </div>
    
    <!-- 工具面板内容 -->
    <div class="tool-content">
      <LayoutPanel v-show="activeTab === 'layout'" />
      <ImagePanel v-show="activeTab === 'image'" />
      <TextPanel v-show="activeTab === 'text'" />
      <BackgroundPanel v-show="activeTab === 'background'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutPanel from './LayoutPanel.vue'
import ImagePanel from './ImagePanel.vue'
import TextPanel from './TextPanel.vue'
import BackgroundPanel from './BackgroundPanel.vue'

/** 标签页列表 */
const tabs = [
  { id: 'layout', label: '布局' },
  { id: 'image', label: '传图' },
  { id: 'text', label: '文字' },
  { id: 'background', label: '背景' }
]

/** 当前激活的标签页 */
const activeTab = ref('layout')
</script>

<style scoped>
.sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tool-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tool-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  background: #f9f9f9;
  border: none;
  font-size: 14px;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tool-tab:hover {
  background: #f0f0f0;
}

.tool-tab.active {
  background: white;
  border-bottom-color: #1890ff;
  color: #1890ff;
}

.tool-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>


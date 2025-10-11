<template>
  <div class="app-container">
    <!-- 左侧工具栏 -->
    <Sidebar class="sidebar" />
    
    <!-- 中间画布区域 -->
    <CanvasArea class="canvas-area" />
    
    <!-- 右侧属性栏 -->
    <Properties class="properties" />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar/Sidebar.vue'
import CanvasArea from './components/Canvas/CanvasArea.vue'
import Properties from './components/Properties/Properties.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.canvas-area {
  flex: 1;
  min-width: 0;
}

.properties {
  width: 260px;
  flex-shrink: 0;
}
</style>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>


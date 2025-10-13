<template>
  <div class="layout-panel">
    <!-- 分类Tab -->
    <div class="tool-section">
      <div class="section-header">
        <Icon name="grid" size="sm" />
        <h3 class="section-title">选择布局</h3>
      </div>
      
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.value"
          class="category-tab"
          :class="{ active: activeCategory === category.value }"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
    
    <!-- 布局选择器 -->
    <div class="tool-section">
      <div class="layout-grid">
        <div
          v-for="layout in filteredLayouts"
          :key="layout.id"
          class="layout-item hover-lift"
          :class="{ active: store.layoutType === layout.id }"
          @click="selectLayout(layout.id)"
        >
          <!-- 使用新的布局预览组件 -->
          <LayoutPreview
            :cells="layout.cells"
            :active="store.layoutType === layout.id"
          />
          
          <!-- 布局名称 -->
          <div class="layout-info">
            <span class="layout-name">{{ layout.name }}</span>
            <span class="layout-count">{{ layout.imageCount }}图</span>
          </div>
          
          <!-- 选中标记 -->
          <Transition name="scale">
            <div v-if="store.layoutType === layout.id" class="layout-check">
              <Icon name="check" size="sm" />
            </div>
          </Transition>
        </div>
      </div>
    </div>
    
    <!-- 布局参数 -->
    <div class="tool-section">
      <div class="section-header">
        <Icon name="settings" size="sm" />
        <h3 class="section-title">布局参数</h3>
      </div>
      
      <!-- 间距 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">间距</label>
          <span class="control-value">{{ store.spacing }}px</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="50"
          :value="store.spacing"
          @input="onSpacingChange"
        >
      </div>
      
      <!-- 边距 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">边距</label>
          <span class="control-value">{{ store.padding }}px</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="100"
          :value="store.padding"
          @input="onPaddingChange"
        >
      </div>
      
      <!-- 圆角 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">圆角</label>
          <span class="control-value">{{ store.radius }}px</span>
        </div>
        <input
          type="range"
          class="control-slider"
          min="0"
          max="50"
          :value="store.radius"
          @input="onRadiusChange"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import Icon from '@/components/Common/Icon.vue'
import LayoutPreview from '@/components/Common/LayoutPreview.vue'
import { LAYOUT_TEMPLATES, LayoutCategory } from '@/core/models'

const store = useAppStore()

/** 分类配置 */
const categories = [
  { value: LayoutCategory.Grid, label: '基础网格' },
  { value: LayoutCategory.Creative, label: '创意组合' },
  { value: LayoutCategory.Social, label: '社交媒体' }
]

/** 当前选中的分类 */
const activeCategory = ref<LayoutCategory>(LayoutCategory.Grid)

/** 过滤后的布局列表 */
const filteredLayouts = computed(() => {
  return LAYOUT_TEMPLATES.filter(layout => layout.category === activeCategory.value)
})

/** 选择布局 */
function selectLayout(id: string) {
  store.setLayoutType(id)
}

/** 间距变化 */
function onSpacingChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setSpacing(value)
}

/** 边距变化 */
function onPaddingChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setPadding(value)
}

/** 圆角变化 */
function onRadiusChange(e: Event) {
  const value = parseInt((e.target as HTMLInputElement).value)
  store.setRadius(value)
}
</script>

<style scoped>
.layout-panel {
  animation: fade-in var(--duration-base) var(--ease-out);
}

.tool-section {
  margin-bottom: var(--spacing-6);
}

.tool-section:last-child {
  margin-bottom: 0;
}

/* 分组标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  color: var(--color-neutral-700);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

/* 分类Tab */
.category-tabs {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.category-tab {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-neutral-0);
  border: 2px solid var(--border-color-base);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: var(--transition-base);
}

.category-tab:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-600);
}

.category-tab.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: var(--font-weight-semibold);
}

/* 布局网格 */
.layout-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--spacing-2);
}

/* 自定义滚动条 */
.layout-grid::-webkit-scrollbar {
  width: 6px;
}

.layout-grid::-webkit-scrollbar-track {
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
}

.layout-grid::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
}

.layout-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-400);
}

.layout-item {
  position: relative;
  aspect-ratio: 1;
  padding: var(--spacing-3);
  background: var(--color-neutral-0);
  border: 2px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.layout-item:hover {
  border-color: var(--color-primary-400);
  transform: translateY(-2px);
}

.layout-item.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-primary);
}

/* 布局信息 */
.layout-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
}

.layout-name {
  font-weight: var(--font-weight-medium);
}

.layout-count {
  color: var(--color-neutral-500);
  font-family: var(--font-family-mono);
}

.layout-item.active .layout-info {
  color: var(--color-primary-700);
}

.layout-item.active .layout-count {
  color: var(--color-primary-600);
}

/* 选中标记 */
.layout-check {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

/* 控件样式 */
.control-group {
  margin-bottom: var(--spacing-5);
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.control-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
  font-family: var(--font-family-mono);
  min-width: 48px;
  text-align: right;
}

.control-slider {
  width: 100%;
}

/* 缩放动画 */
.scale-enter-active {
  animation: scale-in var(--duration-fast) var(--ease-bounce);
}

.scale-leave-active {
  animation: scale-out var(--duration-fast) var(--ease-in);
}
</style>

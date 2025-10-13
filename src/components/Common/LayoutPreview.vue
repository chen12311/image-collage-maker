<template>
  <div class="layout-preview" :class="{ active }">
    <div
      v-for="(cell, index) in cells"
      :key="index"
      class="layout-cell"
      :style="getCellStyle(cell)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Cell } from '@/core/models'

/** 组件属性 */
interface Props {
  /** 单元格列表（归一化坐标） */
  cells: readonly Cell[]
  
  /** 是否选中 */
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

/**
 * 获取单元格样式
 * 将归一化坐标转换为百分比定位
 */
function getCellStyle(cell: Cell): Record<string, string> {
  const [x, y, w, h] = cell
  
  return {
    position: 'absolute',
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${w * 100}%`,
    height: `${h * 100}%`,
    padding: '1px' // 模拟间距效果
  }
}
</script>

<style scoped>
.layout-preview {
  position: relative;
  width: 100%;
  height: 100%;
  transition: var(--transition-transform);
}

.layout-cell {
  box-sizing: border-box;
  transition: var(--transition-fast);
}

.layout-cell::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-neutral-300);
  border-radius: var(--radius-xs);
  transition: var(--transition-fast);
}

/* 选中状态 */
.layout-preview.active .layout-cell::before {
  background: var(--color-primary-400);
}

/* Hover状态 */
.layout-preview:hover .layout-cell::before {
  background: var(--color-primary-300);
}
</style>


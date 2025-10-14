<template>
  <div class="interaction-layer" ref="layerRef" :style="layerStyle">
    <!-- 为每个图片创建交互热区 -->
    <div
      v-for="(cell, index) in computedCells"
      :key="images[index]?.id || `cell-${index}`"
      class="interaction-zone"
      :style="getZoneStyle(cell)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
    >
      <!-- 悬浮时显示控制按钮 -->
      <Transition name="controls-fade">
        <ImageControls
          v-if="hoveredIndex === index && images[index]"
          :x="cell.x"
          :y="cell.y"
          :width="cell.width"
          :height="cell.height"
          @flip-horizontal="handleFlipHorizontal(images[index].id)"
          @flip-vertical="handleFlipVertical(images[index].id)"
          @rotate="handleRotate(images[index].id)"
          @delete="handleDelete(images[index].id)"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { computeLayout } from '@/layout/LayoutEngine'
import ImageControls from './ImageControls.vue'
import { toast } from '@/composables/useToast'

const store = useAppStore()
const layerRef = ref<HTMLDivElement>()
const hoveredIndex = ref<number | null>(null)

/** 计算所有单元格的位置 */
const computedCells = computed(() => {
  const layout = computeLayout(
    store.layoutConfig,
    store.canvasWidth,
    store.canvasHeight
  )
  return layout.cells
})

/** 图片列表 */
const images = computed(() => store.images)

/** 交互层样式（与画布尺寸精确匹配） */
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`
}))

/** 获取热区样式 */
function getZoneStyle(cell: { x: number; y: number; width: number; height: number }) {
  return {
    left: `${cell.x}px`,
    top: `${cell.y}px`,
    width: `${cell.width}px`,
    height: `${cell.height}px`
  }
}

/** 鼠标进入热区 */
function handleMouseEnter(index: number) {
  // 只有当该位置有图片时才显示控制按钮
  if (images.value[index]) {
    hoveredIndex.value = index
  }
}

/** 鼠标离开热区 */
function handleMouseLeave(index: number) {
  if (hoveredIndex.value === index) {
    hoveredIndex.value = null
  }
}

/** 水平翻转 */
function handleFlipHorizontal(id: string) {
  store.flipImageHorizontal(id)
  toast.success('图片已水平翻转')
}

/** 垂直翻转 */
function handleFlipVertical(id: string) {
  store.flipImageVertical(id)
  toast.success('图片已垂直翻转')
}

/** 旋转 */
function handleRotate(id: string) {
  store.rotateImage(id)
  toast.success('图片已旋转 90°')
}

/** 删除 */
function handleDelete(id: string) {
  const image = images.value.find(img => img.id === id)
  if (image) {
    store.removeImage(id)
    toast.success(`已删除 ${image.fileName}`)
    hoveredIndex.value = null
  }
}
</script>

<style scoped>
.interaction-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 5;
}

.interaction-zone {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.interaction-zone:hover {
  background-color: rgba(22, 119, 255, 0.05);
}

/* 控制按钮淡入淡出动画 */
.controls-fade-enter-active,
.controls-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

.controls-fade-enter-from,
.controls-fade-leave-to {
  opacity: 0;
}
</style>


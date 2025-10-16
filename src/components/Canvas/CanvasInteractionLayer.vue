<template>
  <div class="interaction-layer" ref="layerRef" :style="layerStyle">
    <!-- 交互热区（只负责鼠标事件，不包含控件） -->
    <div
      v-for="(cell, index) in computedCells"
      :key="`zone-${index}`"
      class="interaction-zone"
      :style="getZoneStyle(cell, index)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
      @click="handleZoneClick(index)"
    />
    
    <!-- 全局控件（只有一个实例，根据 hoveredIndex 动态定位） -->
    <Transition name="controls-fade">
      <ImageControls
        v-if="hoveredIndex !== null && images[hoveredIndex] && computedCells[hoveredIndex]"
        :key="`controls-${hoveredIndex}`"
        :x="computedCells[hoveredIndex].x"
        :y="computedCells[hoveredIndex].y"
        :width="computedCells[hoveredIndex].width"
        :height="computedCells[hoveredIndex].height"
        @mouseenter="handleControlsEnter"
        @mouseleave="handleControlsLeave"
        @flip-horizontal="handleFlipHorizontal(images[hoveredIndex].id)"
        @flip-vertical="handleFlipVertical(images[hoveredIndex].id)"
        @rotate="handleRotate(images[hoveredIndex].id)"
        @delete="handleDelete(images[hoveredIndex].id)"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { computeLayout } from '@/layout/LayoutEngine'
import ImageControls from './ImageControls.vue'
import { toast } from '@/composables/useToast'
import { createImageElements } from '@/core/models'

const store = useAppStore()
const layerRef = ref<HTMLDivElement>()
const hoveredIndex = ref<number | null>(null)
const fileInput = ref<HTMLInputElement>()
const targetIndex = ref<number>(-1) // 记录点击的目标位置

/** 延迟隐藏控件的计时器 */
let hideTimer: ReturnType<typeof setTimeout> | null = null

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

/** 交互层样式（与画布尺寸和缩放精确匹配） */
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%) scale(${store.canvasScale})`
}))

/** 获取热区样式 */
function getZoneStyle(cell: { x: number; y: number; width: number; height: number }, index: number) {
  return {
    left: `${cell.x}px`,
    top: `${cell.y}px`,
    width: `${cell.width}px`,
    height: `${cell.height}px`,
    // 启用所有图片位置的交互
    pointerEvents: 'auto'
  }
}

/** 清除延迟隐藏计时器 */
function clearHideTimer() {
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

/** 鼠标进入热区 */
function handleMouseEnter(index: number) {
  // 清除待处理的隐藏操作
  clearHideTimer()
  
  // 只有当该位置有图片时才显示控制按钮
  if (images.value[index] && images.value[index] !== null) {
    hoveredIndex.value = index
  }
}

/** 鼠标离开热区 */
function handleMouseLeave(index: number) {
  if (hoveredIndex.value === index) {
    // 延迟隐藏，给鼠标移动到控件上的时间
    clearHideTimer()
    hideTimer = setTimeout(() => {
      if (hoveredIndex.value === index) {
        hoveredIndex.value = null
      }
    }, 100) // 100ms 延迟
  }
}

/** 鼠标进入控件 */
function handleControlsEnter() {
  // 取消待处理的隐藏操作
  clearHideTimer()
}

/** 鼠标离开控件 */
function handleControlsLeave() {
  // 延迟隐藏控件
  clearHideTimer()
  hideTimer = setTimeout(() => {
    hoveredIndex.value = null
  }, 100) // 100ms 延迟
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
  const image = images.value.find(img => img && img !== null && img.id === id)
  if (image) {
    store.removeImage(id)
    toast.success(`已删除 ${image.fileName}`)
    hoveredIndex.value = null
  }
}

/** 处理点击空白位置 */
function handleZoneClick(index: number) {
  // 如果该位置已有图片，不处理（由 ImageControls 处理）
  if (images.value[index] && images.value[index] !== null) {
    return
  }
  
  // 记录目标位置并触发文件选择
  targetIndex.value = index
  fileInput.value?.click()
}

/** 处理文件选择 */
async function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  
  try {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.warning('请选择图片文件')
      return
    }
    
    const imageElements = await createImageElements(imageFiles)
    
    // 在指定位置插入图片
    if (targetIndex.value >= 0) {
      store.insertImagesAt(targetIndex.value, imageElements)
      toast.success(`已在位置 ${targetIndex.value + 1} 插入 ${imageElements.length} 张图片`)
    } else {
      store.addImages(imageElements)
      toast.success(`成功上传 ${imageElements.length} 张图片`)
    }
    
    // 清空 input 和目标索引
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    targetIndex.value = -1
  } catch (error) {
    console.error('图片加载失败:', error)
    toast.error('部分图片加载失败，请重试')
    targetIndex.value = -1
  }
}

/** 组件挂载 */
onMounted(() => {
  // 创建隐藏的文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.style.display = 'none'
  input.addEventListener('change', handleFileChange)
  document.body.appendChild(input)
  fileInput.value = input
})

/** 组件卸载 */
onUnmounted(() => {
  if (fileInput.value) {
    fileInput.value.removeEventListener('change', handleFileChange)
    document.body.removeChild(fileInput.value)
  }
})
</script>

<style scoped>
.interaction-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  pointer-events: none;
  z-index: 5;
}

.interaction-zone {
  position: absolute;
  /* pointer-events 在 getZoneStyle 中动态设置 */
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


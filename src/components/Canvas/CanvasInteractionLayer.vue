<template>
  <div class="interaction-layer" ref="layerRef" :style="layerStyle">
    <!-- 交互热区（只负责鼠标事件，不包含控件） -->
    <div
      v-for="(cell, index) in computedCells"
      :key="`zone-${index}`"
      class="interaction-zone"
      :class="{ 'zone-has-image': images[index] && images[index] !== null }"
      :style="getZoneStyle(cell)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
      @mousedown="handleDragStart(index, $event)"
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
  
  <!-- 拖拽预览层（使用 Teleport 移到 body 下，避免父元素 transform 影响） -->
  <Teleport to="body">
    <Transition name="drag-preview">
      <div
        v-if="isDragging && draggingIndex !== null && getDraggedImage()"
        class="drag-preview"
        :style="getDragPreviewStyle()"
      >
        <img
          :src="getDraggedImage()!.src"
          :alt="getDraggedImage()!.fileName"
          class="drag-preview-image"
        />
      </div>
    </Transition>
  </Teleport>
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

/** 拖拽状态 */
const draggingIndex = ref<number | null>(null) // 正在拖拽的图片索引
const dragStartPos = ref({ x: 0, y: 0 }) // 拖拽起始鼠标位置
const dragCurrentPos = ref({ x: 0, y: 0 }) // 当前鼠标位置
const dragOffset = ref({ x: 0, y: 0 }) // 鼠标在图片中的相对偏移量
const isDragging = ref(false) // 是否正在拖拽
const dragThreshold = 5 // 拖拽触发阈值（像素）

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
function getZoneStyle(cell: { x: number; y: number; width: number; height: number }) {
  return {
    left: `${cell.x}px`,
    top: `${cell.y}px`,
    width: `${cell.width}px`,
    height: `${cell.height}px`,
    // 启用所有图片位置的交互
    pointerEvents: 'auto' as const
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

/** 开始拖拽 */
function handleDragStart(index: number, event: MouseEvent) {
  // 只有该位置有图片时才允许拖拽
  if (!images.value[index] || images.value[index] === null) {
    return
  }
  
  // 计算鼠标在图片中的相对偏移量
  const cell = computedCells.value[index]
  const layerRect = layerRef.value?.getBoundingClientRect()
  
  if (layerRect && cell) {
    // 鼠标在图片中的偏移 = 鼠标位置 - 图片左上角位置（考虑缩放）
    const offsetX = event.clientX - layerRect.left - cell.x * store.canvasScale
    const offsetY = event.clientY - layerRect.top - cell.y * store.canvasScale
    
    dragOffset.value = { x: offsetX, y: offsetY }
  }
  
  // 记录拖拽起始信息
  draggingIndex.value = index
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  dragCurrentPos.value = { x: event.clientX, y: event.clientY }
  
  // 隐藏控制按钮
  hoveredIndex.value = null
  
  // 阻止默认行为和事件冒泡
  event.preventDefault()
  event.stopPropagation()
}

/** 拖拽移动 */
function handleDragMove(event: MouseEvent) {
  if (draggingIndex.value === null) return
  
  // 更新当前鼠标位置
  dragCurrentPos.value = { x: event.clientX, y: event.clientY }
  
  // 检查是否超过拖拽阈值
  const deltaX = Math.abs(event.clientX - dragStartPos.value.x)
  const deltaY = Math.abs(event.clientY - dragStartPos.value.y)
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  
  if (distance > dragThreshold) {
    isDragging.value = true
  }
}

/** 结束拖拽 */
function handleDragEnd(event: MouseEvent) {
  if (draggingIndex.value === null) return
  
  // 如果已经触发拖拽，执行位置交换/移动
  if (isDragging.value) {
    const targetCellIndex = findCellAtPoint(event.clientX, event.clientY)
    
    if (targetCellIndex !== null && targetCellIndex !== draggingIndex.value) {
      const targetImage = images.value[targetCellIndex]
      
      if (targetImage && targetImage !== null) {
        // 目标位置有图片，交换位置
        store.swapImages(draggingIndex.value, targetCellIndex)
        toast.success('图片位置已交换')
      } else {
        // 目标位置为空，移动图片
        store.moveImage(draggingIndex.value, targetCellIndex)
        toast.success('图片已移动')
      }
    }
  }
  
  // 重置拖拽状态
  draggingIndex.value = null
  isDragging.value = false
  dragStartPos.value = { x: 0, y: 0 }
  dragCurrentPos.value = { x: 0, y: 0 }
  dragOffset.value = { x: 0, y: 0 }
}

/** 根据鼠标位置查找单元格索引 */
function findCellAtPoint(clientX: number, clientY: number): number | null {
  if (!layerRef.value) return null
  
  const layerRect = layerRef.value.getBoundingClientRect()
  
  // 计算鼠标在画布坐标系中的位置
  const canvasX = clientX - layerRect.left
  const canvasY = clientY - layerRect.top
  
  // 遍历所有单元格，找到包含该点的单元格
  for (let i = 0; i < computedCells.value.length; i++) {
    const cell = computedCells.value[i]
    if (
      canvasX >= cell.x &&
      canvasX <= cell.x + cell.width &&
      canvasY >= cell.y &&
      canvasY <= cell.y + cell.height
    ) {
      return i
    }
  }
  
  return null
}

/** 获取拖拽预览样式 */
function getDragPreviewStyle() {
  if (draggingIndex.value === null) return {}
  
  const cell = computedCells.value[draggingIndex.value]
  if (!cell) return {}
  
  // 预览图位置 = 鼠标位置 - 鼠标在图片中的偏移量
  // 这样可以保持鼠标在图片中的相对位置不变
  return {
    left: `${dragCurrentPos.value.x - dragOffset.value.x}px`,
    top: `${dragCurrentPos.value.y - dragOffset.value.y}px`,
    width: `${cell.width * store.canvasScale}px`,
    height: `${cell.height * store.canvasScale}px`
  }
}

/** 获取被拖拽的图片元素 */
function getDraggedImage() {
  if (draggingIndex.value === null) return null
  return images.value[draggingIndex.value]
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
  
  // 添加全局拖拽事件监听器
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
})

/** 组件卸载 */
onUnmounted(() => {
  if (fileInput.value) {
    fileInput.value.removeEventListener('change', handleFileChange)
    document.body.removeChild(fileInput.value)
  }
  
  // 移除全局拖拽事件监听器
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
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

.interaction-zone.zone-has-image {
  cursor: move;
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

/* 拖拽预览层 */
.drag-preview {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.6;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.drag-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

/* 拖拽预览淡入淡出动画 */
.drag-preview-enter-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.drag-preview-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in);
}

.drag-preview-enter-from,
.drag-preview-leave-to {
  opacity: 0;
}
</style>


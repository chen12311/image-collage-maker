<template>
  <div class="crop-overlay" :style="overlayStyle">
    <!-- 半透明遮罩 -->
    <svg class="crop-mask" :width="width" :height="height">
      <defs>
        <mask id="crop-mask">
          <rect :width="width" :height="height" fill="white" />
          <rect
            :x="cropBox.x"
            :y="cropBox.y"
            :width="cropBox.width"
            :height="cropBox.height"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        :width="width"
        :height="height"
        fill="rgba(0, 0, 0, 0.6)"
        mask="url(#crop-mask)"
      />
    </svg>
    
    <!-- 裁剪框 -->
    <div
      class="crop-box"
      :style="cropBoxStyle"
      @mousedown="handleBoxMouseDown"
    >
      <!-- 裁剪框边框 -->
      <div class="crop-border"></div>
      
      <!-- 网格线 -->
      <div class="crop-grid">
        <div class="grid-line grid-line-v" style="left: 33.33%"></div>
        <div class="grid-line grid-line-v" style="left: 66.67%"></div>
        <div class="grid-line grid-line-h" style="top: 33.33%"></div>
        <div class="grid-line grid-line-h" style="top: 66.67%"></div>
      </div>
      
      <!-- 8个调整手柄 -->
      <div
        v-for="handle in handles"
        :key="handle.position"
        :class="['crop-handle', `handle-${handle.position}`]"
        :style="handle.style"
        @mousedown.stop="handleHandleMouseDown(handle.position, $event)"
      ></div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="crop-actions" :style="actionsStyle">
      <Button
        variant="secondary"
        size="sm"
        @click="handleReset"
      >
        <Icon name="rotate-ccw" size="sm" />
        {{ $t('interaction.cropReset') }}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        @click="handleCancel"
      >
        <Icon name="x" size="sm" />
        {{ $t('interaction.cropCancel') }}
      </Button>
      <Button
        variant="primary"
        size="sm"
        @click="handleConfirm"
      >
        <Icon name="check" size="sm" />
        {{ $t('interaction.cropConfirm') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CropConfig } from '@/core/models'
import Button from '@/components/Common/Button.vue'
import Icon from '@/components/Common/Icon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/** 组件属性 */
interface Props {
  /** 图片单元格X坐标 */
  x: number
  
  /** 图片单元格Y坐标 */
  y: number
  
  /** 图片单元格宽度 */
  width: number
  
  /** 图片单元格高度 */
  height: number
  
  /** 图片原始宽度 */
  imageWidth: number
  
  /** 图片原始高度 */
  imageHeight: number
  
  /** 初始裁剪配置 */
  initialCrop?: CropConfig
}

const props = defineProps<Props>()

/** 事件定义 */
const emit = defineEmits<{
  confirm: [crop: CropConfig]
  cancel: []
  reset: []
}>()

/** 裁剪框状态（像素坐标） */
const cropBox = ref({
  x: 0,
  y: 0,
  width: props.width,
  height: props.height
})

/** 拖拽状态 */
const isDragging = ref(false)
const dragType = ref<'move' | 'resize'>('move')
const dragHandle = ref<string>('')
const dragStartPos = ref({ x: 0, y: 0 })
const dragStartBox = ref({ x: 0, y: 0, width: 0, height: 0 })

/** 最小裁剪框尺寸（像素） */
const MIN_SIZE = 50

/** 调整手柄配置 */
const handles = computed(() => [
  { position: 'nw', style: { top: '-4px', left: '-4px', cursor: 'nw-resize' } },
  { position: 'n', style: { top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
  { position: 'ne', style: { top: '-4px', right: '-4px', cursor: 'ne-resize' } },
  { position: 'e', style: { top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'e-resize' } },
  { position: 'se', style: { bottom: '-4px', right: '-4px', cursor: 'se-resize' } },
  { position: 's', style: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
  { position: 'sw', style: { bottom: '-4px', left: '-4px', cursor: 'sw-resize' } },
  { position: 'w', style: { top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'w-resize' } }
])

/** 遮罩层样式 */
const overlayStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height}px`
}))

/** 裁剪框样式 */
const cropBoxStyle = computed(() => ({
  left: `${cropBox.value.x}px`,
  top: `${cropBox.value.y}px`,
  width: `${cropBox.value.width}px`,
  height: `${cropBox.value.height}px`
}))

/** 操作按钮样式 */
const actionsStyle = computed(() => ({
  bottom: '8px',
  left: '50%',
  transform: 'translateX(-50%)'
}))

/** 初始化裁剪框 */
function initCropBox() {
  if (props.initialCrop) {
    // 使用已有的裁剪配置
    cropBox.value = {
      x: props.initialCrop.x * props.width,
      y: props.initialCrop.y * props.height,
      width: props.initialCrop.width * props.width,
      height: props.initialCrop.height * props.height
    }
  } else {
    // 默认为完整图片
    cropBox.value = {
      x: 0,
      y: 0,
      width: props.width,
      height: props.height
    }
  }
}

/** 裁剪框拖动 */
function handleBoxMouseDown(e: MouseEvent) {
  isDragging.value = true
  dragType.value = 'move'
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  dragStartBox.value = { ...cropBox.value }
  e.preventDefault()
}

/** 手柄拖动 */
function handleHandleMouseDown(position: string, e: MouseEvent) {
  isDragging.value = true
  dragType.value = 'resize'
  dragHandle.value = position
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  dragStartBox.value = { ...cropBox.value }
  e.preventDefault()
}

/** 鼠标移动 */
function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - dragStartPos.value.x
  const deltaY = e.clientY - dragStartPos.value.y
  
  if (dragType.value === 'move') {
    // 移动裁剪框
    let newX = dragStartBox.value.x + deltaX
    let newY = dragStartBox.value.y + deltaY
    
    // 边界限制
    newX = Math.max(0, Math.min(newX, props.width - cropBox.value.width))
    newY = Math.max(0, Math.min(newY, props.height - cropBox.value.height))
    
    cropBox.value.x = newX
    cropBox.value.y = newY
  } else if (dragType.value === 'resize') {
    // 调整裁剪框大小
    resizeCropBox(deltaX, deltaY)
  }
}

/** 调整裁剪框大小 */
function resizeCropBox(deltaX: number, deltaY: number) {
  const box = { ...dragStartBox.value }
  const handle = dragHandle.value
  
  // 根据手柄位置调整裁剪框
  if (handle.includes('n')) {
    const newY = box.y + deltaY
    const newHeight = box.height - deltaY
    if (newY >= 0 && newHeight >= MIN_SIZE) {
      cropBox.value.y = newY
      cropBox.value.height = newHeight
    }
  }
  if (handle.includes('s')) {
    const newHeight = box.height + deltaY
    if (box.y + newHeight <= props.height && newHeight >= MIN_SIZE) {
      cropBox.value.height = newHeight
    }
  }
  if (handle.includes('w')) {
    const newX = box.x + deltaX
    const newWidth = box.width - deltaX
    if (newX >= 0 && newWidth >= MIN_SIZE) {
      cropBox.value.x = newX
      cropBox.value.width = newWidth
    }
  }
  if (handle.includes('e')) {
    const newWidth = box.width + deltaX
    if (box.x + newWidth <= props.width && newWidth >= MIN_SIZE) {
      cropBox.value.width = newWidth
    }
  }
}

/** 鼠标释放 */
function handleMouseUp() {
  isDragging.value = false
  dragType.value = 'move'
  dragHandle.value = ''
}

/** 确认裁剪 */
function handleConfirm() {
  // 转换为归一化坐标
  const cropConfig: CropConfig = {
    x: cropBox.value.x / props.width,
    y: cropBox.value.y / props.height,
    width: cropBox.value.width / props.width,
    height: cropBox.value.height / props.height
  }
  emit('confirm', cropConfig)
}

/** 取消裁剪 */
function handleCancel() {
  emit('cancel')
}

/** 重置裁剪 */
function handleReset() {
  cropBox.value = {
    x: 0,
    y: 0,
    width: props.width,
    height: props.height
  }
}

/** 组件挂载 */
onMounted(() => {
  initCropBox()
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

/** 组件卸载 */
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.crop-overlay {
  position: absolute;
  pointer-events: auto;
  z-index: 100;
  user-select: none;
}

.crop-mask {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  cursor: move;
  box-sizing: border-box;
}

.crop-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid var(--color-primary-500);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.crop-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.grid-line-v {
  width: 1px;
  height: 100%;
}

.grid-line-h {
  height: 1px;
  width: 100%;
}

.crop-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-primary-500);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.crop-handle:hover {
  background: var(--color-primary-600);
  transform: scale(1.2);
}

.crop-actions {
  position: absolute;
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}
</style>


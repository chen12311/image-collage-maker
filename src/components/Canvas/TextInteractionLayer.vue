<template>
  <div 
    class="text-interaction-layer" 
    ref="layerRef" 
    :style="layerStyle"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!-- 为每个文字创建可交互的热区 -->
    <div
      v-for="text in visibleTexts"
      :key="text.id"
      :class="['text-zone', { 
        'text-zone-selected': text.selected,
        'text-zone-dragging': draggingTextId === text.id,
        'text-zone-hover': hoveredTextId === text.id
      }]"
      :style="getTextZoneStyle(text)"
      @mousedown="onMouseDown(text, $event)"
      @mouseenter="hoveredTextId = text.id"
      @mouseleave="hoveredTextId = null"
    >
      <!-- 文字边界框（视觉反馈） -->
      <div class="text-boundary">
        <div class="text-boundary-corners">
          <span class="corner corner-tl"></span>
          <span class="corner corner-tr"></span>
          <span class="corner corner-bl"></span>
          <span class="corner corner-br"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { measureTextSize } from '@/core/models/TextElement'
import type { TextElement } from '@/core/models'

const store = useAppStore()
const layerRef = ref<HTMLDivElement>()

/** 拖拽状态 */
const draggingTextId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const hoveredTextId = ref<string | null>(null)

/** 临时canvas用于文字尺寸测量 */
let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

/** 获取测量用的canvas上下文 */
function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')!
  }
  return measureCtx!
}

/** 可见的文字列表 */
const visibleTexts = computed(() => {
  return store.texts.filter(t => t.visible)
})

/** 交互层样式（与画布尺寸和缩放精确匹配） */
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%) scale(${store.canvasScale})`
}))

/** 获取文字热区样式 */
function getTextZoneStyle(text: TextElement) {
  const ctx = getMeasureContext()
  const size = measureTextSize(text, ctx)
  
  // 根据textAlign调整x位置
  let adjustedX = text.position.x
  if (text.style.textAlign === 'center') {
    adjustedX = text.position.x - size.width / 2
  } else if (text.style.textAlign === 'right') {
    adjustedX = text.position.x - size.width
  }
  
  // 根据textBaseline调整y位置
  let adjustedY = text.position.y
  if (text.style.textBaseline === 'middle') {
    adjustedY = text.position.y - size.height / 2
  } else if (text.style.textBaseline === 'bottom') {
    adjustedY = text.position.y - size.height
  }
  
  // 添加一些padding使热区更容易点击
  const padding = 8
  
  return {
    left: `${adjustedX - padding}px`,
    top: `${adjustedY - padding}px`,
    width: `${size.width + padding * 2}px`,
    height: `${size.height + padding * 2}px`
  }
}

/** 鼠标按下开始拖拽 */
function onMouseDown(text: TextElement, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  draggingTextId.value = text.id
  
  // 获取画布容器的边界，用于坐标转换
  const layerRect = layerRef.value?.getBoundingClientRect()
  if (!layerRect) return
  
  // 计算鼠标在画布坐标系中的位置
  const canvasX = event.clientX - layerRect.left
  const canvasY = event.clientY - layerRect.top
  
  // 记录鼠标相对文字位置的偏移
  dragOffset.value = {
    x: canvasX - text.position.x,
    y: canvasY - text.position.y
  }
  
  // 选中该文字
  store.selectText(text.id)
  
  // 改变鼠标样式
  document.body.style.cursor = 'grabbing'
}

/** 鼠标移动拖拽中 */
function onMouseMove(event: MouseEvent) {
  if (!draggingTextId.value) return
  
  const text = store.texts.find(t => t.id === draggingTextId.value)
  if (!text) return
  
  // 获取画布容器的边界
  const layerRect = layerRef.value?.getBoundingClientRect()
  if (!layerRect) return
  
  // 计算鼠标在画布坐标系中的位置
  const canvasX = event.clientX - layerRect.left
  const canvasY = event.clientY - layerRect.top
  
  // 计算新位置
  let newX = canvasX - dragOffset.value.x
  let newY = canvasY - dragOffset.value.y
  
  // 获取文字尺寸用于边界检测
  const ctx = getMeasureContext()
  const size = measureTextSize(text, ctx)
  
  // 边界检测（根据textAlign和textBaseline调整）
  let minX = 0
  let maxX = store.canvasWidth
  let minY = 0
  let maxY = store.canvasHeight
  
  if (text.style.textAlign === 'left') {
    maxX = store.canvasWidth - size.width
  } else if (text.style.textAlign === 'center') {
    minX = size.width / 2
    maxX = store.canvasWidth - size.width / 2
  } else if (text.style.textAlign === 'right') {
    minX = size.width
  }
  
  if (text.style.textBaseline === 'top') {
    maxY = store.canvasHeight - size.height
  } else if (text.style.textBaseline === 'middle') {
    minY = size.height / 2
    maxY = store.canvasHeight - size.height / 2
  } else if (text.style.textBaseline === 'bottom') {
    minY = size.height
  }
  
  // 限制在画布范围内
  newX = Math.max(minX, Math.min(maxX, newX))
  newY = Math.max(minY, Math.min(maxY, newY))
  
  // 更新位置
  store.updateText(draggingTextId.value, {
    position: { x: newX, y: newY }
  })
}

/** 鼠标抬起结束拖拽 */
function onMouseUp() {
  if (draggingTextId.value) {
    draggingTextId.value = null
    document.body.style.cursor = ''
  }
}
</script>

<style scoped>
.text-interaction-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  pointer-events: none;
  z-index: 10;
}

.text-zone {
  position: absolute;
  pointer-events: auto;
  cursor: grab;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.text-zone:active {
  cursor: grabbing;
}

.text-zone-dragging {
  cursor: grabbing;
}

.text-zone-hover .text-boundary,
.text-zone-selected .text-boundary,
.text-zone-dragging .text-boundary {
  opacity: 1;
}

/* 文字边界框 */
.text-boundary {
  position: absolute;
  inset: 0;
  border: 2px dashed var(--color-primary-400);
  border-radius: var(--radius-sm);
  background: rgba(22, 119, 255, 0.05);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-in-out);
  pointer-events: none;
}

.text-zone-selected .text-boundary {
  border-color: var(--color-primary-500);
  border-style: solid;
  background: rgba(22, 119, 255, 0.1);
}

.text-zone-dragging .text-boundary {
  border-color: var(--color-primary-600);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

/* 边界框角标 */
.text-boundary-corners {
  position: absolute;
  inset: -4px;
}

.corner {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-primary-500);
  border: 1px solid var(--color-neutral-0);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

.corner-tl { top: 0; left: 0; }
.corner-tr { top: 0; right: 0; }
.corner-bl { bottom: 0; left: 0; }
.corner-br { bottom: 0; right: 0; }

.text-zone-hover .corner,
.text-zone-selected .corner,
.text-zone-dragging .corner {
  opacity: 1;
}

/* 悬停效果 */
.text-zone-hover {
  z-index: 11;
}

.text-zone-selected {
  z-index: 12;
}

.text-zone-dragging {
  z-index: 13;
}
</style>


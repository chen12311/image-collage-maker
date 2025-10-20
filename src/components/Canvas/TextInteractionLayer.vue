<template>
  <div 
    class="text-interaction-layer"
    ref="layerRef" 
    :style="layerStyle"
    @mousedown.capture="onLayerMouseDown"
    @mousemove="onLayerMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!-- 为每个文字创建可交互的热区 -->
    <div
      v-for="text in visibleTexts"
      :key="text.id"
      :data-text-id="text.id"
      :class="['text-zone', { 
        'text-zone-selected': text.selected,
        'text-zone-dragging': draggingTextId === text.id,
        'text-zone-resizing': resizingTextId === text.id,
        'text-zone-hover': hoveredTextId === text.id
      }]"
      :style="getTextZoneStyle(text)"
      @mouseenter="hoveredTextId = text.id"
      @mouseleave="hoveredTextId = null"
    >
      <!-- 文字边界框（视觉反馈） -->
      <div class="text-boundary">
        <div class="text-boundary-corners">
          <span 
            class="corner corner-tl" 
            @mousedown="onCornerMouseDown($event, text.id)"
          ></span>
          <span 
            class="corner corner-tr" 
            @mousedown="onCornerMouseDown($event, text.id)"
          ></span>
          <span 
            class="corner corner-bl" 
            @mousedown="onCornerMouseDown($event, text.id)"
          ></span>
          <span 
            class="corner corner-br" 
            @mousedown="onCornerMouseDown($event, text.id)"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { measureTextSize } from '@/core/models/TextElement'
import type { TextElement } from '@/core/models'

const store = useAppStore()
const layerRef = ref<HTMLDivElement>()

/** 拖拽状态 */
const draggingTextId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const hoveredTextId = ref<string | null>(null)

/** 调整大小状态 */
const resizingTextId = ref<string | null>(null)
const resizeStartPos = ref({ x: 0, y: 0 })
const resizeStartFontSize = ref(0)

/** 临时canvas用于文字尺寸测量 */
let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

/** RAF节流标识 */
let rafId: number | null = null
let pendingMouseEvent: MouseEvent | null = null

/** 文字尺寸缓存 - 避免重复测量 */
const textSizeCache = new Map<string, { width: number; height: number }>()

/** 获取测量用的canvas上下文 */
function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')!
  }
  return measureCtx!
}

/** 获取或缓存文字尺寸 */
function getTextSize(text: TextElement): { width: number; height: number } {
  const cacheKey = `${text.id}-${text.content}-${text.style.fontSize}-${text.style.fontFamily}-${text.style.fontWeight}`
  
  if (textSizeCache.has(cacheKey)) {
    return textSizeCache.get(cacheKey)!
  }
  
  const ctx = getMeasureContext()
  const size = measureTextSize(text, ctx)
  textSizeCache.set(cacheKey, size)
  
  return size
}

/** 检查点是否在文字框内 */
function isPointInText(x: number, y: number, text: TextElement): boolean {
  const size = getTextSize(text)
  const padding = 8
  
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
  
  const left = adjustedX - padding
  const top = adjustedY - padding
  const right = left + size.width + padding * 2
  const bottom = top + size.height + padding * 2
  
  return x >= left && x <= right && y >= top && y <= bottom
}

/** 可见的文字列表 */
const visibleTexts = computed(() => {
  return store.texts.filter(t => t.visible)
})

/** 是否有文字处于选中状态 */
const hasSelectedText = computed(() => {
  return visibleTexts.value.some(t => t.selected)
})

/** 交互层样式（与画布尺寸和缩放精确匹配） */
const layerStyle = computed(() => ({
  width: `${store.canvasWidth}px`,
  height: `${store.canvasHeight}px`,
  transform: `translate(-50%, -50%) scale(${store.canvasScale})`
}))

/** 获取文字热区样式 */
function getTextZoneStyle(text: TextElement) {
  const size = getTextSize(text)
  
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

/** Layer上的鼠标按下 - 判断点击的是哪个文字 */
function onLayerMouseDown(event: MouseEvent) {
  // 检查是否点击的是角标 - 如果是，跳过文字拖拽逻辑
  const target = event.target as HTMLElement
  if (target.classList.contains('corner')) {
    return // 让角标自己的 mousedown 事件处理
  }
  
  // 获取画布容器的边界
  const layerRect = layerRef.value?.getBoundingClientRect()
  if (!layerRect) return
  
  // 计算鼠标在画布坐标系中的位置
  const canvasX = event.clientX - layerRect.left
  const canvasY = event.clientY - layerRect.top
  
  // 从上到下（z-index高的优先）查找被点击的文字
  const texts = [...visibleTexts.value].reverse()
  const clickedText = texts.find(text => isPointInText(canvasX, canvasY, text))
  
  // 如果没有点击任何文字，取消所有文字的选中状态并清除拖拽/调整大小状态
  if (!clickedText) {
    store.deselectAllTexts()
    draggingTextId.value = null
    resizingTextId.value = null
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  draggingTextId.value = clickedText.id
  
  // 记录鼠标相对文字位置的偏移
  dragOffset.value = {
    x: canvasX - clickedText.position.x,
    y: canvasY - clickedText.position.y
  }
  
  // 选中该文字
  store.selectText(clickedText.id)
  
  // 改变鼠标样式
  document.body.style.cursor = 'grabbing'
}

/** Layer上的鼠标移动 - 使用RAF节流 */
function onLayerMouseMove(event: MouseEvent) {
  // 处理调整大小
  if (resizingTextId.value) {
    // 保存最新的鼠标事件
    pendingMouseEvent = event
    
    // 如果已经有pending的RAF，直接返回
    if (rafId !== null) return
    
    // 使用RAF节流
    rafId = requestAnimationFrame(() => {
      rafId = null
      
      if (!pendingMouseEvent || !resizingTextId.value) return
      
      const text = store.texts.find(t => t.id === resizingTextId.value)
      if (!text) return
      
      // 计算鼠标移动距离（对角线距离）
      const deltaX = pendingMouseEvent.clientX - resizeStartPos.value.x
      const deltaY = pendingMouseEvent.clientY - resizeStartPos.value.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // 根据方向确定增减（右下方向为正）
      const direction = (deltaX + deltaY) > 0 ? 1 : -1
      
      // 计算新的字体大小（每移动1px约等于0.2px字体变化）
      const fontSizeChange = distance * 0.2 * direction
      let newFontSize = resizeStartFontSize.value + fontSizeChange
      
      // 限制在 12-120px 范围内
      newFontSize = Math.max(12, Math.min(120, newFontSize))
      newFontSize = Math.round(newFontSize) // 四舍五入到整数
      
      // 更新字体大小
      store.updateText(resizingTextId.value, {
        style: {
          ...text.style,
          fontSize: newFontSize
        }
      })
      
      // 清除缓存，因为字体大小改变了
      textSizeCache.clear()
      
      pendingMouseEvent = null
    })
    return
  }
  
  // 处理拖拽
  if (!draggingTextId.value) return
  
  // 保存最新的鼠标事件
  pendingMouseEvent = event
  
  // 如果已经有pending的RAF，直接返回
  if (rafId !== null) return
  
  // 使用RAF节流
  rafId = requestAnimationFrame(() => {
    rafId = null
    
    if (!pendingMouseEvent || !draggingTextId.value) return
    
    const text = store.texts.find(t => t.id === draggingTextId.value)
    if (!text) return
    
    // 获取画布容器的边界
    const layerRect = layerRef.value?.getBoundingClientRect()
    if (!layerRect) return
    
    // 计算鼠标在画布坐标系中的位置
    const canvasX = pendingMouseEvent.clientX - layerRect.left
    const canvasY = pendingMouseEvent.clientY - layerRect.top
    
    // 计算新位置
    let newX = canvasX - dragOffset.value.x
    let newY = canvasY - dragOffset.value.y
    
    // 获取文字尺寸用于边界检测（使用缓存）
    const size = getTextSize(text)
    
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
    
    pendingMouseEvent = null
  })
}

/** 角标鼠标按下 - 开始调整大小 */
function onCornerMouseDown(event: MouseEvent, textId: string) {
  event.preventDefault()
  event.stopPropagation()
  
  const text = store.texts.find(t => t.id === textId)
  if (!text) return
  
  resizingTextId.value = textId
  resizeStartPos.value = {
    x: event.clientX,
    y: event.clientY
  }
  resizeStartFontSize.value = text.style.fontSize
  
  // 选中该文字
  store.selectText(textId)
  
  // 改变鼠标样式
  document.body.style.cursor = 'nwse-resize'
}

/** 鼠标抬起结束拖拽或调整大小 */
function onMouseUp() {
  if (draggingTextId.value) {
    draggingTextId.value = null
    document.body.style.cursor = ''
  }
  
  if (resizingTextId.value) {
    resizingTextId.value = null
    document.body.style.cursor = ''
  }
  
  // 清理RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  pendingMouseEvent = null
}

/** 全局点击处理 - 点击文字外部区域时取消选中 */
function handleGlobalMouseDown(event: MouseEvent) {
  // 如果没有选中的文字，不需要处理
  if (!hasSelectedText.value) return
  
  // 如果正在拖拽或调整大小，不处理
  if (draggingTextId.value || resizingTextId.value) return
  
  // 检查点击目标是否在文字热区内
  const target = event.target
  
  // 确保 target 是 Element 类型，才能使用 closest 方法
  if (!(target instanceof Element)) {
    // 如果不是 Element，说明点击在文字外部
    store.deselectAllTexts()
    return
  }
  
  const clickedInTextZone = target.closest('.text-zone')
  const clickedInCorner = target.closest('.corner')
  
  // 如果点击在文字区域或角标上，不处理
  if (clickedInTextZone || clickedInCorner) return
  
  // 点击在文字外部，取消所有选中状态
  store.deselectAllTexts()
}

/** 组件挂载时添加全局事件监听 */
onMounted(() => {
  document.addEventListener('mousedown', handleGlobalMouseDown)
})

/** 组件卸载时移除全局事件监听 */
onUnmounted(() => {
  document.removeEventListener('mousedown', handleGlobalMouseDown)
})
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

/* 拖拽或调整大小时layer接收所有事件，避免失去焦点 */
.text-interaction-layer:has(.text-zone-dragging),
.text-interaction-layer:has(.text-zone-resizing) {
  pointer-events: auto;
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
  transition: none !important;
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

/* 边界框角标容器 */
.text-boundary-corners {
  position: absolute;
  inset: -4px;
  pointer-events: none;  /* 容器本身不接收事件，让角标独立控制 */
}

.corner {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-primary-500);
  border: 1px solid var(--color-neutral-0);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  cursor: nwse-resize;
  transition: all var(--duration-fast) var(--ease-in-out);
  opacity: 0;
  pointer-events: auto;
}

/* 扩大角标的可点击热区（视觉大小不变） */
.corner::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  cursor: inherit;
}

.corner:hover {
  transform: scale(1.3);
  background: var(--color-primary-600);
  box-shadow: var(--shadow-md);
}

.corner-tl { top: 0; left: 0; cursor: nwse-resize; }
.corner-tr { top: 0; right: 0; cursor: nesw-resize; }
.corner-bl { bottom: 0; left: 0; cursor: nesw-resize; }
.corner-br { bottom: 0; right: 0; cursor: nwse-resize; }

.text-zone-hover .corner,
.text-zone-selected .corner,
.text-zone-dragging .corner,
.text-zone-resizing .corner {
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

.text-zone-resizing {
  z-index: 14;
  transition: none !important;
}

.text-zone-resizing .text-boundary {
  border-color: var(--color-primary-600);
  background: rgba(22, 119, 255, 0.15);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.4);
}

.text-zone-resizing .corner {
  transform: scale(1.5);
  background: var(--color-primary-700);
  box-shadow: 0 0 0 2px var(--color-primary-200);
}
</style>


<template>
  <canvas
    ref="canvasRef"
    :width="store.canvasWidth"
    :height="store.canvasHeight"
    :style="{ transform: `scale(${store.canvasScale})` }"
    class="canvas"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { computeLayout } from '@/layout/LayoutEngine'
import { CanvasRenderer as Renderer } from '@/rendering/CanvasRenderer'

const store = useAppStore()
const canvasRef = ref<HTMLCanvasElement>()
let resizeObserver: ResizeObserver | null = null
let isMounted = ref(false) // 组件挂载状态标志

/** 计算画布缩放比例 */
function calculateScale() {
  // 防止组件卸载后执行
  if (!isMounted.value || !canvasRef.value) return
  
  // 获取父容器（.canvas-wrapper 的父元素 .canvas-container）
  const parentElement = canvasRef.value.parentElement
  if (!parentElement) return
  
  const container = parentElement.parentElement
  if (!container) return
  
  // 获取容器尺寸
  const containerRect = container.getBoundingClientRect()
  
  // 容器padding（24px * 2）+ 额外留白（48px）
  const PADDING = 24 * 2
  const EXTRA_MARGIN = 48
  const availableWidth = containerRect.width - PADDING - EXTRA_MARGIN
  const availableHeight = containerRect.height - PADDING - EXTRA_MARGIN
  
  // 计算宽高缩放比例，取较小值，且不超过1（不放大）
  const scaleX = availableWidth / store.canvasWidth
  const scaleY = availableHeight / store.canvasHeight
  const scale = Math.min(scaleX, scaleY, 1)
  
  // 更新Store中的缩放比例
  store.setCanvasScale(scale)
}

/** 渲染画布 */
function render() {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  // 计算布局
  const layout = computeLayout(
    store.layoutConfig,
    store.canvasWidth,
    store.canvasHeight
  )
  
  // 渲染
  Renderer.render({
    ctx,
    layout,
    images: store.images,
    texts: store.texts,
    state: store.currentState
  })
}

/** 获取Canvas元素（供父组件使用） */
function getCanvas(): HTMLCanvasElement | undefined {
  return canvasRef.value
}

/** 暴露方法 */
defineExpose({
  getCanvas,
  render
})

/** 监听状态变化，自动重新渲染 */
watch(
  () => [
    store.layoutType,
    store.spacing,
    store.padding,
    store.radius,
    store.bgColor,
    store.bgOpacity,
    store.globalOpacity,
    store.imageOpacity,
    store.canvasWidth,
    store.canvasHeight,
    store.images,
    store.texts,
    // 长图模式状态
    store.longImageMode,
    store.longImageDirection,
    store.sizeCalculationMode,
    store.fixedWidth,
    store.fixedHeight
  ],
  () => {
    nextTick(() => render())
  },
  { deep: true }
)

/** 监听画布尺寸变化，重新计算缩放 */
watch(
  () => [store.canvasWidth, store.canvasHeight],
  () => {
    nextTick(() => calculateScale())
  }
)

/** 组件挂载后初始渲染 */
onMounted(() => {
  isMounted.value = true
  
  // 初始渲染和缩放计算
  nextTick(() => {
    render()
    calculateScale()
  })
  
  // 监听容器尺寸变化
  if (canvasRef.value) {
    const parentElement = canvasRef.value.parentElement
    if (!parentElement) return
    
    const container = parentElement.parentElement
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        calculateScale()
      })
      resizeObserver.observe(container)
    }
  }
})

/** 组件卸载时清理 */
onUnmounted(() => {
  isMounted.value = false
  
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped>
.canvas {
  display: block;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform-origin: center center;
  transition: transform 0.2s ease-out;
}
</style>


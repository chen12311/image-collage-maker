<template>
  <canvas
    ref="canvasRef"
    :width="store.canvasWidth"
    :height="store.canvasHeight"
    class="canvas"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { computeLayout } from '@/layout/LayoutEngine'
import { CanvasRenderer as Renderer } from '@/rendering/CanvasRenderer'

const store = useAppStore()
const canvasRef = ref<HTMLCanvasElement>()

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
    store.images.length,
    store.texts.length
  ],
  () => {
    nextTick(() => render())
  },
  { deep: true }
)

/** 组件挂载后初始渲染 */
onMounted(() => {
  nextTick(() => render())
})
</script>

<style scoped>
.canvas {
  display: block;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  max-height: 100%;
}
</style>


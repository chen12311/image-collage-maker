<template>
  <canvas
    ref="canvasRef"
    :width="store.canvasWidth"
    :height="store.canvasHeight"
    :style="{ transform: `scale(${store.canvasScale})` }"
    :class="['canvas', { 'canvas-empty': store.images.length === 0 }]"
    @click="handleCanvasClick"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { computeLayout } from '@/layout/LayoutEngine'
import { CanvasRenderer as Renderer } from '@/rendering/CanvasRenderer'
import { createImageElements } from '@/core/models'
import { toast } from '@/composables/useToast'

const store = useAppStore()
const canvasRef = ref<HTMLCanvasElement>()
const fileInput = ref<HTMLInputElement>()
const containerRef = ref<HTMLElement>()
let resizeObserver: ResizeObserver | null = null

/** 计算画布缩放比例 */
function calculateScale() {
  if (!canvasRef.value) return
  
  // 获取父容器（.canvas-wrapper 的父元素 .canvas-container）
  const container = canvasRef.value.parentElement?.parentElement
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

/** 处理画布点击 */
function handleCanvasClick() {
  // 只在画布为空时响应
  if (store.images.length === 0) {
    fileInput.value?.click()
  }
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
    store.addImages(imageElements)
    toast.success(`成功上传 ${imageElements.length} 张图片`)
    
    // 清空 input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    console.error('图片加载失败:', error)
    toast.error('部分图片加载失败，请重试')
  }
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
    store.texts
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
  // 创建隐藏的文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.style.display = 'none'
  input.addEventListener('change', handleFileChange)
  document.body.appendChild(input)
  fileInput.value = input
  
  // 初始渲染和缩放计算
  nextTick(() => {
    render()
    calculateScale()
  })
  
  // 监听容器尺寸变化
  if (canvasRef.value) {
    const container = canvasRef.value.parentElement?.parentElement
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
  if (fileInput.value) {
    fileInput.value.removeEventListener('change', handleFileChange)
    document.body.removeChild(fileInput.value)
  }
  
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

.canvas-empty {
  cursor: pointer;
}
</style>


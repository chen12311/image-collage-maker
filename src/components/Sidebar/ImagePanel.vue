<template>
  <div class="image-panel">
    <div class="tool-section">
      <!-- 上传区域 -->
      <div class="upload-area" @click="triggerUpload" @drop="onDrop" @dragover.prevent @dragleave="onDragLeave">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="onFileChange"
        >
        <div class="upload-text">点击或拖拽上传图片</div>
      </div>
      
      <!-- 图片列表 -->
      <div v-if="store.hasImages" class="image-list">
        <div
          v-for="(image, index) in store.images"
          :key="image.id"
          class="image-item"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover.prevent
          @drop="onDropImage(index)"
        >
          <img :src="image.src" :alt="image.fileName">
          <button class="remove-btn" @click="removeImage(image.id)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createImageElements } from '@/core/models'

const store = useAppStore()
const fileInput = ref<HTMLInputElement>()
const dragIndex = ref<number>(-1)

/** 触发文件选择 */
function triggerUpload() {
  fileInput.value?.click()
}

/** 文件选择变化 */
async function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    await handleFiles(Array.from(files))
  }
}

/** 拖拽放置 */
async function onDrop(e: DragEvent) {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files) {
    await handleFiles(Array.from(files))
  }
}

/** 拖拽离开 */
function onDragLeave() {
  // 可以添加视觉反馈
}

/** 处理文件 */
async function handleFiles(files: File[]) {
  try {
    const imageElements = await createImageElements(files)
    store.addImages(imageElements)
  } catch (error) {
    console.error('图片加载失败:', error)
    alert('部分图片加载失败，请重试')
  }
}

/** 删除图片 */
function removeImage(id: string) {
  store.removeImage(id)
}

/** 开始拖拽 */
function onDragStart(index: number) {
  dragIndex.value = index
}

/** 放置图片 */
function onDropImage(targetIndex: number) {
  if (dragIndex.value === -1 || dragIndex.value === targetIndex) return
  
  const images = [...store.images]
  const [draggedImage] = images.splice(dragIndex.value, 1)
  images.splice(targetIndex, 0, draggedImage)
  
  store.reorderImages(images)
  dragIndex.value = -1
}
</script>

<style scoped>
.image-panel {
  /* 继承父容器样式 */
}

.tool-section {
  margin-bottom: 20px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
  background: #fafafa;
}

.upload-text {
  font-size: 13px;
  color: #666;
}

/* 图片列表 */
.image-list {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: move;
  border: 2px solid transparent;
}

.image-item:hover {
  border-color: #1890ff;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
  display: none;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.image-item:hover .remove-btn {
  display: flex;
}
</style>


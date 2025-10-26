<template>
  <div class="image-panel">
    <div class="tool-section">
      <div class="section-header">
        <Icon name="upload" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.image.title') }}</h3>
      </div>
      
      <!-- 上传区域 -->
      <div
        :class="['upload-area', { 'upload-dragging': isDragging }]"
        @click="triggerUpload"
        @drop="onDrop"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @dragend="isDragging = false"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="onFileChange"
        >
        <div class="upload-icon">
          <Icon :name="isDragging ? 'download' : 'upload'" size="xl" />
        </div>
        <div class="upload-text">
          <p class="upload-primary">{{ isDragging ? $t('sidebar.image.releaseToUpload') : $t('sidebar.image.clickOrDrag') }}</p>
          <p class="upload-secondary">{{ $t('sidebar.image.supportedFormats') }}</p>
        </div>
      </div>
      
      <!-- 图片列表 -->
      <div v-if="store.hasImages" class="image-list-section">
        <div class="section-header">
          <span class="image-count">{{ $t('sidebar.image.uploaded', { count: validImages.length }) }}</span>
          <Button
            variant="text"
            size="sm"
            @click="clearAllImages"
          >
            {{ $t('sidebar.image.clear') }}
          </Button>
        </div>
        
        <div class="image-list">
          <div
            v-for="item in validImages"
            :key="item.image.id"
            :class="['image-item', { 'image-dragging': dragIndex === item.index }]"
            draggable="true"
            @dragstart="onDragStart(item.index, $event)"
            @dragover.prevent="onDragOver(item.index)"
            @dragend="onDragEnd"
            @drop.prevent="onDropImage(item.index)"
          >
            <div class="image-preview">
              <img :src="item.image.src" :alt="item.image.fileName">
              <div class="image-overlay">
                <div class="image-index">{{ item.index + 1 }}</div>
              </div>
            </div>
            <button class="image-remove" @click.stop="removeImage(item.image.id)">
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- 空状态提示 -->
      <div v-else class="empty-state">
        <Icon name="image" size="xl" />
        <p>{{ $t('sidebar.image.noImages') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createImageElements } from '@/core/models'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import { toast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const store = useAppStore()
const { t } = useI18n()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const dragIndex = ref<number>(-1)
const dragOverIndex = ref<number>(-1)

/** 只获取有效的图片（过滤掉 null） */
const validImages = computed(() => {
  return store.images
    .map((image, index) => ({ image, index }))
    .filter(item => item.image && item.image !== null)
})

/** 触发文件选择 */
function triggerUpload() {
  fileInput.value?.click()
}

/** 文件选择变化 */
async function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    await handleFiles(Array.from(files))
    // 清空input，允许重复选择同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

/** 拖拽放置 */
async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files) {
    await handleFiles(Array.from(files))
  }
}

/** 处理文件 */
async function handleFiles(files: File[]) {
  try {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.warning(t('toast.pleaseSelectImage'))
      return
    }
    
    if (imageFiles.length !== files.length) {
      toast.warning(t('toast.filteredNonImages', { count: files.length - imageFiles.length }))
    }
    
    const imageElements = await createImageElements(imageFiles)
    store.addImages(imageElements)
    toast.success(t('toast.uploadSuccess', { count: imageElements.length }))
  } catch (error) {
    console.error('Image loading failed:', error)
    toast.error(t('toast.uploadError'))
  }
}

/** 删除图片 */
function removeImage(id: string) {
  store.removeImage(id)
  toast.info(t('toast.imageRemoved'))
}

/** 清空所有图片 */
function clearAllImages() {
  if (confirm(t('confirm.clearAllImages'))) {
    store.clearImages()
    toast.info(t('toast.allImagesCleared'))
  }
}

/** 开始拖拽 */
function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', '')
  }
}

/** 拖拽经过 */
function onDragOver(index: number) {
  dragOverIndex.value = index
}

/** 拖拽结束 */
function onDragEnd() {
  dragIndex.value = -1
  dragOverIndex.value = -1
}

/** 放置图片 */
function onDropImage(targetIndex: number) {
  if (dragIndex.value === -1 || dragIndex.value === targetIndex) {
    onDragEnd()
    return
  }
  
  const images = [...store.images]
  const [draggedImage] = images.splice(dragIndex.value, 1)
  images.splice(targetIndex, 0, draggedImage)
  
  store.reorderImages(images)
  onDragEnd()
}
</script>

<style scoped>
.image-panel {
  animation: fade-in var(--duration-base) var(--ease-out);
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* 分组标题 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  color: var(--color-neutral-700);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  flex: 1;
}

.image-count {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

/* 上传区域 */
.upload-area {
  position: relative;
  padding: var(--spacing-8);
  border: 2px dashed var(--border-color-base);
  border-radius: var(--radius-lg);
  background: var(--color-neutral-50);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-info-bg) 100%);
  opacity: 0;
  transition: var(--transition-base);
}

.upload-area:hover {
  border-color: var(--color-primary-400);
  background: var(--color-neutral-0);
}

.upload-area:hover::before {
  opacity: 0.3;
}

.upload-area.upload-dragging {
  border-color: var(--color-primary-500);
  border-style: solid;
  background: var(--color-primary-50);
  transform: scale(1.02);
}

.upload-area.upload-dragging::before {
  opacity: 1;
}

.upload-icon {
  position: relative;
  z-index: 1;
  color: var(--color-primary-500);
  transition: var(--transition-transform);
}

.upload-area:hover .upload-icon {
  transform: translateY(-4px);
}

.upload-area.upload-dragging .upload-icon {
  animation: bounce var(--duration-slower) var(--ease-in-out) infinite;
}

.upload-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.upload-primary {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
}

.upload-secondary {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
}

/* 图片列表 */
.image-list-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.image-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-3);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: move;
  background: var(--color-neutral-100);
  border: 2px solid transparent;
  transition: var(--transition-base);
}

.image-item:hover {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-md);
  transform: scale(1.05);
  z-index: 10;
}

.image-item.image-dragging {
  opacity: 0.5;
  transform: scale(0.9);
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  opacity: 0;
  transition: var(--transition-fast);
  display: flex;
  align-items: flex-end;
  padding: var(--spacing-2);
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-index {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-0);
  background: rgba(0, 0, 0, 0.5);
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-sm);
}

.image-remove {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-error);
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.image-item:hover .image-remove {
  opacity: 1;
  transform: scale(1);
}

.image-remove:hover {
  background: var(--color-error);
  color: var(--color-neutral-0);
  transform: scale(1.1);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-8) var(--spacing-4);
  color: var(--color-neutral-400);
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-sm);
}
</style>

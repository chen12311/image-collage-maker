<template>
  <div class="text-panel">
    <div class="tool-section">
      <div class="section-header">
        <Icon name="text" size="sm" />
        <h3 class="section-title">{{ $t('sidebar.text.title') }}</h3>
      </div>
      
      <!-- 文字输入 -->
      <div class="control-group">
        <label class="control-label">{{ $t('sidebar.text.content') }}</label>
        <textarea
          v-model="textContent"
          class="text-input"
          :placeholder="$t('sidebar.text.placeholder')"
          rows="3"
        ></textarea>
      </div>
      
      <!-- 字体大小 -->
      <div class="control-group">
        <div class="control-label-row">
          <label class="control-label">{{ $t('sidebar.text.fontSize') }}</label>
          <span class="control-value">{{ fontSize }}px</span>
        </div>
        <input
          v-model.number="fontSize"
          type="range"
          class="control-slider"
          min="12"
          max="120"
        >
      </div>
      
      <!-- 字体选择 -->
      <div class="control-group">
        <label class="control-label">{{ $t('sidebar.text.fontFamily') }}</label>
        <Select
          v-model="fontFamily"
          :options="fontFamilies"
          size="md"
          :placeholder="checkingFonts ? '检测字体中...' : '选择字体'"
          searchable
        />
      </div>
      
      <!-- 自定义字体输入 -->
      <div class="control-group">
        <label class="control-label">{{ $t('sidebar.text.customFont') }}</label>
        <input
          v-model="customFontInput"
          type="text"
          class="text-input custom-font-input"
          :placeholder="$t('sidebar.text.customFontPlaceholder')"
          @blur="applyCustomFont"
          @keydown.enter="applyCustomFont"
        >
      </div>
      
      <!-- 文字颜色 -->
      <div class="control-group">
        <label class="control-label">{{ $t('sidebar.text.color') }}</label>
        <div class="color-grid">
          <div
            v-for="color in presetColors"
            :key="color"
            :class="['color-item', { active: textColor === color }]"
            :style="{ background: color }"
            @click="textColor = color"
          >
            <Icon v-if="textColor === color" name="check" size="sm" />
          </div>
          <div class="color-item color-picker-trigger" @click="triggerColorPicker">
            <input
              ref="colorInput"
              type="color"
              v-model="textColor"
              style="display: none"
            >
            <div class="color-picker-preview" :style="{ background: textColor }"></div>
            <span class="color-picker-plus">+</span>
          </div>
        </div>
      </div>
      
      <!-- 添加按钮 -->
      <Button
        variant="primary"
        size="md"
        icon="text"
        block
        @click="addText"
      >
        {{ $t('sidebar.text.addButton') }}
      </Button>
      
      <!-- 文字列表 -->
      <div v-if="store.hasTexts" class="text-list-section">
        <div class="section-header">
          <span class="text-count">{{ $t('sidebar.text.added', { count: store.texts.length }) }}</span>
          <Button
            variant="text"
            size="sm"
            @click="clearAllTexts"
          >
            {{ $t('sidebar.text.clear') }}
          </Button>
        </div>
        
        <TransitionGroup name="text-list" tag="div" class="text-list">
          <div
            v-for="text in store.texts"
            :key="text.id"
            :class="['text-item', { selected: text.selected }]"
            @click="store.selectText(text.id)"
          >
            <div class="text-preview">
              <div class="text-color-indicator" :style="{ background: text.style.color }"></div>
              <span class="text-content">{{ text.content }}</span>
            </div>
            <button class="text-remove" @click.stop="removeText(text.id)">
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/store/useAppStore'
import { createTextElement } from '@/core/models'
import Icon from '@/components/Common/Icon.vue'
import Button from '@/components/Common/Button.vue'
import Select, { type SelectOption } from '@/components/Common/Select.vue'
import { toast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import { isFontAvailable } from '@/utils/fontDetector'

const store = useAppStore()
const { t } = useI18n()
const colorInput = ref<HTMLInputElement>()

/** 预设字体列表（30+ 常用字体） */
const PRESET_FONTS = [
  // === 中文优先字体 ===
  { label: '苹方（推荐）', value: 'PingFang SC', category: 'chinese' },
  { label: '苹方 HK', value: 'PingFang HK', category: 'chinese' },
  { label: '苹方 TC', value: 'PingFang TC', category: 'chinese' },
  { label: '微软雅黑', value: 'Microsoft YaHei', category: 'chinese' },
  { label: '微软正黑体', value: 'Microsoft JhengHei', category: 'chinese' },
  { label: '黑体', value: 'SimHei', category: 'chinese' },
  { label: '宋体', value: 'SimSun', category: 'chinese' },
  { label: '新宋体', value: 'NSimSun', category: 'chinese' },
  { label: '楷体', value: 'KaiTi', category: 'chinese' },
  { label: '仿宋', value: 'FangSong', category: 'chinese' },
  { label: '华文黑体', value: 'STHeiti', category: 'chinese' },
  { label: '华文宋体', value: 'STSong', category: 'chinese' },
  { label: '华文楷体', value: 'STKaiti', category: 'chinese' },
  
  // === 英文无衬线字体 ===
  { label: 'Arial', value: 'Arial', category: 'sans-serif' },
  { label: 'Helvetica', value: 'Helvetica', category: 'sans-serif' },
  { label: 'Helvetica Neue', value: 'Helvetica Neue', category: 'sans-serif' },
  { label: 'Verdana', value: 'Verdana', category: 'sans-serif' },
  { label: 'Tahoma', value: 'Tahoma', category: 'sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS', category: 'sans-serif' },
  { label: 'Segoe UI', value: 'Segoe UI', category: 'sans-serif' },
  
  // === 英文衬线字体 ===
  { label: 'Times New Roman', value: 'Times New Roman', category: 'serif' },
  { label: 'Georgia', value: 'Georgia', category: 'serif' },
  { label: 'Palatino', value: 'Palatino', category: 'serif' },
  { label: 'Garamond', value: 'Garamond', category: 'serif' },
  
  // === 等宽字体 ===
  { label: 'Courier New', value: 'Courier New', category: 'monospace' },
  { label: 'Consolas', value: 'Consolas', category: 'monospace' },
  { label: 'Monaco', value: 'Monaco', category: 'monospace' },
  
  // === 艺术/创意字体 ===
  { label: 'Comic Sans MS', value: 'Comic Sans MS', category: 'cursive' },
  { label: 'Impact', value: 'Impact', category: 'display' },
  { label: 'Brush Script MT', value: 'Brush Script MT', category: 'cursive' }
]

/** 文字内容 */
const textContent = ref('')

/** 字体大小 */
const fontSize = ref(32)

/** 当前选中字体 */
const fontFamily = ref('PingFang SC, sans-serif')

/** 自定义字体输入 */
const customFontInput = ref('')

/** 字体可用性缓存 */
const fontAvailability = ref<Map<string, boolean>>(new Map())

/** 是否正在检测字体 */
const checkingFonts = ref(false)

/** 文字颜色 */
const textColor = ref('#000000')

/** 当前选中的文字 */
const selectedText = computed(() => {
  return store.texts.find(t => t.selected)
})

/** 
 * 生成字体选择器选项
 * 不可用字体标记为禁用并置灰
 * 每个选项用自己的字体显示，实现字体预览效果
 */
const fontFamilies = computed<SelectOption[]>(() => {
  return PRESET_FONTS.map(font => {
    const isAvailable = fontAvailability.value.get(font.value) ?? true
    const fallback = font.category === 'chinese' ? ', sans-serif' : 
                     font.category === 'serif' ? ', serif' :
                     font.category === 'monospace' ? ', monospace' :
                     font.category === 'cursive' ? ', cursive' : ', sans-serif'
    
    const fullFontFamily = `${font.value}${fallback}`
    
    return {
      label: font.label,
      value: fullFontFamily,
      disabled: !isAvailable,  // 不可用字体禁用
      fontFamily: fullFontFamily  // 用于预览字体效果
    }
  })
})

/** 
 * 检测所有字体可用性
 * 在组件挂载时执行
 */
async function checkAllFonts() {
  checkingFonts.value = true
  
  // 使用 setTimeout 避免阻塞 UI
  await new Promise(resolve => setTimeout(resolve, 0))
  
  const fonts = PRESET_FONTS.map(f => f.value)
  const availability = new Map<string, boolean>()
  
  for (const font of fonts) {
    availability.set(font, isFontAvailable(font))
  }
  
  fontAvailability.value = availability
  checkingFonts.value = false
}

/** 应用自定义字体 */
function applyCustomFont() {
  const customFont = customFontInput.value.trim()
  if (!customFont) return
  
  // 检测字体是否可用
  if (!isFontAvailable(customFont)) {
    toast.error(t('toast.fontNotAvailable', { font: customFont }))
    // 不清空输入框，让 addText 能检测到有未应用的字体
    return
  }
  
  // 构造 font-family 值（添加降级字体）
  const fontValue = `${customFont}, sans-serif`
  fontFamily.value = fontValue
  
  // 显示成功提示
  toast.success(t('toast.fontApplied'))
  
  // 清空输入，便于下次输入
  customFontInput.value = ''
}

/** 监听选中文字的变化，同步字体大小到侧边栏 */
watch(
  () => selectedText.value?.style.fontSize,
  (newFontSize) => {
    if (newFontSize !== undefined && newFontSize !== fontSize.value) {
      fontSize.value = newFontSize
    }
  }
)

/** 监听侧边栏字体大小的变化，同步到选中的文字 */
watch(fontSize, (newSize) => {
  if (selectedText.value && selectedText.value.style.fontSize !== newSize) {
    store.updateText(selectedText.value.id, {
      style: {
        ...selectedText.value.style,
        fontSize: newSize
      }
    })
  }
})

/** 监听选中文字的字体变化，同步到侧边栏 */
watch(
  () => selectedText.value?.style.fontFamily,
  (newFontFamily) => {
    if (newFontFamily !== undefined && newFontFamily !== fontFamily.value) {
      fontFamily.value = newFontFamily
    }
  }
)

/** 监听侧边栏字体变化，同步到选中的文字 */
watch(fontFamily, (newFontFamily) => {
  if (selectedText.value && selectedText.value.style.fontFamily !== newFontFamily) {
    store.updateText(selectedText.value.id, {
      style: {
        ...selectedText.value.style,
        fontFamily: newFontFamily
      }
    })
  }
})

/** 预设颜色 */
const presetColors = [
  '#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F',
  '#B19CD9', '#FF85A2'
]

/** 触发颜色选择器 */
function triggerColorPicker() {
  colorInput.value?.click()
}

/** 添加文字 */
function addText() {
  if (!textContent.value.trim()) {
    toast.warning(t('toast.pleaseInputText'))
    return
  }
  
  // 检查是否有未应用的自定义字体
  const pendingFont = customFontInput.value.trim()
  if (pendingFont) {
    // 再次验证字体是否有效（可能是无效字体）
    if (!isFontAvailable(pendingFont)) {
      toast.error(t('toast.invalidFontCantAdd', { font: pendingFont }))
      // 清空无效字体输入
      customFontInput.value = ''
      return
    } else {
      // 字体有效但未应用，提示用户
      toast.warning(t('toast.pleaseApplyFontFirst'))
      return
    }
  }
  
  // 在画布中心添加文字
  const x = store.canvasWidth / 2
  const y = store.canvasHeight / 2
  
  const text = createTextElement(textContent.value, x, y, {
    fontSize: fontSize.value,
    color: textColor.value,
    fontFamily: fontFamily.value
  })
  
  store.addText(text)
  toast.success(t('toast.textAdded'))
  
  // 清空输入
  textContent.value = ''
}

/** 组件挂载时检测字体 */
onMounted(() => {
  checkAllFonts()
})

/** 删除文字 */
function removeText(id: string) {
  store.removeText(id)
  toast.info(t('toast.textRemoved'))
}

/** 清空所有文字 */
function clearAllTexts() {
  if (confirm(t('confirm.clearAllTexts'))) {
    store.clearTexts()
    toast.info(t('toast.allTextsCleared'))
  }
}
</script>

<style scoped>
.text-panel {
  animation: fade-in var(--duration-base) var(--ease-out);
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
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

.text-count {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

/* 控件组 */
.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.control-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
  font-family: var(--font-family-mono);
}

/* 文字输入框 */
.text-input {
  width: 100%;
  padding: var(--spacing-3);
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-800);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  resize: vertical;
  transition: var(--transition-base);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

/* 自定义字体输入框 */
.custom-font-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-family: inherit;
  font-size: var(--font-size-sm);
  color: var(--color-neutral-800);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}

.custom-font-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

/* 颜色网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-2);
}

.color-item {
  aspect-ratio: 1;
  border: 2px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-0);
  position: relative;
  overflow: hidden;
}

.color-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  transition: var(--transition-fast);
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.color-item.active {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-primary);
}

.color-item Icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* 自定义颜色选择器 */
.color-picker-trigger {
  background: linear-gradient(135deg, 
    #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, 
    #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%);
  position: relative;
}

.color-picker-preview {
  position: absolute;
  inset: 4px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-neutral-0);
}

.color-picker-plus {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-0);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 文字列表 */
.text-list-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.text-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.text-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.text-item:hover {
  border-color: var(--color-primary-400);
  background: var(--color-neutral-50);
  transform: translateX(4px);
}

.text-item.selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-primary);
}

.text-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
  min-width: 0;
}

.text-color-indicator {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color-base);
  flex-shrink: 0;
}

.text-content {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.text-remove:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* 列表动画 */
.text-list-move {
  transition: transform var(--duration-base) var(--ease-out);
}

.text-list-enter-active {
  animation: slide-in-right var(--duration-base) var(--ease-out);
}

.text-list-leave-active {
  position: absolute;
  animation: slide-in-right var(--duration-base) var(--ease-in) reverse;
}
</style>

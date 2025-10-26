<template>
  <div 
    ref="selectRef" 
    class="select-wrapper"
    :class="{ 'select-disabled': disabled }"
  >
    <button
      type="button"
      :class="['select-trigger', sizeClass, { 'select-open': isOpen }]"
      :disabled="disabled"
      @click="toggleDropdown"
      @keydown="handleTriggerKeydown"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <span class="select-value">{{ selectedLabel || actualPlaceholder }}</span>
      <Icon name="chevron-down" size="sm" class="select-arrow" />
    </button>
    
    <Transition name="dropdown">
      <div
        v-show="isOpen"
        class="select-dropdown"
        role="listbox"
      >
        <!-- 搜索框 -->
        <div v-if="searchable" class="select-search">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="select-search-input"
            :placeholder="$t('common.searchPlaceholder')"
            @click.stop
          >
          <Icon name="search" size="sm" class="select-search-icon" />
        </div>
        
        <!-- 选项列表 -->
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          :class="[
            'select-option',
            { 
              'select-option-selected': option.value === modelValue,
              'select-option-highlighted': index === highlightedIndex,
              'select-option-disabled': option.disabled
            }
          ]"
          role="option"
          :aria-selected="option.value === modelValue"
          :aria-disabled="option.disabled"
          @click="selectOption(option)"
          @mouseenter="!option.disabled && (highlightedIndex = index)"
        >
          <span 
            class="select-option-label"
            :style="option.fontFamily ? { fontFamily: option.fontFamily } : undefined"
          >
            {{ option.label }}
          </span>
          <Icon 
            v-if="option.value === modelValue" 
            name="check" 
            size="sm" 
            class="select-option-icon"
          />
        </div>
        
        <!-- 无结果提示 -->
        <div v-if="searchable && filteredOptions.length === 0" class="select-no-results">
          无匹配结果
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/** 选项类型 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean  // 是否禁用
  fontFamily?: string  // 自定义字体（用于预览）
}

/** Select 属性 */
interface Props {
  /** 当前值 */
  modelValue: string | number
  /** 选项列表 */
  options: SelectOption[]
  /** 占位符 */
  placeholder?: string
  /** 禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否可搜索 */
  searchable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
  searchable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const selectRef = ref<HTMLElement>()
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement>()

/** 实际使用的 placeholder（带默认值） */
const actualPlaceholder = computed(() => props.placeholder || t('common.selectPlaceholder'))

/** 尺寸类名 */
const sizeClass = computed(() => `select-${props.size}`)

/** 选中项的标签 */
const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected?.label || ''
})

/** 过滤后的选项列表 */
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => 
    opt.label.toLowerCase().includes(query)
  )
})

/** 切换下拉菜单 */
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    // 打开时，高亮当前选中项
    const currentIndex = filteredOptions.value.findIndex(opt => opt.value === props.modelValue)
    highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
    
    // 如果可搜索，聚焦搜索框
    if (props.searchable) {
      searchQuery.value = ''
      setTimeout(() => {
        searchInputRef.value?.focus()
      }, 50)
    }
  }
}

/** 选择选项 */
function selectOption(option: SelectOption) {
  // 如果选项被禁用，不执行选择
  if (option.disabled) return
  
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
  highlightedIndex.value = -1
  searchQuery.value = ''
}

/** 触发器键盘事件 */
function handleTriggerKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  
  switch (e.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
        const currentIndex = filteredOptions.value.findIndex(opt => opt.value === props.modelValue)
        highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
        const currentIndex = filteredOptions.value.findIndex(opt => opt.value === props.modelValue)
        highlightedIndex.value = currentIndex >= 0 ? currentIndex : filteredOptions.value.length - 1
      }
      break
  }
}

/** 下拉菜单键盘事件 */
function handleDropdownKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  
  // 如果是在搜索框中输入，不处理上下键
  if (props.searchable && document.activeElement === searchInputRef.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      isOpen.value = false
      highlightedIndex.value = -1
      searchQuery.value = ''
      return
    }
    if (e.key === 'Enter' && highlightedIndex.value >= 0) {
      e.preventDefault()
      selectOption(filteredOptions.value[highlightedIndex.value])
      return
    }
    return
  }
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      // 跳过禁用的选项
      let nextIndex = highlightedIndex.value + 1
      while (nextIndex < filteredOptions.value.length && filteredOptions.value[nextIndex].disabled) {
        nextIndex++
      }
      if (nextIndex < filteredOptions.value.length) {
        highlightedIndex.value = nextIndex
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      // 跳过禁用的选项
      let prevIndex = highlightedIndex.value - 1
      while (prevIndex >= 0 && filteredOptions.value[prevIndex].disabled) {
        prevIndex--
      }
      if (prevIndex >= 0) {
        highlightedIndex.value = prevIndex
      }
      break
    case 'Enter':
      e.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      isOpen.value = false
      highlightedIndex.value = -1
      searchQuery.value = ''
      break
  }
}

/** 点击外部关闭 */
function handleClickOutside(e: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
    highlightedIndex.value = -1
  }
}

/** 监听键盘事件 */
watch(isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleDropdownKeydown)
  } else {
    document.removeEventListener('keydown', handleDropdownKeydown)
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleDropdownKeydown)
})
</script>

<style scoped>
.select-wrapper {
  position: relative;
  display: inline-block;
}

.select-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 触发器按钮 */
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
  background: var(--color-neutral-50);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  outline: none;
  user-select: none;
  width: 100%;
}

.select-trigger:hover:not(:disabled) {
  border-color: var(--color-primary-400);
  background-color: var(--color-neutral-0);
}

.select-trigger:focus-visible {
  border-color: var(--color-primary-500);
  background-color: var(--color-neutral-0);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.select-trigger.select-open {
  border-color: var(--color-primary-500);
  background-color: var(--color-neutral-0);
}

.select-trigger:disabled {
  cursor: not-allowed;
}

/* 尺寸 */
.select-sm {
  min-width: 120px;
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  min-height: 28px;
}

.select-md {
  min-width: 160px;
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  min-height: 32px;
}

.select-lg {
  min-width: 200px;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  min-height: 40px;
}

/* 值 */
.select-value {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 箭头 */
.select-arrow {
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-in-out);
  color: var(--color-neutral-500);
}

.select-open .select-arrow {
  transform: rotate(180deg);
  color: var(--color-primary-500);
}

/* 下拉菜单 */
.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 320px;
  overflow-y: auto;
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-dropdown);
  padding: var(--spacing-1);
  display: flex;
  flex-direction: column;
}

/* 搜索框容器 */
.select-search {
  position: relative;
  padding: var(--spacing-2);
  padding-bottom: var(--spacing-1);
  border-bottom: 1px solid var(--border-color-light);
  margin-bottom: var(--spacing-1);
}

/* 搜索输入框 */
.select-search-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-7) var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-800);
  background: var(--color-neutral-50);
  border: 1px solid var(--border-color-base);
  border-radius: var(--radius-sm);
  outline: none;
  transition: var(--transition-fast);
}

.select-search-input:focus {
  background: var(--color-neutral-0);
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.select-search-input::placeholder {
  color: var(--color-neutral-400);
}

/* 搜索图标 */
.select-search-icon {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-neutral-400);
  pointer-events: none;
}

/* 自定义滚动条 */
.select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-400);
}

/* 选项 */
.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-700);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  user-select: none;
}

.select-option:hover,
.select-option-highlighted {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.select-option-selected {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  font-weight: var(--font-weight-semibold);
}

.select-option-selected:hover,
.select-option-selected.select-option-highlighted {
  background: var(--color-primary-600);
}

.select-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-option-icon {
  flex-shrink: 0;
}

/* 禁用选项 */
.select-option-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--color-neutral-50);
}

.select-option-disabled:hover {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
}

.select-option-disabled .select-option-label {
  text-decoration: line-through;
}

/* 无结果提示 */
.select-no-results {
  padding: var(--spacing-4) var(--spacing-3);
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
}

/* 下拉动画 */
.dropdown-enter-active {
  animation: dropdown-in var(--duration-fast) var(--ease-out);
}

.dropdown-leave-active {
  animation: dropdown-out var(--duration-fast) var(--ease-in);
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}
</style>


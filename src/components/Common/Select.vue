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
      <span class="select-value">{{ selectedLabel || placeholder }}</span>
      <Icon name="chevron-down" size="sm" class="select-arrow" />
    </button>
    
    <Transition name="dropdown">
      <div
        v-show="isOpen"
        class="select-dropdown"
        role="listbox"
      >
        <div
          v-for="(option, index) in options"
          :key="option.value"
          :class="[
            'select-option',
            { 
              'select-option-selected': option.value === modelValue,
              'select-option-highlighted': index === highlightedIndex
            }
          ]"
          role="option"
          :aria-selected="option.value === modelValue"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <span class="select-option-label">{{ option.label }}</span>
          <Icon 
            v-if="option.value === modelValue" 
            name="check" 
            size="sm" 
            class="select-option-icon"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'

/** 选项类型 */
export interface SelectOption {
  label: string
  value: string | number
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
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const selectRef = ref<HTMLElement>()
const isOpen = ref(false)
const highlightedIndex = ref(-1)

/** 尺寸类名 */
const sizeClass = computed(() => `select-${props.size}`)

/** 选中项的标签 */
const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected?.label || ''
})

/** 切换下拉菜单 */
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    // 打开时，高亮当前选中项
    const currentIndex = props.options.findIndex(opt => opt.value === props.modelValue)
    highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
  }
}

/** 选择选项 */
function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
  highlightedIndex.value = -1
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
        const currentIndex = props.options.findIndex(opt => opt.value === props.modelValue)
        highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
        const currentIndex = props.options.findIndex(opt => opt.value === props.modelValue)
        highlightedIndex.value = currentIndex >= 0 ? currentIndex : props.options.length - 1
      }
      break
  }
}

/** 下拉菜单键盘事件 */
function handleDropdownKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, props.options.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectOption(props.options[highlightedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      isOpen.value = false
      highlightedIndex.value = -1
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
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-neutral-0);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-index-dropdown);
  padding: var(--spacing-1);
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


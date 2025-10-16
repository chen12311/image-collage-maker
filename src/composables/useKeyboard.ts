/**
 * 键盘快捷键系统
 * 提供全局快捷键管理
 */

import { onMounted, onUnmounted, ref } from 'vue'

/** 快捷键配置 */
export interface ShortcutConfig {
  /** 快捷键组合 */
  key: string
  /** 是否需要Ctrl/Cmd */
  ctrl?: boolean
  /** 是否需要Shift */
  shift?: boolean
  /** 是否需要Alt */
  alt?: boolean
  /** 回调函数 */
  handler: (event: KeyboardEvent) => void
  /** 描述 */
  description?: string
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

/** 快捷键注册表 */
const shortcuts = ref<ShortcutConfig[]>([])

/** 快捷键帮助可见性 */
const helpVisible = ref(false)

/**
 * 注册快捷键
 */
export function registerShortcut(config: ShortcutConfig) {
  shortcuts.value.push(config)
}

/**
 * 注销快捷键
 */
export function unregisterShortcut(key: string) {
  const index = shortcuts.value.findIndex(s => s.key === key)
  if (index !== -1) {
    shortcuts.value.splice(index, 1)
  }
}

/**
 * 清空所有快捷键
 */
export function clearShortcuts() {
  shortcuts.value = []
}

/**
 * 检查快捷键是否匹配
 */
function matchShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
  const keyMatch = event.key.toLowerCase() === config.key.toLowerCase()
  const ctrlMatch = !config.ctrl || (event.ctrlKey || event.metaKey)
  const shiftMatch = !config.shift || event.shiftKey
  const altMatch = !config.alt || event.altKey

  // 如果配置要求修饰键，确保事件也有
  if (config.ctrl && !(event.ctrlKey || event.metaKey)) return false
  if (config.shift && !event.shiftKey) return false
  if (config.alt && !event.altKey) return false

  return keyMatch && ctrlMatch && shiftMatch && altMatch
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  // 检查是否在输入框中
  const target = event.target as HTMLElement
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)

  // 特殊键：? 显示帮助
  if (event.key === '?' && !isInput) {
    event.preventDefault()
    helpVisible.value = !helpVisible.value
    return
  }

  // 如果在输入框中，不处理快捷键（除非是带有 Ctrl/Cmd 的组合键）
  // 这样可以让用户正常输入，同时保留 Ctrl+Z、Ctrl+S 等常用快捷键
  if (isInput) {
    const hasModifier = event.ctrlKey || event.metaKey || event.altKey
    if (!hasModifier) {
      // 在输入框中且没有修饰键，直接返回，不处理快捷键
      return
    }
  }

  // 匹配快捷键
  for (const config of shortcuts.value) {
    if (matchShortcut(event, config)) {
      if (config.preventDefault !== false) {
        event.preventDefault()
      }
      config.handler(event)
      break
    }
  }
}

/**
 * 格式化快捷键显示
 */
export function formatShortcut(config: ShortcutConfig): string {
  const parts: string[] = []
  
  if (config.ctrl) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
  }
  if (config.shift) {
    parts.push('⇧')
  }
  if (config.alt) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt')
  }
  
  parts.push(config.key.toUpperCase())
  
  return parts.join(' + ')
}

/**
 * useKeyboard组合式函数
 */
export function useKeyboard() {
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    shortcuts,
    helpVisible,
    registerShortcut,
    unregisterShortcut,
    clearShortcuts,
    formatShortcut
  }
}

/**
 * 预定义的快捷键
 */
export const SHORTCUTS = {
  UNDO: { key: 'z', ctrl: true, description: '撤销' },
  REDO: { key: 'y', ctrl: true, description: '重做' },
  SAVE: { key: 's', ctrl: true, description: '导出图片' },
  DELETE: { key: 'Delete', description: '删除选中' },
  LAYOUT_1: { key: '1', description: '切换到布局1' },
  LAYOUT_2: { key: '2', description: '切换到布局2' },
  LAYOUT_3: { key: '3', description: '切换到布局3' },
  LAYOUT_4: { key: '4', description: '切换到布局4' },
  TOGGLE_SIDEBAR: { key: ' ', description: '切换侧边栏' },
  HELP: { key: '?', description: '显示快捷键帮助' }
} as const


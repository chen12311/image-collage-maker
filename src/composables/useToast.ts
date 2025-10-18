/**
 * Toast 通知系统
 * 提供全局消息提示功能
 */

import { reactive } from 'vue'

/** Toast类型 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/** Toast配置 */
export interface ToastOptions {
  /** 消息内容 */
  message: string
  /** 类型 */
  type?: ToastType
  /** 持续时间（毫秒），0表示不自动关闭 */
  duration?: number
  /** 唯一ID */
  id?: string
}

/** Toast项 */
export interface ToastItem extends Required<ToastOptions> {
  /** 是否显示 */
  visible: boolean
}

/** Toast列表 */
const toasts = reactive<ToastItem[]>([])

/** 自增ID */
let toastId = 0

/**
 * 显示Toast
 */
export function showToast(options: ToastOptions | string) {
  const opts: ToastOptions = typeof options === 'string'
    ? { message: options }
    : options

  const id = opts.id || `toast-${++toastId}`
  const duration = opts.duration ?? 3000
  const type = opts.type || 'info'

  const toast: ToastItem = {
    id,
    message: opts.message,
    type,
    duration,
    visible: true
  }

  toasts.push(toast)

  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

/**
 * 移除Toast
 */
export function removeToast(id: string) {
  const index = toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts[index].visible = false
    // 等待动画结束后移除
    setTimeout(() => {
      const idx = toasts.findIndex(t => t.id === id)
      if (idx !== -1) {
        toasts.splice(idx, 1)
      }
    }, 300)
  }
}

/**
 * 清空所有Toast
 */
export function clearToasts() {
  toasts.splice(0, toasts.length)
}

/**
 * 快捷方法
 */
export const toast = {
  success: (message: string, duration?: number) => 
    showToast({ message, type: 'success', duration }),
  
  error: (message: string, duration?: number) => 
    showToast({ message, type: 'error', duration }),
  
  warning: (message: string, duration?: number) => 
    showToast({ message, type: 'warning', duration }),
  
  info: (message: string, duration?: number) => 
    showToast({ message, type: 'info', duration })
}

/**
 * useToast组合式函数
 */
export function useToast() {
  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    toast
  }
}


/**
 * ImageBatch - 应用状态管理
 * 
 * 设计哲学：
 * 1. 数据结构优先 - 简洁的状态模型
 * 2. 零特殊情况 - 统一的状态更新模式
 * 3. 实用主义 - 解决真实的撤销重做需求
 */

import { ref, reactive, computed, watch, type Ref, type ComputedRef } from 'vue'
import type { Element, GridConfig, Transform, ElementStyle } from '../core/models'

// ============================================================================
// 类型定义 - "好品味"的数据结构
// ============================================================================

/**
 * 应用状态接口 - 核心数据模型
 */
interface AppState {
  elements: Element[]
  gridConfig: GridConfig
  canvasState: CanvasState
  uiState: UIState
}

/**
 * Canvas渲染状态
 */
interface CanvasState {
  previewImage: ImageData | null
  exportImage: Blob | null
  isRendering: boolean
  renderProgress: number  // 0-1
  backgroundColor: string
}

/**
 * UI交互状态
 */
interface UIState {
  currentTool: 'upload' | 'layout' | 'export'
  isProcessing: boolean
  previewMode: boolean
  selectedElementIds: string[]
}

/**
 * 操作历史条目
 */
interface HistoryEntry {
  state: AppState
  timestamp: number
  action: string  // 操作描述，用于调试
}

/**
 * 内存使用状态
 */
interface MemoryStatus {
  usage: number        // 内存使用率 0-1
  status: 'normal' | 'high' | 'critical' | 'unknown'
  recommendation: string | null
}

/**
 * 本地存储数据结构
 */
interface StorageData {
  state: AppState
  timestamp: number
  version: string
}

// ============================================================================
// 核心状态存储 - AppStore类
// ============================================================================

/**
 * 应用状态管理器
 * 
 * 职责：
 * 1. 响应式状态管理
 * 2. 撤销重做功能
 * 3. 状态持久化
 * 4. 内存监控
 */
class AppStore {
  // 核心响应式状态
  private state: Ref<AppState>
  
  // 操作历史栈 - 撤销重做
  private history: HistoryEntry[] = []
  private historyIndex: number = -1
  private readonly maxHistorySize = 10
  
  // 配置
  private readonly storageKey = 'imageBatch_appState'
  private readonly storageVersion = '1.0.0'
  
  constructor() {
    // 初始化状态
    this.state = ref(this.createInitialState())
    
    // 保存初始状态到历史栈（这是第一个历史记录）
    this.saveToHistory('应用初始化')
    
    // 自动保存到localStorage
    this.setupAutoSave()
    
    // 尝试从localStorage恢复状态
    this.restoreFromStorage()
  }

  // ========================================================================
  // 公共API - 简洁的接口
  // ========================================================================

  /**
   * 获取当前状态（只读）
   */
  get currentState(): AppState {
    return this.state.value
  }

  /**
   * 获取响应式elements
   */
  get elements(): ComputedRef<Element[]> {
    return computed(() => this.state.value.elements)
  }

  /**
   * 获取响应式gridConfig
   */
  get gridConfig(): ComputedRef<GridConfig> {
    return computed(() => this.state.value.gridConfig)
  }

  /**
   * 获取响应式canvasState
   */
  get canvasState(): ComputedRef<CanvasState> {
    return computed(() => this.state.value.canvasState)
  }

  /**
   * 获取响应式uiState
   */
  get uiState(): ComputedRef<UIState> {
    return computed(() => this.state.value.uiState)
  }

  /**
   * 是否可以撤销
   */
  get canUndo(): ComputedRef<boolean> {
    return computed(() => this.historyIndex > 0)
  }

  /**
   * 是否可以重做
   */
  get canRedo(): ComputedRef<boolean> {
    return computed(() => this.historyIndex < this.history.length - 1)
  }

  /**
   * 当前内存使用状态
   */
  get memoryStatus(): ComputedRef<MemoryStatus> {
    return computed(() => this.checkMemoryUsage())
  }

  // ========================================================================
  // 状态更新方法 - 统一模式，零特殊情况
  // ========================================================================

  /**
   * 添加元素
   */
  addElement(element: Element): void {
    this.updateState(state => ({
      ...state,
      elements: [...state.elements, element]
    }), `添加元素: ${element.id}`)
  }

  /**
   * 移除元素
   */
  removeElement(elementId: string): void {
    this.updateState(state => ({
      ...state,
      elements: state.elements.filter(el => el.id !== elementId)
    }), `移除元素: ${elementId}`)
  }

  /**
   * 更新元素
   */
  updateElement(elementId: string, updates: Partial<Element>): void {
    this.updateState(state => ({
      ...state,
      elements: state.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    }), `更新元素: ${elementId}`)
  }

  /**
   * 更新元素变换
   */
  updateElementTransform(elementId: string, transform: Partial<Transform>): void {
    this.updateState(state => ({
      ...state,
      elements: state.elements.map(el => 
        el.id === elementId 
          ? { ...el, transform: { ...el.transform, ...transform } }
          : el
      )
    }), `变换元素: ${elementId}`)
  }

  /**
   * 更新元素样式
   */
  updateElementStyle(elementId: string, style: Partial<ElementStyle>): void {
    this.updateState(state => ({
      ...state,
      elements: state.elements.map(el => 
        el.id === elementId 
          ? { ...el, style: { ...el.style, ...style } }
          : el
      )
    }), `样式元素: ${elementId}`)
  }

  /**
   * 批量更新元素
   */
  updateElements(elements: Element[]): void {
    this.updateState(state => ({
      ...state,
      elements
    }), `批量更新元素 (${elements.length}个)`)
  }

  /**
   * 更新网格配置
   */
  updateGridConfig(config: Partial<GridConfig>): void {
    this.updateState(state => ({
      ...state,
      gridConfig: { ...state.gridConfig, ...config }
    }), '更新网格配置')
  }

  /**
   * 更新Canvas状态
   */
  updateCanvasState(canvasState: Partial<CanvasState>): void {
    this.updateState(state => ({
      ...state,
      canvasState: { ...state.canvasState, ...canvasState }
    }), '更新Canvas状态')
  }

  /**
   * 更新UI状态
   */
  updateUIState(uiState: Partial<UIState>): void {
    this.updateState(state => ({
      ...state,
      uiState: { ...state.uiState, ...uiState }
    }), '更新UI状态')
  }

  /**
   * 重置状态到初始状态
   */
  resetState(): void {
    // 重置状态
    this.state.value = this.createInitialState()
    
    // 重置历史栈
    this.history = []
    this.historyIndex = -1
    
    // 保存初始状态到历史栈
    this.saveToHistory('重置状态')
  }

  // ========================================================================
  // 撤销重做功能 - 简洁实现
  // ========================================================================

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (this.historyIndex <= 0) {
      return false
    }

    this.historyIndex--
    const targetEntry = this.history[this.historyIndex]
    this.state.value = this.deepClone(targetEntry.state)
    
    // console.log(`撤销操作: ${targetEntry.action}`)
    return true
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) {
      return false
    }

    this.historyIndex++
    const targetEntry = this.history[this.historyIndex]
    this.state.value = this.deepClone(targetEntry.state)
    
    // console.log(`重做操作: ${targetEntry.action}`)
    return true
  }

  // ========================================================================
  // 内部实现 - 核心逻辑
  // ========================================================================

  /**
   * 创建初始状态
   */
  private createInitialState(): AppState {
    return {
      elements: [],
      gridConfig: {
        rows: 1,
        cols: 1,
        cellWidth: 200,
        cellHeight: 200,
        spacing: 10
      },
      canvasState: {
        previewImage: null,
        exportImage: null,
        isRendering: false,
        renderProgress: 0,
        backgroundColor: '#ffffff'
      },
      uiState: {
        currentTool: 'upload',
        isProcessing: false,
        previewMode: false,
        selectedElementIds: []
      }
    }
  }

  /**
   * 统一的状态更新方法
   */
  private updateState(
    updater: (state: AppState) => AppState,
    action: string = '状态更新'
  ): void {
    // 更新状态
    const newState = updater(this.state.value)
    this.state.value = newState
    
    // 保存新状态到历史（在更新后）
    this.saveToHistory(action)
  }

  /**
   * 保存状态到历史栈
   */
  private saveToHistory(action: string): void {
    // 如果当前不在历史栈末尾，清除后续历史
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    // 添加新的历史条目
    const historyEntry: HistoryEntry = {
      state: this.deepClone(this.state.value),
      timestamp: Date.now(),
      action
    }

    this.history.push(historyEntry)
    this.historyIndex = this.history.length - 1

    // 限制历史栈大小 - 确保正确的边界处理
    while (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.historyIndex--
    }
  }

  /**
   * 设置自动保存
   */
  private setupAutoSave(): void {
    // 监听状态变化，自动保存到localStorage
    watch(
      this.state,
      (newState) => {
        this.saveToStorage(newState)
      },
      { deep: true, flush: 'post' }
    )
  }

  /**
   * 保存到localStorage
   */
  private saveToStorage(state: AppState): void {
    try {
      const data: StorageData = {
        state: this.deepClone(state),
        timestamp: Date.now(),
        version: this.storageVersion
      }

      const jsonString = JSON.stringify(data)
      
      // 检查存储大小限制（5MB）
      if (jsonString.length > 5 * 1024 * 1024) {
        console.warn('状态数据过大，跳过持久化保存')
        return
      }

      localStorage.setItem(this.storageKey, jsonString)
    } catch (error) {
      console.warn('保存状态到localStorage失败:', error)
    }
  }

  /**
   * 从localStorage恢复状态
   */
  private restoreFromStorage(): void {
    try {
      const jsonString = localStorage.getItem(this.storageKey)
      if (!jsonString) {
        return
      }

      const data: StorageData = JSON.parse(jsonString)
      
      // 检查版本兼容性
      if (data.version !== this.storageVersion) {
        console.warn('存储版本不匹配，跳过状态恢复')
        return
      }

      // 检查数据时效性（7天）
      const maxAge = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - data.timestamp > maxAge) {
        console.warn('存储数据过期，跳过状态恢复')
        this.clearStorage()
        return
      }

      // 恢复状态
      this.state.value = data.state
      console.log('从localStorage恢复状态成功')
    } catch (error) {
      console.warn('从localStorage恢复状态失败:', error)
      this.clearStorage()
    }
  }

  /**
   * 清除localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('清除localStorage失败:', error)
    }
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): MemoryStatus {
    try {
      // @ts-ignore - 实验性API
      if (performance.memory) {
        // @ts-ignore
        const used = performance.memory.usedJSHeapSize
        // @ts-ignore
        const total = performance.memory.totalJSHeapSize
        const usage = used / total

        let status: MemoryStatus['status']
        let recommendation: string | null = null

        if (usage > 0.9) {
          status = 'critical'
          recommendation = '内存使用率过高，建议减少图片数量或降低图片质量'
        } else if (usage > 0.8) {
          status = 'high'
          recommendation = '内存使用率较高，将自动压缩图片以保证性能'
        } else {
          status = 'normal'
        }

        return { usage, status, recommendation }
      }
    } catch (error) {
      console.warn('内存使用检查失败:', error)
    }

    return { usage: 0, status: 'unknown', recommendation: null }
  }

  /**
   * 深拷贝对象 - 优化性能
   */
  private deepClone<T>(obj: T): T {
    // 对于简单对象使用更高效的拷贝方法
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    
    // 对于大对象，仍使用JSON方法但添加错误处理
    try {
      return JSON.parse(JSON.stringify(obj))
    } catch (error) {
      console.warn('深拷贝失败，返回原对象:', error)
      return obj
    }
  }
}

// ============================================================================
// 导出 - 单例模式
// ============================================================================

/**
 * 全局应用状态实例
 */
export const appStore = new AppStore()

/**
 * 用于Composition API的hook
 */
export function useAppStore() {
  return {
    // 响应式状态
    elements: appStore.elements,
    gridConfig: appStore.gridConfig,
    canvasState: appStore.canvasState,
    uiState: appStore.uiState,

    // 状态查询
    canUndo: appStore.canUndo,
    canRedo: appStore.canRedo,
    memoryStatus: appStore.memoryStatus,

    // 状态更新方法
    addElement: appStore.addElement.bind(appStore),
    removeElement: appStore.removeElement.bind(appStore),
    updateElement: appStore.updateElement.bind(appStore),
    updateElementTransform: appStore.updateElementTransform.bind(appStore),
    updateElementStyle: appStore.updateElementStyle.bind(appStore),
    updateElements: appStore.updateElements.bind(appStore),
    updateGridConfig: appStore.updateGridConfig.bind(appStore),
    updateCanvasState: appStore.updateCanvasState.bind(appStore),
    updateUIState: appStore.updateUIState.bind(appStore),
    resetState: appStore.resetState.bind(appStore),

    // 撤销重做
    undo: appStore.undo.bind(appStore),
    redo: appStore.redo.bind(appStore)
  }
}

// 类型导出
export type { AppState, CanvasState, UIState, MemoryStatus }

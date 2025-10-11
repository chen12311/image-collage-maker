/**
 * 历史管理器
 * 
 * 实现撤销/重做功能，使用Command模式管理状态快照
 */

import type { CanvasState } from '@/core/models'
import { cloneCanvasState, isStateEqual } from '@/core/models'

/**
 * 历史管理器配置
 */
export interface HistoryManagerConfig {
  /** 最大历史记录数 */
  maxHistory: number
  
  /** 是否启用状态比较优化 */
  enableOptimization: boolean
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: HistoryManagerConfig = {
  maxHistory: 50,
  enableOptimization: true
}

/**
 * 历史管理器
 */
export class HistoryManager {
  /** 历史栈（已执行的状态） */
  private undoStack: CanvasState[] = []
  
  /** 重做栈（已撤销的状态） */
  private redoStack: CanvasState[] = []
  
  /** 配置 */
  private config: HistoryManagerConfig
  
  /**
   * 构造函数
   */
  constructor(config: Partial<HistoryManagerConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }
  }
  
  /**
   * 记录新状态
   * 
   * @param state 当前状态
   */
  push(state: CanvasState): void {
    // 如果启用优化，检查是否与最后一个状态相同
    if (this.config.enableOptimization && this.undoStack.length > 0) {
      const lastState = this.undoStack[this.undoStack.length - 1]
      if (isStateEqual(lastState, state)) {
        return // 状态未变化，不记录
      }
    }
    
    // 克隆状态以避免引用问题
    const clonedState = cloneCanvasState(state)
    
    // 添加到撤销栈
    this.undoStack.push(clonedState)
    
    // 清空重做栈（新操作会使重做栈失效）
    this.redoStack = []
    
    // 限制历史记录数量
    if (this.undoStack.length > this.config.maxHistory) {
      this.undoStack.shift() // 移除最旧的记录
    }
  }
  
  /**
   * 撤销
   * 
   * @returns 撤销后的状态，如果无法撤销返回null
   */
  undo(): CanvasState | null {
    if (!this.canUndo) {
      return null
    }
    
    // 弹出当前状态
    const currentState = this.undoStack.pop()!
    
    // 移动到重做栈
    this.redoStack.push(currentState)
    
    // 返回上一个状态
    const previousState = this.undoStack[this.undoStack.length - 1]
    return previousState ? cloneCanvasState(previousState) : null
  }
  
  /**
   * 重做
   * 
   * @returns 重做后的状态，如果无法重做返回null
   */
  redo(): CanvasState | null {
    if (!this.canRedo) {
      return null
    }
    
    // 从重做栈弹出状态
    const nextState = this.redoStack.pop()!
    
    // 移动回撤销栈
    this.undoStack.push(nextState)
    
    // 返回状态
    return cloneCanvasState(nextState)
  }
  
  /**
   * 是否可以撤销
   */
  get canUndo(): boolean {
    return this.undoStack.length > 1 // 至少需要2个状态才能撤销
  }
  
  /**
   * 是否可以重做
   */
  get canRedo(): boolean {
    return this.redoStack.length > 0
  }
  
  /**
   * 获取撤销栈大小
   */
  get undoCount(): number {
    return this.undoStack.length
  }
  
  /**
   * 获取重做栈大小
   */
  get redoCount(): number {
    return this.redoStack.length
  }
  
  /**
   * 清空所有历史
   */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }
  
  /**
   * 重置为指定状态
   */
  reset(initialState: CanvasState): void {
    this.clear()
    this.push(initialState)
  }
  
  /**
   * 获取当前状态（不移除）
   */
  getCurrentState(): CanvasState | null {
    if (this.undoStack.length === 0) {
      return null
    }
    return cloneCanvasState(this.undoStack[this.undoStack.length - 1])
  }
  
  /**
   * 获取历史记录摘要（用于调试）
   */
  getSummary(): {
    canUndo: boolean
    canRedo: boolean
    undoCount: number
    redoCount: number
    totalCount: number
  } {
    return {
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      undoCount: this.undoCount,
      redoCount: this.redoCount,
      totalCount: this.undoCount + this.redoCount
    }
  }
}

/**
 * 创建历史管理器
 */
export function createHistoryManager(
  config?: Partial<HistoryManagerConfig>
): HistoryManager {
  return new HistoryManager(config)
}


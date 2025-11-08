/**
 * HistoryManager 历史管理器单元测试
 */

import { HistoryManager, createHistoryManager } from '@/history/HistoryManager'
import { createEmptyCanvasState, cloneCanvasState } from '@/core/models'
import { createLayoutConfig } from '@/core/models'
import type { CanvasState } from '@/core/models'

/** 创建测试用的画布状态 */
function createTestState(imageCount: number = 0): CanvasState {
  const layout = createLayoutConfig('grid-2x1-h')
  const state = createEmptyCanvasState(layout)
  
  // 添加指定数量的虚拟图片
  const images = Array.from({ length: imageCount }, (_, i) => ({
    id: `img-${i}`,
    fileName: `test-${i}.jpg`,
    src: `data:image/png;base64,test${i}`,
    image: new Image(),
    width: 100,
    height: 100,
    fileSize: 1024,
    timestamp: Date.now(),
    index: i,
    transform: {
      rotation: 0 as 0 | 90 | 180 | 270,
      flipH: false,
      flipV: false
    },
    fitMode: 'contain' as const
  }))
  
  return {
    ...state,
    images
  }
}

describe('HistoryManager - 基础功能', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
  })

  it('应该正确创建历史管理器', () => {
    expect(manager).toBeInstanceOf(HistoryManager)
    expect(manager.canUndo).toBe(false)
    expect(manager.canRedo).toBe(false)
  })

  it('应该使用默认配置', () => {
    const summary = manager.getSummary()
    expect(summary.undoCount).toBe(0)
    expect(summary.redoCount).toBe(0)
  })

  it('应该支持自定义配置', () => {
    const customManager = createHistoryManager({
      maxHistory: 20,
      enableOptimization: false
    })
    
    expect(customManager).toBeInstanceOf(HistoryManager)
  })
})

describe('HistoryManager - 状态推送', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
  })

  it('应该正确推送第一个状态', () => {
    const state = createTestState(0)
    manager.push(state)
    
    expect(manager.undoCount).toBe(1)
    expect(manager.canUndo).toBe(false) // 需要至少2个状态才能撤销
  })

  it('应该正确推送多个状态', () => {
    manager.push(createTestState(0))
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    
    expect(manager.undoCount).toBe(3)
    expect(manager.canUndo).toBe(true)
  })

  it('推送新状态应该清空重做栈', () => {
    // 添加3个状态
    manager.push(createTestState(0))
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    
    // 撤销一次
    manager.undo()
    expect(manager.canRedo).toBe(true)
    
    // 推送新状态
    manager.push(createTestState(3))
    
    // 重做栈应该被清空
    expect(manager.canRedo).toBe(false)
    expect(manager.redoCount).toBe(0)
  })

  it('应该克隆状态以避免引用问题', () => {
    const original = createTestState(1)
    manager.push(original)
    
    // 获取的状态应该与原始状态不同
    const current = manager.getCurrentState()
    expect(current).not.toBe(original)
    expect(current?.timestamp).toBeDefined()
  })
})

describe('HistoryManager - 撤销功能', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
  })

  it('空栈时无法撤销', () => {
    expect(manager.canUndo).toBe(false)
    expect(manager.undo()).toBeNull()
  })

  it('只有一个状态时无法撤销', () => {
    manager.push(createTestState(0))
    
    expect(manager.canUndo).toBe(false)
    expect(manager.undo()).toBeNull()
  })

  it('应该正确撤销到上一个状态', () => {
    const state1 = createTestState(1)
    const state2 = createTestState(2)
    
    manager.push(state1)
    manager.push(state2)
    
    expect(manager.canUndo).toBe(true)
    
    const undoResult = manager.undo()
    
    expect(undoResult).not.toBeNull()
    expect(undoResult?.images.length).toBe(1) // 应该是state1
  })

  it('撤销后应该能重做', () => {
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    
    manager.undo()
    
    expect(manager.canRedo).toBe(true)
    expect(manager.redoCount).toBe(1)
  })

  it('连续撤销', () => {
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
    
    // 第一次撤销
    let result = manager.undo()
    expect(result?.images.length).toBe(2)
    
    // 第二次撤销
    result = manager.undo()
    expect(result?.images.length).toBe(1)
    
    // 无法继续撤销（只剩一个状态）
    expect(manager.canUndo).toBe(false)
  })
})

describe('HistoryManager - 重做功能', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
  })

  it('空栈时无法重做', () => {
    expect(manager.canRedo).toBe(false)
    expect(manager.redo()).toBeNull()
  })

  it('未撤销时无法重做', () => {
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    
    expect(manager.canRedo).toBe(false)
  })

  it('应该正确重做', () => {
    const state1 = createTestState(1)
    const state2 = createTestState(2)
    
    manager.push(state1)
    manager.push(state2)
    
    manager.undo()
    
    const redoResult = manager.redo()
    
    expect(redoResult).not.toBeNull()
    expect(redoResult?.images.length).toBe(2) // 恢复到state2
  })

  it('连续重做', () => {
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
    
    // 连续撤销两次
    manager.undo()
    manager.undo()
    
    expect(manager.redoCount).toBe(2)
    
    // 第一次重做
    let result = manager.redo()
    expect(result?.images.length).toBe(2)
    
    // 第二次重做
    result = manager.redo()
    expect(result?.images.length).toBe(3)
    
    // 无法继续重做
    expect(manager.canRedo).toBe(false)
  })

  it('撤销后重做应该恢复到原始状态', () => {
    const state1 = createTestState(1)
    const state2 = createTestState(2)
    const state3 = createTestState(3)
    
    manager.push(state1)
    manager.push(state2)
    manager.push(state3)
    
    // 撤销
    manager.undo()
    expect(manager.getCurrentState()?.images.length).toBe(2)
    
    // 重做
    manager.redo()
    expect(manager.getCurrentState()?.images.length).toBe(3)
  })
})

describe('HistoryManager - 最大历史记录限制', () => {
  it('应该限制历史记录数量（默认50）', () => {
    const manager = createHistoryManager({ maxHistory: 50 })
    
    // 添加100个状态
    for (let i = 0; i < 100; i++) {
      manager.push(createTestState(i))
    }
    
    // 应该只保留50个
    expect(manager.undoCount).toBe(50)
  })

  it('应该使用自定义最大历史数', () => {
    const manager = createHistoryManager({ maxHistory: 10 })
    
    // 添加20个状态
    for (let i = 0; i < 20; i++) {
      manager.push(createTestState(i))
    }
    
    // 应该只保留10个
    expect(manager.undoCount).toBe(10)
  })

  it('超出限制时应该移除最旧的记录', () => {
    const manager = createHistoryManager({ maxHistory: 3 })
    
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
    manager.push(createTestState(4))
    
    // 应该移除了第一个状态（imageCount=1）
    expect(manager.undoCount).toBe(3)
    
    // 当前状态应该是最后一个
    const current = manager.getCurrentState()
    expect(current?.images.length).toBe(4)
  })
})

describe('HistoryManager - 状态优化', () => {
  it('启用优化时不记录相同状态', () => {
    const manager = createHistoryManager({ enableOptimization: true })
    
    const state1 = createTestState(1)
    manager.push(state1)
    
    // 推送相同状态
    manager.push(cloneCanvasState(state1))
    
    // 应该只有一个状态（相同状态被忽略）
    expect(manager.undoCount).toBe(1)
  })

  it('禁用优化时记录所有状态', () => {
    const manager = createHistoryManager({ enableOptimization: false })
    
    const state1 = createTestState(1)
    manager.push(state1)
    
    // 推送相同状态
    manager.push(cloneCanvasState(state1))
    
    // 应该有两个状态
    expect(manager.undoCount).toBe(2)
  })
})

describe('HistoryManager - 清空和重置', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
  })

  it('应该正确清空所有历史', () => {
    manager.clear()
    
    expect(manager.undoCount).toBe(0)
    expect(manager.redoCount).toBe(0)
    expect(manager.canUndo).toBe(false)
    expect(manager.canRedo).toBe(false)
  })

  it('应该正确重置到指定状态', () => {
    const newState = createTestState(5)
    manager.reset(newState)
    
    expect(manager.undoCount).toBe(1)
    expect(manager.redoCount).toBe(0)
    expect(manager.getCurrentState()?.images.length).toBe(5)
  })
})

describe('HistoryManager - 获取当前状态', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
  })

  it('空栈时返回null', () => {
    expect(manager.getCurrentState()).toBeNull()
  })

  it('应该返回当前状态的克隆', () => {
    const state = createTestState(1)
    manager.push(state)
    
    const current = manager.getCurrentState()
    
    expect(current).not.toBeNull()
    expect(current).not.toBe(state) // 应该是克隆
    expect(current?.images.length).toBe(1)
  })

  it('不应该修改内部状态', () => {
    manager.push(createTestState(1))
    
    const before = manager.undoCount
    manager.getCurrentState()
    const after = manager.undoCount
    
    expect(before).toBe(after)
  })
})

describe('HistoryManager - 获取摘要', () => {
  let manager: HistoryManager

  beforeEach(() => {
    manager = createHistoryManager()
  })

  it('应该返回完整的摘要信息', () => {
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
    
    const summary = manager.getSummary()
    
    expect(summary).toEqual({
      canUndo: true,
      canRedo: false,
      undoCount: 3,
      redoCount: 0,
      totalCount: 3
    })
  })

  it('撤销后摘要应该正确更新', () => {
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
    
    manager.undo()
    
    const summary = manager.getSummary()
    
    expect(summary).toEqual({
      canUndo: true,
      canRedo: true,
      undoCount: 2,
      redoCount: 1,
      totalCount: 3
    })
  })
})

describe('HistoryManager - 边界条件', () => {
  it('应该处理快速连续的推送', () => {
    const manager = createHistoryManager()
    
    for (let i = 0; i < 100; i++) {
      manager.push(createTestState(i))
    }
    
    expect(manager.undoCount).toBe(50) // 最大限制50
  })

  it('应该处理撤销到底', () => {
    const manager = createHistoryManager()
    
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    
    manager.undo()
    
    // 尝试继续撤销
    const result = manager.undo()
    expect(result).toBeNull()
    expect(manager.canUndo).toBe(false)
  })

  it('应该处理重做到顶', () => {
    const manager = createHistoryManager()
    
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    
    manager.undo()
    manager.redo()
    
    // 尝试继续重做
    const result = manager.redo()
    expect(result).toBeNull()
    expect(manager.canRedo).toBe(false)
  })

  it('应该处理交替的撤销和重做', () => {
    const manager = createHistoryManager()
    
    manager.push(createTestState(1))
    manager.push(createTestState(2))
    manager.push(createTestState(3))
    
    manager.undo() // 3 -> 2
    manager.redo() // 2 -> 3
    manager.undo() // 3 -> 2
    manager.undo() // 2 -> 1
    manager.redo() // 1 -> 2
    
    expect(manager.getCurrentState()?.images.length).toBe(2)
  })
})


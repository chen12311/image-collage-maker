/**
 * useKeyboard 键盘快捷键系统单元测试
 * 
 * 注意：本测试专注于测试快捷键的注册、注销和数据结构管理API。
 * DOM事件的实际触发和处理逻辑需要在Vue组件环境中测试（需要onMounted钩子），
 * 因此这些功能在E2E测试中验证。
 */

import {
  registerShortcut,
  unregisterShortcut,
  clearShortcuts,
  formatShortcut,
  SHORTCUTS
} from '@/composables/useKeyboard'

// 注：快捷键的实际注册和触发需要在Vue组件环境中测试（需要onMounted钩子）
// 这里主要测试API的调用不报错，实际功能在E2E测试中验证

describe('useKeyboard - 快捷键注册与管理', () => {
  beforeEach(() => {
    clearShortcuts()
    jest.clearAllMocks()
  })

  afterEach(() => {
    clearShortcuts()
  })

  it('应该成功注册快捷键（通过API调用不报错验证）', () => {
    const handler = jest.fn()
    
    // 不应该抛出错误
    expect(() => {
      registerShortcut({
        key: 'z',
        ctrl: true,
        handler,
        description: '撤销'
      })
    }).not.toThrow()
  })

  it('应该成功注册多个快捷键', () => {
    expect(() => {
      registerShortcut({ key: 'z', ctrl: true, handler: jest.fn(), description: '撤销' })
      registerShortcut({ key: 'y', ctrl: true, handler: jest.fn(), description: '重做' })
      registerShortcut({ key: 's', ctrl: true, handler: jest.fn(), description: '保存' })
    }).not.toThrow()
  })

  it('应该成功注销快捷键', () => {
    const handler = jest.fn()
    
    registerShortcut({
      key: 'z',
      ctrl: true,
      handler
    })
    
    // 不应该抛出错误
    expect(() => {
      unregisterShortcut('z')
    }).not.toThrow()
  })

  it('应该成功清空所有快捷键', () => {
    registerShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    registerShortcut({ key: 'y', ctrl: true, handler: jest.fn() })
    
    // 不应该抛出错误
    expect(() => {
      clearShortcuts()
    }).not.toThrow()
  })

  it('注销不存在的快捷键不应报错', () => {
    expect(() => {
      unregisterShortcut('non-existent-key')
    }).not.toThrow()
  })

  it('应该支持各种修饰键配置', () => {
    expect(() => {
      registerShortcut({ key: 's', ctrl: true, handler: jest.fn() })
      registerShortcut({ key: 'z', ctrl: true, shift: true, handler: jest.fn() })
      registerShortcut({ key: 'f', alt: true, handler: jest.fn() })
      registerShortcut({ key: 'a', ctrl: true, shift: true, alt: true, handler: jest.fn() })
    }).not.toThrow()
  })

  it('应该支持preventDefault配置', () => {
    expect(() => {
      registerShortcut({ key: 's', ctrl: true, handler: jest.fn(), preventDefault: true })
      registerShortcut({ key: 'a', handler: jest.fn(), preventDefault: false })
    }).not.toThrow()
  })

  it('应该允许相同快捷键注册多次', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()
    
    expect(() => {
      registerShortcut({ key: 'z', ctrl: true, handler: handler1 })
      registerShortcut({ key: 'z', ctrl: true, handler: handler2 })
    }).not.toThrow()
  })

  it('清空后可以重新注册快捷键', () => {
    registerShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    clearShortcuts()
    
    expect(() => {
      registerShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    }).not.toThrow()
  })

  it('注销后可以重新注册同一个快捷键', () => {
    registerShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    unregisterShortcut('z')
    
    expect(() => {
      registerShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    }).not.toThrow()
  })
})

describe('useKeyboard - 格式化快捷键显示', () => {
  it('应该正确格式化单键快捷键', () => {
    const result = formatShortcut({ key: 'a', handler: jest.fn() })
    expect(result).toBe('A')
  })

  it('应该正确格式化Ctrl组合键', () => {
    const result = formatShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    // Mac平台显示⌘，其他平台显示Ctrl
    expect(result).toMatch(/^(⌘|Ctrl) \+ Z$/)
  })

  it('应该正确格式化Shift组合键', () => {
    const result = formatShortcut({
      key: 'z',
      shift: true,
      handler: jest.fn()
    })
    expect(result).toContain('⇧')
    expect(result).toContain('Z')
  })

  it('应该正确格式化Alt组合键', () => {
    const result = formatShortcut({
      key: 'f',
      alt: true,
      handler: jest.fn()
    })
    expect(result).toMatch(/⌥|Alt/)
    expect(result).toContain('F')
  })

  it('应该正确格式化多修饰键组合', () => {
    const result = formatShortcut({
      key: 'z',
      ctrl: true,
      shift: true,
      handler: jest.fn()
    })
    expect(result).toMatch(/\+ ⇧ \+ Z$/)
  })

  it('应该正确格式化包含所有修饰键的组合', () => {
    const result = formatShortcut({
      key: 'a',
      ctrl: true,
      shift: true,
      alt: true,
      handler: jest.fn()
    })
    
    // 应该包含所有修饰键符号
    expect(result).toContain('⇧')
    expect(result).toMatch(/⌘|Ctrl/)
    expect(result).toMatch(/⌥|Alt/)
    expect(result).toContain('A')
  })

  it('应该将键转换为大写', () => {
    const result1 = formatShortcut({ key: 'a', handler: jest.fn() })
    const result2 = formatShortcut({ key: 'z', ctrl: true, handler: jest.fn() })
    
    expect(result1).toBe('A')
    expect(result2).toContain('Z')
  })

  it('应该正确格式化特殊键名', () => {
    const result = formatShortcut({ key: 'Delete', handler: jest.fn() })
    expect(result).toBe('DELETE')
  })
})

describe('useKeyboard - 预定义快捷键常量', () => {
  it('SHORTCUTS常量应该包含所有预定义快捷键', () => {
    expect(SHORTCUTS.UNDO).toEqual({ key: 'z', ctrl: true, description: '撤销' })
    expect(SHORTCUTS.REDO).toEqual({ key: 'y', ctrl: true, description: '重做' })
    expect(SHORTCUTS.SAVE).toEqual({ key: 's', ctrl: true, description: '导出图片' })
    expect(SHORTCUTS.DELETE).toEqual({ key: 'Delete', description: '删除选中' })
  })

  it('SHORTCUTS应该包含布局切换快捷键', () => {
    expect(SHORTCUTS.LAYOUT_1).toEqual({ key: '1', description: '切换到布局1' })
    expect(SHORTCUTS.LAYOUT_2).toEqual({ key: '2', description: '切换到布局2' })
    expect(SHORTCUTS.LAYOUT_3).toEqual({ key: '3', description: '切换到布局3' })
    expect(SHORTCUTS.LAYOUT_4).toEqual({ key: '4', description: '切换到布局4' })
  })

  it('SHORTCUTS应该包含切换侧边栏快捷键', () => {
    expect(SHORTCUTS.TOGGLE_SIDEBAR).toEqual({ key: ' ', description: '切换侧边栏' })
  })

  it('SHORTCUTS应该包含帮助快捷键', () => {
    expect(SHORTCUTS.HELP).toEqual({ key: '?', description: '显示快捷键帮助' })
  })

  it('所有SHORTCUTS应该包含description', () => {
    const shortcuts = Object.values(SHORTCUTS)
    shortcuts.forEach(shortcut => {
      expect(shortcut).toHaveProperty('description')
      expect(typeof shortcut.description).toBe('string')
      expect(shortcut.description.length).toBeGreaterThan(0)
    })
  })

  it('所有SHORTCUTS应该包含key', () => {
    const shortcuts = Object.values(SHORTCUTS)
    shortcuts.forEach(shortcut => {
      expect(shortcut).toHaveProperty('key')
      expect(typeof shortcut.key).toBe('string')
      expect(shortcut.key.length).toBeGreaterThan(0)
    })
  })
})

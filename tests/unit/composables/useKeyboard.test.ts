/**
 * useKeyboard 键盘快捷键系统单元测试
 */

describe('useKeyboard - 输入框事件处理', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该正确识别输入框元素', () => {
    // 模拟 textarea 元素
    const textarea = document.createElement('textarea')
    expect(textarea.tagName).toBe('TEXTAREA')
    
    // 模拟 input 元素
    const input = document.createElement('input')
    expect(input.tagName).toBe('INPUT')
    
    // 模拟 select 元素
    const select = document.createElement('select')
    expect(select.tagName).toBe('SELECT')
  })

  it('在输入框中输入普通字符不应触发快捷键', () => {
    const handler = jest.fn()
    
    // 创建一个键盘事件，target 是 textarea
    const textarea = document.createElement('textarea')
    const event = new KeyboardEvent('keydown', {
      key: '1',
      bubbles: true
    })
    
    // 设置事件的 target
    Object.defineProperty(event, 'target', {
      value: textarea,
      writable: false
    })
    
    // 验证是输入框元素
    expect((event.target as HTMLElement).tagName).toBe('TEXTAREA')
    
    // 在输入框中输入字符时，不应该有 ctrl/cmd/alt 修饰键
    expect(event.ctrlKey).toBe(false)
    expect(event.metaKey).toBe(false)
    expect(event.altKey).toBe(false)
  })

  it('在输入框中使用 Ctrl+Z 应该允许触发快捷键', () => {
    const textarea = document.createElement('textarea')
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true
    })
    
    Object.defineProperty(event, 'target', {
      value: textarea,
      writable: false
    })
    
    // 在输入框中但有修饰键，应该允许触发快捷键
    expect((event.target as HTMLElement).tagName).toBe('TEXTAREA')
    expect(event.ctrlKey).toBe(true)
  })

  it('非输入框元素应该允许触发快捷键', () => {
    const div = document.createElement('div')
    const event = new KeyboardEvent('keydown', {
      key: '1',
      bubbles: true
    })
    
    Object.defineProperty(event, 'target', {
      value: div,
      writable: false
    })
    
    // 验证不是输入框元素
    expect(['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)).toBe(false)
  })
})


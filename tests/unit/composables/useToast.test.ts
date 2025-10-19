/**
 * useToast 通知系统单元测试
 */

import {
  showToast,
  removeToast,
  clearToasts,
  toast,
  useToast
} from '@/composables/useToast'

describe('useToast - 基础功能', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('应该正确显示toast', () => {
    const { toasts } = useToast()
    
    showToast('测试消息')
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('测试消息')
    expect(toasts[0].visible).toBe(true)
  })

  it('应该支持字符串参数', () => {
    const { toasts } = useToast()
    
    showToast('简单消息')
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('简单消息')
    expect(toasts[0].type).toBe('info')
  })

  it('应该支持对象参数', () => {
    const { toasts } = useToast()
    
    showToast({
      message: '成功消息',
      type: 'success',
      duration: 5000
    })
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('成功消息')
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].duration).toBe(5000)
  })

  it('应该生成唯一ID', () => {
    const { toasts } = useToast()
    
    showToast('消息1')
    showToast('消息2')
    
    expect(toasts.length).toBe(2)
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })

  it('应该支持自定义ID', () => {
    const { toasts } = useToast()
    
    showToast({
      message: '自定义ID',
      id: 'custom-id'
    })
    
    expect(toasts[0].id).toBe('custom-id')
  })
})

describe('useToast - Toast类型', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('应该支持success类型', () => {
    const { toasts } = useToast()
    
    toast.success('成功')
    
    expect(toasts[0].type).toBe('success')
  })

  it('应该支持error类型', () => {
    const { toasts } = useToast()
    
    toast.error('错误')
    
    expect(toasts[0].type).toBe('error')
  })

  it('应该支持warning类型', () => {
    const { toasts } = useToast()
    
    toast.warning('警告')
    
    expect(toasts[0].type).toBe('warning')
  })

  it('应该支持info类型', () => {
    const { toasts } = useToast()
    
    toast.info('信息')
    
    expect(toasts[0].type).toBe('info')
  })
})

describe('useToast - 自动关闭', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('应该在指定时间后自动关闭', () => {
    const { toasts } = useToast()
    
    showToast({
      message: '自动关闭',
      duration: 3000
    })
    
    expect(toasts.length).toBe(1)
    
    // 3秒后应该开始关闭
    jest.advanceTimersByTime(3000)
    
    expect(toasts[0].visible).toBe(false)
    
    // 再等待300ms动画结束后应该被移除
    jest.advanceTimersByTime(300)
    
    expect(toasts.length).toBe(0)
  })

  it('默认3秒后自动关闭', () => {
    const { toasts } = useToast()
    
    showToast('默认持续时间')
    
    expect(toasts.length).toBe(1)
    
    jest.advanceTimersByTime(3000)
    expect(toasts[0].visible).toBe(false)
    
    jest.advanceTimersByTime(300)
    expect(toasts.length).toBe(0)
  })

  it('duration为0时不自动关闭', () => {
    const { toasts } = useToast()
    
    showToast({
      message: '永久显示',
      duration: 0
    })
    
    expect(toasts.length).toBe(1)
    
    // 即使等待很久也不会关闭
    jest.advanceTimersByTime(10000)
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].visible).toBe(true)
  })
})

describe('useToast - 手动关闭', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('应该能手动移除toast', () => {
    const { toasts } = useToast()
    
    const id = showToast('手动关闭')
    
    expect(toasts.length).toBe(1)
    
    removeToast(id)
    
    expect(toasts[0].visible).toBe(false)
    
    // 等待动画结束
    jest.advanceTimersByTime(300)
    
    expect(toasts.length).toBe(0)
  })

  it('移除不存在的toast不应报错', () => {
    const { toasts } = useToast()
    
    expect(() => {
      removeToast('non-existent-id')
    }).not.toThrow()
    
    expect(toasts.length).toBe(0)
  })
})

describe('useToast - 多个Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('应该支持同时显示多个toast', () => {
    const { toasts } = useToast()
    
    toast.success('消息1')
    toast.error('消息2')
    toast.warning('消息3')
    
    expect(toasts.length).toBe(3)
    expect(toasts[0].message).toBe('消息1')
    expect(toasts[1].message).toBe('消息2')
    expect(toasts[2].message).toBe('消息3')
  })

  it('应该按顺序自动关闭', () => {
    const { toasts } = useToast()
    
    showToast({ message: '消息1', duration: 1000 })
    showToast({ message: '消息2', duration: 2000 })
    showToast({ message: '消息3', duration: 3000 })
    
    expect(toasts.length).toBe(3)
    
    // 1秒后第一个开始关闭
    jest.advanceTimersByTime(1000)
    const toast1 = toasts.find(t => t.message === '消息1')
    expect(toast1?.visible).toBe(false)
    
    // 再等1秒，第二个开始关闭（从创建时算起共2秒）
    jest.advanceTimersByTime(1000)
    const toast2 = toasts.find(t => t.message === '消息2')
    expect(toast2?.visible).toBe(false)
    
    // 再等1秒，第三个开始关闭（从创建时算起共3秒）
    jest.advanceTimersByTime(1000)
    const toast3 = toasts.find(t => t.message === '消息3')
    expect(toast3?.visible).toBe(false)
  })

  it('应该能清空所有toast', () => {
    const { toasts } = useToast()
    
    toast.success('消息1')
    toast.error('消息2')
    toast.info('消息3')
    
    expect(toasts.length).toBe(3)
    
    clearToasts()
    
    expect(toasts.length).toBe(0)
  })
})

describe('useToast - 边界条件', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('应该处理空消息', () => {
    const { toasts } = useToast()
    
    showToast('')
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('')
  })

  it('应该处理超长消息', () => {
    const { toasts } = useToast()
    
    const longMessage = 'a'.repeat(1000)
    showToast(longMessage)
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe(longMessage)
  })

  it('应该处理特殊字符', () => {
    const { toasts } = useToast()
    
    const specialMessage = '<script>alert("xss")</script>'
    showToast(specialMessage)
    
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe(specialMessage)
  })
})

describe('useToast - 快捷方法自定义持续时间', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    jest.useRealTimers()
    clearToasts()
  })

  it('快捷方法应该支持自定义持续时间', () => {
    const { toasts } = useToast()
    
    toast.success('成功', 5000)
    
    expect(toasts[0].duration).toBe(5000)
  })

  it('快捷方法应该支持永久显示', () => {
    const { toasts } = useToast()
    
    toast.error('错误', 0)
    
    expect(toasts[0].duration).toBe(0)
    
    // 即使等待很久也不会关闭
    jest.advanceTimersByTime(10000)
    expect(toasts[0].visible).toBe(true)
  })
})


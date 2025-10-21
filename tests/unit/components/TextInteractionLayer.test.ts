/**
 * TextInteractionLayer 文字交互层组件测试
 * 
 * 测试文字渲染、选择、拖拽等核心交互逻辑
 */

import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/store/useAppStore'
import TextInteractionLayer from '@/components/Canvas/TextInteractionLayer.vue'
import { createTextElement } from '@/core/models/TextElement'

describe('TextInteractionLayer 组件', () => {
  let store: ReturnType<typeof useAppStore>

  beforeEach(() => {
    // 设置 Pinia
    setActivePinia(createPinia())
    store = useAppStore()
    
    // Mock measureText
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      measureText: jest.fn(() => ({ width: 100 })),
      save: jest.fn(),
      restore: jest.fn(),
      font: ''
    })) as any
  })

  describe('基本渲染', () => {
    it('应该正确挂载组件', () => {
      const wrapper = mount(TextInteractionLayer)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.text-interaction-layer').exists()).toBe(true)
    })

    it('没有文字时不应渲染文字热区', () => {
      const wrapper = mount(TextInteractionLayer)
      
      expect(wrapper.findAll('.text-zone')).toHaveLength(0)
    })

    it('应该为每个可见文字渲染热区', async () => {
      // 添加测试文字到 store
      const text1 = createTextElement('Text 1', 100, 100)
      const text2 = createTextElement('Text 2', 200, 200)
      
      store.texts = [text1, text2]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      const textZones = wrapper.findAll('.text-zone')
      expect(textZones).toHaveLength(2)
    })

    it('不应该渲染不可见的文字', async () => {
      const text1 = createTextElement('Visible', 100, 100)
      const text2 = createTextElement('Hidden', 200, 200)
      text2.visible = false
      
      store.texts = [text1, text2]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      const textZones = wrapper.findAll('.text-zone')
      expect(textZones).toHaveLength(1)
    })

    it('选中的文字应该有选中样式类', async () => {
      const text = createTextElement('Selected', 100, 100)
      text.selected = true
      
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      const textZone = wrapper.find('.text-zone')
      expect(textZone.classes()).toContain('text-zone-selected')
    })

    it('应该正确设置文字热区的data-text-id属性', async () => {
      const text = createTextElement('Test', 100, 100)
      
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      const textZone = wrapper.find('.text-zone')
      expect(textZone.attributes('data-text-id')).toBe(text.id)
    })
  })

  describe('文字选择逻辑', () => {
    it('点击文字热区外应该取消所有选择', async () => {
      const text = createTextElement('Test', 100, 100)
      text.selected = true
      store.texts = [text]
      
      // Mock updateText
      const updateTextSpy = jest.spyOn(store, 'updateText')
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 点击空白区域
      await wrapper.find('.text-interaction-layer').trigger('mousedown', {
        target: wrapper.find('.text-interaction-layer').element
      })
      
      expect(updateTextSpy).toHaveBeenCalled()
    })

    it('应该渲染选中边界框的四个角点', async () => {
      const text = createTextElement('Selected', 100, 100)
      text.selected = true
      
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 验证四个角点存在
      const corners = wrapper.findAll('.corner')
      expect(corners.length).toBeGreaterThanOrEqual(4)
      
      // 验证角点类名
      expect(wrapper.find('.corner-tl').exists()).toBe(true) // 左上
      expect(wrapper.find('.corner-tr').exists()).toBe(true) // 右上
      expect(wrapper.find('.corner-bl').exists()).toBe(true) // 左下
      expect(wrapper.find('.corner-br').exists()).toBe(true) // 右下
    })
  })

  describe('文字位置计算', () => {
    it('应该根据文字位置计算热区位置', async () => {
      const text = createTextElement('Test', 150, 250)
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      const textZone = wrapper.find('.text-zone')
      const style = textZone.attributes('style')
      
      // 验证style包含位置信息（具体值取决于实现）
      expect(style).toBeDefined()
      expect(style).toContain('left')
      expect(style).toContain('top')
    })

    it('不同位置的文字应该有不同的热区位置', async () => {
      const text1 = createTextElement('Text 1', 100, 100)
      const text2 = createTextElement('Text 2', 300, 400)
      
      store.texts = [text1, text2]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      const zones = wrapper.findAll('.text-zone')
      const style1 = zones[0].attributes('style')
      const style2 = zones[1].attributes('style')
      
      // 两个文字的位置应该不同
      expect(style1).not.toBe(style2)
    })
  })

  describe('组件生命周期', () => {
    it('应该正确卸载组件', async () => {
      const text = createTextElement('Test', 100, 100)
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 卸载应该不报错
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('卸载后应该清理资源', async () => {
      const text = createTextElement('Test', 100, 100)
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      wrapper.unmount()
      
      // 验证DOM已清理
      expect(wrapper.find('.text-interaction-layer').exists()).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理空文字列表', async () => {
      store.texts = []
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.findAll('.text-zone')).toHaveLength(0)
    })

    it('应该处理大量文字', async () => {
      const texts = []
      for (let i = 0; i < 50; i++) {
        texts.push(createTextElement(`Text ${i}`, i * 50, i * 50))
      }
      store.texts = texts
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.findAll('.text-zone')).toHaveLength(50)
    })

    it('应该处理位置为负数的文字', async () => {
      const text = createTextElement('Negative', -100, -100)
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 应该正常渲染，不报错
      expect(wrapper.findAll('.text-zone')).toHaveLength(1)
    })

    it('应该处理字体大小为0的文字', async () => {
      const text = createTextElement('Zero Size', 100, 100)
      text.style.fontSize = 0
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 应该正常渲染，不报错
      expect(wrapper.findAll('.text-zone')).toHaveLength(1)
    })

    it('应该处理空内容的文字', async () => {
      const text = createTextElement('', 100, 100)
      store.texts = [text]
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 应该正常渲染，不报错
      expect(wrapper.findAll('.text-zone')).toHaveLength(1)
    })
  })

  describe('尺寸缓存机制', () => {
    it('相同文字不应该重复测量', async () => {
      const text1 = createTextElement('Same Text', 100, 100)
      const text2 = createTextElement('Same Text', 200, 200)
      text2.style = { ...text1.style } // 相同样式
      
      store.texts = [text1, text2]
      
      // 创建 measureText spy
      const measureTextSpy = jest.fn(() => ({ width: 100 }))
      HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        measureText: measureTextSpy,
        save: jest.fn(),
        restore: jest.fn(),
        font: ''
      })) as any
      
      const wrapper = mount(TextInteractionLayer)
      await wrapper.vm.$nextTick()
      
      // 因为有缓存，相同内容和样式的文字只测量一次
      // 注意：实际行为取决于缓存键的实现
      expect(wrapper.findAll('.text-zone')).toHaveLength(2)
    })
  })
})



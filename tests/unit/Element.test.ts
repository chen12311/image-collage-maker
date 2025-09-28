/**
 * Element统一模型测试
 * 
 * 测试重点：统一接口、不可变更新、类型安全
 */

import { 
  ElementBuilder, 
  ElementUtils, 
  ElementPresets,
  type ImageContent,
  type TextContent,
  type Element
} from '@/core/models/Element'
import { TransformBuilder } from '@/core/models/Transform'

// 测试辅助工具
function createMockImageContent(): ImageContent {
  return {
    file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    imageData: new ImageData(100, 100),
    thumbnail: new ImageData(50, 50),
    originalSize: { width: 100, height: 100 },
    fileSize: 1024,
    mimeType: 'image/jpeg'
  }
}

function createMockTextContent(): TextContent {
  return {
    text: '测试文字',
    fontFamily: 'Arial',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'normal',
    lineHeight: 1.5
  }
}

describe('Element统一模型', () => {
  describe('元素创建', () => {
    test('创建图片元素', () => {
      const imageContent = createMockImageContent()
      const transform = TransformBuilder.create(1, 1, 2, 2)
      
      const element = ElementBuilder.createImage('img1', imageContent, transform)
      
      expect(element.id).toBe('img1')
      expect(element.type).toBe('image')
      expect(element.content).toBe(imageContent)
      expect(element.transform).toBe(transform)
      expect(element.metadata.name).toContain('图片')
    })

    test('创建文字元素', () => {
      const textContent = createMockTextContent()
      const transform = TransformBuilder.create(0, 0, 1, 1)
      
      const element = ElementBuilder.createText('text1', textContent, transform)
      
      expect(element.id).toBe('text1')
      expect(element.type).toBe('text')
      expect(element.content).toBe(textContent)
      expect(element.transform).toBe(transform)
      expect(element.metadata.name).toContain('文字')
    })

    test('创建时自动设置元数据', () => {
      const before = Date.now()
      const element = ElementBuilder.createImage('test', createMockImageContent(), TransformBuilder.create())
      const after = Date.now()
      
      expect(element.metadata.createdAt).toBeGreaterThanOrEqual(before)
      expect(element.metadata.createdAt).toBeLessThanOrEqual(after)
      expect(element.metadata.updatedAt).toBe(element.metadata.createdAt)
      expect(element.metadata.locked).toBe(false)
      expect(element.metadata.tags).toEqual([])
    })
  })

  describe('不可变更新', () => {
    let originalElement: Element

    beforeEach(() => {
      originalElement = ElementBuilder.createImage(
        'test',
        createMockImageContent(),
        TransformBuilder.create(1, 1, 1, 1)
      )
    })

    test('withTransform不修改原对象', () => {
      const newTransform = TransformBuilder.create(2, 2, 2, 2)
      const updated = ElementBuilder.withTransform(originalElement, newTransform)
      
      // 原对象未变
      expect(originalElement.transform.gridX).toBe(1)
      expect(originalElement.transform.gridY).toBe(1)
      
      // 新对象正确更新
      expect(updated.transform).toBe(newTransform)
      expect(updated.id).toBe(originalElement.id)  // 其他属性保持不变
      expect(updated.content).toBe(originalElement.content)
    })

    test('withStyle更新样式并设置updatedAt', async () => {
      const originalUpdatedAt = originalElement.metadata.updatedAt
      
      // 稍等一毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const updated = ElementBuilder.withStyle(originalElement, { opacity: 0.5 })
      
      expect(updated.style.opacity).toBe(0.5)
      expect(updated.style.borderWidth).toBe(originalElement.style.borderWidth)  // 其他样式保持不变
      expect(updated.metadata.updatedAt).toBeGreaterThan(originalUpdatedAt)
    })

    test('withContent更新内容', () => {
      const newContent = createMockTextContent()
      const updated = ElementBuilder.withContent(originalElement, newContent)
      
      expect(updated.content).toBe(newContent)
      expect(updated.type).toBe(originalElement.type)  // type字段不会自动更新
    })

    test('withMetadata更新元数据', () => {
      const updated = ElementBuilder.withMetadata(originalElement, { 
        name: '新名称',
        locked: true 
      })
      
      expect(updated.metadata.name).toBe('新名称')
      expect(updated.metadata.locked).toBe(true)
      expect(updated.metadata.createdAt).toBe(originalElement.metadata.createdAt)  // 创建时间保持不变
    })

    test('clone创建副本', async () => {
      // 等待1毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const cloned = ElementBuilder.clone(originalElement, 'new-id')
      
      expect(cloned.id).toBe('new-id')
      expect(cloned.content).toBe(originalElement.content)  // 内容共享引用
      expect(cloned.transform).toBe(originalElement.transform)  // 变换共享引用
      expect(cloned.metadata.name).toContain('副本')
      expect(cloned.metadata.createdAt).toBeGreaterThanOrEqual(originalElement.metadata.createdAt)
    })
  })

  describe('类型判断和工具方法', () => {
    test('ElementUtils.isImage正确判断图片元素', () => {
      const imageElement = ElementBuilder.createImage('img', createMockImageContent(), TransformBuilder.create())
      const textElement = ElementBuilder.createText('text', createMockTextContent(), TransformBuilder.create())
      
      expect(ElementUtils.isImage(imageElement)).toBe(true)
      expect(ElementUtils.isImage(textElement)).toBe(false)
    })

    test('ElementUtils.isText正确判断文字元素', () => {
      const imageElement = ElementBuilder.createImage('img', createMockImageContent(), TransformBuilder.create())
      const textElement = ElementBuilder.createText('text', createMockTextContent(), TransformBuilder.create())
      
      expect(ElementUtils.isText(textElement)).toBe(true)
      expect(ElementUtils.isText(imageElement)).toBe(false)
    })

    test('getDisplayName返回合适的显示名称', () => {
      const imageElement = ElementBuilder.createImage('img', createMockImageContent(), TransformBuilder.create())
      const textElement = ElementBuilder.createText('text', createMockTextContent(), TransformBuilder.create())
      
      expect(ElementUtils.getDisplayName(imageElement)).toBe('test.jpg')
      expect(ElementUtils.getDisplayName(textElement)).toBe('测试文字')
    })

    test('getDisplayName截断长文字', () => {
      const longTextContent = { ...createMockTextContent(), text: '这是一段非常非常非常非常长的文字内容，应该会被截断显示' }
      const textElement = ElementBuilder.createText('text', longTextContent, TransformBuilder.create())
      
      const displayName = ElementUtils.getDisplayName(textElement)
      if (longTextContent.text.length > 20) {
        expect(displayName).toHaveLength(23)  // 20个字符 + "..."
        expect(displayName).toContain('...')
      } else {
        expect(displayName).toBe(longTextContent.text)
      }
    })

    test('estimateMemoryUsage计算内存占用', () => {
      const imageElement = ElementBuilder.createImage('img', createMockImageContent(), TransformBuilder.create())
      const textElement = ElementBuilder.createText('text', createMockTextContent(), TransformBuilder.create())
      
      const imageMemory = ElementUtils.estimateMemoryUsage(imageElement)
      const textMemory = ElementUtils.estimateMemoryUsage(textElement)
      
      // 图片内存占用 = 主图(100×100×4) + 缩略图(50×50×4) = 40000 + 10000 = 50000
      expect(imageMemory).toBe(50000)
      
      // 文字内存占用 = 字符数×2 = 4×2 = 8
      expect(textMemory).toBe(8)
    })
  })

  describe('数据验证', () => {
    test('有效元素通过验证', () => {
      const element = ElementBuilder.createImage('valid', createMockImageContent(), TransformBuilder.create())
      const result = ElementUtils.validate(element)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('无效元素验证失败', () => {
      const invalidElement = ElementBuilder.createImage('', createMockImageContent(), TransformBuilder.create())
      const result = ElementUtils.validate(invalidElement)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('元素ID不能为空')
    })

    test('图片元素缺少必要数据', () => {
      const invalidImageContent = { ...createMockImageContent(), imageData: null as any }
      const element = ElementBuilder.createImage('test', invalidImageContent, TransformBuilder.create())
      const result = ElementUtils.validate(element)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('图片元素缺少imageData')
    })

    test('文字元素内容为空', () => {
      const emptyTextContent = { ...createMockTextContent(), text: '' }
      const element = ElementBuilder.createText('test', emptyTextContent, TransformBuilder.create())
      const result = ElementUtils.validate(element)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('文字元素内容不能为空')
    })

    test('样式参数范围验证', () => {
      const element = ElementBuilder.createText('test', createMockTextContent(), TransformBuilder.create())
      const invalidStyle = ElementBuilder.withStyle(element, { 
        opacity: 1.5,  // 超出0-1范围
        borderWidth: -5  // 负数
      })
      
      const result = ElementUtils.validate(invalidStyle)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('透明度必须在0-1范围内')
      expect(result.errors).toContain('边框宽度不能为负数')
    })
  })

  describe('预设模板', () => {
    test('文字预设内容', () => {
      const titleText = ElementPresets.titleText('我的标题')
      expect(titleText.text).toBe('我的标题')
      expect(titleText.fontSize).toBe(32)
      expect(titleText.fontWeight).toBe('bold')
      
      const bodyText = ElementPresets.bodyText('正文内容')
      expect(bodyText.text).toBe('正文内容')
      expect(bodyText.fontSize).toBe(16)
      expect(bodyText.fontWeight).toBe('normal')
    })

    test('样式预设', () => {
      const highlightStyle = ElementPresets.highlightTextStyle()
      expect(highlightStyle.backgroundColor).toBe('#ffeb3b')
      expect(highlightStyle.shadow?.enabled).toBe(true)
      
      const imageStyle = ElementPresets.imageShadowStyle()
      expect(imageStyle.shadow?.enabled).toBe(true)
      expect(imageStyle.borderRadius).toBe(4)
    })
  })
})

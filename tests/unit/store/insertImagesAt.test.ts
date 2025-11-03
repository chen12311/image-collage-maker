/**
 * insertImagesAt 函数行为测试
 * 
 * 测试拖拽上传到指定位置的逻辑
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/store/useAppStore'
import type { ImageElement } from '@/core/models'

describe('insertImagesAt 函数测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * 创建测试用的图片元素
   */
  function createTestImage(id: string, fileName: string): ImageElement {
    return {
      id,
      src: `data:image/png;base64,test`,
      fileName,
      fileSize: 1024,
      timestamp: Date.now(),
      image: new Image(),
      index: 0,
      width: 100,
      height: 100,
      transform: {
        flipH: false,
        flipV: false,
        rotation: 0
      }
    }
  }

  it('场景1：空数组，拖拽到位置 0', () => {
    const store = useAppStore()
    const image1 = createTestImage('img1', 'test1.png')
    
    store.insertImagesAt(0, [image1])
    
    expect(store.images.length).toBe(1)
    expect(store.images[0]?.id).toBe('img1')
  })

  it('场景2：已有一张图片在位置 0，拖拽到位置 1', () => {
    const store = useAppStore()
    const image1 = createTestImage('img1', 'test1.png')
    const image2 = createTestImage('img2', 'test2.png')
    
    // 先添加第一张图片
    store.addImages([image1])
    expect(store.images.length).toBe(1)
    expect(store.images[0]?.id).toBe('img1')
    
    // 拖拽第二张图片到位置 1
    store.insertImagesAt(1, [image2])
    
    // 期望：数组长度为 2，位置 0 是 image1，位置 1 是 image2
    expect(store.images.length).toBe(2)
    expect(store.images[0]?.id).toBe('img1')
    expect(store.images[1]?.id).toBe('img2')
  })

  it('场景3：已有图片在位置 0，拖拽到位置 2（跳过位置 1）', () => {
    const store = useAppStore()
    const image1 = createTestImage('img1', 'test1.png')
    const image2 = createTestImage('img2', 'test2.png')
    
    // 先添加第一张图片
    store.addImages([image1])
    
    // 拖拽第二张图片到位置 2（跳过位置 1）
    store.insertImagesAt(2, [image2])
    
    // 期望：数组长度为 3，位置 0 是 image1，位置 1 是 null，位置 2 是 image2
    expect(store.images.length).toBe(3)
    expect(store.images[0]?.id).toBe('img1')
    expect(store.images[1]).toBeNull()
    expect(store.images[2]?.id).toBe('img2')
  })

  it('场景4：已有两张图片，拖拽到位置 1 应该替换而不是插入', () => {
    const store = useAppStore()
    const image1 = createTestImage('img1', 'test1.png')
    const image2 = createTestImage('img2', 'test2.png')
    const image3 = createTestImage('img3', 'test3.png')
    
    // 先添加两张图片
    store.addImages([image1, image2])
    expect(store.images.length).toBe(2)
    
    // 删除位置 1 的图片，模拟空白单元格
    store.removeImage('img2')
    expect(store.images[1]).toBeNull()
    
    // 拖拽新图片到位置 1
    store.insertImagesAt(1, [image3])
    
    // 期望：数组长度仍为 2，位置 0 是 image1，位置 1 是 image3
    expect(store.images.length).toBe(2)
    expect(store.images[0]?.id).toBe('img1')
    expect(store.images[1]?.id).toBe('img3')
  })

  it('场景5：默认布局（2个单元格），先通过侧边栏上传1张，再拖拽1张到位置1', () => {
    const store = useAppStore()
    const image1 = createTestImage('img1', 'test1.png')
    const image2 = createTestImage('img2', 'test2.png')
    
    // 设置为默认布局（2图横排）
    store.setLayoutType('grid-2x1-h')
    expect(store.layoutCellCount).toBe(2)
    
    // 通过侧边栏上传第一张图片
    store.addImages([image1])
    expect(store.images.length).toBe(1)
    
    // 拖拽第二张图片到位置 1
    store.insertImagesAt(1, [image2])
    
    // 期望：两个位置显示不同的图片
    expect(store.images.length).toBe(2)
    expect(store.images[0]?.id).toBe('img1')
    expect(store.images[1]?.id).toBe('img2')
    
    // 验证每张图片的 index 属性
    expect(store.images[0]?.index).toBe(0)
    expect(store.images[1]?.index).toBe(1)
  })
})


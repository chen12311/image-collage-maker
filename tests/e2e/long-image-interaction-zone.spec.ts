/**
 * 长图拼接模式 - interaction-zone 布局问题测试
 * 
 * 问题描述：
 * 在长图拼接模式下，上传两张以上图片时，
 * interaction-zone 的数量和尺寸与实际图片数量不匹配
 */

import { test, expect } from '@playwright/test'

test.describe('长图拼接模式 - interaction-zone 布局问题', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    // 等待应用加载完成
    await page.waitForSelector('.canvas-area', { timeout: 10000 })
  })

  test('上传3张图片后，应该显示3个 interaction-zone', async ({ page }) => {
    // 1. 点击布局选项卡（默认应该已经在这里）
    await page.getByRole('button', { name: '布局', exact: true }).click()
    await page.waitForTimeout(300)
    
    // 2. 启用长图模式 - 点击toggle按钮而不是label
    const toggleButton = page.locator('.toggle-btn').first()
    await toggleButton.click()
    await page.waitForTimeout(300)
    
    // 2. 切换到图片面板
    await page.getByRole('button', { name: '图片', exact: true }).click()
    
    // 3. 上传3张测试图片
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.locator('div').filter({ hasText: /^点击或拖拽图片到此处支持 JPG、PNG、GIF 等格式$/ }).first().click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([
      'tests/fixtures/images/test-image-100x100.png',
      'tests/fixtures/images/test-image-large.jpg',
      'tests/fixtures/images/test-image-portrait.jpg'
    ])
    
    // 4. 等待图片加载完成
    await page.waitForTimeout(500)
    
    // 5. 验证侧边栏显示3张图片
    const imageItems = await page.locator('.image-item').count()
    expect(imageItems).toBe(3)
    
    // 6. 验证画布上的 interaction-zone 数量
    const interactionZones = await page.locator('.interaction-zone').count()
    expect(interactionZones).toBe(3) // ❌ 实际只有2个，但应该是3个
    
    // 7. 验证有图片的 zone 数量
    const zonesWithImages = await page.locator('.interaction-zone.zone-has-image').count()
    expect(zonesWithImages).toBe(3) // ❌ 实际只有2个，但应该是3个
  })

  test('长图模式下画布尺寸应该根据图片数量动态调整', async ({ page }) => {
    // 1. 点击布局选项卡
    await page.getByRole('button', { name: '布局', exact: true }).click()
    await page.waitForTimeout(300)
    
    // 2. 启用长图模式（竖向）
    const toggleButton = page.locator('.toggle-btn').first()
    await toggleButton.click()
    await page.waitForTimeout(300)
    
    // 2. 切换到图片面板并上传3张图片
    await page.getByRole('button', { name: '图片', exact: true }).click()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.locator('div').filter({ hasText: /^点击或拖拽图片到此处支持 JPG、PNG、GIF 等格式$/ }).first().click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([
      'tests/fixtures/images/test-image-100x100.png',
      'tests/fixtures/images/test-image-large.jpg',
      'tests/fixtures/images/test-image-portrait.jpg'
    ])
    
    // 3. 等待图片加载
    await page.waitForTimeout(500)
    
    // 4. 检查画布尺寸
    const canvasSize = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      const interactionLayer = document.querySelector('.interaction-layer')
      return {
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        layerWidth: interactionLayer?.style.width,
        layerHeight: interactionLayer?.style.height
      }
    })
    
    // 5. 竖向长图模式下，高度应该大于宽度（因为是3张图片纵向排列）
    // ❌ 实际 canvasSize 是 800x800，但应该根据图片数量动态计算
    console.log('Canvas Size:', canvasSize)
    
    // 预期：竖向长图应该宽度固定（如1080px），高度根据图片数量计算
    // 实际：固定为 800x800，没有动态计算
  })

  test('检查 interaction-zone 的样式属性', async ({ page }) => {
    // 1. 点击布局选项卡
    await page.getByRole('button', { name: '布局', exact: true }).click()
    await page.waitForTimeout(300)
    
    // 2. 启用长图模式
    const toggleButton = page.locator('.toggle-btn').first()
    await toggleButton.click()
    await page.waitForTimeout(300)
    
    // 2. 上传3张图片
    await page.getByRole('button', { name: '图片', exact: true }).click()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.locator('div').filter({ hasText: /^点击或拖拽图片到此处支持 JPG、PNG、GIF 等格式$/ }).first().click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([
      'tests/fixtures/images/test-image-100x100.png',
      'tests/fixtures/images/test-image-large.jpg',
      'tests/fixtures/images/test-image-portrait.jpg'
    ])
    
    await page.waitForTimeout(500)
    
    // 3. 获取所有 interaction-zone 的详细信息
    const zonesInfo = await page.evaluate(() => {
      const zones = Array.from(document.querySelectorAll('.interaction-zone'))
      return zones.map((zone, index) => ({
        index,
        hasImageClass: zone.classList.contains('zone-has-image'),
        style: {
          left: (zone as HTMLElement).style.left,
          top: (zone as HTMLElement).style.top,
          width: (zone as HTMLElement).style.width,
          height: (zone as HTMLElement).style.height
        }
      }))
    })
    
    console.log('Interaction Zones Info:', JSON.stringify(zonesInfo, null, 2))
    
    // 预期：应该有3个 zone
    // 实际：只有2个 zone
    expect(zonesInfo.length).toBe(3)
  })

  test('验证长图模式下的布局配置', async ({ page }) => {
    // 1. 点击布局选项卡
    await page.getByRole('button', { name: '布局', exact: true }).click()
    await page.waitForTimeout(300)
    
    // 2. 启用长图模式
    const toggleButton = page.locator('.toggle-btn').first()
    await toggleButton.click()
    await page.waitForTimeout(300)
    
    // 2. 上传3张图片
    await page.getByRole('button', { name: '图片', exact: true }).click()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.locator('div').filter({ hasText: /^点击或拖拽图片到此处支持 JPG、PNG、GIF 等格式$/ }).first().click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles([
      'tests/fixtures/images/test-image-100x100.png',
      'tests/fixtures/images/test-image-large.jpg',
      'tests/fixtures/images/test-image-portrait.jpg'
    ])
    
    await page.waitForTimeout(500)
    
    // 3. 检查画布信息
    const debugInfo = await page.evaluate(() => {
      return {
        imagesInSidebar: document.querySelectorAll('.image-item').length,
        interactionZonesTotal: document.querySelectorAll('.interaction-zone').length,
        zonesWithImages: document.querySelectorAll('.interaction-zone.zone-has-image').length,
        canvasSize: {
          width: document.querySelector('canvas')?.width,
          height: document.querySelector('canvas')?.height
        },
        interactionLayerSize: {
          width: document.querySelector('.interaction-layer')?.style.width,
          height: document.querySelector('.interaction-layer')?.style.height
        }
      }
    })
    
    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2))
    
    // 验证问题
    expect(debugInfo.imagesInSidebar, '侧边栏应该显示3张图片').toBe(3)
    expect(debugInfo.interactionZonesTotal, '应该有3个 interaction-zone').toBe(3) // ❌ 失败
    expect(debugInfo.zonesWithImages, '应该有3个带图片的 zone').toBe(3) // ❌ 失败
  })
})


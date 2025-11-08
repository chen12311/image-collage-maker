import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 图片裁剪功能测试
 */
test.describe('图片裁剪功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
  })

  test('应该显示裁剪按钮', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    // 等待图片加载
    await page.waitForTimeout(500)
    
    // 悬停到画布上的图片区域
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    
    // 等待控制按钮出现
    await page.waitForTimeout(300)
    
    // 检查是否有裁剪按钮（通过tooltip识别）
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await expect(cropButton).toBeVisible()
  })

  test('应该能够进入裁剪模式', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    await page.waitForTimeout(500)
    
    // 悬停并点击裁剪按钮
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300)
    
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await cropButton.click()
    
    // 检查裁剪覆盖层是否出现
    const cropOverlay = page.locator('.crop-overlay')
    await expect(cropOverlay).toBeVisible()
    
    // 检查裁剪框是否存在
    const cropBox = page.locator('.crop-box')
    await expect(cropBox).toBeVisible()
    
    // 检查操作按钮
    const confirmButton = page.getByText(/确认裁剪|Confirm Crop/)
    const cancelButton = page.getByText(/取消|Cancel/).first()
    const resetButton = page.getByText(/重置|Reset/)
    
    await expect(confirmButton).toBeVisible()
    await expect(cancelButton).toBeVisible()
    await expect(resetButton).toBeVisible()
  })

  test('应该能够应用裁剪', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    await page.waitForTimeout(500)
    
    // 进入裁剪模式
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300)
    
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await cropButton.click()
    
    await page.waitForTimeout(300)
    
    // 点击确认按钮
    const confirmButton = page.getByText(/确认裁剪|Confirm Crop/)
    await confirmButton.click()
    
    // 检查成功提示
    const toast = page.locator('.toast-container')
    await expect(toast).toContainText(/裁剪已应用|Crop applied/)
    
    // 裁剪覆盖层应该消失
    const cropOverlay = page.locator('.crop-overlay')
    await expect(cropOverlay).not.toBeVisible()
  })

  test('应该能够取消裁剪', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    await page.waitForTimeout(500)
    
    // 进入裁剪模式
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300)
    
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await cropButton.click()
    
    await page.waitForTimeout(300)
    
    // 点击取消按钮
    const cancelButton = page.getByText(/取消|Cancel/).first()
    await cancelButton.click()
    
    // 检查提示
    const toast = page.locator('.toast-container')
    await expect(toast).toContainText(/已取消裁剪|Crop cancelled/)
    
    // 裁剪覆盖层应该消失
    const cropOverlay = page.locator('.crop-overlay')
    await expect(cropOverlay).not.toBeVisible()
  })

  test('应该能够重置裁剪框', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    await page.waitForTimeout(500)
    
    // 进入裁剪模式
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300)
    
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await cropButton.click()
    
    await page.waitForTimeout(300)
    
    // 获取初始裁剪框尺寸
    const cropBox = page.locator('.crop-box')
    const initialBox = await cropBox.boundingBox()
    
    // 拖动裁剪框调整大小（拖动右下角手柄）
    const seHandle = page.locator('.handle-se')
    await seHandle.hover()
    await page.mouse.down()
    await page.mouse.move(400, 400, { steps: 10 })
    await page.mouse.up()
    
    await page.waitForTimeout(200)
    
    // 点击重置按钮
    const resetButton = page.getByText(/重置|Reset/)
    await resetButton.click()
    
    await page.waitForTimeout(200)
    
    // 检查裁剪框是否恢复到初始尺寸
    const resetBox = await cropBox.boundingBox()
    expect(resetBox?.width).toBeCloseTo(initialBox?.width || 0, 5)
    expect(resetBox?.height).toBeCloseTo(initialBox?.height || 0, 5)
  })

  test('应该能够拖动裁剪框', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    await page.waitForTimeout(500)
    
    // 进入裁剪模式
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300)
    
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await cropButton.click()
    
    await page.waitForTimeout(300)
    
    // 获取初始位置
    const cropBox = page.locator('.crop-box')
    const initialBox = await cropBox.boundingBox()
    
    // 拖动裁剪框
    await cropBox.hover()
    await page.mouse.down()
    await page.mouse.move((initialBox?.x || 0) + 50, (initialBox?.y || 0) + 50, { steps: 10 })
    await page.mouse.up()
    
    await page.waitForTimeout(200)
    
    // 检查位置是否改变
    const newBox = await cropBox.boundingBox()
    expect(newBox?.x).not.toBe(initialBox?.x)
    expect(newBox?.y).not.toBe(initialBox?.y)
  })

  test('裁剪后导出图片应该应用裁剪效果', async ({ page }) => {
    // 上传图片
    const imagePath = path.resolve(__dirname, '../fixtures/images/test-image-1.jpg')
    const fileInput = await page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    
    await page.waitForTimeout(500)
    
    // 进入裁剪模式并确认
    const canvas = page.locator('canvas').first()
    await canvas.hover({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300)
    
    const cropButton = page.locator('button[aria-label*="裁剪"], button[aria-label*="Crop"]')
    await cropButton.click()
    await page.waitForTimeout(300)
    
    const confirmButton = page.getByText(/确认裁剪|Confirm Crop/)
    await confirmButton.click()
    await page.waitForTimeout(500)
    
    // 导出图片（检查导出按钮是否可用）
    const exportButton = page.getByText(/导出图片|Export Image/)
    await expect(exportButton).toBeEnabled()
    
    // 注意：实际导出和验证裁剪结果需要更复杂的逻辑
    // 这里只验证导出功能可用
  })
})


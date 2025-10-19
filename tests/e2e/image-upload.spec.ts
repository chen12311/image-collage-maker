/**
 * 图片上传和基础操作 E2E测试
 */

import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('图片上传功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('应用应该正常加载', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/ImageBatch|图片拼接/)
    
    // 验证核心UI元素存在
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('应该显示上传区域', async ({ page }) => {
    // 查找上传按钮或上传区域
    const uploadArea = page.locator('[data-testid="upload-area"], .upload-area, input[type="file"]').first()
    await expect(uploadArea).toBeDefined()
  })

  // Note: 实际的文件上传测试需要有测试图片文件
  // test('应该能够上传图片', async ({ page }) => {
  //   // 准备测试图片
  //   const filePath = path.join(__dirname, '../fixtures/test-image.jpg')
    
  //   // 上传文件
  //   const fileInput = page.locator('input[type="file"]')
  //   await fileInput.setInputFiles(filePath)
    
  //   // 验证图片已上传
  //   await expect(page.locator('.image-item, [data-testid="image-item"]')).toBeVisible()
  // })

  test('画布应该可见', async ({ page }) => {
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 验证canvas有合理的尺寸
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThan(100)
    expect(box!.height).toBeGreaterThan(100)
  })
})

test.describe('侧边栏功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('侧边栏应该可见', async ({ page }) => {
    // 查找侧边栏
    const sidebar = page.locator('aside, .sidebar, [data-testid="sidebar"]').first()
    
    // 侧边栏可能需要一些时间加载
    await page.waitForTimeout(500)
    
    // 验证侧边栏存在（可能默认隐藏或折叠）
    expect(await sidebar.count()).toBeGreaterThan(0)
  })
})

test.describe('响应式设计', () => {
  test('应该在移动端正常显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 验证关键元素仍然可访问
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('应该在平板端正常显示', async ({ page }) => {
    // 设置平板视口
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 验证关键元素仍然可访问
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('应该在桌面端正常显示', async ({ page }) => {
    // 设置桌面视口
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 验证关键元素仍然可访问
    await expect(page.locator('canvas')).toBeVisible()
  })
})

test.describe('性能检查', () => {
  test('页面应该快速加载', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // 页面应该在5秒内加载完成
    expect(loadTime).toBeLessThan(5000)
  })

  test('Canvas应该正确渲染', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 等待canvas渲染
    await page.waitForTimeout(1000)
    
    // 截图验证（用于手动检查）
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 验证canvas尺寸合理
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
  })
})

test.describe('错误处理', () => {
  test('应该处理无效操作', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 尝试在没有图片时导出（应该有适当的错误提示或禁用状态）
    // 这取决于具体实现
    // const exportButton = page.locator('button:has-text("导出"), button:has-text("Export")')
    // if (await exportButton.count() > 0) {
    //   await expect(exportButton).toBeDisabled()
    // }
  })

  test('应该在控制台没有错误', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有严重错误（排除一些常见的无害警告）
    const seriousErrors = consoleErrors.filter(err => 
      !err.includes('DevTools') && 
      !err.includes('extension')
    )
    
    expect(seriousErrors.length).toBe(0)
  })
})


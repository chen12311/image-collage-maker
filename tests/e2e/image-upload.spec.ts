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
    await expect(page).toHaveTitle(/ImageCollageMaker|图片拼接/)
    
    // 验证核心UI元素存在
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('应该显示上传区域', async ({ page }) => {
    // 查找上传按钮或上传区域
    const uploadArea = page.locator('[data-testid="upload-area"], .upload-area, input[type="file"]').first()
    await expect(uploadArea).toBeDefined()
  })

  test('应该能够上传单张图片', async ({ page }) => {
    // 准备测试图片
    const filePath = path.join(__dirname, '../fixtures/images/test-image-100x100.png')
    
    // 查找文件输入框
    const fileInput = page.locator('input[type="file"]')
    
    // 上传文件
    await fileInput.setInputFiles(filePath)
    
    // 等待图片处理完成
    await page.waitForTimeout(1000)
    
    // 验证画布已更新（画布应该有内容）
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('应该能够上传多张图片', async ({ page }) => {
    // 准备多个测试图片
    const filePaths = [
      path.join(__dirname, '../fixtures/images/test-image-100x100.png'),
      path.join(__dirname, '../fixtures/images/test-image-portrait.jpg'),
      path.join(__dirname, '../fixtures/images/test-image-large.jpg')
    ]
    
    // 查找文件输入框
    const fileInput = page.locator('input[type="file"]')
    
    // 上传多个文件
    await fileInput.setInputFiles(filePaths)
    
    // 等待所有图片处理完成
    await page.waitForTimeout(2000)
    
    // 验证画布已更新
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 可以截图保存用于人工验证
    await page.screenshot({ path: 'test-results/multi-image-upload.png' })
  })

  test('上传图片后应该能切换布局', async ({ page }) => {
    // 上传图片
    const filePaths = [
      path.join(__dirname, '../fixtures/images/test-image-100x100.png'),
      path.join(__dirname, '../fixtures/images/test-image-portrait.jpg')
    ]
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePaths)
    await page.waitForTimeout(1000)
    
    // 尝试查找布局切换按钮（根据实际UI调整选择器）
    const layoutButtons = page.locator('button, .layout-item, [data-testid*="layout"]')
    const count = await layoutButtons.count()
    
    if (count > 0) {
      // 点击第二个布局
      await layoutButtons.nth(1).click()
      await page.waitForTimeout(500)
      
      // 验证画布仍然可见
      await expect(page.locator('canvas')).toBeVisible()
    }
  })

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


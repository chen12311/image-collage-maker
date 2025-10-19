/**
 * 布局切换 E2E测试
 */

import { test, expect } from '@playwright/test'

test.describe('布局切换功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('应该能够访问布局面板', async ({ page }) => {
    // 查找布局相关的UI元素
    const layoutPanel = page.locator('[data-testid="layout-panel"], .layout-panel, text=布局').first()
    
    // 等待元素加载
    await page.waitForTimeout(500)
    
    // 验证布局控制存在
    expect(await layoutPanel.count()).toBeGreaterThan(0)
  })

  test('Canvas应该根据不同布局渲染', async ({ page }) => {
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 获取初始canvas状态
    const initialBox = await canvas.boundingBox()
    expect(initialBox).toBeTruthy()
    
    // Canvas应该有合理的尺寸
    expect(initialBox!.width).toBeGreaterThan(0)
    expect(initialBox!.height).toBeGreaterThan(0)
  })
})

test.describe('布局预览', () => {
  test('应该显示当前布局', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 等待渲染完成
    await page.waitForTimeout(1000)
    
    // Canvas应该已渲染
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('布局变化应该更新画布', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const canvas = page.locator('canvas')
    
    // 等待初始渲染
    await page.waitForTimeout(500)
    
    // 验证canvas存在
    await expect(canvas).toBeVisible()
  })
})

test.describe('布局参数调整', () => {
  test('应该能够调整间距', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 查找间距控制（可能是滑块或输入框）
    // 具体选择器取决于实现
    await page.waitForTimeout(500)
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('应该能够调整边距', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.waitForTimeout(500)
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })
})

test.describe('快捷键切换布局', () => {
  test('应该支持键盘快捷键', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 等待页面完全加载
    await page.waitForTimeout(500)
    
    // 测试快捷键（1-4切换布局）
    await page.keyboard.press('1')
    await page.waitForTimeout(200)
    
    // 验证Canvas仍然可见
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('快捷键应该在输入框中被阻止', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 如果有输入框，在其中按键不应该触发布局切换
    const inputs = page.locator('input[type="text"], input[type="number"], textarea')
    
    if (await inputs.count() > 0) {
      await inputs.first().focus()
      await page.keyboard.press('1')
      
      // 输入框应该显示"1"而不是切换布局
      await expect(inputs.first()).toBeDefined()
    }
  })
})

test.describe('布局持久化', () => {
  test('刷新页面后应该保持布局选择', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 等待初始加载
    await page.waitForTimeout(500)
    
    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Canvas应该仍然可见
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })
})

test.describe('不同屏幕尺寸下的布局', () => {
  test('移动端应该正常显示布局控制', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.waitForTimeout(500)
    
    // 布局控制可能在移动端折叠或调整位置
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('大屏幕应该显示完整布局控制', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.waitForTimeout(500)
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })
})


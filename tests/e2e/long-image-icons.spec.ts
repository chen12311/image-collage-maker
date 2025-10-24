import { test, expect } from '@playwright/test'

test.describe('长图模式图标显示测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('开启长图模式后所有按钮图标应该正确显示', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 点击布局标签（确保在布局面板）
    await page.getByRole('button', { name: '布局' }).click()

    // 开启长图模式
    const toggleButton = page.locator('.toggle-btn')
    await toggleButton.click()

    // 等待长图模式面板展开
    await page.waitForTimeout(500)

    // 验证拼接方向按钮的图标存在
    const verticalButton = page.getByRole('button', { name: '竖向' })
    await expect(verticalButton.locator('svg')).toBeVisible()
    
    const horizontalButton = page.getByRole('button', { name: '横向' })
    await expect(horizontalButton.locator('svg')).toBeVisible()

    // 验证尺寸计算按钮的图标存在
    const fixedWidthButton = page.getByRole('button', { name: '固定宽度' })
    await expect(fixedWidthButton.locator('svg')).toBeVisible()
    
    const fixedHeightButton = page.getByRole('button', { name: '固定高度' })
    await expect(fixedHeightButton.locator('svg')).toBeVisible()
    
    const autoButton = page.getByRole('button', { name: '自适应' })
    await expect(autoButton.locator('svg')).toBeVisible()
    
    const customButton = page.getByRole('button', { name: '自定义' })
    await expect(customButton.locator('svg')).toBeVisible()
  })

  test('拼接方向切换应该正常工作', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 点击布局标签
    await page.getByRole('button', { name: '布局' }).click()

    // 开启长图模式
    const toggleButton = page.locator('.toggle-btn')
    await toggleButton.click()
    await page.waitForTimeout(500)

    // 默认应该是竖向
    const verticalButton = page.getByRole('button', { name: '竖向' })
    await expect(verticalButton).toHaveClass(/active/)

    // 切换到横向
    const horizontalButton = page.getByRole('button', { name: '横向' })
    await horizontalButton.click()
    await expect(horizontalButton).toHaveClass(/active/)
    await expect(verticalButton).not.toHaveClass(/active/)

    // 切换回竖向
    await verticalButton.click()
    await expect(verticalButton).toHaveClass(/active/)
    await expect(horizontalButton).not.toHaveClass(/active/)
  })

  test('尺寸计算模式切换应该正常工作', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 点击布局标签
    await page.getByRole('button', { name: '布局' }).click()

    // 开启长图模式
    const toggleButton = page.locator('.toggle-btn')
    await toggleButton.click()
    await page.waitForTimeout(500)

    // 默认应该是固定宽度
    const fixedWidthButton = page.getByRole('button', { name: '固定宽度' })
    await expect(fixedWidthButton).toHaveClass(/active/)

    // 切换到固定高度
    const fixedHeightButton = page.getByRole('button', { name: '固定高度' })
    await fixedHeightButton.click()
    await expect(fixedHeightButton).toHaveClass(/active/)

    // 切换到自适应
    const autoButton = page.getByRole('button', { name: '自适应' })
    await autoButton.click()
    await expect(autoButton).toHaveClass(/active/)

    // 切换到自定义
    const customButton = page.getByRole('button', { name: '自定义' })
    await customButton.click()
    await expect(customButton).toHaveClass(/active/)
  })

  test('所有图标应该使用正确的 SVG 路径', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 点击布局标签
    await page.getByRole('button', { name: '布局' }).click()

    // 开启长图模式
    const toggleButton = page.locator('.toggle-btn')
    await toggleButton.click()
    await page.waitForTimeout(500)

    // 验证竖向按钮的 arrow-down 图标（应该有向下的箭头）
    const verticalSvg = page.getByRole('button', { name: '竖向' }).locator('svg')
    const verticalPolyline = verticalSvg.locator('polyline')
    await expect(verticalPolyline).toBeVisible()

    // 验证横向按钮的 arrow-right 图标（应该有向右的箭头）
    const horizontalSvg = page.getByRole('button', { name: '横向' }).locator('svg')
    const horizontalPolyline = horizontalSvg.locator('polyline')
    await expect(horizontalPolyline).toBeVisible()

    // 验证所有按钮都有 SVG 图标
    const buttons = [
      '固定宽度',
      '固定高度',
      '自适应',
      '自定义'
    ]

    for (const buttonName of buttons) {
      const button = page.getByRole('button', { name: buttonName })
      const svg = button.locator('svg')
      await expect(svg).toBeVisible()
      
      // 验证 SVG 有内容（有子元素）
      const hasContent = await svg.locator('*').count() > 0
      expect(hasContent).toBe(true)
    }
  })
})


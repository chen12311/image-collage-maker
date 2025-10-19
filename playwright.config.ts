/**
 * Playwright E2E测试配置
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 每个测试的超时时间（30秒）
  timeout: 30 * 1000,
  
  // 测试全局配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter配置
  reporter: [
    ['html'],
    ['list']
  ],
  
  // 共享配置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',
    
    // 追踪配置
    trace: 'on-first-retry',
    
    // 截图配置
    screenshot: 'only-on-failure',
    
    // 视频配置
    video: 'retain-on-failure'
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    // 如果需要可以取消注释以下浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] }
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] }
    // },

    // 移动端测试
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] }
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] }
    // }
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})


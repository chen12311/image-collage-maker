/**
 * 字体检测工具
 * 
 * 通过 Canvas 测量文字宽度判断字体是否在系统中可用
 */

/** 测试用文本（包含中英文） */
const TEST_TEXT = 'mmmmmmmmmmlli测试字体'

/** 基准字体（必定存在） */
const BASE_FONTS = ['monospace', 'sans-serif', 'serif']

/** 
 * 检测字体是否可用
 * 
 * 原理：如果指定字体不存在，浏览器会使用降级字体渲染
 * 通过对比渲染宽度判断字体是否真实存在
 */
export function isFontAvailable(fontFamily: string): boolean {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  
  // 测量基准字体的宽度
  const baseWidths = BASE_FONTS.map(baseFont => {
    ctx.font = `72px ${baseFont}`
    return ctx.measureText(TEST_TEXT).width
  })
  
  // 测量目标字体 + 基准字体的宽度
  const testWidths = BASE_FONTS.map(baseFont => {
    ctx.font = `72px "${fontFamily}", ${baseFont}`
    return ctx.measureText(TEST_TEXT).width
  })
  
  // 如果任何一个测量宽度与基准不同，说明字体存在
  return testWidths.some((width, index) => width !== baseWidths[index])
}

/**
 * 批量检测字体可用性
 */
export function checkFontsAvailability(fonts: string[]): Map<string, boolean> {
  const result = new Map<string, boolean>()
  
  fonts.forEach(font => {
    // 提取字体名称（去除 fallback）
    const primaryFont = font.split(',')[0].trim().replace(/['"]/g, '')
    result.set(font, isFontAvailable(primaryFont))
  })
  
  return result
}


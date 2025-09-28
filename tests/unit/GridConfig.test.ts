/**
 * GridConfig核心算法测试
 * 
 * Linus测试哲学：测试核心算法，不追求覆盖率
 * 专注验证最重要的数学函数和边界情况
 */

import { GridConfigBuilder, detectLayoutMode } from '@/core/models/GridConfig'

describe('GridConfig核心算法', () => {
  describe('布局模式自动检测', () => {
    test('横向布局检测 (1×N)', () => {
      const config = GridConfigBuilder.horizontal(5)
      expect(config.rows).toBe(1)
      expect(config.cols).toBe(5)
      expect(detectLayoutMode(config)).toBe('horizontal')
    })

    test('纵向布局检测 (N×1)', () => {
      const config = GridConfigBuilder.vertical(4)
      expect(config.rows).toBe(4)
      expect(config.cols).toBe(1)
      expect(detectLayoutMode(config)).toBe('vertical')
    })

    test('网格布局检测 (M×N)', () => {
      const config = GridConfigBuilder.grid(3, 3)
      expect(config.rows).toBe(3)
      expect(config.cols).toBe(3)
      expect(detectLayoutMode(config)).toBe('grid')
    })
  })

  describe('自动布局算法', () => {
    test('1张图片 -> 1×1网格', () => {
      const config = GridConfigBuilder.autoLayout(1)
      expect(config.rows).toBe(1)
      expect(config.cols).toBe(1)
    })

    test('2-3张图片 -> 横向布局', () => {
      const config2 = GridConfigBuilder.autoLayout(2)
      expect(config2.rows).toBe(1)
      expect(config2.cols).toBe(2)

      const config3 = GridConfigBuilder.autoLayout(3)
      expect(config3.rows).toBe(1)
      expect(config3.cols).toBe(3)
    })

    test('4-6张图片 -> 2行布局', () => {
      const config4 = GridConfigBuilder.autoLayout(4)
      expect(config4.rows).toBe(2)
      expect(config4.cols).toBe(2)

      const config6 = GridConfigBuilder.autoLayout(6)
      expect(config6.rows).toBe(2)
      expect(config6.cols).toBe(3)
    })

    test('9张图片 -> 3×3网格（接近正方形）', () => {
      const config = GridConfigBuilder.autoLayout(9)
      expect(config.rows).toBe(3)
      expect(config.cols).toBe(3)
    })

    test('10张图片 -> 合理的矩形网格', () => {
      const config = GridConfigBuilder.autoLayout(10)
      // 应该是3行4列或4行3列，优先列数多的
      expect(config.rows * config.cols).toBeGreaterThanOrEqual(10)
      expect(Math.abs(config.rows - config.cols)).toBeLessThanOrEqual(1) // 接近正方形
    })
  })

  describe('边界情况处理', () => {
    test('图片数量为0时抛出错误', () => {
      expect(() => GridConfigBuilder.autoLayout(0)).toThrow('图片数量必须大于0')
    })

    test('负数图片数量抛出错误', () => {
      expect(() => GridConfigBuilder.autoLayout(-1)).toThrow('图片数量必须大于0')
    })

    test('参数验证 - 有效配置', () => {
      const config = GridConfigBuilder.grid(2, 3, 100, 100, 10)
      const result = GridConfigBuilder.validate(config)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('参数验证 - 无效配置', () => {
      const invalidConfig = {
        rows: -1,
        cols: 0,
        cellWidth: -100,
        cellHeight: 0,
        spacing: -5
      }
      
      const result = GridConfigBuilder.validate(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('网格行数必须大于0')
      expect(result.errors).toContain('网格列数必须大于0')
      expect(result.errors).toContain('单元格宽度必须大于0')
      expect(result.errors).toContain('单元格高度必须大于0')
      expect(result.errors).toContain('间距不能为负数')
    })
  })

  describe('工厂方法参数传递', () => {
    test('横向布局自定义参数', () => {
      const config = GridConfigBuilder.horizontal(3, 150, 200, 15)
      
      expect(config.rows).toBe(1)
      expect(config.cols).toBe(3)
      expect(config.cellWidth).toBe(150)
      expect(config.cellHeight).toBe(200)
      expect(config.spacing).toBe(15)
    })

    test('纵向布局默认参数', () => {
      const config = GridConfigBuilder.vertical(4)
      
      expect(config.cellWidth).toBe(200)  // 默认值
      expect(config.cellHeight).toBe(200) // 默认值
      expect(config.spacing).toBe(10)     // 默认值
    })

    test('网格布局混合参数', () => {
      const config = GridConfigBuilder.grid(2, 3, 120)
      
      expect(config.cellWidth).toBe(120)
      expect(config.cellHeight).toBe(200)  // 默认值
      expect(config.spacing).toBe(10)      // 默认值
    })
  })
})

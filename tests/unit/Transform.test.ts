/**
 * Transform核心算法测试
 * 
 * 测试重点：不可变更新、坐标变换、数据验证
 */

import { TransformBuilder, TransformPresets } from '@/core/models/Transform'

describe('Transform核心算法', () => {
  describe('不可变更新方法', () => {
    test('withPosition不修改原对象', () => {
      const original = TransformBuilder.create(1, 1, 2, 2)
      const updated = TransformBuilder.withPosition(original, 3, 4)
      
      // 原对象未变
      expect(original.gridX).toBe(1)
      expect(original.gridY).toBe(1)
      
      // 新对象正确更新
      expect(updated.gridX).toBe(3)
      expect(updated.gridY).toBe(4)
      expect(updated.gridWidth).toBe(2)  // 其他属性保持不变
      expect(updated.gridHeight).toBe(2)
    })

    test('withSize正确更新尺寸', () => {
      const original = TransformBuilder.create(0, 0, 1, 1)
      const updated = TransformBuilder.withSize(original, 3, 2)
      
      expect(updated.gridWidth).toBe(3)
      expect(updated.gridHeight).toBe(2)
      expect(updated.gridX).toBe(0)  // 位置保持不变
      expect(updated.gridY).toBe(0)
    })

    test('withRotation规范化角度', () => {
      const transform = TransformBuilder.create()
      
      // 正常角度
      const r1 = TransformBuilder.withRotation(transform, Math.PI / 2)
      expect(r1.rotation).toBeCloseTo(Math.PI / 2)
      
      // 超过2π的角度应该规范化
      const r2 = TransformBuilder.withRotation(transform, 3 * Math.PI)
      expect(r2.rotation).toBeCloseTo(Math.PI)
      
      // 负角度应该转换为正角度
      const r3 = TransformBuilder.withRotation(transform, -Math.PI / 2)
      expect(r3.rotation).toBeCloseTo(3 * Math.PI / 2)
    })
  })

  describe('变换操作', () => {
    test('translate平移操作', () => {
      const transform = TransformBuilder.create(2, 3, 1, 1)
      const translated = TransformBuilder.translate(transform, 1, -1)
      
      expect(translated.gridX).toBe(3)  // 2 + 1
      expect(translated.gridY).toBe(2)  // 3 + (-1)
    })

    test('scale缩放操作', () => {
      const transform = TransformBuilder.create(0, 0, 4, 2)
      const scaled = TransformBuilder.scale(transform, 0.5, 2)
      
      expect(scaled.gridWidth).toBe(2)  // 4 * 0.5 = 2
      expect(scaled.gridHeight).toBe(4) // 2 * 2 = 4
    })

    test('scale保证最小尺寸为1', () => {
      const transform = TransformBuilder.create(0, 0, 2, 2)
      const scaled = TransformBuilder.scale(transform, 0.1, 0.1)
      
      // 缩放结果不能小于1
      expect(scaled.gridWidth).toBe(1)
      expect(scaled.gridHeight).toBe(1)
    })

    test('rotate90顺时针旋转', () => {
      const transform = TransformBuilder.create(0, 0, 1, 1, 0)
      
      const rotated1 = TransformBuilder.rotate90(transform)
      expect(rotated1.rotation).toBeCloseTo(Math.PI / 2)
      
      const rotated2 = TransformBuilder.rotate90(rotated1)
      expect(rotated2.rotation).toBeCloseTo(Math.PI)
      
      const rotated3 = TransformBuilder.rotate90(rotated2)
      expect(rotated3.rotation).toBeCloseTo(3 * Math.PI / 2)
      
      const rotated4 = TransformBuilder.rotate90(rotated3)
      expect(rotated4.rotation).toBeCloseTo(0)  // 一圈回到原点
    })

    test('reset重置到原点', () => {
      const transform = TransformBuilder.create(5, 3, 2, 2, Math.PI, 10)
      const reset = TransformBuilder.reset(transform)
      
      expect(reset.gridX).toBe(0)
      expect(reset.gridY).toBe(0)
      expect(reset.rotation).toBe(0)
      expect(reset.gridWidth).toBe(2)  // 尺寸保持不变
      expect(reset.gridHeight).toBe(2)
      expect(reset.zIndex).toBe(10)    // zIndex保持不变
    })
  })

  describe('数据验证', () => {
    test('有效Transform通过验证', () => {
      const validTransform = TransformBuilder.create(0, 0, 1, 1, Math.PI, 0)
      const result = TransformBuilder.validate(validTransform)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('无效Transform验证失败', () => {
      const invalidTransform = {
        gridX: -1,
        gridY: -2,
        gridWidth: 0,
        gridHeight: -1,
        rotation: -0.5,
        zIndex: 0
      }
      
      const result = TransformBuilder.validate(invalidTransform)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('网格X坐标不能为负数')
      expect(result.errors).toContain('网格Y坐标不能为负数')
      expect(result.errors).toContain('网格宽度必须大于0')
      expect(result.errors).toContain('网格高度必须大于0')
      expect(result.errors).toContain('旋转角度必须在0-2π范围内')
    })

    test('边界值验证', () => {
      // 测试边界值
      const boundaryTransform = {
        gridX: 0,
        gridY: 0,
        gridWidth: 1,
        gridHeight: 1,
        rotation: 0,
        zIndex: 0
      }
      
      const result = TransformBuilder.validate(boundaryTransform)
      expect(result.isValid).toBe(true)
      
      // 测试最大边界
      const maxTransform = {
        gridX: 1000,
        gridY: 1000,
        gridWidth: 100,
        gridHeight: 100,
        rotation: 2 * Math.PI - 0.001,
        zIndex: 999
      }
      
      const maxResult = TransformBuilder.validate(maxTransform)
      expect(maxResult.isValid).toBe(true)
    })
  })

  describe('预设Transform', () => {
    test('origin预设', () => {
      const origin = TransformPresets.origin()
      expect(origin.gridX).toBe(0)
      expect(origin.gridY).toBe(0)
      expect(origin.gridWidth).toBe(1)
      expect(origin.gridHeight).toBe(1)
    })

    test('尺寸预设', () => {
      const wide = TransformPresets.wide()
      expect(wide.gridWidth).toBe(2)
      expect(wide.gridHeight).toBe(1)
      
      const tall = TransformPresets.tall()
      expect(tall.gridWidth).toBe(1)
      expect(tall.gridHeight).toBe(2)
      
      const large = TransformPresets.large()
      expect(large.gridWidth).toBe(2)
      expect(large.gridHeight).toBe(2)
    })

    test('旋转预设', () => {
      const r90 = TransformPresets.rotated90()
      expect(r90.rotation).toBeCloseTo(Math.PI / 2)
      
      const r180 = TransformPresets.rotated180()
      expect(r180.rotation).toBeCloseTo(Math.PI)
      
      const r270 = TransformPresets.rotated270()
      expect(r270.rotation).toBeCloseTo(3 * Math.PI / 2)
    })
  })
})

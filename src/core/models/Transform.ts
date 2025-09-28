/**
 * Transform - 网格坐标变换接口
 * 
 * Linus哲学体现：
 * - 使用网格坐标而非像素坐标，简化计算
 * - 不可变数据结构，避免副作用
 * - 统一图片和文字的变换接口
 */

/**
 * 网格变换接口
 * 所有坐标都是网格单元数，不是像素值
 */
export interface Transform {
  /** 网格X坐标（从0开始） */
  readonly gridX: number
  
  /** 网格Y坐标（从0开始） */
  readonly gridY: number
  
  /** 占用的网格宽度（单元格数量） */
  readonly gridWidth: number
  
  /** 占用的网格高度（单元格数量） */
  readonly gridHeight: number
  
  /** 旋转角度（弧度，0-2π） */
  readonly rotation: number
  
  /** Z轴层级（用于重叠时的显示顺序） */
  readonly zIndex: number
}

/**
 * Transform工厂类
 * 提供不可变更新方法
 */
export class TransformBuilder {
  /**
   * 创建默认Transform
   */
  static create(
    gridX = 0,
    gridY = 0,
    gridWidth = 1,
    gridHeight = 1,
    rotation = 0,
    zIndex = 0
  ): Transform {
    return {
      gridX,
      gridY,
      gridWidth,
      gridHeight,
      rotation,
      zIndex
    }
  }

  /**
   * 更新位置（网格坐标）
   */
  static withPosition(transform: Transform, gridX: number, gridY: number): Transform {
    return {
      ...transform,
      gridX,
      gridY
    }
  }

  /**
   * 更新尺寸（网格单元数）
   */
  static withSize(transform: Transform, gridWidth: number, gridHeight: number): Transform {
    return {
      ...transform,
      gridWidth,
      gridHeight
    }
  }

  /**
   * 更新旋转角度
   */
  static withRotation(transform: Transform, rotation: number): Transform {
    return {
      ...transform,
      rotation: this.normalizeRotation(rotation)
    }
  }

  /**
   * 更新层级
   */
  static withZIndex(transform: Transform, zIndex: number): Transform {
    return {
      ...transform,
      zIndex
    }
  }

  /**
   * 平移变换
   */
  static translate(transform: Transform, deltaX: number, deltaY: number): Transform {
    return {
      ...transform,
      gridX: transform.gridX + deltaX,
      gridY: transform.gridY + deltaY
    }
  }

  /**
   * 缩放变换
   */
  static scale(transform: Transform, scaleX: number, scaleY: number): Transform {
    return {
      ...transform,
      gridWidth: Math.max(1, Math.round(transform.gridWidth * scaleX)),
      gridHeight: Math.max(1, Math.round(transform.gridHeight * scaleY))
    }
  }

  /**
   * 旋转90度（顺时针）
   */
  static rotate90(transform: Transform): Transform {
    return this.withRotation(transform, transform.rotation + Math.PI / 2)
  }

  /**
   * 重置到原点
   */
  static reset(transform: Transform): Transform {
    return {
      ...transform,
      gridX: 0,
      gridY: 0,
      rotation: 0
    }
  }

  /**
   * 规范化旋转角度到 0-2π 范围
   */
  private static normalizeRotation(rotation: number): number {
    const normalized = rotation % (2 * Math.PI)
    return normalized < 0 ? normalized + 2 * Math.PI : normalized
  }

  /**
   * 验证Transform的合理性
   */
  static validate(transform: Transform): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (transform.gridX < 0) {
      errors.push('网格X坐标不能为负数')
    }

    if (transform.gridY < 0) {
      errors.push('网格Y坐标不能为负数')
    }

    if (transform.gridWidth <= 0) {
      errors.push('网格宽度必须大于0')
    }

    if (transform.gridHeight <= 0) {
      errors.push('网格高度必须大于0')
    }

    if (transform.rotation < 0 || transform.rotation >= 2 * Math.PI) {
      errors.push('旋转角度必须在0-2π范围内')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Transform常用预设
 */
export const TransformPresets = {
  /** 单元格大小，位于原点 */
  origin: (): Transform => TransformBuilder.create(0, 0, 1, 1),
  
  /** 双宽单元格 */
  wide: (): Transform => TransformBuilder.create(0, 0, 2, 1),
  
  /** 双高单元格 */
  tall: (): Transform => TransformBuilder.create(0, 0, 1, 2),
  
  /** 2x2大块 */
  large: (): Transform => TransformBuilder.create(0, 0, 2, 2),
  
  /** 旋转90度 */
  rotated90: (): Transform => TransformBuilder.create(0, 0, 1, 1, Math.PI / 2),
  
  /** 旋转180度 */  
  rotated180: (): Transform => TransformBuilder.create(0, 0, 1, 1, Math.PI),
  
  /** 旋转270度 */
  rotated270: (): Transform => TransformBuilder.create(0, 0, 1, 1, 3 * Math.PI / 2)
} as const

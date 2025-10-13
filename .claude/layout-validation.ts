/**
 * 布局数据验证脚本
 * 验证所有24种布局的数据完整性和正确性
 */

import { LAYOUT_TEMPLATES, LayoutCategory } from '../src/core/models/LayoutConfig'

interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  summary: {
    totalLayouts: number
    gridLayouts: number
    creativeLayouts: number
    socialLayouts: number
  }
}

function validateLayouts(): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    summary: {
      totalLayouts: 0,
      gridLayouts: 0,
      creativeLayouts: 0,
      socialLayouts: 0
    }
  }

  // 验证总数
  result.summary.totalLayouts = LAYOUT_TEMPLATES.length
  if (LAYOUT_TEMPLATES.length !== 24) {
    result.errors.push(`布局总数错误: 期望24个，实际${LAYOUT_TEMPLATES.length}个`)
    result.passed = false
  }

  // 按分类统计
  LAYOUT_TEMPLATES.forEach(layout => {
    switch (layout.category) {
      case LayoutCategory.Grid:
        result.summary.gridLayouts++
        break
      case LayoutCategory.Creative:
        result.summary.creativeLayouts++
        break
      case LayoutCategory.Social:
        result.summary.socialLayouts++
        break
    }
  })

  // 验证分类数量
  if (result.summary.gridLayouts !== 13) {
    result.errors.push(`基础网格布局数量错误: 期望13个，实际${result.summary.gridLayouts}个`)
    result.passed = false
  }
  if (result.summary.creativeLayouts !== 8) {
    result.errors.push(`创意组合布局数量错误: 期望8个，实际${result.summary.creativeLayouts}个`)
    result.passed = false
  }
  if (result.summary.socialLayouts !== 3) {
    result.errors.push(`社交媒体布局数量错误: 期望3个，实际${result.summary.socialLayouts}个`)
    result.passed = false
  }

  // 验证每个布局
  const usedIds = new Set<string>()
  LAYOUT_TEMPLATES.forEach((layout, index) => {
    const prefix = `布局[${index}] ${layout.id}`

    // 1. 验证ID唯一性
    if (usedIds.has(layout.id)) {
      result.errors.push(`${prefix}: ID重复`)
      result.passed = false
    }
    usedIds.add(layout.id)

    // 2. 验证ID格式
    if (!layout.id || layout.id.trim() === '') {
      result.errors.push(`${prefix}: ID为空`)
      result.passed = false
    }

    // 3. 验证名称
    if (!layout.name || layout.name.trim() === '') {
      result.errors.push(`${prefix}: 名称为空`)
      result.passed = false
    }

    // 4. 验证cells数量与imageCount一致
    if (layout.cells.length !== layout.imageCount) {
      result.errors.push(`${prefix}: cells数量(${layout.cells.length})与imageCount(${layout.imageCount})不一致`)
      result.passed = false
    }

    // 5. 验证归一化坐标
    layout.cells.forEach((cell, cellIndex) => {
      const [x, y, w, h] = cell

      // 坐标范围检查
      if (x < 0 || x > 1) {
        result.errors.push(`${prefix}: cell[${cellIndex}]的x坐标(${x})超出[0,1]范围`)
        result.passed = false
      }
      if (y < 0 || y > 1) {
        result.errors.push(`${prefix}: cell[${cellIndex}]的y坐标(${y})超出[0,1]范围`)
        result.passed = false
      }
      if (w <= 0 || w > 1) {
        result.errors.push(`${prefix}: cell[${cellIndex}]的宽度(${w})超出(0,1]范围`)
        result.passed = false
      }
      if (h <= 0 || h > 1) {
        result.errors.push(`${prefix}: cell[${cellIndex}]的高度(${h})超出(0,1]范围`)
        result.passed = false
      }

      // 边界检查
      if (x + w > 1.01) { // 允许0.01的浮点误差
        result.warnings.push(`${prefix}: cell[${cellIndex}]右边界(${x + w})超出画布(可能浮点误差)`)
      }
      if (y + h > 1.01) {
        result.warnings.push(`${prefix}: cell[${cellIndex}]下边界(${y + h})超出画布(可能浮点误差)`)
      }
    })

    // 6. 验证tags
    if (!layout.tags || layout.tags.length === 0) {
      result.warnings.push(`${prefix}: 缺少搜索标签`)
    }
  })

  return result
}

// 执行验证
console.log('🔍 开始验证布局数据...\n')

const result = validateLayouts()

// 输出结果
console.log('📊 统计信息:')
console.log(`  - 总布局数: ${result.summary.totalLayouts}`)
console.log(`  - 基础网格: ${result.summary.gridLayouts}`)
console.log(`  - 创意组合: ${result.summary.creativeLayouts}`)
console.log(`  - 社交媒体: ${result.summary.socialLayouts}`)
console.log()

if (result.errors.length > 0) {
  console.log('❌ 发现错误:')
  result.errors.forEach(error => console.log(`  - ${error}`))
  console.log()
}

if (result.warnings.length > 0) {
  console.log('⚠️  发现警告:')
  result.warnings.forEach(warning => console.log(`  - ${warning}`))
  console.log()
}

if (result.passed) {
  console.log('✅ 所有验证通过！')
} else {
  console.log('❌ 验证失败！')
  process.exit(1)
}


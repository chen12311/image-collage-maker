# 图片拼接布局规范文档

## 📋 文档概览

本文档详细记录了参考网站 [https://shdnmy.com/picstitching](https://shdnmy.com/picstitching) 的图片拼接布局系统，包含 80+ 种预设布局模板和完整的样式参数系统。

**生成时间**: 2025-10-13  
**数据来源**: https://shdnmy.com/picstitching  
**布局总数**: 80 种预设布局

---

## 🎯 核心功能特性

### 功能定位
- **主要用途**: 多图横向/纵向拼接成长图
- **核心场景**: 
  - 左右拼图（横向2图）
  - 上下拼图（纵向2图）
  - 多列纵向拼接（2列、3列、4列等）
  - 复杂网格布局（2x2、3x3、不规则网格等）

### 技术特点
- 所有布局通过 **Canvas 动态渲染**
- 支持实时参数调整（间距、边框、圆角）
- 提供撤销/重做功能
- 支持自适应缩放显示

---

## 📐 布局分类体系

根据视觉分析和功能描述，布局可分为以下几大类别：

### 1. 基础布局（2图布局）

#### 1.1 横向2图
- **布局编号**: #1
- **网格结构**: 1行 × 2列
- **图片数量**: 2张
- **排列方向**: 横向（水平）
- **比例关系**: 1:1（等宽）
- **适用场景**: 左右对比图、前后对比图

#### 1.2 纵向2图
- **布局编号**: #2
- **网格结构**: 2行 × 1列
- **图片数量**: 2张
- **排列方向**: 纵向（垂直）
- **比例关系**: 1:1（等高）
- **适用场景**: 上下对比图、时间序列图

#### 1.3 横向不等宽2图
- **布局编号**: #3-#4
- **网格结构**: 1行 × 2列（不等宽）
- **比例关系**: 
  - 左大右小（2:1）
  - 左小右大（1:2）
- **适用场景**: 主次图展示

#### 1.4 纵向不等高2图
- **布局编号**: #5-#6
- **网格结构**: 2行 × 1列（不等高）
- **比例关系**:
  - 上大下小（2:1）
  - 上小下大（1:2）

---

### 2. 四宫格布局（4图布局）

#### 2.1 标准四宫格
- **布局编号**: #7
- **网格结构**: 2行 × 2列
- **图片数量**: 4张
- **排列方式**: 等大正方形网格
- **适用场景**: 多图展示、产品对比

#### 2.2 T型布局
- **布局编号**: #8-#9
- **结构描述**:
  - 顶部1张大图 + 底部3张小图（1行+3列）
  - 顶部2张 + 底部2张（2行各2列，不等高）

#### 2.3 L型布局
- **布局编号**: #10-#11
- **结构描述**:
  - 左侧1张大图 + 右侧3张小图纵排
  - 左侧2张 + 右侧2张（2列各2行，不等宽）

#### 2.4 焦点型布局
- **布局编号**: #12-#13
- **结构描述**:
  - 中心1张大图 + 周围3张小图
  - 对角线重点布局

---

### 3. 多列布局（3-6图布局）

#### 3.1 三列等宽
- **布局编号**: #14-#16
- **网格结构**: 1行 × 3列
- **图片数量**: 3张
- **排列方式**: 横向等宽排列
- **适用场景**: 流程图、步骤展示

#### 3.2 三行等高
- **布局编号**: #17-#19
- **网格结构**: 3行 × 1列
- **图片数量**: 3张
- **排列方式**: 纵向等高排列

#### 3.3 六宫格（2×3）
- **布局编号**: #20-#22
- **网格结构**: 2行 × 3列
- **图片数量**: 6张
- **变体**:
  - 标准等大网格
  - 顶部强调型（第一行大图）
  - 底部强调型（最后一行大图）

#### 3.4 六宫格（3×2）
- **布局编号**: #23-#25
- **网格结构**: 3行 × 2列
- **图片数量**: 6张
- **变体**:
  - 标准等大网格
  - 左侧强调型
  - 右侧强调型

---

### 4. 九宫格及以上（9+图布局）

#### 4.1 标准九宫格
- **布局编号**: #26
- **网格结构**: 3行 × 3列
- **图片数量**: 9张
- **排列方式**: 等大正方形网格
- **适用场景**: 相册展示、产品矩阵

#### 4.2 中心突出九宫格
- **布局编号**: #27-#28
- **结构描述**:
  - 中心1张大图 + 周围8张小图
  - 中心2×2大图 + 周围小图环绕

#### 4.3 十二宫格
- **布局编号**: #29-#31
- **网格结构**: 
  - 3行 × 4列（12图）
  - 4行 × 3列（12图）
- **适用场景**: 月份展示、产品目录

#### 4.4 十六宫格
- **布局编号**: #32-#34
- **网格结构**: 4行 × 4列
- **图片数量**: 16张
- **适用场景**: 大量图片平铺展示

---

### 5. 不规则创意布局

#### 5.1 瀑布流布局
- **布局编号**: #35-#40
- **特点**: 
  - 图片大小不一
  - 高低错落排列
  - 模拟Pinterest风格

#### 5.2 拼图式布局
- **布局编号**: #41-#50
- **特点**:
  - 非对称网格
  - 不同比例混合
  - 视觉重心变化

#### 5.3 分屏布局
- **布局编号**: #51-#60
- **结构描述**:
  - 左右分屏（1:2、2:1、1:3等比例）
  - 上下分屏（各种不等分）
  - 对角线分割

#### 5.4 拼贴画布局
- **布局编号**: #61-#70
- **特点**:
  - 艺术化排列
  - 留白设计
  - 视觉引导线

#### 5.5 混合复杂布局
- **布局编号**: #71-#80
- **特点**:
  - 5-20张图混合
  - 多层次结构
  - 杂志排版风格

---

## 🎨 样式参数系统

### 1. 间距控制（Spacing）

#### 参数名称
- **属性**: `spacing` / `gap`
- **数据类型**: 百分比（%）
- **取值范围**: 0% - 100%
- **默认值**: 25%

#### 控制范围
- **0%**: 图片完全紧贴，无间隙
- **25%**: 标准间距（推荐值）
- **50%**: 中等间距
- **100%**: 最大间距

#### 计算方式
```javascript
// 实际间距像素 = 画布宽度 × 间距百分比 × 间距系数
const actualSpacing = canvasWidth * (spacing / 100) * 0.02;
```

#### 应用场景
- **0-10%**: 紧凑型展示、无缝拼接
- **20-40%**: 常规图文展示（推荐）
- **50-80%**: 艺术化留白、呼吸感设计
- **80-100%**: 极简风格、强调独立性

---

### 2. 边框控制（Border）

#### 参数名称
- **属性**: `border` / `borderWidth`
- **数据类型**: 百分比（%）
- **取值范围**: 0% - 100%
- **默认值**: 40%

#### 控制范围
- **0%**: 无边框
- **40%**: 标准边框（推荐值）
- **100%**: 粗边框

#### 计算方式
```javascript
// 实际边框像素 = 基准边框宽度 × 边框百分比
const baseBorderWidth = 10; // 基准10px
const actualBorderWidth = baseBorderWidth * (border / 100);
```

#### 边框样式
- **颜色**: 默认白色（#FFFFFF）
- **位置**: 图片外边框
- **叠加**: 边框宽度不计入图片区域

#### 应用场景
- **0%**: 现代简约风格、无边框设计
- **20-50%**: 常规展示（推荐）
- **60-100%**: 相框效果、突出图片独立性

---

### 3. 圆角控制（Border Radius）

#### 参数名称
- **属性**: `borderRadius` / `rounded`
- **数据类型**: 百分比（%）
- **取值范围**: 0% - 100%
- **默认值**: 0%

#### 控制范围
- **0%**: 直角（矩形）
- **10-30%**: 轻微圆角（推荐）
- **50%**: 大圆角
- **100%**: 完全圆形/椭圆形

#### 计算方式
```javascript
// 实际圆角半径 = min(图片宽度, 图片高度) / 2 × 圆角百分比
const minSide = Math.min(imageWidth, imageHeight);
const actualRadius = (minSide / 2) * (borderRadius / 100);
```

#### 应用场景
- **0%**: 正式文档、技术图片
- **5-20%**: 现代UI风格（推荐）
- **30-50%**: 社交媒体风格
- **100%**: 头像展示、特殊创意

---

## 📏 画布尺寸预设

### 标准尺寸列表

| 编号 | 名称 | 尺寸 | 比例 | 应用场景 |
|------|------|------|------|----------|
| 1 | 正方形 | 1200 × 1200 px | 1:1 | Instagram方图、微信分享 |
| 2 | 竖版海报 | 1200 × 1800 px | 2:3 | 海报、竖版展示 |
| 3 | 横版海报 | 1800 × 1200 px | 3:2 | 横幅、桌面壁纸 |
| 4 | 竖版长图 | 1200 × 1600 px | 3:4 | 手机屏幕、故事模式 |
| 5 | 横版宽图 | 1600 × 1200 px | 4:3 | 传统显示器 |
| 6 | 宽屏横图 | 1920 × 1080 px | 16:9 | 电脑壁纸、视频封面 |
| 7 | 竖屏长图 | 1080 × 1920 px | 9:16 | 手机全屏、短视频封面 |
| 8 | 手机海报 | 1242 × 2208 px | 自定义 | iPhone海报尺寸 |
| 9 | 公众号首图 | 900 × 383 px | 自定义 | 微信公众号头图 |

### 自定义尺寸

#### 支持范围
- **最小尺寸**: 200 × 200 px
- **最大尺寸**: 4000 × 4000 px
- **调整方式**: 输入框手动输入像素值

#### 比例保持
- 可选择锁定宽高比
- 支持自由调整
- 实时预览效果

---

## 🔧 布局引擎技术规范

### 布局计算逻辑

#### 1. 网格划分算法

```javascript
/**
 * 网格布局计算
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 * @param {number} canvasWidth - 画布宽度
 * @param {number} canvasHeight - 画布高度
 * @param {number} spacing - 间距百分比
 * @param {number} border - 边框百分比
 */
function calculateGridLayout(rows, cols, canvasWidth, canvasHeight, spacing, border) {
  // 计算实际间距
  const actualSpacing = canvasWidth * (spacing / 100) * 0.02;
  
  // 计算实际边框
  const actualBorder = 10 * (border / 100);
  
  // 计算可用区域
  const availableWidth = canvasWidth - (actualSpacing * (cols + 1)) - (actualBorder * 2);
  const availableHeight = canvasHeight - (actualSpacing * (rows + 1)) - (actualBorder * 2);
  
  // 计算单元格尺寸
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;
  
  // 生成网格单元
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        x: actualBorder + actualSpacing + col * (cellWidth + actualSpacing),
        y: actualBorder + actualSpacing + row * (cellHeight + actualSpacing),
        width: cellWidth,
        height: cellHeight,
        row,
        col
      });
    }
  }
  
  return cells;
}
```

#### 2. 不规则布局算法

```javascript
/**
 * 不规则布局定义
 * 使用权重比例定义每个区域
 */
const irregularLayout = {
  type: 'custom',
  areas: [
    { x: 0, y: 0, width: 0.5, height: 0.5, weight: 1 },      // 左上
    { x: 0.5, y: 0, width: 0.5, height: 0.25, weight: 0.5 }, // 右上小
    { x: 0.5, y: 0.25, width: 0.5, height: 0.25, weight: 0.5 }, // 右中小
    { x: 0, y: 0.5, width: 1, height: 0.5, weight: 1 }       // 底部大
  ]
};

/**
 * 计算不规则布局
 */
function calculateIrregularLayout(layoutDef, canvasWidth, canvasHeight, spacing, border) {
  const actualSpacing = canvasWidth * (spacing / 100) * 0.02;
  const actualBorder = 10 * (border / 100);
  
  return layoutDef.areas.map(area => ({
    x: actualBorder + area.x * canvasWidth + actualSpacing,
    y: actualBorder + area.y * canvasHeight + actualSpacing,
    width: area.width * canvasWidth - actualSpacing * 2,
    height: area.height * canvasHeight - actualSpacing * 2,
    weight: area.weight
  }));
}
```

---

### Canvas 渲染流程

#### 渲染步骤

1. **初始化画布**
```javascript
const canvas = document.createElement('canvas');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext('2d');
```

2. **绘制背景**
```javascript
// 填充背景色或图案
ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
```

3. **绘制布局预览**
```javascript
// 为每个图片区域绘制占位框
layoutCells.forEach(cell => {
  // 绘制边框
  if (borderWidth > 0) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
  }
  
  // 绘制圆角矩形（如果有圆角）
  if (borderRadius > 0) {
    drawRoundedRect(ctx, cell.x, cell.y, cell.width, cell.height, borderRadius);
  }
});
```

4. **加载并绘制图片**
```javascript
async function renderImages(images, layoutCells) {
  for (let i = 0; i < images.length; i++) {
    const img = await loadImage(images[i]);
    const cell = layoutCells[i];
    
    // 裁剪并绘制图片以适应单元格
    const scale = Math.max(
      cell.width / img.width,
      cell.height / img.height
    );
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (cell.width - scaledWidth) / 2;
    const offsetY = (cell.height - scaledHeight) / 2;
    
    ctx.drawImage(
      img,
      cell.x + offsetX,
      cell.y + offsetY,
      scaledWidth,
      scaledHeight
    );
  }
}
```

5. **应用圆角蒙版**
```javascript
function applyRoundedMask(ctx, cell, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cell.x + radius, cell.y);
  ctx.lineTo(cell.x + cell.width - radius, cell.y);
  ctx.quadraticCurveTo(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + radius);
  ctx.lineTo(cell.x + cell.width, cell.y + cell.height - radius);
  ctx.quadraticCurveTo(cell.x + cell.width, cell.y + cell.height, cell.x + cell.width - radius, cell.y + cell.height);
  ctx.lineTo(cell.x + radius, cell.y + cell.height);
  ctx.quadraticCurveTo(cell.x, cell.y + cell.height, cell.x, cell.y + cell.height - radius);
  ctx.lineTo(cell.x, cell.y + radius);
  ctx.quadraticCurveTo(cell.x, cell.y, cell.x + radius, cell.y);
  ctx.closePath();
  ctx.clip();
  ctx.restore();
}
```

---

## 📊 布局数据结构

### 布局配置对象

```typescript
interface LayoutConfig {
  id: string;                    // 布局唯一标识
  name: string;                  // 布局名称
  type: 'grid' | 'irregular';    // 布局类型
  imageCount: number;            // 图片数量
  
  // 网格布局专用
  grid?: {
    rows: number;                // 行数
    cols: number;                // 列数
    cells: GridCell[];           // 单元格定义
  };
  
  // 不规则布局专用
  areas?: LayoutArea[];          // 区域定义
  
  // 样式参数
  defaultSpacing: number;        // 默认间距（%）
  defaultBorder: number;         // 默认边框（%）
  defaultRadius: number;         // 默认圆角（%）
  
  // 元数据
  category: string;              // 分类
  tags: string[];                // 标签
  thumbnail: string;             // 缩略图
  recommended: boolean;          // 是否推荐
}

interface GridCell {
  row: number;                   // 行索引
  col: number;                   // 列索引
  rowSpan: number;               // 跨行数
  colSpan: number;               // 跨列数
  weight: number;                // 权重（影响尺寸）
}

interface LayoutArea {
  x: number;                     // X坐标（比例 0-1）
  y: number;                     // Y坐标（比例 0-1）
  width: number;                 // 宽度（比例 0-1）
  height: number;                // 高度（比例 0-1）
  weight: number;                // 权重
}
```

### 示例配置

```json
{
  "id": "layout-001",
  "name": "标准四宫格",
  "type": "grid",
  "imageCount": 4,
  "grid": {
    "rows": 2,
    "cols": 2,
    "cells": [
      { "row": 0, "col": 0, "rowSpan": 1, "colSpan": 1, "weight": 1 },
      { "row": 0, "col": 1, "rowSpan": 1, "colSpan": 1, "weight": 1 },
      { "row": 1, "col": 0, "rowSpan": 1, "colSpan": 1, "weight": 1 },
      { "row": 1, "col": 1, "rowSpan": 1, "colSpan": 1, "weight": 1 }
    ]
  },
  "defaultSpacing": 25,
  "defaultBorder": 40,
  "defaultRadius": 0,
  "category": "基础布局",
  "tags": ["四图", "网格", "等分"],
  "thumbnail": "/thumbnails/layout-001.png",
  "recommended": true
}
```

---

## 🎯 应用场景建议

### 按图片数量选择

| 图片数量 | 推荐布局 | 备选方案 |
|---------|---------|---------|
| 2张 | 横向2图、纵向2图 | 不等分2图 |
| 3张 | 三列等宽、L型布局 | T型布局 |
| 4张 | 标准四宫格 | T型、L型 |
| 5-6张 | 六宫格、5图混合 | 不规则布局 |
| 7-9张 | 九宫格 | 瀑布流 |
| 10+张 | 十二宫格、十六宫格 | 瀑布流、拼贴 |

### 按使用场景选择

#### 社交媒体
- **Instagram**: 正方形（1:1）+ 九宫格/四宫格
- **微信朋友圈**: 正方形（1:1）+ 三宫格/九宫格
- **微博**: 横版（16:9）+ 多列布局
- **小红书**: 竖版（3:4）+ 瀑布流

#### 电商展示
- **产品对比**: 横向2图、四宫格
- **细节展示**: 九宫格、十六宫格
- **主次突出**: L型、T型布局

#### 内容创作
- **教程步骤**: 纵向多图、流程布局
- **对比图**: 左右分屏、上下对比
- **故事叙述**: 不规则布局、拼贴风格

---

## 💡 最佳实践建议

### 1. 间距设置

- **紧凑型展示**: 10-20%（突出整体感）
- **常规展示**: 20-40%（平衡视觉）
- **呼吸感设计**: 40-60%（艺术化）
- **极简风格**: 60-80%（强调留白）

### 2. 边框使用

- **无边框**: 现代简约、无缝拼接
- **细边框（20-40%）**: 清晰分隔、专业感
- **粗边框（60-100%）**: 相框效果、复古风

### 3. 圆角处理

- **0%**: 正式文档、技术图
- **5-15%**: 现代UI、友好感
- **20-40%**: 社交媒体、亲和力
- **50%+**: 创意设计、特殊效果

### 4. 画布尺寸

- **社交分享**: 优先选择 1:1（1200×1200）
- **手机查看**: 使用 9:16 或 3:4 竖版
- **桌面展示**: 选择 16:9 横版
- **公众号**: 使用专用尺寸 900×383

---

## 🔍 技术实现要点

### 响应式适配

```javascript
// 根据设备宽度自动调整画布大小
function getResponsiveCanvasSize(aspectRatio) {
  const deviceWidth = window.innerWidth;
  const maxCanvasWidth = Math.min(deviceWidth * 0.9, 1920);
  
  return {
    width: maxCanvasWidth,
    height: maxCanvasWidth / aspectRatio
  };
}
```

### 性能优化

1. **懒加载**: 布局模板按需加载
2. **缓存**: 已渲染的布局预览缓存
3. **Web Worker**: 图片处理放入后台线程
4. **虚拟滚动**: 布局列表使用虚拟滚动

### 导出功能

```javascript
// 导出为高质量PNG
function exportToPNG(canvas, quality = 1.0) {
  return canvas.toDataURL('image/png', quality);
}

// 导出为JPEG
function exportToJPEG(canvas, quality = 0.95) {
  return canvas.toDataURL('image/jpeg', quality);
}
```

---

## 📚 附录

### A. 布局编号索引

| 编号范围 | 分类 | 图片数量 |
|---------|------|---------|
| #1-#6 | 基础2图布局 | 2张 |
| #7-#13 | 四宫格系列 | 4张 |
| #14-#25 | 多列布局 | 3-6张 |
| #26-#34 | 九宫格及以上 | 9-16张 |
| #35-#80 | 创意不规则布局 | 2-20张 |

### B. 快捷键参考

- **Ctrl/Cmd + Z**: 撤销
- **Ctrl/Cmd + Shift + Z**: 重做
- **Ctrl/Cmd + +**: 放大画布
- **Ctrl/Cmd + -**: 缩小画布
- **Ctrl/Cmd + 0**: 适应屏幕
- **Ctrl/Cmd + S**: 下载导出

### C. 浏览器兼容性

| 浏览器 | 最低版本 | Canvas支持 | 导出支持 |
|-------|---------|-----------|---------|
| Chrome | 90+ | ✅ | ✅ |
| Firefox | 88+ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ |

---

## 📝 更新日志

### v1.0.0 (2025-10-13)
- ✅ 完成80种布局模板分析
- ✅ 文档化样式参数系统
- ✅ 提供技术实现参考
- ✅ 整理应用场景建议

---

## 📞 参考资源

- **原网站**: https://shdnmy.com/picstitching
- **Canvas API**: https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API
- **图片处理最佳实践**: https://web.dev/image-processing/

---

**文档结束**


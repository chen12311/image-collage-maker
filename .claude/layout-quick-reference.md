# 布局系统快速参考手册

> 基于 https://shdnmy.com/picstitching 的布局系统分析  
> 完整文档见：`layout-specification.md`

---

## 🚀 快速开始

### 核心概念
- **80种布局模板**: 从2图到20+图的完整覆盖
- **3个样式参数**: 间距、边框、圆角（0-100%）
- **9种画布尺寸**: 适配各种社交媒体和展示场景

---

## 📋 常用布局速查

### 2图布局
```
横向并排: [图1 | 图2]          (布局 #1)
纵向堆叠: [图1]                (布局 #2)
          [图2]

左大右小: [图1大 | 图2小]      (布局 #3)
右大左小: [图1小 | 图2大]      (布局 #4)
```

### 4图布局
```
标准四宫格:                    (布局 #7)
[图1 | 图2]
[图3 | 图4]

T型布局:                       (布局 #8)
[    图1大    ]
[图2 | 图3 | 图4]

L型布局:                       (布局 #10)
[图1大 | 图2]
[      | 图3]
[      | 图4]
```

### 9图布局
```
标准九宫格:                    (布局 #26)
[图1 | 图2 | 图3]
[图4 | 图5 | 图6]
[图7 | 图8 | 图9]
```

---

## 🎨 样式参数速查

### 间距（Spacing）
| 数值 | 效果 | 场景 |
|------|------|------|
| 0-10% | 紧凑无缝 | 拼接长图 |
| 20-40% | 标准间距 ⭐ | 常规展示 |
| 50-80% | 呼吸留白 | 艺术设计 |

### 边框（Border）
| 数值 | 效果 | 场景 |
|------|------|------|
| 0% | 无边框 | 简约风格 |
| 20-50% | 细边框 ⭐ | 专业展示 |
| 60-100% | 粗边框 | 相框效果 |

### 圆角（Border Radius）
| 数值 | 效果 | 场景 |
|------|------|------|
| 0% | 直角 | 正式文档 |
| 5-20% | 轻微圆角 ⭐ | 现代UI |
| 30-50% | 大圆角 | 社交媒体 |
| 100% | 圆形/椭圆 | 头像展示 |

---

## 📏 画布尺寸速查

### 社交媒体常用
| 平台 | 尺寸 | 比例 | 用途 |
|------|------|------|------|
| Instagram | 1200×1200 | 1:1 | 方图分享 ⭐ |
| 微信朋友圈 | 1200×1200 | 1:1 | 图片分享 |
| 抖音封面 | 1080×1920 | 9:16 | 竖屏视频 |
| 微博 | 1920×1080 | 16:9 | 横版图片 |
| 公众号 | 900×383 | 自定义 | 文章头图 |

### 通用场景
| 场景 | 推荐尺寸 | 比例 |
|------|---------|------|
| 手机查看 | 1080×1920 | 9:16 |
| 电脑壁纸 | 1920×1080 | 16:9 |
| 海报打印 | 1200×1800 | 2:3 |
| PPT展示 | 1600×1200 | 4:3 |

---

## 🔧 核心算法速查

### 网格布局计算
```typescript
// 计算网格单元格位置和尺寸
function calculateGrid(rows, cols, width, height, spacing, border) {
  const gap = width * (spacing / 100) * 0.02;
  const borderW = 10 * (border / 100);
  
  const cellW = (width - gap * (cols + 1) - borderW * 2) / cols;
  const cellH = (height - gap * (rows + 1) - borderW * 2) / rows;
  
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: borderW + gap + c * (cellW + gap),
        y: borderW + gap + r * (cellH + gap),
        width: cellW,
        height: cellH
      });
    }
  }
  return cells;
}
```

### 圆角矩形绘制
```typescript
function drawRoundedRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
```

---

## 📊 数据结构速查

### 布局配置接口
```typescript
interface LayoutConfig {
  id: string;              // 布局ID
  type: 'grid' | 'custom'; // 类型
  imageCount: number;      // 图片数量
  
  // 网格布局
  grid?: {
    rows: number;          // 行数
    cols: number;          // 列数
  };
  
  // 样式默认值
  defaultSpacing: number;  // 间距(%)
  defaultBorder: number;   // 边框(%)
  defaultRadius: number;   // 圆角(%)
  
  // 元数据
  category: string;        // 分类
  tags: string[];          // 标签
}
```

### 示例配置
```json
{
  "id": "layout-2x2",
  "type": "grid",
  "imageCount": 4,
  "grid": { "rows": 2, "cols": 2 },
  "defaultSpacing": 25,
  "defaultBorder": 40,
  "defaultRadius": 0,
  "category": "基础布局",
  "tags": ["四图", "网格"]
}
```

---

## 🎯 场景推荐

### 按图片数量选择
- **2张**: 横向2图、纵向2图
- **3张**: 三列等宽、L型布局
- **4张**: 标准四宫格 ⭐
- **6张**: 2×3网格、3×2网格
- **9张**: 九宫格 ⭐
- **12+张**: 瀑布流、拼贴布局

### 按用途选择
| 用途 | 推荐布局 | 参数建议 |
|------|---------|---------|
| 产品展示 | 四宫格、九宫格 | 间距30%、边框40% |
| 对比图 | 横向2图、上下2图 | 间距20%、无边框 |
| 教程步骤 | 纵向多图 | 间距15%、边框30% |
| 社交分享 | 九宫格、拼贴 | 间距25%、圆角10% |

---

## 💡 最佳实践

### 1. 参数组合建议
```
现代简约风:
- 间距: 20-30%
- 边框: 0%
- 圆角: 5-15%

复古相框风:
- 间距: 30-40%
- 边框: 60-80%
- 圆角: 0%

社交媒体风:
- 间距: 25%
- 边框: 40%
- 圆角: 10-20%

极简留白风:
- 间距: 50-60%
- 边框: 0%
- 圆角: 0%
```

### 2. 性能优化
- ✅ 使用 Canvas 离屏渲染
- ✅ 图片预加载和缓存
- ✅ 布局模板懒加载
- ✅ 大图分块处理

### 3. 响应式适配
```typescript
// 移动端自动缩小画布
const maxWidth = isMobile ? 750 : 1920;
const scale = Math.min(1, windowWidth / maxWidth);
```

---

## 🔍 调试技巧

### 显示网格辅助线
```typescript
function drawGridHelper(ctx, cells) {
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  cells.forEach(cell => {
    ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
  });
}
```

### 控制台输出布局信息
```typescript
console.table(cells.map(c => ({
  x: c.x.toFixed(2),
  y: c.y.toFixed(2),
  w: c.width.toFixed(2),
  h: c.height.toFixed(2)
})));
```

---

## 📚 常见问题

### Q: 如何确定使用哪种布局？
**A**: 
1. 先确定图片数量（2/4/9是最常用的）
2. 再考虑展示场景（对比/展示/叙述）
3. 最后调整样式参数

### Q: 间距、边框、圆角的推荐值？
**A**: 
- 新手建议: 间距25%、边框40%、圆角0%（默认值）
- 进阶调整: 根据场景微调±10-20%

### Q: 如何适配不同尺寸的图片？
**A**:
```typescript
// 图片自动裁剪居中
const scale = Math.max(
  cellWidth / imgWidth,
  cellHeight / imgHeight
);
// 然后居中裁剪多余部分
```

### Q: Canvas导出时图片模糊？
**A**:
```typescript
// 使用2倍画布提高清晰度
canvas.width = targetWidth * 2;
canvas.height = targetHeight * 2;
ctx.scale(2, 2);
// 绘制后再缩放回原尺寸导出
```

---

## 🔗 相关资源

- **完整规范**: `layout-specification.md`
- **操作日志**: `operations-log.md`
- **参考网站**: https://shdnmy.com/picstitching
- **Canvas API**: https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API

---

**快速参考手册 v1.0** | 更新于 2025-10-13


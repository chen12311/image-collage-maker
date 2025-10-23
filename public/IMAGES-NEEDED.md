# 网站图标和OG分享图片规格说明

本文档列出了SEO优化所需的图片文件及其规格要求。

## 📋 必需的图片文件

### 1. favicon.ico
- **路径**：`/public/favicon.ico`
- **尺寸**：16×16px 和 32×32px（多尺寸ICO文件）
- **格式**：ICO
- **用途**：浏览器标签页图标
- **设计要求**：
  - 简洁明了，在小尺寸下清晰可辨
  - 建议使用品牌主色
  - 推荐使用"ImageBatch"首字母"I"或图片拼接图标

### 2. favicon-32x32.png
- **路径**：`/public/favicon-32x32.png`
- **尺寸**：32×32px
- **格式**：PNG（支持透明）
- **用途**：现代浏览器图标
- **设计要求**：与 favicon.ico 保持一致

### 3. apple-touch-icon.png
- **路径**：`/public/apple-touch-icon.png`
- **尺寸**：180×180px
- **格式**：PNG
- **用途**：iOS添加到主屏幕图标、PWA图标
- **设计要求**：
  - 不需要圆角（iOS会自动添加）
  - 避免在边缘放置重要信息
  - 可以使用更丰富的细节（尺寸较大）
  - 背景色应为纯色或渐变

### 4. og-image.png
- **路径**：`/public/og-image.png`
- **尺寸**：1200×630px
- **格式**：PNG 或 JPG
- **用途**：社交平台分享卡片（微信、Facebook、Twitter等）
- **设计要求**：
  - 突出显示应用名称"ImageBatch"
  - 简要展示核心功能（如：多图拼接示例）
  - 避免在边缘区域放置文字（可能被裁剪）
  - 安全区域：距离边缘至少40px
  - 文字清晰可读，字号≥24px
  - 配色与品牌一致

## 🎨 设计建议

### 配色方案
根据项目主题色：
- 主色：`#3b82f6`（蓝色）
- 辅助色：`#ffffff`（白色）
- 中性色：`#f1f5f9`（浅灰）

### 图标设计灵感
- 图片拼接网格图标
- 多张图片组合图标
- 简洁的字母"I"或"IB"标识

## 📦 快速生成方法

### 方法1：使用在线工具
- **Favicon生成**：https://realfavicongenerator.net/
- **OG图片设计**：https://www.canva.com/（模板搜索"Social Media"）

### 方法2：使用设计软件
- Figma / Sketch / Adobe XD
- 使用提供的尺寸模板设计
- 导出为对应格式

### 方法3：临时占位符（开发/测试）
如果需要快速测试，可以使用纯色占位符：

```bash
# 使用 ImageMagick 生成占位符（需安装 ImageMagick）
convert -size 32x32 xc:#3b82f6 public/favicon-32x32.png
convert -size 180x180 xc:#3b82f6 public/apple-touch-icon.png
convert -size 1200x630 xc:#3b82f6 -pointsize 60 -fill white -gravity center -annotate +0+0 'ImageBatch' public/og-image.png
```

## ✅ 验证清单

创建完图片后，请确认：

- [ ] 所有文件都放置在 `/public/` 目录下
- [ ] 文件名与上述规格完全一致
- [ ] 图片尺寸符合要求
- [ ] 图片质量清晰（特别是 og-image）
- [ ] 运行 `npm run build` 后检查 `dist/` 目录是否包含这些文件
- [ ] 在浏览器中测试 favicon 是否正常显示
- [ ] 使用 Facebook Sharing Debugger 测试 OG 图片

## 🔗 相关资源

- [Favicon 最佳实践](https://github.com/audreyfeldroy/favicon-cheat-sheet)
- [Open Graph 协议文档](https://ogp.me/)
- [Twitter Card 文档](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [PWA 图标规范](https://web.dev/add-manifest/)

---

**注意**：图片文件不包含在 Git 版本控制中（已添加到 .gitignore）。团队成员需要自行生成或从设计团队获取。


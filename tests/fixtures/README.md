# 测试资源文件

本目录包含用于单元测试和E2E测试的测试资源文件。

## 图片文件

### images/test-image-100x100.png
- 尺寸: 100x100
- 格式: PNG
- 用途: 基础图片上传测试

### images/test-image-large.jpg
- 尺寸: 2000x2000
- 格式: JPEG
- 用途: 大图处理测试

### images/test-image-portrait.jpg
- 尺寸: 800x1200
- 格式: JPEG
- 用途: 竖图布局测试

## 使用方法

在测试中使用相对路径引用：

```typescript
// 单元测试
const imagePath = path.join(__dirname, '../fixtures/images/test-image-100x100.png')

// E2E测试
await page.setInputFiles('input[type="file"]', 'tests/fixtures/images/test-image-100x100.png')
```

## 生成方式

测试图片通过Canvas API生成，包含简单的颜色填充和文字标记，便于视觉验证。



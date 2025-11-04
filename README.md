# 图片拼接工具

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)

一个简洁高效的在线图片拼接工具，基于 Vue 3 + TypeScript 构建

[在线演示](https://stitch.helimoyu.com) | [功能特性](#✨-功能特性) | [快速开始](#🚀-快速开始) | [贡献指南](#🤝-贡献指南)

</div>

---

## 📖 项目简介

**image-collage-maker** 是一个开源的在线图片拼接工具，提供直观的可视化界面，让您轻松创建精美的图片拼接效果。无需安装任何软件，在浏览器中即可完成所有操作。

### 🌟 为什么选择 image-collage-maker？

- 🎯 **简单易用**：拖拽式操作，零学习成本
- 🚀 **性能优秀**：基于 Canvas API，实时渲染预览
- 🎨 **高度自定义**：灵活的布局和样式控制
- 💾 **隐私安全**：所有处理在本地完成，图片不上传服务器
- 🌐 **完全开源**：MIT 协议，欢迎贡献和定制

## ✨ 功能特性

### 核心功能
- **多种布局模式**：支持1/2/3/4宫格布局，灵活满足不同需求
- **图片管理**：
  - 支持点击上传和拖拽上传
  - 图片拖拽排序
  - 实时预览效果
- **文字编辑**：
  - 添加自定义文字到画布
  - 调整字体大小和颜色
  - 文字列表管理
- **样式控制**：
  - 自定义图片间距、边距、圆角
  - 背景颜色和透明度调节
  - 全局和图片透明度独立控制

### 增强功能
- **撤销/重做**：支持操作历史记录，Ctrl+Z/Y快捷键
- **灵活导出**：支持多种画布尺寸，导出高质量PNG图片
- **实时渲染**：Canvas实时渲染，所见即所得

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 7

### 安装

```bash
# 克隆项目
git clone https://github.com/chen12311/image-collage-maker.git

# 进入项目目录
cd image-collage-maker

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 测试

```bash
# 运行测试
npm run test

# 运行测试（监听模式）
npm run test:watch

# 运行测试覆盖率
npm run test:coverage
```

## 📖 使用指南

### 1. 选择布局
- 在左侧"布局"标签中选择1-4宫格布局
- 调整间距、边距和圆角参数

### 2. 上传图片
- 点击"传图"标签
- 点击或拖拽图片到上传区域
- 拖拽缩略图可调整图片顺序

### 3. 添加文字
- 点击"文字"标签
- 输入文字内容
- 设置字体大小和颜色
- 点击"添加文字"按钮

### 4. 调整背景
- 点击"背景"标签
- 选择背景颜色
- 调整背景透明度

### 5. 导出图片
- 在中间画布区域选择画布尺寸
- 点击"导出图片"按钮
- 图片将自动下载

## 🏗️ 技术架构

### 技术栈
- **Vue 3**：渐进式JavaScript框架
- **TypeScript**：类型安全的JavaScript超集
- **Pinia**：Vue 3状态管理库
- **Vite**：下一代前端构建工具
- **Canvas API**：高性能图形渲染

### 项目结构

```
src/
├── components/         # Vue组件
│   ├── Sidebar/       # 左侧工具栏组件
│   ├── Canvas/        # 中间画布组件
│   └── Properties/    # 右侧属性栏组件
├── core/              # 核心数据模型
│   └── models/        # 类型定义
├── store/             # Pinia状态管理
├── layout/            # 布局计算引擎
├── rendering/         # Canvas渲染器
├── history/           # 历史管理（撤销/重做）
├── main.ts            # 应用入口
└── App.vue            # 根组件
```

### 核心模块

#### 1. 数据模型（core/models）
- **LayoutConfig**：布局配置
- **ImageElement**：图片元素
- **TextElement**：文字元素
- **CanvasState**：画布状态（用于历史记录）

#### 2. 状态管理（store）
- **useAppStore**：Pinia Store，管理应用全局状态

#### 3. 布局引擎（layout）
- **LayoutEngine**：计算布局网格位置和尺寸

#### 4. 渲染系统（rendering）
- **CanvasRenderer**：Canvas渲染器，支持背景、图片、文字渲染

#### 5. 历史管理（history）
- **HistoryManager**：撤销/重做功能实现

## 🎨 设计原则

1. **组件化设计**：每个功能模块独立封装为Vue组件
2. **类型安全**：全面使用TypeScript，确保代码质量
3. **状态集中管理**：使用Pinia统一管理应用状态
4. **性能优化**：Canvas实时渲染，响应式更新
5. **用户体验**：直观的UI设计，流畅的交互体验

## 📝 代码规范

- 使用TypeScript严格模式
- 所有注释使用简体中文
- 组件使用Composition API（`<script setup>`）
- 遵循Vue 3官方风格指南

## 🧪 测试

### 测试架构

项目包含完整的测试体系，确保代码质量和功能稳定性：

- **单元测试（Jest）**：测试核心算法和业务逻辑
- **E2E测试（Playwright）**：测试关键用户流程

### 运行测试

```bash
# 运行所有单元测试
npm run test

# 单元测试（监听模式）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行E2E测试
npm run test:e2e

# E2E测试（UI模式）
npm run test:e2e:ui

# E2E测试（调试模式）
npm run test:e2e:debug

# 运行所有测试
npm run test:all
```

### 测试覆盖率目标

- **Branches**: ≥ 80%
- **Functions**: ≥ 85%
- **Lines**: ≥ 80%
- **Statements**: ≥ 80%

### 测试文件组织

```
tests/
├── setup.ts              # Jest测试环境配置
├── unit/                 # 单元测试
│   ├── composables/      # Composables测试
│   │   ├── useKeyboard.test.ts
│   │   ├── useToast.test.ts
│   │   └── useResponsive.test.ts
│   ├── core/             # 核心模块测试
│   │   └── CanvasSizeCalculator.test.ts
│   ├── history/          # 历史管理测试
│   │   └── HistoryManager.test.ts
│   ├── layout/           # 布局引擎测试
│   │   └── LayoutEngine.test.ts
│   ├── rendering/        # 渲染器测试
│   │   └── CanvasRenderer.test.ts
│   └── store/            # 状态管理测试
│       └── useAppStore.test.ts
└── e2e/                  # E2E测试
    ├── image-upload.spec.ts
    └── layout-switching.spec.ts
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是新功能、Bug修复、文档改进还是提出建议。

### 如何贡献

1. **Fork 本仓库**
2. **创建特性分支**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **提交更改**
   ```bash
   git commit -m 'feat: 添加某个功能'
   ```
4. **推送到分支**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **开启 Pull Request**

### 开发规范

- 遵循项目代码风格和命名约定
- 提交前运行 `npm run test` 确保测试通过
- 提交前运行 `npm run build` 确保构建成功
- 使用有意义的 commit message（参考 [Conventional Commits](https://www.conventionalcommits.org/)）
- 为新功能添加相应的测试用例

### 问题反馈

如果您发现 Bug 或有功能建议，请在 [GitHub Issues](https://github.com/chen12311/image-collage-maker/issues) 提交。

## 💬 社区与支持

- 🐛 [报告 Bug](https://github.com/chen12311/image-collage-maker/issues/new?labels=bug)
- 💡 [功能建议](https://github.com/chen12311/image-collage-maker/issues/new?labels=enhancement)
- 📖 [查看文档](https://github.com/chen12311/image-collage-maker#readme)
- ⭐ 如果这个项目对您有帮助，请给我们一个 Star！

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

您可以自由地：
- ✅ 使用、复制、修改、合并、发布、分发本软件
- ✅ 用于商业目的
- ✅ 创建衍生作品

但需要保留原始的版权声明和许可证声明。

## 👥 作者

由 [@chen12311](https://github.com/chen12311) 创建和维护

## 🙏 致谢

感谢所有 [贡献者](https://github.com/chen12311/image-collage-maker/graphs/contributors) 的付出！

### 技术栈致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

---

<div align="center">

如果觉得这个项目不错，欢迎 ⭐ Star 支持一下！

Made with ❤️ by 合理摸鱼 Team

</div>


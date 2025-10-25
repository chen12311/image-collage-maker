# 图片拼接工具

一个简洁高效的在线图片拼接工具，基于Vue 3 + TypeScript构建。

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
git clone <repository-url>

# 进入项目目录
cd imageBatch

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

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证 

MIT License

## 👥 作者

ImageBatch团队

## 🙏 致谢

感谢所有贡献者和用户的支持！


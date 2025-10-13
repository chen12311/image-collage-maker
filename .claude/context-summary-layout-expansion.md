# 项目上下文摘要 - 布局系统扩展

**生成时间**: 2025-10-13  
**任务**: 扩展布局系统到24种布局模式

---

## 1. 相似实现分析

### LayoutEngine.ts (核心计算逻辑)
- **位置**: `src/layout/LayoutEngine.ts:60-122`
- **模式**: 基于归一化坐标的布局计算引擎
- **可复用**: 整个计算逻辑无需改动，天然支持任意布局
- **需注意**: 
  - 使用 `[x, y, w, h]` 归一化坐标（0-1范围）
  - 自动处理spacing和padding
  - 返回像素级的绝对坐标

### 原LayoutPanel.vue (UI实现)
- **位置**: `src/components/Sidebar/LayoutPanel.vue:1-289`
- **模式**: 2列网格展示布局选项，使用CSS Grid类名预览
- **可复用**: 整体布局结构、交互模式、控件样式
- **需注意**: 
  - 使用hover-lift类实现悬停效果
  - 使用Transition组件实现动画
  - 控件使用range input + 实时更新

### Store状态管理
- **位置**: `src/store/useAppStore.ts:25-406`
- **模式**: Pinia Composition API，使用ref和computed
- **可复用**: 状态管理模式、setter方法模式
- **需注意**: 
  - 所有setter都有范围验证
  - 使用computed派生状态
  - restoreState用于历史记录

---

## 2. 项目约定

### 命名约定
- **变量/函数**: camelCase（如 `layoutType`, `getLayoutById`）
- **类型/接口**: PascalCase（如 `LayoutConfig`, `LayoutTemplate`）
- **组件**: PascalCase文件名（如 `LayoutPanel.vue`）
- **常量**: UPPER_SNAKE_CASE（如 `LAYOUT_TEMPLATES`）
- **CSS类名**: kebab-case（如 `layout-panel`, `category-tab`）

### 文件组织
```
src/
  ├── core/models/        # 核心数据模型
  ├── layout/             # 布局计算引擎
  ├── components/
  │   ├── Common/         # 通用组件
  │   └── Sidebar/        # 侧边栏组件
  └── store/              # 状态管理
```

### 导入顺序
1. Vue核心（ref, computed等）
2. 第三方库（pinia等）
3. 类型导入（type关键字）
4. 本地组件
5. 本地工具/模型

### 代码风格
- 使用2空格缩进
- 单引号字符串
- 尾部逗号
- TypeScript严格模式
- 所有注释强制使用简体中文

---

## 3. 可复用组件清单

### UI组件
- `src/components/Common/Icon.vue` - 图标组件
- `src/components/Common/Button.vue` - 按钮组件
- `src/components/Common/Tooltip.vue` - 提示组件
- `src/components/Common/Loading.vue` - 加载组件

### 核心模块
- `src/layout/LayoutEngine.ts` - 布局计算引擎（完全复用）
- `src/core/models/LayoutConfig.ts` - 布局数据模型（已重构）
- `src/store/useAppStore.ts` - 全局状态管理

### 样式系统
- `src/styles/design-tokens.css` - 设计令牌（颜色、间距、字体等）
- `src/styles/animations.css` - 动画定义
- CSS变量命名：`--color-*`, `--spacing-*`, `--font-*`

---

## 4. 测试策略

### 测试框架
- Jest配置在 `jest.config.js`
- 测试文件位置：`tests/unit/`, `tests/integration/`

### 测试模式
- 单元测试：模型和工具函数
- 集成测试：组件交互
- E2E测试：完整用户流程

### 验证方式
1. TypeScript类型检查（`read_lints`工具）
2. 数据验证脚本（`.claude/layout-validation.ts`）
3. 手动UI测试（浏览器验证）

### 覆盖要求
- 核心逻辑必须有单元测试
- 数据完整性必须验证
- UI交互需要手动测试

---

## 5. 依赖和集成点

### 外部依赖
- Vue 3 - 前端框架
- Pinia - 状态管理
- TypeScript - 类型系统
- Vite - 构建工具

### 内部依赖
```
LayoutPanel.vue
  ├─> LayoutPreview.vue (新建)
  ├─> Icon.vue
  ├─> useAppStore
  └─> LAYOUT_TEMPLATES

LayoutEngine
  ├─> LayoutConfig (models)
  └─> Cell类型

useAppStore
  ├─> createLayoutConfig
  └─> getLayoutById
```

### 集成方式
- 组件通过props传递数据
- 状态通过Pinia store共享
- 事件通过方法调用处理

### 配置来源
- Vite配置：`vite.config.ts`
- TypeScript配置：`tsconfig.json`
- 布局数据：`src/core/models/LayoutConfig.ts`

---

## 6. 技术选型理由

### 为什么用归一化坐标（0-1范围）？
- ✅ 响应式布局：自适应任意画布尺寸
- ✅ 数据简洁：只需4个数字描述一个单元格
- ✅ 计算高效：简单的乘法运算转换为像素
- ✅ 易于设计：0-1范围直观表示比例

### 为什么用字符串ID而非数字？
- ✅ 语义化：'grid-2x2'比'4'更直观
- ✅ 可扩展：可以轻松添加新布局而不破坏旧ID
- ✅ 分类友好：ID包含分类信息（grid-, creative-, social-）
- ✅ 搜索友好：字符串更容易匹配和过滤

### 为什么引入分类Tab？
- ✅ 组织清晰：24个布局需要分类管理
- ✅ 认知负担低：用户不需要一次性浏览所有布局
- ✅ 可扩展：未来可以轻松添加新分类
- ✅ 用户体验：按需展示，减少滚动

### 为什么创建LayoutPreview组件？
- ✅ 精确预览：使用绝对定位完美复现复杂布局
- ✅ 可复用：任何地方都可以预览布局
- ✅ 解耦：预览逻辑独立于选择逻辑
- ✅ 易于测试：独立组件更容易测试

---

## 7. 关键风险点

### 并发问题
- ⚠️ 快速切换布局时的状态更新
- **缓解**: Vue响应式系统保证状态一致性
- **验证**: 手动测试快速切换场景

### 边界条件
- ⚠️ 图片数量与布局单元格不匹配
  - 图片少：多余单元格为空（正常）
  - 图片多：多余图片不显示（正常）
- ⚠️ 归一化坐标浮点误差
  - 允许0.01的边界误差
  - 使用Math.round确保像素对齐

### 性能瓶颈
- ⚠️ 24个布局项同时渲染
- **缓解**: 使用v-for key优化、限制最大高度+滚动
- **未来**: 如布局数量继续增加，考虑虚拟滚动

### 向后兼容
- ❌ 破坏性变更：LayoutType从数字改为字符串
- **影响**: 如果有持久化的旧数据会失效
- **策略**: 根据CLAUDE.md规范，不做向后兼容

---

## 8. 实施经验总结

### 成功经验
1. **Sequential Thinking先行**: 深度分析避免返工
2. **数据驱动**: 先设计24种布局数据，再实现UI
3. **渐进式重构**: 从核心到外围，逐层验证
4. **自动验证**: 编写验证脚本提前发现问题

### 注意事项
1. **归一化坐标精度**: 确保相邻单元格无缝衔接
2. **类型系统完整**: 所有接口都有完整的TypeScript类型
3. **注释强制中文**: 严格遵守CLAUDE.md规范
4. **UI滚动容器**: 大量内容需要限制高度和滚动

### 可优化点
1. 添加布局搜索UI（函数已实现）
2. 添加布局收藏功能
3. 添加自动化UI测试
4. 考虑虚拟滚动优化性能

---

**摘要版本**: 1.0  
**最后更新**: 2025-10-13


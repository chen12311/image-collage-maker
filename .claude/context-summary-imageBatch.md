## 项目上下文摘要（图片拼接工具）
生成时间：2025-10-11

### 1. 项目概述
基于HTML demo实现Vue 3 + TypeScript的图片拼接工具，集成已有Worker系统，支持多布局、拖拽编辑、撤销重做等增强功能。

### 2. 现有实现分析

#### 2.1 HTML Demo分析（index.html）
- **实现模式**：纯前端Canvas应用，单文件实现
- **核心功能**：
  - 4种预设布局（1/2/3/4宫格）
  - 图片上传和预览
  - Canvas实时渲染
  - 文字添加
  - 背景和样式控制
  - 导出PNG功能
- **关键实现**：
  - 状态管理：全局state对象
  - 布局计算：layouts对象定义cell坐标
  - 渲染逻辑：renderCanvas函数
  - 图片裁剪：cover模式（保持比例，居中裁剪）
  - 圆角支持：roundRect函数进行路径裁剪

#### 2.2 已有Worker系统（git staged）
- **WorkerManager.ts**：统一的Worker管理器
  - 任务类型：image-process、image-batch、canvas-render、canvas-export
  - 自动降级策略：Worker失败时使用主线程
  - 负载均衡和资源管理
- **ImageWorker.ts**：图片处理Worker
  - 图片变换和裁剪
  - 批量处理支持
- **RenderWorker.ts**：Canvas渲染Worker
  - OffscreenCanvas渲染
  - 预览和导出模式
- **设计原则**：Linus哲学 - 消除特殊情况、零配置启动、简洁错误处理

### 3. 项目约定

#### 3.1 命名约定
- **文件名**：PascalCase（组件）、camelCase（工具函数）
- **类型定义**：PascalCase接口和类型
- **变量/函数**：camelCase
- **常量**：UPPER_SNAKE_CASE
- **组件命名**：使用描述性名称，如LayoutPanel、CanvasRenderer

#### 3.2 文件组织
```
src/
├── components/        # Vue组件
│   ├── Sidebar/      # 工具栏组件
│   ├── Canvas/       # 画布组件
│   └── Properties/   # 属性栏组件
├── core/             # 核心模型
│   └── models/       # 类型定义
├── store/            # 状态管理（Pinia）
├── layout/           # 布局计算
├── processing/       # 图片处理
├── rendering/        # Canvas渲染
├── history/          # 历史管理
└── workers/          # Web Workers
```

#### 3.3 代码风格
- 使用TypeScript严格模式
- 所有注释使用简体中文
- 组件使用Composition API（`<script setup>`）
- 优先使用响应式组合式API（ref、reactive、computed）

### 4. 可复用组件清单

#### 4.1 从Worker系统复用
- `src/workers/WorkerManager.ts`：Worker管理器
- `src/workers/ImageWorker.ts`：图片处理
- `src/workers/RenderWorker.ts`：Canvas渲染

#### 4.2 需要创建的核心组件
- `src/core/models/`：类型定义（LayoutConfig、ImageElement、TextElement）
- `src/store/useAppStore.ts`：Pinia状态管理
- `src/layout/LayoutEngine.ts`：布局计算引擎
- `src/rendering/CanvasRenderer.ts`：Canvas渲染器
- `src/history/HistoryManager.ts`：历史管理器

### 5. 测试策略
- **测试框架**：Jest + @vue/test-utils
- **测试模式**：单元测试 + 集成测试
- **参考文件**：
  - tests/unit/workers/WorkerManager.test.ts（已存在）
  - tests/integration/WorkerIntegration.test.ts（已存在）
- **覆盖要求**：
  - 布局计算的所有分支
  - 历史管理的边界条件
  - Worker降级处理

### 6. 依赖和集成点

#### 6.1 外部依赖
- Vue 3：组件框架
- Pinia：状态管理
- TypeScript：类型系统
- Vite：构建工具
- Jest：测试框架

#### 6.2 内部依赖关系
- Store → Models（数据模型）
- Components → Store（状态访问）
- LayoutEngine → Models（布局计算）
- CanvasRenderer → LayoutEngine + Store（渲染逻辑）
- WorkerManager → ImageWorker + RenderWorker（任务分发）

#### 6.3 集成方式
- 状态管理：Pinia集中式store
- 组件通信：Props + Emits + Store
- Worker通信：PostMessage + Transferable Objects

### 7. 技术选型理由

#### 7.1 Vue 3 + Composition API
- **理由**：现代化开发体验，更好的TypeScript支持
- **优势**：响应式系统、组件化、生态成熟
- **风险**：学习曲线（对不熟悉Vue的开发者）

#### 7.2 Pinia状态管理
- **理由**：Vue 3官方推荐，替代Vuex
- **优势**：类型安全、模块化、DevTools支持
- **对比demo**：替代全局state对象，提供更好的状态追踪

#### 7.3 保留Worker系统
- **理由**：已有完善的Worker架构，支持降级
- **优势**：性能优化、非阻塞UI、代码复用
- **适配方案**：扩展任务类型，添加文字渲染支持

#### 7.4 Canvas主线程渲染 + Worker优化
- **理由**：实时交互需要主线程Canvas，重渲染使用Worker
- **策略**：
  - 预览：主线程快速渲染
  - 导出：Worker高质量渲染
  - 降级：Worker失败时主线程处理

### 8. 关键风险点

#### 8.1 性能问题
- **风险**：大尺寸图片或复杂布局导致渲染卡顿
- **缓解**：
  - 使用Worker处理重任务
  - 图片尺寸限制和缩放
  - Canvas离屏渲染

#### 8.2 浏览器兼容性
- **风险**：OffscreenCanvas、Transferable Objects支持不全
- **缓解**：WorkerManager的自动降级机制

#### 8.3 状态管理复杂度
- **风险**：撤销/重做导致状态快照过大
- **缓解**：
  - 限制历史栈大小（默认50步）
  - 使用diff优化状态存储
  - 图片引用共享，避免复制

#### 8.4 内存泄漏
- **风险**：图片对象、Canvas引用未释放
- **缓解**：
  - 组件卸载时清理资源
  - Worker自动回收机制
  - 监控内存使用

### 9. Demo关键代码分析

#### 9.1 布局定义（layouts对象）
```javascript
const layouts = {
  1: [[0, 0, 1, 1]],  // [x, y, width, height] 归一化坐标
  2: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  3: [[0, 0, 0.33, 1], [0.33, 0, 0.34, 1], [0.67, 0, 0.33, 1]],
  4: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]
};
```

#### 9.2 图片Cover裁剪逻辑（renderCanvas函数）
```javascript
const imgRatio = img.width / img.height;
const cellRatio = cellW / cellH;

if (imgRatio > cellRatio) {
  // 图片更宽，高度填满，宽度居中裁剪
  drawH = cellH;
  drawW = drawH * imgRatio;
  drawY = cellY;
  drawX = cellX - (drawW - cellW) / 2;
} else {
  // 图片更高，宽度填满，高度居中裁剪
  drawW = cellW;
  drawH = drawW / imgRatio;
  drawX = cellX;
  drawY = cellY - (drawH - cellH) / 2;
}
```

#### 9.3 圆角裁剪（roundRect函数）
```javascript
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  // ... 四个角的路径
  ctx.closePath();
}
```

### 10. 实施策略

#### 10.1 阶段划分
1. **基础设施**（Todo 1-4）：恢复项目、创建模型、设置Store
2. **核心渲染**（Todo 5-10）：组件结构、Canvas渲染、Worker集成
3. **交互增强**（Todo 11-13）：拖拽、文字编辑、历史管理
4. **导出和样式**（Todo 14-16）：导出功能、属性栏、样式实现
5. **测试和文档**（Todo 17-19）：测试、文档、验证

#### 10.2 渐进式实施
- 每完成一个模块立即验证
- 保持代码可运行状态
- 及时记录到operations-log.md

#### 10.3 验收标准
- 所有9项功能验证清单通过
- 测试覆盖率 > 80%
- 代码符合TypeScript严格模式
- 所有注释使用中文


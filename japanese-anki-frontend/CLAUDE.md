# Claude Code 项目指南 - 日语Anki卡片生成器前端

## 项目概览
基于React TypeScript的现代化前端应用，用于日语文章转Anki卡片生成，支持用户认证、任务管理和实时状态跟踪。

## 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: React Context + Hooks
- **HTTP**: Axios
- **测试**: Playwright
- **图标**: Lucide React

## 核心功能
1. **用户认证**: 注册/登录/登出，JWT Token管理
2. **文本输入**: 支持长文本，滚动条，验证
3. **单词书选择**: JLPT N1-N5 多选
4. **任务管理**: 创建、状态跟踪、队列显示
5. **文件下载**: Anki卡片包(.apkg)下载
6. **实时更新**: 5秒轮询任务状态

## 项目结构
```
src/
├── components/          # 可复用组件
│   ├── LoginModal.tsx   # 认证模态框
│   ├── Navbar.tsx       # 导航栏
│   ├── TaskQueue.tsx    # 任务队列
│   └── TextInputSection.tsx  # 输入区域
├── contexts/            # 全局状态
│   └── AuthContext.tsx  # 认证状态管理
├── services/            # API服务
│   └── api.ts           # 统一API封装
├── constants/           # 配置常量
│   └── config.ts        # 应用配置
└── tests/               # 测试文件
```

## 常用命令
```bash
# 开发
npm run dev                    # 启动开发服务器
npm run build                  # 生产构建
npm run preview                # 预览构建结果

# 测试
npx playwright test           # 运行所有测试
npx playwright test tests/e2e/auth.spec.ts  # 运行特定测试
npx playwright show-report    # 查看测试报告

# 代码检查
npm run lint                  # ESLint检查
```

## API集成
- 基础URL: `http://localhost:5000`
- 认证: JWT Token存储在localStorage
- 主要端点:
  - `/api/auth/*` - 用户认证
  - `/api/tasks/*` - 任务管理
  - `/api/download/*` - 文件下载

## 开发规范
- 使用TypeScript严格模式
- 组件使用函数式组件 + Hooks
- 状态管理优先使用Context而非全局状态
- API调用统一封装在services/api.ts
- 样式使用Tailwind CSS原子类
- 测试使用Playwright E2E测试

## 测试策略
- **E2E测试**: 覆盖用户完整流程
- **手动测试**: 详细测试计划见TEST_PLAN.md
- **响应式测试**: 桌面端和移动端

## 部署配置
- 开发端口: 5173
- 生产构建: dist/
- 环境变量: VITE_API_BASE_URL
- 后端依赖: 需要运行在5000端口的后端服务

## 常见问题
1. **CORS问题**: 确保后端正确配置CORS
2. **Token过期**: 401错误会自动清除token并重定向
3. **构建优化**: 使用Vite的代码分割功能
4. **样式问题**: 检查Tailwind配置和类名
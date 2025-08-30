# 日语Anki卡片生成器 - 前端

基于React TypeScript构建的现代化前端应用，用于日语文章转Anki卡片生成。

## 🚀 功能特性

### 核心功能
- ✅ **用户认证**: 注册、登录、登出
- ✅ **文本输入**: 支持长文本输入，带滚动条
- ✅ **单词书选择**: JLPT N1-N5 多选功能
- ✅ **任务管理**: 创建、跟踪、管理解析任务
- ✅ **文件下载**: 生成Anki卡片包(APKG格式)
- ✅ **实时状态**: 任务进度实时更新

### 用户体验
- 🎨 现代化UI设计，简洁美观
- 📱 响应式布局，适配桌面端和移动端
- ⚡ 即时反馈，操作状态实时显示
- 🛡️ 友好的错误处理和验证

## 🏁 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
cd japanese-anki-frontend
npm install
```

### 启动开发服务器
```bash
npm run dev
```
应用将在 http://localhost:5173 启动

### 生产环境构建
```bash
npm run build
```

## 📖 使用说明

### 1. 用户注册/登录
- 点击右上角"登录/注册"
- 新用户选择"注册"，填写用户名、邮箱和密码
- 已注册用户直接登录
- 登录后右上角显示用户名和登出按钮

### 2. 创建任务
1. **输入文本**: 在左侧大文本框中输入日语文本
2. **选择单词书**: 勾选需要的JLPT等级(N1-N5)
3. **提交任务**: 点击"开始制作单词卡片"
4. **等待处理**: 任务会自动添加到队列中

### 3. 下载卡片
1. **查看状态**: 在右侧任务队列中查看任务进度
2. **下载文件**: 任务完成后点击"下载"按钮
3. **导入Anki**: 将下载的.apkg文件导入Anki

## 🏗️ 项目结构

```
japanese-anki-frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── LoginModal.tsx   # 登录/注册模态框
│   │   ├── Navbar.tsx       # 顶部导航栏
│   │   ├── TaskQueue.tsx    # 任务队列组件
│   │   └── TextInputSection.tsx  # 文本输入区域
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx  # 认证状态管理
│   ├── services/            # API服务
│   │   └── api.ts           # API调用封装
│   ├── constants/           # 常量配置
│   │   └── config.ts        # 应用配置
│   └── tests/               # 测试文件
├── playwright.config.ts     # Playwright配置
└── package.json
```

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: React Context + Hooks
- **HTTP客户端**: Axios
- **测试**: Playwright
- **图标**: Lucide React

## 🔧 开发配置

### 环境变量
创建 `.env` 文件：
```
VITE_API_BASE_URL=http://localhost:5000
```

### 后端服务
确保后端服务运行在 http://localhost:5000

## 🧪 测试

### 测试覆盖
- ✅ 用户认证流程
- ✅ 任务创建与管理
- ✅ UI布局与响应式设计
- ✅ 集成测试

### 运行测试
```bash
# 运行所有测试
npm run test:e2e

# 运行特定测试
npx playwright test tests/e2e/auth.spec.ts
```

详细测试计划见 `TEST_PLAN.md`

## 📱 兼容性

- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **设备**: 桌面端、平板端、移动端

## 🚀 部署

### 生产环境
1. 构建项目: `npm run build`
2. 部署构建文件到Web服务器
3. 配置反向代理到API服务

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📄 许可证

MIT License

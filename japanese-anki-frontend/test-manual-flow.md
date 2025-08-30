# 真实用户流程测试指南

## 测试账户
- 用户名: `testuser_actual`
- 邮箱: `actual@test.com`
- 密码: `testpass123`

## 完整测试步骤

### 1. 注册新用户
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_actual","email":"actual@test.com","password":"testpass123"}'
```

### 2. 登录验证
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_actual","password":"testpass123"}'
```

### 3. 浏览器手动测试流程

1. **访问前端**: http://localhost:5173
2. **点击登录/注册**: 右上角按钮
3. **输入注册信息**:
   - 用户名: `testuser_actual`
   - 邮箱: `actual@test.com`
   - 密码: `testpass123`
4. **选择等级**: 勾选 N4 和 N5
5. **输入文本**:
```
こんにちは。今日は良い天気です。
私は日本語を勉強しています。
寿司が大好きです。
```
6. **创建任务**: 点击
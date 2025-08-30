# Real User Flow Testing Guide

## Test Account
- Username: `testuser_actual`
- Email: `actual@test.com`
- Password: `testpass123`

## Complete Test Steps

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_actual","email":"actual@test.com","password":"testpass123"}'
```

### 2. Login Verification
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_actual","password":"testpass123"}'
```

### 3. Browser Manual Testing Process

1. **Visit Frontend**: http://localhost:5173
2. **Click Login/Register**: Top right button
3. **Enter Registration Info**:
   - Username: `testuser_actual`
   - Email: `actual@test.com`
   - Password: `testpass123`
4. **Select Levels**: Check N4 and N5
5. **Input Text**:
```
こんにちは。今日は良い天気です。
私は日本語を勉強しています。
寿司が大好きです。
```
6. **Create Task**: Click "Generate Flashcards"
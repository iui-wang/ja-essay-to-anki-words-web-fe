// 真实端到端测试脚本
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_USER = {
  username: 'testuser123456',
  email: 'test123456@test.com',
  password: 'testpass123'
};

const TEST_JAPANESE_TEXT = 'こんにちは。今日は良い天気です。私は日本語を勉強しています。寿司が大好きです。';

// 模拟真实用户操作步骤
async function runRealE2ETest() {
  console.log('🚀 开始真实端到端测试...');
  
  // 步骤1: 验证用户注册
  console.log('1️⃣ 验证用户注册...');
  const registerResponse = await registerUser(TEST_USER);
  if (!registerResponse.success) {
    console.log('用户已存在，使用现有用户...');
  }
  
  // 步骤2: 验证用户登录
  console.log('2️⃣ 验证用户登录...');
  const loginResponse = await loginUser(TEST_USER);
  if (!loginResponse.success) {
    throw new Error('登录失败: ' + loginResponse.message);
  }
  
  const token = loginResponse.data.token;
  console.log('✅ 登录成功，获取token');
  
  // 步骤3: 创建任务
  console.log('3️⃣ 创建任务...');
  const taskResponse = await createTask(token, TEST_JAPANESE_TEXT, ['N4', 'N5']);
  if (!taskResponse.success) {
    throw new Error('任务创建失败: ' + taskResponse.message);
  }
  
  const taskId = taskResponse.data.task_id;
  console.log('✅ 任务创建成功，任务ID:', taskId);
  
  // 步骤4: 轮询任务状态
  console.log('4️⃣ 轮询任务状态...');
  let taskStatus = await waitForTaskCompletion(token, taskId);
  console.log('✅ 任务状态:', taskStatus.status);
  
  // 步骤5: 下载文件
  console.log('5️⃣ 下载文件...');
  const downloadSuccess = await downloadTaskFile(token, taskId);
  if (downloadSuccess) {
    console.log('✅ 文件下载成功！');
  }
  
  console.log('🎉 完整端到端测试完成！');
  
  return {
    user: TEST_USER,
    taskId: taskId,
    status: taskStatus,
    token: token
  };
}

// API调用函数
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function registerUser(user) {
  return await apiCall('http://localhost:5000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(user)
  });
}

async function loginUser(user) {
  return await apiCall('http://localhost:5000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: user.username,
      password: user.password
    })
  });
}

async function createTask(token, text, levels) {
  return await apiCall('http://localhost:5000/api/tasks/create', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      text: text,
      jlpt_levels: levels,
      task_name: `测试任务_${Date.now()}`
    })
  });
}

async function getTaskStatus(token, taskId) {
  return await apiCall(`http://localhost:5000/api/tasks/${taskId}/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

async function downloadTaskFile(token, taskId) {
  try {
    const response = await fetch(`http://localhost:5000/api/download/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function waitForTaskCompletion(token, taskId) {
  let attempts = 0;
  const maxAttempts = 12; // 2分钟
  
  while (attempts < maxAttempts) {
    const status = await getTaskStatus(token, taskId);
    console.log(`   第${attempts + 1}次检查: ${status.data?.status || '未知'}`);
    
    if (status.data?.status === 'completed') {
      return status.data;
    }
    
    if (status.data?.status === 'failed') {
      throw new Error('任务处理失败');
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
  }
  
  throw new Error('任务超时未完成');
}

// 运行测试
if (require.main === module) {
  runRealE2ETest()
    .then(result => {
      console.log('\n✅ 测试成功！');
      console.log('用户:', result.user.username);
      console.log('任务ID:', result.taskId);
      console.log('最终状态:', result.status.status);
    })
    .catch(error => {
      console.error('\n❌ 测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = { runRealE2ETest };
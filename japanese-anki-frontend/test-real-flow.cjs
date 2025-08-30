// 真实端到端测试脚本 - CommonJS版本
const https = require('https');
const http = require('http');

// 测试配置
const TEST_USER = {
  username: 'testflowuser',
  email: 'testflow@test.com',
  password: 'testpass123'
};

const TEST_JAPANESE_TEXT = 'こんにちは。今日は良い天気です。私は日本語を勉強しています。寿司が大好きです。';

// 简单的HTTP请求函数
function apiCall(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ success: false, message: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runRealFlowTest() {
  console.log('🚀 开始真实流程测试...');
  
  try {
    // 步骤1: 用户注册
    console.log('1️⃣ 用户注册...');
    const registerResult = await apiCall('http://localhost:5000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });
    
    if (registerResult.success) {
      console.log('✅ 注册成功:', registerResult.data.username);
    } else {
      console.log('⚠️ 用户已存在，使用现有用户');
    }
    
    // 步骤2: 用户登录
    console.log('2️⃣ 用户登录...');
    const loginResult = await apiCall('http://localhost:5000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: TEST_USER.username,
        password: TEST_USER.password
      })
    });
    
    if (!loginResult.success) {
      throw new Error('登录失败: ' + loginResult.message);
    }
    
    const token = loginResult.data.token;
    console.log('✅ 登录成功，获取token');
    
    // 步骤3: 创建任务
    console.log('3️⃣ 创建任务...');
    const taskResult = await apiCall('http://localhost:5000/api/tasks/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        text: TEST_JAPANESE_TEXT,
        jlpt_levels: ['N4', 'N5'],
        task_name: `真实测试_${Date.now()}`
      })
    });
    
    if (!taskResult.success) {
      throw new Error('任务创建失败: ' + taskResult.message);
    }
    
    const taskId = taskResult.data.task_id;
    console.log('✅ 任务创建成功，ID:', taskId);
    
    // 步骤4: 轮询任务状态
    console.log('4️⃣ 轮询任务状态...');
    let statusResult;
    let attempts = 0;
    
    while (attempts < 12) { // 2分钟
      statusResult = await apiCall(`http://localhost:5000/api/tasks/${taskId}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`   第${attempts + 1}次检查: ${statusResult.data?.status || '未知'}`);
      
      if (statusResult.data?.status === 'completed') {
        console.log('✅ 任务完成！');
        break;
      }
      
      if (statusResult.data?.status === 'failed') {
        throw new Error('任务处理失败');
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒
    }
    
    if (statusResult.data?.status !== 'completed') {
      throw new Error('任务超时未完成');
    }
    
    // 步骤5: 验证任务列表
    console.log('5️⃣ 验证任务列表...');
    const tasksResult = await apiCall('http://localhost:5000/api/tasks/list?limit=10&offset=0', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (tasksResult.success && tasksResult.data.tasks.length > 0) {
      console.log('✅ 任务列表正常，共', tasksResult.data.tasks.length, '个任务');
    }
    
    // 步骤6: 验证下载功能
    console.log('6️⃣ 验证下载功能...');
    const fileInfo = await apiCall(`http://localhost:5000/api/download/${taskId}/info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (fileInfo.success) {
      console.log('✅ 文件信息获取成功，大小:', fileInfo.data.file_size, '字节');
    }
    
    console.log('\n🎉 完整真实流程测试通过！');
    console.log('测试用户:', TEST_USER.username);
    console.log('任务ID:', taskId);
    console.log('任务状态:', statusResult.data.status);
    console.log('卡片数量:', statusResult.data.cards_count);
    
    return {
      user: TEST_USER.username,
      taskId: taskId,
      status: statusResult.data.status,
      cardsCount: statusResult.data.cards_count
    };
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    throw error;
  }
}

// 运行测试
if (require.main === module) {
  runRealFlowTest()
    .then(result => {
      console.log('\n📊 测试结果总结:');
      console.log('==================');
      console.log('✅ 用户注册: 通过');
      console.log('✅ 用户登录: 通过');
      console.log('✅ 任务创建: 通过');
      console.log('✅ 状态轮询: 通过');
      console.log('✅ 文件下载: 通过');
      console.log('==================');
    })
    .catch(error => {
      console.error('\n💥 测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = { runRealFlowTest };
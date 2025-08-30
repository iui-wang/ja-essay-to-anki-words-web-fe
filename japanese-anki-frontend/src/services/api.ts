import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = 'http://32d064c9.r3.cpolar.top';

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  username: string;
  expires_in: number;
}

export interface Task {
  task_id: string;
  task_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  jlpt_levels: string[];
  created_at: string;
  completed_at?: string;
  cards_count?: number;
  file_size?: number;
  result?: {
    cards_count: number;
    file_size: number;
  };
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  processing_tasks: number;
  failed_tasks: number;
  total_cards: number;
  running_tasks: number;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // 请求拦截器添加token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器处理错误
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 认证相关
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.client.post('/api/auth/login', { username, password });
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      // 提取后端返回的详细错误信息
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('用户名或密码错误');
      } else if (error.response?.status === 400) {
        throw new Error('请求格式错误，请检查输入');
      } else if (error.response?.status === 429) {
        throw new Error('登录尝试过于频繁，请稍后再试');
      } else if (error.response?.status >= 500) {
        throw new Error('服务器内部错误，请稍后重试');
      } else {
        throw new Error('网络连接失败，请检查网络后重试');
      }
    }
  }

  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.client.post('/api/auth/register', { username, email, password });
      if (response.data?.user_id) {
        // 注册成功后自动登录
        const loginResponse = await this.login(username, password);
        return loginResponse;
      }
      return response.data;
    } catch (error: any) {
      // 提取后端返回的详细错误信息
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.username) {
        throw new Error(`用户名问题: ${error.response.data.username.join(', ')}`);
      } else if (error.response?.data?.email) {
        throw new Error(`邮箱问题: ${error.response.data.email.join(', ')}`);
      } else if (error.response?.data?.password) {
        throw new Error(`密码问题: ${error.response.data.password.join(', ')}`);
      } else if (error.response?.status === 409) {
        throw new Error('用户名或邮箱已被注册');
      } else if (error.response?.status === 400) {
        throw new Error('注册信息格式错误，请检查输入');
      } else if (error.response?.status >= 500) {
        throw new Error('服务器内部错误，请稍后重试');
      } else {
        throw new Error('网络连接失败，请检查网络后重试');
      }
    }
  }

  async logout() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await this.client.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('auth_token');
  }

  async getProfile(): Promise<{ success: boolean; data?: User; message?: string }> {
    return this.client.get('/api/auth/profile').then(res => res.data);
  }

  // 任务相关
  async createTask(text: string, jlptLevels: string[], taskName: string) {
    return this.client.post('/api/tasks/create', {
      text,
      jlpt_levels: jlptLevels,
      task_name: taskName
    }).then(res => res.data);
  }

  async getTaskStatus(taskId: string) {
    return this.client.get(`/api/tasks/${taskId}/status`).then(res => res.data);
  }

  async getTasks(limit: number = 20, offset: number = 0) {
    return this.client.get(`/api/tasks/list?limit=${limit}&offset=${offset}`).then(res => res.data);
  }

  async getStats() {
    return this.client.get('/api/tasks/stats').then(res => res.data);
  }

  // 下载相关
  async downloadFile(taskId: string): Promise<Blob> {
    const response = await this.client.get(`/api/download/${taskId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async getFileInfo(taskId: string) {
    return this.client.get(`/api/download/${taskId}/info`).then(res => res.data);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const api = new ApiService();
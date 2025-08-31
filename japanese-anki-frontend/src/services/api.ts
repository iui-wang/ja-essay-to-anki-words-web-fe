import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = 'http://4e19b9c5.r3.cpolar.top';

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

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          // 只在开发环境下重定向，生产环境由组件处理
          if (import.meta.env.DEV) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication related
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.client.post('/api/auth/login', { username, password });
      if (response.data?.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      return response.data.data;
    } catch (error: any) {
      // Extract detailed error messages from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request format, please check input');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts, please try again later');
      } else if (error.response?.status >= 500) {
        throw new Error('Server internal error, please try again later');
      } else {
        throw new Error('Network connection failed, please check your network and try again');
      }
    }
  }

  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.client.post('/api/auth/register', { username, email, password });
      if (response.data?.data?.user_id) {
        // Auto login after successful registration
        const loginResponse = await this.login(username, password);
        return loginResponse;
      }
      return response.data.data;
    } catch (error: any) {
      // Extract detailed error messages from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.username) {
        throw new Error(`Username issue: ${error.response.data.username.join(', ')}`);
      } else if (error.response?.data?.email) {
        throw new Error(`Email issue: ${error.response.data.email.join(', ')}`);
      } else if (error.response?.data?.password) {
        throw new Error(`Password issue: ${error.response.data.password.join(', ')}`);
      } else if (error.response?.status === 409) {
        throw new Error('Username or email already registered');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid registration format, please check input');
      } else if (error.response?.status >= 500) {
        throw new Error('Server internal error, please try again later');
      } else {
        throw new Error('Network connection failed, please check your network and try again');
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

  // Task related
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

  // Download related
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
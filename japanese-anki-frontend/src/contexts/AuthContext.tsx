import { createContext, useContext, useEffect, useState } from 'react';
import { api, type User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (username: string, email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (api.isAuthenticated()) {
      try {
        const response = await api.getProfile();
        if (response?.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  };

  const login = async (username: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      const response = await api.login(username, password);
      if (response?.token) {
        await checkAuth();
        return { success: true };
      }
      return { success: false, error: '登录失败，请重试' };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || '登录失败，请重试' };
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      const response = await api.register(username, email, password);
      if (response?.user_id) {
        await checkAuth();
        return { success: true };
      }
      return { success: false, error: '注册失败，请重试' };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message || '注册失败，请重试' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
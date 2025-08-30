import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Japanese Anki Card Generator</h1>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  // 触发登录模态框的事件
                  const event = new CustomEvent('showLoginModal');
                  window.dispatchEvent(event);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Login/Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
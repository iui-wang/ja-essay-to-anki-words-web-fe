import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { TextInputSection } from './components/TextInputSection';
import { TaskQueue } from './components/TaskQueue';
import { api, type Task } from './services/api';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['N4', 'N5']);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };

    window.addEventListener('showLoginModal', handleShowLoginModal);
    return () => {
      window.removeEventListener('showLoginModal', handleShowLoginModal);
    };
  }, []);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!text.trim()) {
      alert('Please enter Japanese text');
      return;
    }

    if (selectedLevels.length === 0) {
      alert('Please select at least one word book');
      return;
    }

    setLoading(true);
    try {
      const taskName = `Task_${new Date().toLocaleString('en-US')}`;
      const response = await api.createTask(text, selectedLevels, taskName);
      
      if (response?.data?.task_id) {
        setText('');
        // 重新加载任务列表
        const tasksResponse = await api.getTasks();
        if (tasksResponse?.data?.tasks) {
          setTasks(tasksResponse.data.tasks);
        }
      } else {
        alert('Failed to create task: ' + (response?.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task, please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (taskId: string, taskName: string) => {
    try {
      const blob = await api.downloadFile(taskId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${taskName}.apkg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Download failed, please try again later');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="card">
              <TextInputSection
                text={text}
                setText={setText}
                selectedLevels={selectedLevels}
                setSelectedLevels={setSelectedLevels}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>

          <div className="w-80">
            <div className="card">
              <TaskQueue
                tasks={tasks}
                setTasks={setTasks}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

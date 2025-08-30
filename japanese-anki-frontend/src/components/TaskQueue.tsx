import { useState, useEffect } from 'react';
import { Download, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api, Task } from '../services/api';
import { POLLING_INTERVAL } from '../constants/config';

interface TaskQueueProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onDownload: (taskId: string, taskName: string) => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({ tasks, setTasks, onDownload }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    // Poll processing tasks
    const processingTasks = tasks.filter(task => task.status === 'processing' || task.status === 'pending');
    
    if (processingTasks.length > 0) {
      const interval = setInterval(() => {
        processingTasks.forEach(task => {
          updateTaskStatus(task.task_id);
        });
      }, POLLING_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.getTasks();
      if (response?.data?.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string) => {
    try {
      const response = await api.getTaskStatus(taskId);
      if (response?.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.task_id === taskId ? response.data : task
          )
        );
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-80">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Task Queue</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks</p>
          <p className="text-sm mt-1">Tasks will appear here after creation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.task_id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate flex-1">
                  {task.task_name}
                </h4>
                <div className="ml-2">
                  {getStatusIcon(task.status)}
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <p>{getStatusText(task.status)}</p>
                <p>{formatDate(task.created_at)}</p>
                <p>Levels: {task.jlpt_levels.join(', ')}</p>
                
                {task.status === 'processing' && task.progress !== undefined && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">{task.progress}% complete</p>
                  </div>
                )}

                {task.status === 'completed' && task.cards_count && (
                  <>
                    <p>{task.cards_count} cards</p>
                    {task.file_size && <p>{formatFileSize(task.file_size)}</p>}
                  </>
                )}
              </div>

              {task.status === 'completed' && (
                <button
                  onClick={() => onDownload(task.task_id, task.task_name)}
                  className="mt-3 w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
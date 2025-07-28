import React, { useEffect, useState } from 'react';
import { tasksAPI } from '../utils/api';
import { CheckSquare, Plus, Calendar, Clock, AlertTriangle } from 'lucide-react';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await tasksAPI.complete(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  const pendingTasks = tasks.filter(task => !task.is_completed);
  const completedTasks = tasks.filter(task => task.is_completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Tasks</h1>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Pending</p>
              <p className="text-2xl font-semibold text-secondary-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Completed</p>
              <p className="text-2xl font-semibold text-secondary-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total</p>
              <p className="text-2xl font-semibold text-secondary-900">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="card">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No tasks found
            </h3>
            <p className="text-secondary-500">
              {filter === 'all' 
                ? "Create your first task to get started."
                : `No ${filter} tasks at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, onComplete }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;
  const dueDate = task.due_date ? new Date(task.due_date) : null;

  const priorityColors = {
    low: 'bg-success-500',
    medium: 'bg-warning-500', 
    high: 'bg-danger-500'
  };

  return (
    <div className={`p-4 border rounded-lg ${
      task.is_completed 
        ? 'border-success-200 bg-success-50' 
        : isOverdue
        ? 'border-danger-200 bg-danger-50'
        : 'border-secondary-200 bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={onComplete}
              disabled={task.is_completed}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                task.is_completed
                  ? 'border-success-500 bg-success-500'
                  : 'border-secondary-300 hover:border-primary-500'
              }`}
            >
              {task.is_completed && (
                <CheckSquare className="w-3 h-3 text-white" />
              )}
            </button>
            
            <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
            
            <div className="flex-1">
              <h4 className={`font-medium ${
                task.is_completed 
                  ? 'text-success-900 line-through' 
                  : isOverdue
                  ? 'text-danger-900'
                  : 'text-secondary-900'
              }`}>
                {task.title}
              </h4>
              
              {task.description && (
                <p className="text-secondary-600 text-sm mt-1">{task.description}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                {dueDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className={isOverdue ? 'text-danger-600' : ''}>
                      {dueDate.toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {task.estimated_hours && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{task.estimated_hours}h estimated</span>
                  </div>
                )}
                
                {isOverdue && (
                  <div className="flex items-center space-x-1 text-danger-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Overdue</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <span className={`badge ${
            task.priority === 'high' ? 'badge-danger' :
            task.priority === 'medium' ? 'badge-warning' : 'badge-success'
          }`}>
            {task.priority}
          </span>
          
          {task.is_completed && task.completed_at && (
            <span className="text-xs text-success-600">
              Completed {new Date(task.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;
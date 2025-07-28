import React, { useEffect, useState } from 'react';
import { analyticsAPI, tasksAPI, habitsAPI } from '../utils/api';
import useAppStore from '../store/appStore';
import { CheckCircle, Clock, Target, TrendingUp, Brain, Calendar } from 'lucide-react';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, tasksRes, habitsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        tasksAPI.getToday(),
        habitsAPI.getToday()
      ]);

      setAnalytics(analyticsRes.data);
      setTodayTasks(tasksRes.data);
      setTodayHabits(habitsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <div className="text-sm text-secondary-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={analytics?.total_tasks || 0}
          subtitle={`${Math.round(analytics?.completion_rate || 0)}% completed`}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="This Week"
          value={analytics?.completed_this_week || 0}
          subtitle={`${Math.round(analytics?.weekly_completion_rate || 0)}% completion rate`}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Active Habits"
          value={analytics?.active_habits || 0}
          subtitle={`${Math.round(analytics?.habit_consistency || 0)}% consistency`}
          icon={Target}
          color="warning"
        />
        <StatCard
          title="AI Insights"
          value="3"
          subtitle="New suggestions"
          icon={Brain}
          color="secondary"
        />
      </div>

      {/* Today's Tasks & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Today's Tasks</h2>
            <Clock className="h-5 w-5 text-secondary-400" />
          </div>
          
          {todayTasks.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No tasks for today</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              {todayTasks.length > 5 && (
                <p className="text-sm text-secondary-500 text-center">
                  +{todayTasks.length - 5} more tasks
                </p>
              )}
            </div>
          )}
        </div>

        {/* Today's Habits */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Today's Habits</h2>
            <Target className="h-5 w-5 text-secondary-400" />
          </div>
          
          {todayHabits.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No habits tracked</p>
          ) : (
            <div className="space-y-3">
              {todayHabits.map((habitStatus) => (
                <HabitItem key={habitStatus.habit.id} habitStatus={habitStatus} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            title="Add Task"
            description="Create a new task"
            onClick={() => {/* TODO: Open task modal */}}
          />
          <QuickActionButton
            title="Log Habit"
            description="Quick habit check-in"
            onClick={() => {/* TODO: Open habit modal */}}
          />
          <QuickActionButton
            title="View Roadmap"
            description="Check learning progress"
            onClick={() => {/* TODO: Navigate to roadmaps */}}
          />
          <QuickActionButton
            title="AI Insights"
            description="Get personalized tips"
            onClick={() => {/* TODO: Open AI assistant */}}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    success: 'text-success-600 bg-success-100',
    primary: 'text-primary-600 bg-primary-100',
    warning: 'text-warning-600 bg-warning-100',
    secondary: 'text-secondary-600 bg-secondary-100',
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900">{value}</p>
          <p className="text-sm text-secondary-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task }) {
  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-secondary-50 rounded">
      <div className="flex-shrink-0">
        <div className={`h-3 w-3 rounded-full ${
          task.priority === 'high' ? 'bg-danger-500' :
          task.priority === 'medium' ? 'bg-warning-500' : 'bg-success-500'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-secondary-900 truncate">
          {task.title}
        </p>
        <p className="text-sm text-secondary-500">
          {task.estimated_hours && `${task.estimated_hours}h`}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={`badge ${
          task.priority === 'high' ? 'badge-danger' :
          task.priority === 'medium' ? 'badge-warning' : 'badge-success'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

function HabitItem({ habitStatus }) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-secondary-50 rounded">
      <div className="flex items-center space-x-3">
        <div className={`h-4 w-4 rounded-full border-2 ${
          habitStatus.completed 
            ? 'bg-success-500 border-success-500' 
            : 'border-secondary-300'
        }`}>
          {habitStatus.completed && (
            <CheckCircle className="h-4 w-4 text-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-900">
            {habitStatus.habit.name}
          </p>
          <p className="text-xs text-secondary-500">
            {habitStatus.habit.category}
          </p>
        </div>
      </div>
      {habitStatus.rating && (
        <div className="text-sm text-secondary-500">
          {habitStatus.rating}/10
        </div>
      )}
    </div>
  );
}

function QuickActionButton({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-4 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
    >
      <p className="text-sm font-medium text-secondary-900">{title}</p>
      <p className="text-xs text-secondary-500 mt-1">{description}</p>
    </button>
  );
}

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../utils/api';
import { BarChart3, TrendingUp, Target, Calendar, Award } from 'lucide-react';

function Analytics() {
  const [analytics, setAnalytics] = useState({
    overview: {},
    productivity: {},
    habits: {},
    streaks: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [overviewRes, productivityRes, habitsRes, streaksRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getProductivity(),
        analyticsAPI.getHabits(),
        analyticsAPI.getStreaks()
      ]);

      setAnalytics({
        overview: overviewRes.data,
        productivity: productivityRes.data,
        habits: habitsRes.data,
        streaks: streaksRes.data
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'productivity', name: 'Productivity', icon: TrendingUp },
    { id: 'habits', name: 'Habits', icon: Target },
    { id: 'streaks', name: 'Streaks', icon: Award },
  ];

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
        <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
        <div className="text-sm text-secondary-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab data={analytics.overview} />}
      {activeTab === 'productivity' && <ProductivityTab data={analytics.productivity} />}
      {activeTab === 'habits' && <HabitsTab data={analytics.habits} />}
      {activeTab === 'streaks' && <StreaksTab data={analytics.streaks} />}
    </div>
  );
}

function OverviewTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tasks"
          value={data.total_tasks || 0}
          subtitle={`${Math.round(data.completion_rate || 0)}% completed`}
          color="primary"
        />
        <MetricCard
          title="This Week"
          value={data.completed_this_week || 0}
          subtitle={`${Math.round(data.weekly_completion_rate || 0)}% completion`}
          color="success"
        />
        <MetricCard
          title="Active Habits"
          value={data.active_habits || 0}
          subtitle={`${Math.round(data.habit_consistency || 0)}% consistency`}
          color="warning"
        />
        <MetricCard
          title="Overall Score"
          value={Math.round((data.completion_rate + data.habit_consistency) / 2) || 0}
          subtitle="Performance index"
          color="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Progress Summary</h3>
          <div className="space-y-4">
            <ProgressBar
              label="Task Completion"
              value={data.completion_rate || 0}
              color="primary"
            />
            <ProgressBar
              label="Weekly Goals"
              value={data.weekly_completion_rate || 0}
              color="success"
            />
            <ProgressBar
              label="Habit Consistency"
              value={data.habit_consistency || 0}
              color="warning"
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <InsightItem
              text={`You've completed ${data.completed_tasks || 0} out of ${data.total_tasks || 0} total tasks`}
              type="info"
            />
            <InsightItem
              text={`This week you completed ${data.completed_this_week || 0} tasks`}
              type="success"
            />
            <InsightItem
              text={`You're tracking ${data.active_habits || 0} active habits`}
              type="info"
            />
            {data.habit_consistency < 70 && (
              <InsightItem
                text="Consider focusing on habit consistency to improve overall performance"
                type="warning"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductivityTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Time by Priority</h3>
          {data.time_by_priority && data.time_by_priority.length > 0 ? (
            <div className="space-y-3">
              {data.time_by_priority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <span className="text-secondary-600 capitalize">{item.priority} Priority</span>
                  <span className="font-medium text-secondary-900">{item.hours.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-8">No productivity data available yet</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Weekly Trend</h3>
          {data.weekly_trend && data.weekly_trend.length > 0 ? (
            <div className="space-y-2">
              {data.weekly_trend.map((week) => (
                <div key={week.week} className="flex items-center justify-between">
                  <span className="text-secondary-600">{week.week}</span>
                  <span className="font-medium text-secondary-900">{week.completed_tasks} tasks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-8">No trend data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function HabitsTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Habit Performance (Last 30 Days)</h3>
        {data.habits && data.habits.length > 0 ? (
          <div className="space-y-4">
            {data.habits.map((habit) => (
              <div key={habit.habit_name} className="border border-secondary-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-secondary-900">{habit.habit_name}</h4>
                  <span className="badge badge-secondary">{habit.category}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-secondary-500">Target</span>
                    <p className="font-medium">{habit.target_frequency}x/week</p>
                  </div>
                  <div>
                    <span className="text-secondary-500">Completion</span>
                    <p className="font-medium">{Math.round(habit.completion_rate)}%</p>
                  </div>
                  <div>
                    <span className="text-secondary-500">Total Entries</span>
                    <p className="font-medium">{habit.total_entries}</p>
                  </div>
                  <div>
                    <span className="text-secondary-500">Completed</span>
                    <p className="font-medium">{habit.completed_entries}</p>
                  </div>
                </div>
                <ProgressBar
                  label=""
                  value={habit.completion_rate}
                  color="success"
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 text-center py-8">No habit data available yet</p>
        )}
      </div>
    </div>
  );
}

function StreaksTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Current Streaks</h3>
        {data.streaks && data.streaks.length > 0 ? (
          <div className="space-y-4">
            {data.streaks.map((streak, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-secondary-900">{streak.type}</h4>
                  <p className="text-sm text-secondary-600">{streak.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{streak.current_streak}</p>
                  <p className="text-sm text-secondary-500">days</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 text-center py-8">No streaks data available yet</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }) {
  const colorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    secondary: 'text-secondary-600',
  };

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-secondary-600">{title}</h3>
      <p className={`text-2xl font-semibold mt-1 ${colorClasses[color]}`}>{value}</p>
      <p className="text-sm text-secondary-500 mt-1">{subtitle}</p>
    </div>
  );
}

function ProgressBar({ label, value, color, className = '' }) {
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    secondary: 'bg-secondary-500',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-secondary-600">{label}</span>
          <span className="text-secondary-900 font-medium">{Math.round(value)}%</span>
        </div>
      )}
      <div className="bg-secondary-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function InsightItem({ text, type }) {
  const typeClasses = {
    info: 'text-primary-700 bg-primary-50 border-primary-200',
    success: 'text-success-700 bg-success-50 border-success-200',
    warning: 'text-warning-700 bg-warning-50 border-warning-200',
  };

  return (
    <div className={`p-3 rounded-lg border text-sm ${typeClasses[type]}`}>
      {text}
    </div>
  );
}

export default Analytics;
import React, { useEffect, useState } from 'react';
import { habitsAPI } from '../utils/api';
import { Target, Plus, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

function Habits() {
  const [habits, setHabits] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
    loadTodayHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const response = await habitsAPI.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayHabits = async () => {
    try {
      const response = await habitsAPI.getToday();
      setTodayHabits(response.data);
    } catch (error) {
      console.error('Error loading today habits:', error);
    }
  };

  const quickLogHabit = async (habitId, completed, rating = null) => {
    try {
      await habitsAPI.quickLog(habitId, completed, rating, '');
      loadTodayHabits();
    } catch (error) {
      console.error('Error logging habit:', error);
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
        <h1 className="text-2xl font-bold text-secondary-900">Habits</h1>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Today's Check-in */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Today's Check-in</h2>
        {todayHabits.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No habits to track today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayHabits.map((habitStatus) => (
              <TodayHabitCard
                key={habitStatus.habit.id}
                habitStatus={habitStatus}
                onLog={quickLogHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Habits */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">All Habits</h2>
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No habits yet
            </h3>
            <p className="text-secondary-500">
              Create your first habit to start building consistent routines.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TodayHabitCard({ habitStatus, onLog }) {
  const { habit, completed, rating } = habitStatus;

  return (
    <div className={`p-4 border rounded-lg ${
      completed ? 'border-success-200 bg-success-50' : 'border-secondary-200 bg-white'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onLog(habit.id, !completed)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              completed
                ? 'border-success-500 bg-success-500'
                : 'border-secondary-300 hover:border-success-500'
            }`}
          >
            {completed && <CheckCircle className="w-4 h-4 text-white" />}
          </button>
          <div>
            <h3 className="font-medium text-secondary-900">{habit.name}</h3>
            <p className="text-sm text-secondary-500">{habit.category}</p>
          </div>
        </div>
      </div>

      {completed && (
        <div className="mt-3">
          <p className="text-sm text-secondary-600 mb-2">Rate your performance:</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                key={score}
                onClick={() => onLog(habit.id, true, score)}
                className={`w-6 h-6 text-xs rounded ${
                  rating === score
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
          {rating && (
            <p className="text-sm text-secondary-500 mt-1">
              Current rating: {rating}/10
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function HabitCard({ habit }) {
  return (
    <div className="p-4 border border-secondary-200 rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-secondary-900">{habit.name}</h3>
          </div>
          
          {habit.description && (
            <p className="text-secondary-600 mb-3">{habit.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-secondary-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{habit.target_frequency}x per week</span>
            </div>
            <span className="badge badge-secondary">{habit.category}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="btn btn-sm btn-secondary">View History</button>
          <button className="btn btn-sm btn-primary">Edit</button>
        </div>
      </div>

      {/* Progress indicator placeholder */}
      <div className="mt-4 pt-4 border-t border-secondary-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-600">This week's progress</span>
          <span className="text-secondary-900 font-medium">4/7 days</span>
        </div>
        <div className="mt-2 bg-secondary-200 rounded-full h-2">
          <div className="bg-success-500 h-2 rounded-full" style={{ width: '57%' }}></div>
        </div>
      </div>
    </div>
  );
}

export default Habits;
import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Roadmaps
  roadmaps: [],
  currentRoadmap: null,
  
  setRoadmaps: (roadmaps) => set({ roadmaps }),
  setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),
  
  // Tasks
  tasks: [],
  todayTasks: [],
  
  setTasks: (tasks) => set({ tasks }),
  setTodayTasks: (tasks) => set({ todayTasks: tasks }),
  
  addTask: (task) => set({ tasks: [...get().tasks, task] }),
  updateTask: (taskId, updates) => set({
    tasks: get().tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    )
  }),
  
  // Habits
  habits: [],
  todayHabits: [],
  
  setHabits: (habits) => set({ habits }),
  setTodayHabits: (habits) => set({ todayHabits: habits }),
  
  addHabit: (habit) => set({ habits: [...get().habits, habit] }),
  updateHabit: (habitId, updates) => set({
    habits: get().habits.map(habit => 
      habit.id === habitId ? { ...habit, ...updates } : habit
    )
  }),
  
  // Analytics
  analytics: {
    overview: {},
    productivity: {},
    habits: {},
    streaks: {}
  },
  
  setAnalytics: (analyticsData) => set({ 
    analytics: { ...get().analytics, ...analyticsData } 
  }),
  
  // UI State
  sidebarOpen: true,
  currentPage: 'dashboard',
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));

export default useAppStore;
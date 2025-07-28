from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from ..models.database import get_db
from ..models.models import Task, Habit, HabitEntry, User
from .auth import get_current_user

router = APIRouter()

@router.get("/overview")
def get_analytics_overview(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get analytics overview for dashboard"""
    
    # Task completion stats
    total_tasks = db.query(Task).filter(Task.owner_id == current_user.id).count()
    completed_tasks = db.query(Task).filter(Task.owner_id == current_user.id, Task.is_completed == True).count()
    
    # This week's tasks
    week_start = datetime.now() - timedelta(days=7)
    tasks_this_week = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.created_at >= week_start
    ).count()
    
    completed_this_week = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.completed_at >= week_start,
        Task.is_completed == True
    ).count()
    
    # Habit consistency
    active_habits = db.query(Habit).filter(Habit.owner_id == current_user.id, Habit.is_active == True).count()
    
    # Recent habit entries (last 7 days)
    recent_entries = db.query(HabitEntry).join(Habit).filter(
        Habit.owner_id == current_user.id,
        HabitEntry.date >= week_start
    ).count()
    
    completed_entries = db.query(HabitEntry).join(Habit).filter(
        Habit.owner_id == current_user.id,
        HabitEntry.date >= week_start,
        HabitEntry.completed == True
    ).count()
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "tasks_this_week": tasks_this_week,
        "completed_this_week": completed_this_week,
        "weekly_completion_rate": (completed_this_week / tasks_this_week * 100) if tasks_this_week > 0 else 0,
        "active_habits": active_habits,
        "habit_consistency": (completed_entries / recent_entries * 100) if recent_entries > 0 else 0
    }

@router.get("/productivity")
def get_productivity_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get productivity analytics - time spent per category"""
    
    # Time spent analysis
    time_by_priority = db.query(
        Task.priority,
        func.sum(Task.actual_hours).label('total_hours')
    ).filter(
        Task.owner_id == current_user.id,
        Task.actual_hours.isnot(None)
    ).group_by(Task.priority).all()
    
    # Weekly completion trend (last 8 weeks)
    weekly_data = []
    for i in range(8):
        week_start = datetime.now() - timedelta(weeks=i+1)
        week_end = datetime.now() - timedelta(weeks=i)
        
        completed = db.query(Task).filter(
            Task.owner_id == current_user.id,
            Task.completed_at >= week_start,
            Task.completed_at < week_end,
            Task.is_completed == True
        ).count()
        
        weekly_data.append({
            "week": f"Week {8-i}",
            "completed_tasks": completed
        })
    
    return {
        "time_by_priority": [{"priority": item.priority, "hours": float(item.total_hours or 0)} for item in time_by_priority],
        "weekly_trend": list(reversed(weekly_data))
    }

@router.get("/habits")
def get_habit_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get habit tracking analytics"""
    
    # Habit completion rates
    habits_data = []
    user_habits = db.query(Habit).filter(Habit.owner_id == current_user.id, Habit.is_active == True).all()
    
    for habit in user_habits:
        # Last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        total_entries = db.query(HabitEntry).filter(
            HabitEntry.habit_id == habit.id,
            HabitEntry.date >= thirty_days_ago
        ).count()
        
        completed_entries = db.query(HabitEntry).filter(
            HabitEntry.habit_id == habit.id,
            HabitEntry.date >= thirty_days_ago,
            HabitEntry.completed == True
        ).count()
        
        completion_rate = (completed_entries / total_entries * 100) if total_entries > 0 else 0
        
        habits_data.append({
            "habit_name": habit.name,
            "category": habit.category,
            "target_frequency": habit.target_frequency,
            "completion_rate": completion_rate,
            "total_entries": total_entries,
            "completed_entries": completed_entries
        })
    
    return {"habits": habits_data}

@router.get("/streaks")
def get_streaks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Calculate current streaks for habits and tasks"""
    
    streaks = []
    
    # Task completion streak
    task_streak = 0
    current_date = datetime.now().date()
    
    while True:
        day_tasks = db.query(Task).filter(
            Task.owner_id == current_user.id,
            func.date(Task.due_date) == current_date,
            Task.is_completed == True
        ).count()
        
        if day_tasks > 0:
            task_streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    streaks.append({
        "type": "Daily Tasks",
        "current_streak": task_streak,
        "description": f"{task_streak} days of completing at least one task"
    })
    
    return {"streaks": streaks}
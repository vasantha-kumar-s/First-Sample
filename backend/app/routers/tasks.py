from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..models.database import get_db
from ..models.models import Task, User
from ..models.schemas import Task as TaskSchema, TaskCreate
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskSchema])
def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all tasks for the current user"""
    tasks = db.query(Task).filter(Task.owner_id == current_user.id).order_by(Task.due_date).all()
    return tasks

@router.post("/", response_model=TaskSchema)
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new task"""
    db_task = Task(**task.dict(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskSchema)
def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}/complete")
def complete_task(task_id: int, actual_hours: float = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark a task as completed"""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.is_completed = True
    task.completed_at = datetime.utcnow()
    if actual_hours:
        task.actual_hours = actual_hours
    
    db.commit()
    return {"message": "Task completed successfully"}

@router.put("/{task_id}")
def update_task(task_id: int, task_update: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.get("/today/")
def get_today_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get tasks due today"""
    today = datetime.now().date()
    tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.due_date >= today,
        Task.due_date < today + timedelta(days=1),
        Task.is_completed == False
    ).order_by(Task.priority.desc()).all()
    return tasks
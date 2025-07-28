from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from ..models.database import get_db
from ..models.models import Habit, HabitEntry, User
from ..models.schemas import Habit as HabitSchema, HabitCreate, HabitEntry as HabitEntrySchema, HabitEntryCreate
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[HabitSchema])
def get_habits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all active habits for the current user"""
    habits = db.query(Habit).filter(Habit.owner_id == current_user.id, Habit.is_active == True).all()
    return habits

@router.post("/", response_model=HabitSchema)
def create_habit(habit: HabitCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new habit"""
    db_habit = Habit(**habit.dict(), owner_id=current_user.id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.get("/{habit_id}", response_model=HabitSchema)
def get_habit(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.owner_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.put("/{habit_id}")
def update_habit(habit_id: int, habit_update: HabitCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update a habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.owner_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    for key, value in habit_update.dict(exclude_unset=True).items():
        setattr(habit, key, value)
    
    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{habit_id}")
def delete_habit(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a habit (mark as inactive)"""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.owner_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habit.is_active = False
    db.commit()
    return {"message": "Habit deleted successfully"}

@router.get("/{habit_id}/entries", response_model=List[HabitEntrySchema])
def get_habit_entries(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all entries for a specific habit"""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.owner_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    entries = db.query(HabitEntry).filter(HabitEntry.habit_id == habit_id).order_by(HabitEntry.date.desc()).all()
    return entries

@router.post("/{habit_id}/entries", response_model=HabitEntrySchema)
def create_habit_entry(habit_id: int, entry: HabitEntryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new habit entry"""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.owner_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Check if entry for this date already exists
    existing_entry = db.query(HabitEntry).filter(
        HabitEntry.habit_id == habit_id,
        HabitEntry.date == entry.date.date()
    ).first()
    
    if existing_entry:
        # Update existing entry
        for key, value in entry.dict(exclude_unset=True).items():
            if key != 'habit_id':  # Don't update habit_id
                setattr(existing_entry, key, value)
        db.commit()
        db.refresh(existing_entry)
        return existing_entry
    else:
        # Create new entry
        db_entry = HabitEntry(**entry.dict())
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry

@router.get("/today/")
def get_today_habits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get today's habit status"""
    today = date.today()
    habits = db.query(Habit).filter(Habit.owner_id == current_user.id, Habit.is_active == True).all()
    
    habit_status = []
    for habit in habits:
        entry = db.query(HabitEntry).filter(
            HabitEntry.habit_id == habit.id,
            HabitEntry.date == today
        ).first()
        
        habit_status.append({
            "habit": habit,
            "completed": entry.completed if entry else False,
            "notes": entry.notes if entry else "",
            "rating": entry.rating if entry else None
        })
    
    return habit_status

@router.post("/quick-log")
def quick_log_habit(habit_id: int, completed: bool, rating: int = None, notes: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Quick log a habit for today"""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.owner_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    today = datetime.now()
    entry_data = HabitEntryCreate(
        date=today,
        completed=completed,
        rating=rating,
        notes=notes,
        habit_id=habit_id
    )
    
    # Check if entry already exists for today
    existing_entry = db.query(HabitEntry).filter(
        HabitEntry.habit_id == habit_id,
        HabitEntry.date == today.date()
    ).first()
    
    if existing_entry:
        existing_entry.completed = completed
        existing_entry.rating = rating
        existing_entry.notes = notes
        db.commit()
        return {"message": "Habit updated for today"}
    else:
        db_entry = HabitEntry(**entry_data.dict())
        db.add(db_entry)
        db.commit()
        return {"message": "Habit logged for today"}
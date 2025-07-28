from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Roadmap schemas
class RoadmapBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str

class RoadmapCreate(RoadmapBase):
    pass

class Roadmap(RoadmapBase):
    id: int
    is_predefined: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Milestone schemas
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    day: int

class MilestoneCreate(MilestoneBase):
    roadmap_id: int

class Milestone(MilestoneBase):
    id: int
    is_completed: bool
    roadmap_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"
    estimated_hours: Optional[float] = None

class TaskCreate(TaskBase):
    milestone_id: Optional[int] = None

class Task(TaskBase):
    id: int
    is_completed: bool
    actual_hours: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Habit schemas
class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    target_frequency: int

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class HabitEntryBase(BaseModel):
    date: datetime
    completed: bool
    notes: Optional[str] = None
    rating: Optional[int] = None

class HabitEntryCreate(HabitEntryBase):
    habit_id: int

class HabitEntry(HabitEntryBase):
    id: int
    habit_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
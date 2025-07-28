from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    roadmaps = relationship("Roadmap", back_populates="owner")
    tasks = relationship("Task", back_populates="owner")
    habits = relationship("Habit", back_populates="owner")

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)  # AI/MLOps, Data Science, etc.
    is_predefined = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="roadmaps")
    milestones = relationship("Milestone", back_populates="roadmap")

class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    day = Column(Integer)  # Day in the roadmap
    is_completed = Column(Boolean, default=False)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    roadmap = relationship("Roadmap", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    due_date = Column(DateTime)
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    milestone_id = Column(Integer, ForeignKey("milestones.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    owner = relationship("User", back_populates="tasks")
    milestone = relationship("Milestone", back_populates="tasks")

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    category = Column(String)  # reading, exercise, sleep, etc.
    target_frequency = Column(Integer)  # times per week
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="habits")
    entries = relationship("HabitEntry", back_populates="habit")

class HabitEntry(Base):
    __tablename__ = "habit_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    completed = Column(Boolean)
    notes = Column(Text)
    rating = Column(Integer)  # 1-10 scale
    habit_id = Column(Integer, ForeignKey("habits.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    habit = relationship("Habit", back_populates="entries")

class MLExperiment(Base):
    __tablename__ = "ml_experiments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    model_type = Column(String)
    dataset = Column(String)
    metrics = Column(Text)  # JSON string
    parameters = Column(Text)  # JSON string
    training_duration = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User")
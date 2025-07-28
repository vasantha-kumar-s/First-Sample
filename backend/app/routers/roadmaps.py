from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db
from ..models.models import Roadmap, Milestone, User
from ..models.schemas import Roadmap as RoadmapSchema, RoadmapCreate, Milestone as MilestoneSchema, MilestoneCreate
from .auth import get_current_user

router = APIRouter()

# Predefined roadmaps data
PREDEFINED_ROADMAPS = [
    {
        "title": "Become a Data Engineer in 100 Days",
        "description": "Complete roadmap to become a professional data engineer",
        "category": "Data Engineering",
        "milestones": [
            {"title": "Introduction to Data Engineering", "description": "Learn the basics of data engineering", "day": 1},
            {"title": "SQL Fundamentals", "description": "Master SQL querying and database design", "day": 5},
            {"title": "Python for Data Engineering", "description": "Learn Python libraries for data processing", "day": 15},
            {"title": "Data Warehousing", "description": "Understand data warehouse concepts", "day": 30},
            {"title": "ETL Processes", "description": "Learn Extract, Transform, Load processes", "day": 45},
            {"title": "Cloud Platforms", "description": "AWS/GCP/Azure for data engineering", "day": 60},
            {"title": "Stream Processing", "description": "Real-time data processing with Kafka", "day": 75},
            {"title": "Final Project", "description": "Build end-to-end data pipeline", "day": 90}
        ]
    },
    {
        "title": "MLOps Mastery in 90 Days",
        "description": "Comprehensive MLOps learning path",
        "category": "MLOps",
        "milestones": [
            {"title": "Introduction to MLOps", "description": "Understanding MLOps principles", "day": 1},
            {"title": "Git + DVC basics", "description": "Version control for ML projects", "day": 7},
            {"title": "Experiment Tracking", "description": "MLflow and Weights & Biases", "day": 20},
            {"title": "Model Deployment", "description": "Deploy with FastAPI and Docker", "day": 35},
            {"title": "CI/CD for ML", "description": "Automated ML pipelines", "day": 50},
            {"title": "Monitoring & Observability", "description": "Monitor model performance", "day": 65},
            {"title": "Advanced MLOps", "description": "Kubernetes and production systems", "day": 80}
        ]
    }
]

@router.get("/", response_model=List[RoadmapSchema])
def get_roadmaps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all roadmaps for the current user, including predefined ones"""
    user_roadmaps = db.query(Roadmap).filter(Roadmap.owner_id == current_user.id).all()
    predefined_roadmaps = db.query(Roadmap).filter(Roadmap.is_predefined == True).all()
    return user_roadmaps + predefined_roadmaps

@router.post("/", response_model=RoadmapSchema)
def create_roadmap(roadmap: RoadmapCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new custom roadmap"""
    db_roadmap = Roadmap(**roadmap.dict(), owner_id=current_user.id)
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap

@router.post("/predefined", response_model=str)
def seed_predefined_roadmaps(db: Session = Depends(get_db)):
    """Seed the database with predefined roadmaps (admin function)"""
    for roadmap_data in PREDEFINED_ROADMAPS:
        # Check if roadmap already exists
        existing_roadmap = db.query(Roadmap).filter(
            Roadmap.title == roadmap_data["title"],
            Roadmap.is_predefined == True
        ).first()
        
        if not existing_roadmap:
            # Create roadmap
            db_roadmap = Roadmap(
                title=roadmap_data["title"],
                description=roadmap_data["description"],
                category=roadmap_data["category"],
                is_predefined=True,
                owner_id=None
            )
            db.add(db_roadmap)
            db.commit()
            db.refresh(db_roadmap)
            
            # Create milestones
            for milestone_data in roadmap_data["milestones"]:
                db_milestone = Milestone(
                    **milestone_data,
                    roadmap_id=db_roadmap.id
                )
                db.add(db_milestone)
            db.commit()
    
    return "Predefined roadmaps seeded successfully"

@router.get("/{roadmap_id}", response_model=RoadmapSchema)
def get_roadmap(roadmap_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific roadmap"""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Check if user owns the roadmap or it's predefined
    if roadmap.owner_id != current_user.id and not roadmap.is_predefined:
        raise HTTPException(status_code=403, detail="Not authorized to view this roadmap")
    
    return roadmap

@router.get("/{roadmap_id}/milestones", response_model=List[MilestoneSchema])
def get_roadmap_milestones(roadmap_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all milestones for a roadmap"""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Check permissions
    if roadmap.owner_id != current_user.id and not roadmap.is_predefined:
        raise HTTPException(status_code=403, detail="Not authorized to view this roadmap")
    
    milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap_id).order_by(Milestone.day).all()
    return milestones

@router.post("/{roadmap_id}/milestones", response_model=MilestoneSchema)
def create_milestone(roadmap_id: int, milestone: MilestoneCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new milestone for a roadmap"""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    if roadmap.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this roadmap")
    
    db_milestone = Milestone(**milestone.dict(), roadmap_id=roadmap_id)
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.put("/milestones/{milestone_id}/complete")
def complete_milestone(milestone_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark a milestone as completed"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    roadmap = db.query(Roadmap).filter(Roadmap.id == milestone.roadmap_id).first()
    if roadmap.owner_id != current_user.id and not roadmap.is_predefined:
        raise HTTPException(status_code=403, detail="Not authorized to modify this milestone")
    
    milestone.is_completed = True
    db.commit()
    return {"message": "Milestone completed successfully"}
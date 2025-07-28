from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import roadmaps, tasks, analytics, habits, auth
from app.models.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeuroFlow API",
    description="Your Personal AI-Driven Learning Companion",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(roadmaps.router, prefix="/api/roadmaps", tags=["Roadmaps"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])

@app.get("/")
async def root():
    return {"message": "Welcome to NeuroFlow API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
# NeuroFlow: Your Personal AI-Driven Learning Companion

🧠 A Notion-like platform for personal growth, AI/MLOps learning, and daily discipline.

## Features

### Core MVP Features
- ✅ Learning Roadmap Builder
- 🧠 Personal AI Companion  
- ⏰ Task + Hourly Planner with Email Reminders
- 📈 Progress & Self-Improvement Analytics
- 🧪 MLOps Performance Journal
- 🧾 Habit Tracker & Daily Reflections
- 🔒 Local-first & Secure

## Tech Stack

- **Frontend**: React + Tailwind CSS + Zustand
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Authentication**: JWT-based
- **AI**: Local LLM integration ready
- **Analytics**: Chart.js
- **Email**: SMTP + Scheduling

## Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- SQLite

### Installation

1. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Run the application:
```bash
# Backend (from backend directory)
uvicorn main:app --reload

# Frontend (from frontend directory)
npm start
```

## Project Structure

```
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/       # Database models
│   │   ├── routers/      # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── requirements.txt
│   └── main.py
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   └── utils/        # Utilities
│   ├── package.json
│   └── public/
└── docs/                 # Documentation
```
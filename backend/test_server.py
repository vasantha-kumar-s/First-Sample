# Simple test backend without dependencies
import sqlite3
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time

class SimpleNeuroFlowAPI(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        path = urlparse(self.path).path
        
        if path == '/':
            response = {"message": "Welcome to NeuroFlow API (Test Mode)"}
        elif path == '/health':
            response = {"status": "healthy"}
        elif path == '/api/analytics/overview':
            response = {
                "total_tasks": 15,
                "completed_tasks": 12,
                "completion_rate": 80,
                "tasks_this_week": 8,
                "completed_this_week": 6,
                "weekly_completion_rate": 75,
                "active_habits": 5,
                "habit_consistency": 85
            }
        elif path.startswith('/api/roadmaps'):
            if path == '/api/roadmaps/':
                response = [
                    {
                        "id": 1,
                        "title": "Become a Data Engineer in 100 Days",
                        "description": "Complete roadmap to become a professional data engineer",
                        "category": "Data Engineering",
                        "is_predefined": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    },
                    {
                        "id": 2,
                        "title": "MLOps Mastery in 90 Days",
                        "description": "Comprehensive MLOps learning path",
                        "category": "MLOps",
                        "is_predefined": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                ]
            elif '/milestones' in path:
                response = [
                    {
                        "id": 1,
                        "title": "Introduction to Data Engineering",
                        "description": "Learn the basics of data engineering",
                        "day": 1,
                        "is_completed": False,
                        "roadmap_id": 1,
                        "created_at": "2024-01-01T00:00:00Z"
                    }
                ]
        elif path == '/api/tasks/':
            response = []
        elif path == '/api/tasks/today/':
            response = []
        elif path == '/api/habits/':
            response = []
        elif path == '/api/habits/today/':
            response = []
        else:
            response = {"error": "Endpoint not found"}
            
        self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), SimpleNeuroFlowAPI)
    print("Starting NeuroFlow Test API server on http://localhost:8000")
    print("This is a minimal test server for development")
    server.serve_forever()
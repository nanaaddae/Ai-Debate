from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.v1 import api_router
from app.database import engine, Base
from app.services.websocket_manager import ws_manager
from app.models.tag import Tag

# Import all models so they get registered
from app.models.user import User
from app.models.debate import Debate, DebateVote
from app.models.argument import Argument, Vote

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Debate Platform API",
    description="Backend API for AI-powered debate platform with RBAC",
    version="1.0.0"
)

# CORS middleware - MUST be before mounting socket
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Mount WebSocket at root level (not /ws)
socket_app = ws_manager.get_socket_app()
app.mount("/socket.io", socket_app)

@app.get("/")
def root():
    return {"message": "AI Debate Platform API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
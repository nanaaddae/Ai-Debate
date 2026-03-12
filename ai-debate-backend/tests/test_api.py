import pytest
from fastapi.testclient import TestClient
from app.main import app

# This creates a test client to make requests to your API
client = TestClient(app)

def test_health_check():
    """Test that the health endpoint works"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root_endpoint():
    """Test that the root endpoint works"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "AI Debate Platform API"

def test_get_debates_without_auth():
    """Test that anyone can view debates"""
    response = client.get("/api/v1/debates/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_debate_without_auth():
    """Test that creating debate requires authentication"""
    response = client.post("/api/v1/debates/", json={
        "topic": "Test debate",
        "description": "Test description"
    })
    assert response.status_code == 401  # Should be unauthorized
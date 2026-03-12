import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)


def test_register_new_user():
    unique_id = uuid.uuid4().hex[:6]
    response = client.post("/api/v1/auth/register", json={
        "email": f"test_{unique_id}@example.com",
        "username": f"user_{unique_id}",
        "password": "password123"
    })
    assert response.status_code == 201



def test_register_duplicate_email():
    """Test that duplicate email fails"""
    # Register first user
    client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "username": "user1",
        "password": "password123"
    })

    # Try to register again with same email
    response = client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "username": "user2",
        "password": "password123"
    })
    assert response.status_code == 400  # Should fail


def test_login_success():
    """Test successful login"""
    # First register a user
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "username": "loginuser",
        "password": "password123"
    })

    # Now login
    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    """Test login with wrong password"""
    # Register user
    client.post("/api/v1/auth/register", json={
        "email": "wrongpass@example.com",
        "username": "wronguser",
        "password": "correctpassword"
    })

    # Try to login with wrong password
    response = client.post("/api/v1/auth/login", json={
        "email": "wrongpass@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401  # Unauthorized
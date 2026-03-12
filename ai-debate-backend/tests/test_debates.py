import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_token():
    """Create a user and return auth token"""
    # Register
    client.post("/api/v1/auth/register", json={
        "email": "debater@example.com",
        "username": "debater",
        "password": "password123"
    })

    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": "debater@example.com",
        "password": "password123"
    })
    return response.json()["access_token"]


def test_create_debate_with_auth(auth_token):
    """Test creating a debate with authentication"""
    response = client.post(
        "/api/v1/debates/",
        json={
            "topic": "Should unit tests be written?",
            "description": "Testing is important",
            "tag_ids": []
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["topic"] == "Should unit tests be written?"
    assert "ai_pro_argument" in data
    assert "ai_con_argument" in data
    assert data["pro_votes"] == 0
    assert data["con_votes"] == 0


def test_vote_on_debate(auth_token):
    """Test voting on a debate"""
    # First create a debate
    create_response = client.post(
        "/api/v1/debates/",
        json={"topic": "Test voting", "description": "Test"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    debate_id = create_response.json()["id"]

    # Now vote on it
    vote_response = client.post(
        f"/api/v1/debates/{debate_id}/vote?side=pro",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert vote_response.status_code == 200
    data = vote_response.json()
    assert data["pro_votes"] == 1
    assert data["con_votes"] == 0


def test_get_specific_debate(auth_token):
    """Test retrieving a specific debate"""
    # Create debate
    create_response = client.post(
        "/api/v1/debates/",
        json={"topic": "Specific debate test"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    debate_id = create_response.json()["id"]

    # Get it
    get_response = client.get(f"/api/v1/debates/{debate_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == debate_id
    assert data["topic"] == "Specific debate test"
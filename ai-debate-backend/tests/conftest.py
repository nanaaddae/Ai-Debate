import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.main import app
from app.database import get_db

# Add the parent directory (backend) to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Create a separate test database
TEST_DATABASE_URL = "sqlite:///./test_debate_platform.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create a fresh database for each test"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop all tables after test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a new database session for a test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


# Override the get_db dependency to use test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
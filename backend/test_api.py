import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from datetime import datetime, timedelta, timezone

from main import app
from database import get_session
from models import TestReport

# Create an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})

@pytest.fixture(name="session")
def session_fixture():
    # Setup
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    # Teardown
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_and_read_report(client):
    # 1. Create a dummy report
    report_data = {
        "projectName": "TestProject",
        "authors": "Tester",
        "storyTests": 10,
        "regressionTestsAutomated": 20,
        "regressionTestsManual": 5,
        "totalTestsByApplication": 35,
        
        "storyPassed": 9,
        "storyFailed": 1,
        "storyUnexecuted": 0,
        "storyBlocked": 0,
        "storySkipped": 0,
        "storyCritical": 0,
        "storyNew": 2,
        "storyUnused": 0,
        "storyBugs": 1,
        
        "arPassed": 19,
        "arFailed": 1,
        "arUnexecuted": 0,
        "arBlocked": 0,
        "arSkipped": 0,
        "arCritical": 0,
        "arNew": 4,
        "arUnused": 0,
        "arBugs": 0,
        
        "mrPassed": 4,
        "mrFailed": 1,
        "mrUnexecuted": 0,
        "mrBlocked": 0,
        "mrSkipped": 0,
        "mrCritical": 0,
        "mrNew": 0,
        "mrUnused": 0,
        "mrBugs": 1,
        
        "createdAt": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    }
    
    response = client.post("/api/reports", json=report_data)
    assert response.status_code == 200
    data = response.json()
    assert data["projectName"] == "TestProject"
    assert data["totalTestsByApplication"] == 35
    assert data["id"] is not None

    # 2. Get projects list
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert "TestProject" in projects

    # 3. Get reports list
    response = client.get("/api/reports/TestProject")
    assert response.status_code == 200
    reports = response.json()
    assert len(reports) == 1
    assert reports[0]["authors"] == "Tester"

def test_predict_endpoint_error_if_insufficient_data(client):
    # Add just 1 report (requires at least 4 for forecasting)
    report_data = {
        "projectName": "EmptyProj",
        "authors": "Tester",
        "storyTests": 5,
        "regressionTestsAutomated": 5,
        "regressionTestsManual": 5,
        "totalTestsByApplication": 15,
        
        "storyPassed": 5, "storyFailed": 0, "storyUnexecuted": 0, "storyBlocked": 0, "storySkipped": 0,
        "storyCritical": 0, "storyNew": 0, "storyUnused": 0, "storyBugs": 0,
        "arPassed": 5, "arFailed": 0, "arUnexecuted": 0, "arBlocked": 0, "arSkipped": 0,
        "arCritical": 0, "arNew": 0, "arUnused": 0, "arBugs": 0,
        "mrPassed": 5, "mrFailed": 0, "mrUnexecuted": 0, "mrBlocked": 0, "mrSkipped": 0,
        "mrCritical": 0, "mrNew": 0, "mrUnused": 0, "mrBugs": 0
    }
    client.post("/api/reports", json=report_data)
    
    response = client.post("/api/predict/EmptyProj")
    assert response.status_code == 400
    assert "Insufficient data" in response.json()["detail"]

def test_predict_successful_forecast(client):
    # Seed 10 reports to allow prediction
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for w in range(10):
        date = now - timedelta(weeks=10-w)
        report_data = {
            "projectName": "PredictProj",
            "authors": "AI Forecaster",
            "storyTests": 10 + w,
            "regressionTestsAutomated": 20 + w * 2,
            "regressionTestsManual": 10,
            "totalTestsByApplication": 40 + w * 3,
            
            "storyPassed": 8 + w, "storyFailed": 2, "storyUnexecuted": 0, "storyBlocked": 0, "storySkipped": 0,
            "storyCritical": 1, "storyNew": 2, "storyUnused": 0, "storyBugs": 1,
            "arPassed": 18 + w * 2, "arFailed": 2, "arUnexecuted": 0, "arBlocked": 0, "arSkipped": 0,
            "arCritical": 1, "arNew": 4, "arUnused": 0, "arBugs": 1,
            "mrPassed": 8, "mrFailed": 2, "mrUnexecuted": 0, "mrBlocked": 0, "mrSkipped": 0,
            "mrCritical": 0, "mrNew": 0, "mrUnused": 0, "mrBugs": 1,
            "createdAt": date.isoformat()
        }
        client.post("/api/reports", json=report_data)
        
    response = client.post("/api/predict/PredictProj")
    assert response.status_code == 200
    data = response.json()
    assert data["projectName"] == "PredictProj"
    assert "forecast" in data
    assert "storyTests" in data["forecast"]
    
    story_forecast = data["forecast"]["storyTests"]
    assert "predicted_value" in story_forecast
    assert "current_average" in story_forecast
    assert "percentage_change" in story_forecast
    assert "explainability" in story_forecast
    assert len(story_forecast["explainability"]) > 0

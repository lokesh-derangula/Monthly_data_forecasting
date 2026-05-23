import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Dict, Any
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from database import engine, create_db_and_tables, get_session
from models import TestReport, TestReportCreate, PredictionResponse
from seed import reset_db_and_reseed, generate_historical_data
from forecaster import generate_forecast_response

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Seed data on startup if database is empty
    generate_historical_data()
    yield

app = FastAPI(
    title="AI Prediction API for Monthly Test Data Forecasting",
    description="FastAPI predictive endpoint forecasting monthly testing metrics from weekly logs, including model explainability.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS restricted to configured frontend domains
origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://monthly-data-forecasting.vercel.app")
allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/projects", response_model=List[str])
async def get_projects(session: Session = Depends(get_session)):
    """Fetch unique project names from the database."""
    statement = select(TestReport.projectName).distinct()
    results = session.exec(statement).all()
    return results

@app.get("/api/reports/{project_name}", response_model=List[TestReport])
async def get_project_reports(project_name: str, session: Session = Depends(get_session)):
    """Fetch all weekly reports for a specific project, ordered by creation date."""
    statement = select(TestReport).where(TestReport.projectName == project_name).order_by(TestReport.createdAt)
    results = session.exec(statement).all()
    if not results:
        raise HTTPException(status_code=404, detail="No reports found for this project.")
    return results

@app.post("/api/reports", response_model=TestReport)
async def create_report(report_data: TestReportCreate, session: Session = Depends(get_session)):
    """Add a new weekly report to the database."""
    report = TestReport(
        projectName=report_data.projectName,
        authors=report_data.authors,
        storyTests=report_data.storyTests,
        regressionTestsAutomated=report_data.regressionTestsAutomated,
        regressionTestsManual=report_data.regressionTestsManual,
        totalTestsByApplication=report_data.totalTestsByApplication,
        
        storyPassed=report_data.storyPassed,
        storyFailed=report_data.storyFailed,
        storyUnexecuted=report_data.storyUnexecuted,
        storyBlocked=report_data.storyBlocked,
        storySkipped=report_data.storySkipped,
        storyCritical=report_data.storyCritical,
        storyNew=report_data.storyNew,
        storyUnused=report_data.storyUnused,
        storyBugs=report_data.storyBugs,
        
        arPassed=report_data.arPassed,
        arFailed=report_data.arFailed,
        arUnexecuted=report_data.arUnexecuted,
        arBlocked=report_data.arBlocked,
        arSkipped=report_data.arSkipped,
        arCritical=report_data.arCritical,
        arNew=report_data.arNew,
        arUnused=report_data.arUnused,
        arBugs=report_data.arBugs,
        
        mrPassed=report_data.mrPassed,
        mrFailed=report_data.mrFailed,
        mrUnexecuted=report_data.mrUnexecuted,
        mrBlocked=report_data.mrBlocked,
        mrSkipped=report_data.mrSkipped,
        mrCritical=report_data.mrCritical,
        mrNew=report_data.mrNew,
        mrUnused=report_data.mrUnused,
        mrBugs=report_data.mrBugs,
        
        createdAt=report_data.createdAt if report_data.createdAt else datetime.now(timezone.utc).replace(tzinfo=None)
    )
    
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

@app.post("/api/predict/{project_name}")
async def predict_project_forecast(project_name: str, session: Session = Depends(get_session)):
    """
    Train machine learning models on a project's weekly historical records, 
    and forecast next month's aggregates along with explainability metrics.
    """
    statement = select(TestReport).where(TestReport.projectName == project_name).order_by(TestReport.createdAt)
    reports = session.exec(statement).all()
    
    if not reports:
        raise HTTPException(status_code=404, detail="No historical data found for this project.")
        
    if len(reports) < 4:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient data. Need at least 4 weekly reports to make forecasting computations."
        )
        
    try:
        forecast_payload = generate_forecast_response(reports)
        return forecast_payload
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Forecasting calculation failed: {str(e)}")

@app.post("/api/seed")
async def seed_data(background_tasks: BackgroundTasks):
    """Trigger background job to reset the database and seed it with fresh mockup data."""
    background_tasks.add_task(reset_db_and_reseed)
    return {"message": "Database reset and seeding process started in background."}

@app.get("/")
async def root():
    return {"message": "AI Forecasting API Running"}

if __name__ == "__main__":
    import uvicorn
    # Bind to 0.0.0.0 on Render, otherwise 127.0.0.1 locally
    host = os.getenv("HOST", "0.0.0.0" if os.getenv("RENDER") else "127.0.0.1")
    # Use Render port (defaults to 10000 on Render if unset), fallback to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)

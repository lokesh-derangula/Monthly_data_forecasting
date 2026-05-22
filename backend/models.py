from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field
from pydantic import BaseModel

class TestReport(SQLModel, table=True):
    __tablename__ = "test_reports"
    __test__ = False
    
    id: Optional[int] = Field(default=None, primary_key=True)
    projectName: str
    authors: Optional[str] = Field(default="")
    storyTests: int
    regressionTestsAutomated: int
    regressionTestsManual: int
    totalTestsByApplication: int

    # Story Test Results
    storyPassed: int
    storyFailed: int
    storyUnexecuted: int
    storyBlocked: int
    storySkipped: int
    storyCritical: int
    storyNew: int
    storyUnused: int
    storyBugs: int

    # Automation Test Results (AR)
    arPassed: int
    arFailed: int
    arUnexecuted: int
    arBlocked: int
    arSkipped: int
    arCritical: int
    arNew: int
    arUnused: int
    arBugs: int

    # Manual Regression Test Results (MR)
    mrPassed: int
    mrFailed: int
    mrUnexecuted: int
    mrBlocked: int
    mrSkipped: int
    mrCritical: int
    mrNew: int
    mrUnused: int
    mrBugs: int

    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

class TestReportCreate(BaseModel):
    projectName: str
    authors: Optional[str] = ""
    storyTests: int
    regressionTestsAutomated: int
    regressionTestsManual: int
    totalTestsByApplication: int

    # Story Test Results
    storyPassed: int
    storyFailed: int
    storyUnexecuted: int
    storyBlocked: int
    storySkipped: int
    storyCritical: int
    storyNew: int
    storyUnused: int
    storyBugs: int

    # Automation Test Results (AR)
    arPassed: int
    arFailed: int
    arUnexecuted: int
    arBlocked: int
    arSkipped: int
    arCritical: int
    arNew: int
    arUnused: int
    arBugs: int

    # Manual Regression Test Results (MR)
    mrPassed: int
    mrFailed: int
    mrUnexecuted: int
    mrBlocked: int
    mrSkipped: int
    mrCritical: int
    mrNew: int
    mrUnused: int
    mrBugs: int
    
    createdAt: Optional[datetime] = None

class MetricForecast(BaseModel):
    metric: str
    predicted_value: float
    current_average: float
    percentage_change: float
    explainability: List[Dict[str, Any]] # Contributions of features

class PredictionResponse(BaseModel):
    projectName: str
    historical_weeks_count: int
    forecast: Dict[str, MetricForecast]
    historical_data: List[Dict[str, Any]]

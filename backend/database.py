import os
from sqlmodel import SQLModel, create_engine, Session

# Use local SQLite database path
DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    f"sqlite:///{os.path.join(DATABASE_DIR, 'forecaster.db')}"
)

# connect_args={"check_same_thread": False} is required only for SQLite.
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

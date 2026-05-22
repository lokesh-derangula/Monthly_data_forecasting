import sys
import traceback
from sqlmodel import Session, select
from database import engine
from models import TestReport
from forecaster import generate_forecast_response

def check_types(val, path=""):
    import numpy as np
    if isinstance(val, dict):
        for k, v in val.items():
            check_types(v, f"{path}.{k}")
    elif isinstance(val, list):
        for i, v in enumerate(val):
            check_types(v, f"{path}[{i}]")
    else:
        if isinstance(val, (np.integer, np.floating, np.ndarray)):
            print(f"FOUND NUMPY TYPE at {path}: {type(val)} = {val}")
        elif not isinstance(val, (int, float, str, bool, type(None))):
            print(f"FOUND OTHER TYPE at {path}: {type(val)} = {val}")

def debug():
    with Session(engine) as session:
        statement = select(TestReport).where(TestReport.projectName == "QuantumPay").order_by(TestReport.createdAt)
        reports = session.exec(statement).all()
        print(f"Loaded {len(reports)} reports for QuantumPay.")
        if len(reports) < 4:
            print("Not enough reports!")
            return
        
        try:
            res = generate_forecast_response(reports)
            print("Checking types of keys in response...")
            check_types(res)
            print("Type check complete.")
        except Exception as e:
            print("CRITICAL ERROR during generate_forecast_response:")
            traceback.print_exc()

if __name__ == "__main__":
    debug()

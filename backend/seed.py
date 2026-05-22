import random
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import TestReport

PROJECTS = {
    "QuantumPay": {
        "authors": "Alex Dev, Sarah QA",
        "base_story": 30,
        "base_ar": 120,
        "base_mr": 40,
        "trend_story": 0.4,       # stories grow by ~0.4 per week
        "trend_ar": 3.0,          # automation grows by ~3 per week
        "trend_mr": -0.2,         # manual regression decreases slightly (shifting to automation)
        "pass_rate_story": 0.94,
        "pass_rate_ar": 0.96,
        "pass_rate_mr": 0.90,
        "bug_factor": 0.05        # bugs are ~5% of failed or complex tests
    },
    "HealthSync": {
        "authors": "John Doe, Emily Nurse",
        "base_story": 20,
        "base_ar": 80,
        "base_mr": 80,
        "trend_story": 0.15,
        "trend_ar": 1.2,
        "trend_mr": 0.5,          # manual regression grows steadily due to compliance checking
        "pass_rate_story": 0.98,  # very high quality bar
        "pass_rate_ar": 0.97,
        "pass_rate_mr": 0.95,
        "bug_factor": 0.02
    },
    "EduLearn": {
        "authors": "Michael K., Lisa Chang",
        "base_story": 45,
        "base_ar": 40,
        "base_mr": 120,
        "trend_story": 0.6,       # fast paced, lots of stories
        "trend_ar": 0.5,          # slow automation adoption
        "trend_mr": 2.0,          # rapid manual regression testing growth
        "pass_rate_story": 0.82,  # buggy project
        "pass_rate_ar": 0.85,
        "pass_rate_mr": 0.80,
        "bug_factor": 0.12        # high bug rate
    }
}

def generate_historical_data():
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if database already has reports
        existing = session.exec(select(TestReport)).first()
        if existing:
            print("Database already contains data. Seeding skipped.")
            return

        print("Seeding database with 52 weeks of historical test reports...")
        
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        start_date = now - timedelta(weeks=52)

        for project_name, config in PROJECTS.items():
            print(f"Generating data for project: {project_name}...")
            
            for week in range(52):
                date = start_date + timedelta(weeks=week)
                
                # Add randomness and trends
                noise = lambda: random.uniform(-0.1, 0.1)
                
                story_count = int(config["base_story"] + (config["trend_story"] * week) + random.randint(-4, 4))
                story_count = max(5, story_count)
                
                ar_count = int(config["base_ar"] + (config["trend_ar"] * week) + random.randint(-10, 10))
                ar_count = max(10, ar_count)
                
                mr_count = int(config["base_mr"] + (config["trend_mr"] * week) + random.randint(-8, 8))
                mr_count = max(10, mr_count)
                
                total_tests = story_count + ar_count + mr_count
                
                # Story Test Outcomes
                story_passed = int(story_count * (config["pass_rate_story"] + noise() * 0.05))
                story_passed = min(story_count, max(0, story_passed))
                
                story_failed = story_count - story_passed
                story_blocked = int(story_failed * random.uniform(0.1, 0.3))
                story_unexecuted = int(story_failed * random.uniform(0, 0.2))
                story_skipped = int(story_count * random.uniform(0.01, 0.03))
                story_critical = int(story_failed * random.uniform(0.2, 0.4))
                story_new = int(story_count * random.uniform(0.1, 0.25))
                story_unused = int(story_count * random.uniform(0, 0.05))
                story_bugs = int((story_failed * 1.2) + (story_critical * 0.5) + random.randint(0, 2))
                
                # Adjust remaining categories
                story_failed = max(0, story_failed - story_blocked - story_unexecuted - story_skipped)
                story_passed = story_count - (story_failed + story_blocked + story_unexecuted + story_skipped)
                story_passed = max(0, story_passed)
                
                # Automation Test Outcomes (AR)
                ar_passed = int(ar_count * (config["pass_rate_ar"] + noise() * 0.02))
                ar_passed = min(ar_count, max(0, ar_passed))
                
                ar_failed = ar_count - ar_passed
                ar_blocked = int(ar_failed * random.uniform(0.05, 0.15))
                ar_unexecuted = int(ar_failed * random.uniform(0, 0.1))
                ar_skipped = int(ar_count * random.uniform(0, 0.02))
                ar_critical = int(ar_failed * random.uniform(0.1, 0.3))
                ar_new = int(ar_count * random.uniform(0.05, 0.15))
                ar_unused = int(ar_count * random.uniform(0, 0.02))
                ar_bugs = int((ar_failed * 0.8) + random.randint(0, 1))
                
                ar_failed = max(0, ar_failed - ar_blocked - ar_unexecuted - ar_skipped)
                ar_passed = ar_count - (ar_failed + ar_blocked + ar_unexecuted + ar_skipped)
                ar_passed = max(0, ar_passed)

                # Manual Regression Test Outcomes (MR)
                mr_passed = int(mr_count * (config["pass_rate_mr"] + noise() * 0.04))
                mr_passed = min(mr_count, max(0, mr_passed))
                
                mr_failed = mr_count - mr_passed
                mr_blocked = int(mr_failed * random.uniform(0.1, 0.25))
                mr_unexecuted = int(mr_failed * random.uniform(0.05, 0.15))
                mr_skipped = int(mr_count * random.uniform(0.02, 0.05))
                mr_critical = int(mr_failed * random.uniform(0.15, 0.35))
                mr_new = int(mr_count * random.uniform(0.05, 0.1))
                mr_unused = int(mr_count * random.uniform(0, 0.04))
                mr_bugs = int((mr_failed * 1.0) + random.randint(0, 2))
                
                mr_failed = max(0, mr_failed - mr_blocked - mr_unexecuted - mr_skipped)
                mr_passed = mr_count - (mr_failed + mr_blocked + mr_unexecuted + mr_skipped)
                mr_passed = max(0, mr_passed)

                report = TestReport(
                    projectName=project_name,
                    authors=config["authors"],
                    storyTests=story_count,
                    regressionTestsAutomated=ar_count,
                    regressionTestsManual=mr_count,
                    totalTestsByApplication=total_tests,
                    
                    # Story
                    storyPassed=story_passed,
                    storyFailed=story_failed,
                    storyUnexecuted=story_unexecuted,
                    storyBlocked=story_blocked,
                    storySkipped=story_skipped,
                    storyCritical=story_critical,
                    storyNew=story_new,
                    storyUnused=story_unused,
                    storyBugs=story_bugs,
                    
                    # AR
                    arPassed=ar_passed,
                    arFailed=ar_failed,
                    arUnexecuted=ar_unexecuted,
                    arBlocked=ar_blocked,
                    arSkipped=ar_skipped,
                    arCritical=ar_critical,
                    arNew=ar_new,
                    arUnused=ar_unused,
                    arBugs=ar_bugs,
                    
                    # MR
                    mrPassed=mr_passed,
                    mrFailed=mr_failed,
                    mrUnexecuted=mr_unexecuted,
                    mrBlocked=mr_blocked,
                    mrSkipped=mr_skipped,
                    mrCritical=mr_critical,
                    mrNew=mr_new,
                    mrUnused=mr_unused,
                    mrBugs=mr_bugs,
                    
                    createdAt=date
                )
                session.add(report)
            
        session.commit()
        print("Database seeded successfully.")

def reset_db_and_reseed():
    from sqlmodel import SQLModel
    # Drop and recreate tables, then seed
    SQLModel.metadata.drop_all(engine)
    generate_historical_data()

if __name__ == "__main__":
    generate_historical_data()

"""
Seed script — populates MongoDB with test data matching the Node.js seed.js.
Run: cd backend && python seed.py
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from passlib.hash import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/software-test-platform")


async def seed():
    client = AsyncIOMotorClient(MONGODB_URI)
    db_name = MONGODB_URI.rsplit("/", 1)[-1].split("?")[0] or "software-test-platform"
    db = client[db_name]

    print(f"Connected to MongoDB: {db_name}")

    # Clear existing data
    await db.users.delete_many({})
    await db.tasks.delete_many({})
    await db.feedback.delete_many({})
    await db.transactions.delete_many({})
    print("Cleared existing data")

    # ============ Create Users ============
    password = bcrypt.hash("Password123")
    now = datetime.now(timezone.utc)

    def make_user(**kwargs):
        base = {
            "password": password,
            "status": "active",
            "avatar": None,
            "company": "",
            "tasksCreated": 0,
            "totalSpent": 0,
            "rating": 0,
            "reviewCount": 0,
            "completedTests": 0,
            "walletBalance": 0,
            "pendingCredits": 0,
            "totalEarnings": 0,
            "permissions": [],
            "otpVerified": True,
            "createdAt": now,
            "updatedAt": now,
        }
        base.update(kwargs)
        return base

    admin_doc = make_user(name="Admin User", email="admin@testflow.com", role="admin", permissions=["all"])
    dev1_doc = make_user(name="John Developer", email="john@devcompany.com", role="developer", company="TechCorp Inc.", tasksCreated=15, totalSpent=7500)
    dev2_doc = make_user(name="Emily Chen", email="emily@startup.io", role="developer", company="StartupXYZ", tasksCreated=8, totalSpent=3200)
    dev3_doc = make_user(name="Robert Wilson", email="robert@enterprise.com", role="developer", company="Enterprise Solutions", tasksCreated=25, totalSpent=12500)
    dev4_doc = make_user(name="Maria Garcia", email="maria@fintech.com", role="developer", company="FinTech Pro", status="suspended", tasksCreated=3, totalSpent=1500)
    tester1_doc = make_user(name="Sarah Tester", email="sarah@testing.com", role="tester", rating=4.9, reviewCount=142, completedTests=156, walletBalance=2450, pendingCredits=350, totalEarnings=12500)
    tester2_doc = make_user(name="Mike QA", email="mike@qa.net", role="tester", rating=4.7, reviewCount=89, completedTests=98, walletBalance=1800, totalEarnings=7800)
    tester3_doc = make_user(name="Lisa QA", email="lisa@qaexpert.com", role="tester", rating=4.5, reviewCount=58, completedTests=67, walletBalance=980, totalEarnings=5200)
    tester4_doc = make_user(name="David Test", email="david@tester.io", role="tester", status="pending", rating=0, completedTests=0, walletBalance=0, totalEarnings=0, otpVerified=False)
    tester5_doc = make_user(name="Anna Beta", email="anna@betatest.com", role="tester", rating=4.8, reviewCount=190, completedTests=203, walletBalance=3200, totalEarnings=16200)

    users = [admin_doc, dev1_doc, dev2_doc, dev3_doc, dev4_doc, tester1_doc, tester2_doc, tester3_doc, tester4_doc, tester5_doc]
    result = await db.users.insert_many(users)
    ids = result.inserted_ids

    admin_id, dev1_id, dev2_id, dev3_id, dev4_id = ids[0], ids[1], ids[2], ids[3], ids[4]
    t1_id, t2_id, t3_id, t4_id, t5_id = ids[5], ids[6], ids[7], ids[8], ids[9]
    print(f"Created {len(ids)} users")

    # ============ Create Tasks ============
    def make_task(**kwargs):
        base = {
            "description": "",
            "status": "open",
            "progress": 0,
            "assignedTesters": [],
            "appliedTesters": 0,
            "estimatedTime": "",
            "createdAt": now,
            "updatedAt": now,
        }
        base.update(kwargs)
        return base

    tasks = [
        make_task(appName="E-Commerce Mobile App", appUrl="https://shop.example.com", testingLevel="expert",
                  testTypes=["functional", "usability", "security"], budget=500, credits=500,
                  deadline=datetime(2024, 2, 15, tzinfo=timezone.utc), status="in-progress", progress=65,
                  developer=dev1_id, developerName="John Developer", developerCompany="TechCorp Inc.",
                  assignedTesters=[t1_id, t3_id, t5_id], requiredTesters=3, appliedTesters=3),

        make_task(appName="Banking Dashboard", appUrl="https://bank.example.com", testingLevel="expert",
                  testTypes=["security", "performance", "accessibility"], budget=750, credits=750,
                  deadline=datetime(2024, 2, 20, tzinfo=timezone.utc), status="pending-review", progress=100,
                  developer=dev1_id, developerName="John Developer", developerCompany="TechCorp Inc.",
                  assignedTesters=[t1_id, t2_id, t3_id, t5_id, t4_id], requiredTesters=5, appliedTesters=5),

        make_task(appName="Social Media Platform", appUrl="https://social.example.com", testingLevel="intermediate",
                  testTypes=["functional", "usability"], budget=350, credits=350,
                  deadline=datetime(2024, 2, 25, tzinfo=timezone.utc),
                  developer=dev1_id, developerName="John Developer", developerCompany="TechCorp Inc.", requiredTesters=3),

        make_task(appName="Fitness Tracker App", appUrl="https://fitness.example.com", testingLevel="basic",
                  testTypes=["functional", "compatibility"], budget=200, credits=200,
                  deadline=datetime(2024, 2, 10, tzinfo=timezone.utc), status="completed", progress=100,
                  developer=dev1_id, developerName="John Developer", developerCompany="TechCorp Inc.",
                  assignedTesters=[t2_id, t3_id], requiredTesters=2, appliedTesters=2),

        make_task(appName="Travel Booking App", appUrl="https://travel.example.com", testingLevel="intermediate",
                  testTypes=["functional", "performance"], budget=400, credits=400,
                  deadline=datetime(2024, 2, 10, tzinfo=timezone.utc), status="under-verification", progress=100,
                  developer=dev2_id, developerName="Emily Chen", developerCompany="StartupXYZ",
                  assignedTesters=[t1_id, t2_id, t5_id], requiredTesters=3, appliedTesters=3),

        make_task(appName="Healthcare Portal", appUrl="https://health.example.com",
                  description="Comprehensive testing of patient data management system including HIPAA compliance verification.",
                  testingLevel="expert", testTypes=["security", "accessibility", "performance"], budget=450, credits=450,
                  deadline=datetime(2024, 2, 18, tzinfo=timezone.utc),
                  developer=dev3_id, developerName="Robert Wilson", developerCompany="Enterprise Solutions",
                  requiredTesters=5, appliedTesters=2, estimatedTime="4-6 hours"),

        make_task(appName="Food Delivery App", appUrl="https://foodie.example.com",
                  description="Test the new order tracking feature and payment integration across iOS and Android.",
                  testingLevel="intermediate", testTypes=["functional", "usability"], budget=250, credits=250,
                  deadline=datetime(2024, 2, 12, tzinfo=timezone.utc),
                  developer=dev2_id, developerName="Emily Chen", developerCompany="StartupXYZ",
                  requiredTesters=3, appliedTesters=1, estimatedTime="2-3 hours"),

        make_task(appName="Learning Management System", appUrl="https://lms.example.com",
                  description="Test course enrollment, video playback, and quiz functionality on multiple browsers.",
                  testingLevel="basic", testTypes=["functional", "compatibility"], budget=150, credits=150,
                  deadline=datetime(2024, 2, 8, tzinfo=timezone.utc),
                  developer=dev3_id, developerName="Robert Wilson", developerCompany="Enterprise Solutions",
                  requiredTesters=4, appliedTesters=3, estimatedTime="1-2 hours"),

        make_task(appName="Real Estate Platform", appUrl="https://homes.example.com",
                  description="Test property search, virtual tour feature, and mortgage calculator.",
                  testingLevel="intermediate", testTypes=["functional", "usability", "performance"], budget=300, credits=300,
                  deadline=datetime(2024, 2, 20, tzinfo=timezone.utc),
                  developer=dev3_id, developerName="Robert Wilson", developerCompany="Enterprise Solutions",
                  requiredTesters=3, appliedTesters=0, estimatedTime="3-4 hours"),
    ]

    task_result = await db.tasks.insert_many(tasks)
    task_ids = task_result.inserted_ids
    print(f"Created {len(task_ids)} tasks")

    # ============ Create Feedback ============
    feedback_docs = [
        {
            "task": task_ids[1], "taskName": "Banking Dashboard",
            "tester": t1_id, "testerName": "Sarah Tester", "testerRating": 4.9,
            "status": "pending", "proofType": "video", "proofUrl": "/proofs/banking-test.mp4",
            "observations": "Found 3 critical security vulnerabilities in the login flow. Session tokens are not properly invalidated on logout.",
            "testResult": "issues-found", "aiVerification": "verified", "creditScore": 95,
            "createdAt": now, "updatedAt": now,
        },
        {
            "task": task_ids[1], "taskName": "Banking Dashboard",
            "tester": t2_id, "testerName": "Mike QA", "testerRating": 4.7,
            "status": "approved", "proofType": "screenshots", "proofUrl": "/proofs/banking-screenshots.zip",
            "observations": "Accessibility issues found: missing alt tags, low contrast ratios on warning buttons.",
            "testResult": "issues-found", "aiVerification": "verified", "creditScore": 88,
            "createdAt": now, "updatedAt": now,
        },
        {
            "task": task_ids[0], "taskName": "E-Commerce Mobile App",
            "tester": t3_id, "testerName": "Lisa QA", "testerRating": 4.5,
            "status": "needs-revision", "proofType": "video", "proofUrl": "/proofs/ecommerce-test.mp4",
            "observations": "Checkout flow tested. Minor UI glitches on mobile landscape mode.",
            "testResult": "pass", "aiVerification": "low-quality", "creditScore": 62,
            "createdAt": now, "updatedAt": now,
        },
    ]
    await db.feedback.insert_many(feedback_docs)
    print("Created 3 feedback entries")

    # ============ Create Transactions ============
    transactions = [
        {"user": t1_id, "userName": "Sarah Tester", "userType": "tester", "type": "credit",
         "amount": 180, "description": "Payment for E-Commerce testing", "taskName": "E-Commerce Mobile App",
         "status": "completed", "createdAt": now, "updatedAt": now},
        {"user": dev1_id, "userName": "John Developer", "userType": "developer", "type": "debit",
         "amount": 500, "description": "Task creation fee", "taskName": "E-Commerce Mobile App",
         "status": "completed", "createdAt": now, "updatedAt": now},
        {"user": admin_id, "userName": "Platform", "userType": "admin", "type": "commission",
         "amount": 50, "description": "Commission earned", "taskName": "Banking Dashboard",
         "status": "completed", "createdAt": now, "updatedAt": now},
        {"user": t2_id, "userName": "Mike QA", "userType": "tester", "type": "credit",
         "amount": 220, "description": "Payment for Banking Dashboard", "taskName": "Banking Dashboard",
         "status": "completed", "createdAt": now, "updatedAt": now},
        {"user": t5_id, "userName": "Anna Beta", "userType": "tester", "type": "withdrawal",
         "amount": 1000, "description": "Withdrawal request", "taskName": None,
         "status": "pending", "createdAt": now, "updatedAt": now},
        {"user": dev4_id, "userName": "Maria Garcia", "userType": "developer", "type": "refund",
         "amount": 150, "description": "Cancelled task refund", "taskName": "Cancelled Task",
         "status": "completed", "createdAt": now, "updatedAt": now},
    ]
    await db.transactions.insert_many(transactions)
    print("Created 6 transactions")

    print("\n--- Seed Complete ---")
    print("Login credentials (all accounts): Password123")
    print("\nDeveloper:  john@devcompany.com")
    print("Tester:     sarah@testing.com")
    print("Admin:      admin@testflow.com")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())

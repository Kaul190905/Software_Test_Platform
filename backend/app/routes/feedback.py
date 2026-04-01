from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional
import random

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.utils import serialize_doc

router = APIRouter()


# ---------- Request schemas ----------

class SubmitFeedbackRequest(BaseModel):
    taskId: str
    proofType: str = "screenshots"
    proofUrl: str = ""
    observations: str
    testResult: str = "pass"


class UpdateFeedbackRequest(BaseModel):
    status: Optional[str] = None
    aiVerification: Optional[str] = None


# ---------- Helpers ----------

async def _populate_feedback(fb: dict, db) -> dict:
    """Populate task and tester references in a feedback document."""
    data = serialize_doc(fb)

    # Populate task
    if fb.get("task"):
        task = await db.tasks.find_one(
            {"_id": ObjectId(str(fb["task"]))},
            {"appName": 1, "appUrl": 1, "status": 1},
        )
        if task:
            data["task"] = serialize_doc(task)

    # Populate tester
    if fb.get("tester"):
        tester = await db.users.find_one(
            {"_id": ObjectId(str(fb["tester"]))},
            {"name": 1, "email": 1, "rating": 1},
        )
        if tester:
            data["tester"] = serialize_doc(tester)

    # Virtual — submittedAt
    if "createdAt" in data:
        data["submittedAt"] = data["createdAt"]

    return data


# ---------- GET /api/feedback ----------

@router.get("")
async def list_feedback(
    status_filter: Optional[str] = Query(None, alias="status"),
    taskId: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    filter_q = {}

    if user.get("role") == "developer":
        # Get tasks owned by this developer
        my_tasks = await db.tasks.find(
            {"developer": user["_id"]}, {"_id": 1}
        ).to_list(None)
        task_ids = [t["_id"] for t in my_tasks]
        filter_q["task"] = {"$in": task_ids}
    elif user.get("role") == "tester":
        filter_q["tester"] = user["_id"]
    # Admin sees all

    if status_filter and status_filter != "all":
        filter_q["status"] = status_filter
    if taskId:
        try:
            filter_q["task"] = ObjectId(taskId)
        except Exception:
            pass

    cursor = db.feedback.find(filter_q).sort("createdAt", -1)
    feedback_list = []
    async for fb in cursor:
        feedback_list.append(await _populate_feedback(fb, db))

    return {"feedback": feedback_list}


# ---------- POST /api/feedback ----------

@router.post("", status_code=201)
async def submit_feedback(
    body: SubmitFeedbackRequest,
    user: dict = Depends(require_role("tester")),
):
    db = get_db()

    try:
        task = await db.tasks.find_one({"_id": ObjectId(body.taskId)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check tester is assigned
    if user["_id"] not in task.get("assignedTesters", []):
        raise HTTPException(status_code=403, detail="You are not assigned to this task")

    feedback_doc = {
        "task": ObjectId(body.taskId),
        "taskName": task.get("appName", ""),
        "tester": user["_id"],
        "testerName": user.get("name", ""),
        "testerRating": user.get("rating", 0),
        "proofType": body.proofType,
        "proofUrl": body.proofUrl,
        "observations": body.observations,
        "testResult": body.testResult,
        "status": "pending",
        "aiVerification": "pending",
        "creditScore": random.randint(60, 99),
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }

    result = await db.feedback.insert_one(feedback_doc)
    feedback_doc["_id"] = result.inserted_id

    # Update task status
    await db.tasks.update_one(
        {"_id": ObjectId(body.taskId)},
        {"$set": {"status": "pending-review", "progress": 100, "updatedAt": datetime.now(timezone.utc)}},
    )

    return {"feedback": await _populate_feedback(feedback_doc, db)}


# ---------- PUT /api/feedback/:id ----------

@router.put("/{feedback_id}")
async def update_feedback(
    feedback_id: str,
    body: UpdateFeedbackRequest,
    user: dict = Depends(require_role("developer", "admin")),
):
    db = get_db()

    try:
        fb = await db.feedback.find_one({"_id": ObjectId(feedback_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID")

    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    updates = {}
    if body.status:
        updates["status"] = body.status
    if body.aiVerification:
        updates["aiVerification"] = body.aiVerification

    if updates:
        updates["updatedAt"] = datetime.now(timezone.utc)
        await db.feedback.update_one({"_id": ObjectId(feedback_id)}, {"$set": updates})

    # If approved, credit the tester
    if body.status == "approved":
        tester = await db.users.find_one({"_id": fb["tester"]})
        if tester:
            credit_amount = fb.get("creditScore", 0) * 3
            await db.users.update_one(
                {"_id": fb["tester"]},
                {
                    "$inc": {
                        "walletBalance": credit_amount,
                        "totalEarnings": credit_amount,
                        "completedTests": 1,
                    },
                    "$set": {"updatedAt": datetime.now(timezone.utc)},
                },
            )

        # Check if all feedback for this task is approved
        task = await db.tasks.find_one({"_id": fb["task"]})
        if task:
            all_fb = await db.feedback.find({"task": task["_id"]}).to_list(None)
            # Re-fetch after our update
            updated_fb = await db.feedback.find_one({"_id": ObjectId(feedback_id)})
            all_approved = all(
                (f.get("status") == "approved" if str(f["_id"]) != feedback_id else body.status == "approved")
                for f in all_fb
            )
            if all_approved:
                await db.tasks.update_one(
                    {"_id": task["_id"]},
                    {"$set": {"status": "completed", "updatedAt": datetime.now(timezone.utc)}},
                )

    updated_feedback = await db.feedback.find_one({"_id": ObjectId(feedback_id)})
    return {"feedback": await _populate_feedback(updated_feedback, db)}

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.utils import serialize_doc, populate_user_fields

router = APIRouter()


# ---------- Request schemas ----------

class CreateTaskRequest(BaseModel):
    appName: str
    appUrl: str
    description: str = ""
    testingLevel: str
    testTypes: List[str] = []
    budget: float = 0
    credits: float = 0
    deadline: str  # ISO date string
    requiredTesters: int = 1
    estimatedTime: str = ""


class UpdateTaskRequest(BaseModel):
    appName: Optional[str] = None
    appUrl: Optional[str] = None
    description: Optional[str] = None
    testingLevel: Optional[str] = None
    testTypes: Optional[List[str]] = None
    budget: Optional[float] = None
    credits: Optional[float] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    requiredTesters: Optional[int] = None
    estimatedTime: Optional[str] = None


# ---------- Helpers ----------

async def _populate_task(task: dict, db) -> dict:
    """Populate developer and assignedTesters references in a task."""
    data = serialize_doc(task)

    # Populate developer
    if task.get("developer"):
        dev = await db.users.find_one(
            {"_id": ObjectId(str(task["developer"]))},
            {"name": 1, "email": 1, "company": 1},
        )
        if dev:
            data["developer"] = serialize_doc(dev)

    # Populate assignedTesters
    if task.get("assignedTesters"):
        tester_map = await populate_user_fields(
            db, task["assignedTesters"], ["name", "email", "rating"]
        )
        data["assignedTesters"] = list(tester_map.values())

    # Virtuals
    assigned_count = len(task.get("assignedTesters", []))
    data["testersAssigned"] = assigned_count
    data["openSlots"] = max(0, task.get("requiredTesters", 1) - assigned_count)

    return data


# ---------- GET /api/tasks ----------

@router.get("")
async def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    filter_q = {}

    # Developer sees only their own tasks
    if user.get("role") == "developer":
        filter_q["developer"] = user["_id"]

    if status_filter and status_filter != "all":
        filter_q["status"] = status_filter

    if search:
        filter_q["appName"] = {"$regex": search, "$options": "i"}

    cursor = db.tasks.find(filter_q).sort("createdAt", -1)
    tasks = []
    async for task in cursor:
        tasks.append(await _populate_task(task, db))

    return {"tasks": tasks}


# ---------- GET /api/tasks/marketplace ----------

@router.get("/marketplace")
async def marketplace(
    level: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    db = get_db()
    filter_q = {"status": "open"}

    if level and level != "all":
        filter_q["testingLevel"] = level

    if type and type != "all":
        filter_q["testTypes"] = type

    if search:
        filter_q["appName"] = {"$regex": search, "$options": "i"}

    cursor = db.tasks.find(filter_q).sort("createdAt", -1)
    tasks = []
    async for task in cursor:
        data = await _populate_task(task, db)
        # Extra marketplace fields
        data["company"] = task.get("developerCompany", "")
        data["companyName"] = task.get("developerCompany", "")
        if data.get("developer") and isinstance(data["developer"], dict):
            data["company"] = data["company"] or data["developer"].get("company", "")
            data["companyName"] = data["companyName"] or data["developer"].get("company", "")
        tl = task.get("testingLevel", "")
        data["level"] = tl[0].upper() + tl[1:] if tl else ""
        data["postedAt"] = data.get("createdAt")
        tasks.append(data)

    return {"tasks": tasks}


# ---------- GET /api/tasks/my-tasks ----------

@router.get("/my-tasks")
async def my_tasks(user: dict = Depends(get_current_user)):
    db = get_db()

    cursor = db.tasks.find({"assignedTesters": user["_id"]}).sort("createdAt", -1)
    tasks = []
    async for task in cursor:
        data = await _populate_task(task, db)
        data["company"] = task.get("developerCompany", "")
        if data.get("developer") and isinstance(data["developer"], dict):
            data["company"] = data["company"] or data["developer"].get("company", "")
        data["acceptedAt"] = data.get("updatedAt")
        tasks.append(data)

    return {"tasks": tasks}


# ---------- GET /api/tasks/stats ----------

@router.get("/stats")
async def task_stats(user: dict = Depends(get_current_user)):
    db = get_db()

    if user.get("role") == "developer":
        my_tasks = await db.tasks.find({"developer": user["_id"]}).to_list(None)
        active = sum(1 for t in my_tasks if t.get("status") in ["open", "in-progress"])
        completed = sum(1 for t in my_tasks if t.get("status") == "completed")
        total_budget = sum(t.get("budget", 0) for t in my_tasks)

        return {
            "activeProjects": active,
            "completedProjects": completed,
            "totalBudgetSpent": total_budget,
            "feedbackReceived": 0,
            "activeProjectsChange": 8.5,
            "completedProjectsChange": 12.3,
        }

    elif user.get("role") == "tester":
        active_tests = await db.tasks.count_documents({
            "assignedTesters": user["_id"],
            "status": {"$in": ["in-progress", "pending-review"]},
        })

        return {
            "walletBalance": user.get("walletBalance", 0),
            "availableCredits": user.get("walletBalance", 0),
            "pendingCredits": user.get("pendingCredits", 0),
            "completedTests": user.get("completedTests", 0),
            "completedTasks": user.get("completedTests", 0),
            "activeTests": active_tests,
            "rating": user.get("rating", 0),
            "reviewCount": user.get("reviewCount", 0),
            "totalEarnings": user.get("totalEarnings", 0),
        }

    else:
        # Admin stats
        total_users = await db.users.count_documents({})
        total_developers = await db.users.count_documents({"role": "developer"})
        total_testers = await db.users.count_documents({"role": "tester"})
        active_tasks = await db.tasks.count_documents({"status": {"$in": ["open", "in-progress"]}})
        completed_tasks = await db.tasks.count_documents({"status": "completed"})
        pending_verifications = await db.tasks.count_documents({"status": "under-verification"})

        return {
            "totalUsers": total_users,
            "totalDevelopers": total_developers,
            "totalTesters": total_testers,
            "activeTasks": active_tasks,
            "completedTasks": completed_tasks,
            "totalCreditsDistributed": 125000,
            "platformRevenue": 18750,
            "pendingVerifications": pending_verifications,
            "disputesPending": 5,
            "usersChange": 8.5,
            "revenueChange": 12.3,
        }


# ---------- GET /api/tasks/:id ----------

@router.get("/{task_id}")
async def get_task(task_id: str, user: dict = Depends(get_current_user)):
    db = get_db()

    try:
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"task": await _populate_task(task, db)}


# ---------- POST /api/tasks ----------

@router.post("", status_code=201)
async def create_task(
    body: CreateTaskRequest,
    user: dict = Depends(require_role("developer", "admin")),
):
    db = get_db()

    # Parse deadline
    try:
        deadline = datetime.fromisoformat(body.deadline.replace("Z", "+00:00"))
    except ValueError:
        deadline = datetime.now(timezone.utc)

    task_doc = {
        "appName": body.appName,
        "appUrl": body.appUrl,
        "description": body.description,
        "testingLevel": body.testingLevel,
        "testTypes": body.testTypes,
        "budget": body.budget,
        "credits": body.credits or body.budget,
        "deadline": deadline,
        "status": "open",
        "progress": 0,
        "developer": user["_id"],
        "developerName": user.get("name", ""),
        "developerCompany": user.get("company", ""),
        "assignedTesters": [],
        "requiredTesters": body.requiredTesters,
        "appliedTesters": 0,
        "estimatedTime": body.estimatedTime,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }

    result = await db.tasks.insert_one(task_doc)
    task_doc["_id"] = result.inserted_id

    # Update developer stats
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$inc": {"tasksCreated": 1, "totalSpent": body.budget},
            "$set": {"updatedAt": datetime.now(timezone.utc)},
        },
    )

    return {"task": await _populate_task(task_doc, db)}


# ---------- PUT /api/tasks/:id ----------

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()

    try:
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Only owner or admin can update
    if user.get("role") != "admin" and str(task["developer"]) != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "deadline" in updates:
        try:
            updates["deadline"] = datetime.fromisoformat(updates["deadline"].replace("Z", "+00:00"))
        except ValueError:
            pass

    updates["updatedAt"] = datetime.now(timezone.utc)

    await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": updates})

    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return {"task": await _populate_task(updated_task, db)}


# ---------- POST /api/tasks/:id/apply ----------

@router.post("/{task_id}/apply")
async def apply_to_task(
    task_id: str,
    user: dict = Depends(require_role("tester")),
):
    db = get_db()

    try:
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.get("status") != "open":
        raise HTTPException(status_code=400, detail="Task is not open for applications")

    assigned = task.get("assignedTesters", [])
    if user["_id"] in assigned:
        raise HTTPException(status_code=400, detail="Already applied to this task")

    if len(assigned) >= task.get("requiredTesters", 1):
        raise HTTPException(status_code=400, detail="No open slots available")

    assigned.append(user["_id"])
    new_status = "in-progress" if len(assigned) >= task.get("requiredTesters", 1) else task["status"]

    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {
                "assignedTesters": assigned,
                "appliedTesters": len(assigned),
                "status": new_status,
                "updatedAt": datetime.now(timezone.utc),
            }
        },
    )

    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return {"message": "Successfully applied to task", "task": await _populate_task(updated_task, db)}

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.utils import serialize_user

router = APIRouter()


# ---------- GET /api/users/stats ----------

@router.get("/stats")
async def user_stats(user: dict = Depends(get_current_user)):
    return {"user": serialize_user(user)}


# ---------- GET /api/users ----------

@router.get("")
async def list_users(
    role: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    user: dict = Depends(require_role("admin")),
):
    db = get_db()
    filter_q = {}

    if role and role != "all":
        filter_q["role"] = role
    if status_filter and status_filter != "all":
        filter_q["status"] = status_filter
    if search:
        filter_q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.users.find(filter_q, {"password": 0}).sort("createdAt", -1)
    users_raw = await cursor.to_list(None)

    # Format into the shape the frontend expects
    developers = []
    testers = []
    all_users = []

    for u in users_raw:
        uid = str(u["_id"])
        created_at = u.get("createdAt", "")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()

        if u.get("role") == "developer":
            developers.append({
                "id": uid,
                "name": u.get("name", ""),
                "email": u.get("email", ""),
                "role": u.get("role"),
                "status": u.get("status"),
                "company": u.get("company", ""),
                "tasksCreated": u.get("tasksCreated", 0),
                "completedTasks": u.get("tasksCreated", 0),
                "totalSpent": u.get("totalSpent", 0),
                "credits": u.get("totalSpent", 0),
                "joinedAt": created_at,
            })
        elif u.get("role") == "tester":
            testers.append({
                "id": uid,
                "name": u.get("name", ""),
                "email": u.get("email", ""),
                "role": u.get("role"),
                "status": u.get("status"),
                "rating": u.get("rating", 0),
                "completedTests": u.get("completedTests", 0),
                "completedTasks": u.get("completedTests", 0),
                "totalEarned": u.get("totalEarnings", 0),
                "credits": u.get("totalEarnings", 0),
                "joinedAt": created_at,
            })

        # Combined flat list
        all_users.append({
            "id": uid,
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "role": u.get("role"),
            "status": u.get("status"),
            "completedTasks": (
                u.get("completedTests", 0) if u.get("role") == "tester"
                else u.get("tasksCreated", 0)
            ),
            "credits": (
                u.get("totalEarnings", 0) if u.get("role") == "tester"
                else u.get("totalSpent", 0)
            ),
            "joinedAt": created_at,
        })

    return {
        "users": all_users,
        "developers": developers,
        "testers": testers,
    }


# ---------- GET /api/users/:id ----------

@router.get("/{user_id}")
async def get_user(user_id: str, user: dict = Depends(get_current_user)):
    db = get_db()

    try:
        target = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user": serialize_user(target)}


# ---------- PUT /api/users/:id ----------

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    user: dict = Depends(get_current_user),
):
    db = get_db()

    # Only admin or self can update
    if user.get("role") != "admin" and str(user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}

    # Non-admin cannot change role or status
    if user.get("role") != "admin":
        updates.pop("role", None)
        updates.pop("status", None)

    # Never allow password changes via this route
    updates.pop("password", None)
    updates["updatedAt"] = datetime.now(timezone.utc)

    result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": updates},
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user": serialize_user(result)}

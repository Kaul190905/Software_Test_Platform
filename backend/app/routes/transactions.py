from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.utils import serialize_doc

router = APIRouter()


# ---------- GET /api/transactions ----------

@router.get("")
async def list_transactions(
    type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    user: dict = Depends(get_current_user),
):
    db = get_db()
    filter_q = {}

    # Non-admin users only see their own transactions
    if user.get("role") != "admin":
        filter_q["user"] = user["_id"]

    if type and type != "all":
        filter_q["type"] = type
    if status_filter and status_filter != "all":
        filter_q["status"] = status_filter

    cursor = db.transactions.find(filter_q).sort("createdAt", -1)
    transactions = []

    async for t in cursor:
        # Populate user if needed
        user_name = t.get("userName", "Unknown")
        user_type = t.get("userType", "tester")
        if t.get("user"):
            u = await db.users.find_one(
                {"_id": ObjectId(str(t["user"]))},
                {"name": 1, "email": 1, "role": 1},
            )
            if u:
                user_name = user_name or u.get("name", "Unknown")
                user_type = user_type or u.get("role", "tester")

        created_at = t.get("createdAt", "")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()

        transactions.append({
            "id": str(t["_id"]),
            "type": t.get("type"),
            "user": user_name,
            "userName": user_name,
            "userType": user_type,
            "amount": t.get("amount", 0),
            "description": t.get("description", ""),
            "taskName": t.get("taskName"),
            "timestamp": created_at,
            "status": t.get("status", "completed"),
        })

    return {"transactions": transactions}


# ---------- GET /api/transactions/wallet ----------

@router.get("/wallet")
async def wallet_summary(user: dict = Depends(get_current_user)):
    db = get_db()

    cursor = db.transactions.find({"user": user["_id"]}).sort("createdAt", -1).limit(20)
    transactions = []

    async for t in cursor:
        created_at = t.get("createdAt", "")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()

        transactions.append({
            "id": str(t["_id"]),
            "type": t.get("type"),
            "amount": t.get("amount", 0),
            "description": t.get("description", ""),
            "taskName": t.get("taskName"),
            "timestamp": created_at,
            "status": t.get("status", "completed"),
        })

    return {
        "balance": user.get("walletBalance", 0),
        "pendingCredits": user.get("pendingCredits", 0),
        "totalEarnings": user.get("totalEarnings", 0),
        "transactions": transactions,
    }

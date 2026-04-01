from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.auth.dependencies import require_role

router = APIRouter()


# ---------- GET /api/analytics/overview ----------

@router.get("/overview")
async def analytics_overview(user: dict = Depends(require_role("admin"))):
    db = get_db()

    # Tasks by type aggregation
    pipeline_by_type = [
        {"$unwind": "$testTypes"},
        {"$group": {"_id": "$testTypes", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    tasks_by_type = await db.tasks.aggregate(pipeline_by_type).to_list(None)

    type_labels = [t["_id"][0].upper() + t["_id"][1:] for t in tasks_by_type]
    type_data = [t["count"] for t in tasks_by_type]

    # Monthly task creation (last 6 months)
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)

    pipeline_monthly = [
        {"$match": {"createdAt": {"$gte": six_months_ago}}},
        {
            "$group": {
                "_id": {"$month": "$createdAt"},
                "created": {"$sum": 1},
                "completed": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
            }
        },
        {"$sort": {"_id": 1}},
    ]
    monthly_tasks = await db.tasks.aggregate(pipeline_monthly).to_list(None)

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    task_labels = [months[m["_id"] - 1] for m in monthly_tasks]
    created_data = [m["created"] for m in monthly_tasks]
    completed_data = [m["completed"] for m in monthly_tasks]

    has_data = len(monthly_tasks) > 0

    return {
        "tasksOverTime": {
            "labels": task_labels if has_data else ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "datasets": [
                {
                    "label": "Tasks Created",
                    "data": created_data if has_data else [45, 52, 68, 74, 82, 89],
                    "borderColor": "#6366f1",
                    "backgroundColor": "rgba(99, 102, 241, 0.1)",
                },
                {
                    "label": "Tasks Completed",
                    "data": completed_data if has_data else [38, 45, 58, 65, 72, 78],
                    "borderColor": "#14b8a6",
                    "backgroundColor": "rgba(20, 184, 166, 0.1)",
                },
            ],
        },
        "creditsDistribution": {
            "labels": task_labels if has_data else ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "data": [c * 250 for c in created_data] if has_data else [15000, 18500, 22000, 28000, 35000, 42000],
        },
        "tasksByType": {
            "labels": type_labels if type_labels else ["Functional", "Security", "Usability", "Performance", "Accessibility", "Compatibility"],
            "data": type_data if type_data else [35, 25, 20, 12, 5, 3],
        },
        "platformRevenue": {
            "labels": task_labels if has_data else ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "data": [c * 37.5 for c in created_data] if has_data else [2250, 2775, 3300, 4200, 5250, 6300],
        },
    }

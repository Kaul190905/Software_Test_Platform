"""Utility helpers shared across the backend."""

from bson import ObjectId
from datetime import datetime


def serialize_doc(doc: dict) -> dict:
    """
    Convert a MongoDB document to a JSON-serializable dict.
    - Converts ObjectId fields to strings
    - Removes password and __v fields
    """
    if doc is None:
        return None

    result = {}
    for key, value in doc.items():
        if key == "password":
            continue
        if key == "__v":
            continue
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, list):
            result[key] = [
                str(v) if isinstance(v, ObjectId) else v for v in value
            ]
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value

    # Rename _id to id and also keep _id for compatibility
    if "_id" in result:
        result["id"] = result["_id"]

    return result


def serialize_user(user: dict) -> dict:
    """Serialize a user document, adding joinedDate virtual."""
    if user is None:
        return None
    data = serialize_doc(user)
    if "createdAt" in data:
        data["joinedDate"] = data["createdAt"]
    return data


async def populate_user_fields(db, user_ids: list, fields: list[str] = None) -> dict:
    """
    Populate user references — fetches users by IDs and returns
    a dict mapping str(user_id) -> user_data.
    """
    if not user_ids:
        return {}
    oids = [ObjectId(uid) if isinstance(uid, str) else uid for uid in user_ids]
    projection = {"password": 0, "__v": 0}
    if fields:
        projection = {f: 1 for f in fields}
        projection["_id"] = 1
    cursor = db.users.find({"_id": {"$in": oids}}, projection)
    users = {}
    async for u in cursor:
        users[str(u["_id"])] = serialize_doc(u)
    return users

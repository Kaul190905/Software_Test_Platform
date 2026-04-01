from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt
from bson import ObjectId
from datetime import datetime, timezone

from app.database import get_db
from app.auth.jwt_handler import create_token
from app.auth.dependencies import get_current_user
from app.utils import serialize_user

router = APIRouter()


# ---------- Request schemas ----------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "developer"
    company: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OTPRequest(BaseModel):
    otp: str


# ---------- POST /api/auth/register ----------

@router.post("/register", status_code=201)
async def register(body: RegisterRequest):
    db = get_db()

    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = bcrypt.hash(body.password)

    user_doc = {
        "name": body.name,
        "email": body.email.lower(),
        "password": hashed_password,
        "role": body.role,
        "status": "pending",  # pending until OTP verified
        "avatar": None,
        "company": body.company,
        "tasksCreated": 0,
        "totalSpent": 0,
        "rating": 0,
        "reviewCount": 0,
        "completedTests": 0,
        "walletBalance": 0,
        "pendingCredits": 0,
        "totalEarnings": 0,
        "permissions": [],
        "otpVerified": False,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_token(str(result.inserted_id))

    return {"user": serialize_user(user_doc), "token": token}


# ---------- POST /api/auth/login ----------

@router.post("/login")
async def login(body: LoginRequest):
    db = get_db()

    user = await db.users.find_one({"email": body.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not bcrypt.verify(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

    token = create_token(str(user["_id"]))

    return {"user": serialize_user(user), "token": token}


# ---------- POST /api/auth/verify-otp ----------

@router.post("/verify-otp")
async def verify_otp(body: OTPRequest, user: dict = Depends(get_current_user)):
    if not body.otp or len(body.otp) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Must be 6 digits.",
        )

    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"otpVerified": True, "status": "active", "updatedAt": datetime.now(timezone.utc)}},
    )

    user["otpVerified"] = True
    user["status"] = "active"

    return {"message": "OTP verified successfully", "user": serialize_user(user)}


# ---------- GET /api/auth/me ----------

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": serialize_user(user)}

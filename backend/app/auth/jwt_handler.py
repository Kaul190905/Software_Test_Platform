from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.config import settings


def create_token(user_id: str) -> str:
    """Create a JWT token for the given user ID."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRES_IN)
    payload = {
        "userId": user_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.
    Returns the payload dict or raises JWTError.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise

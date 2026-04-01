from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Connect to MongoDB Atlas (or local) using Motor async driver."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    # Extract DB name from URI, fallback to default
    db_name = settings.MONGODB_URI.rsplit("/", 1)[-1].split("?")[0]
    if not db_name:
        db_name = "software-test-platform"
    db = client[db_name]
    # Verify connection
    await client.admin.command("ping")
    print(f"Connected to MongoDB: {db_name}")


async def close_db():
    """Close the Motor client connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    """Return the database instance."""
    return db

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/software-test-platform"
    JWT_SECRET: str = "stp_jwt_secret_change_in_production_2024"
    JWT_EXPIRES_IN: int = 7  # days
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

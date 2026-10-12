import os
from functools import lru_cache
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()


class Settings:
    """Application configuration settings loaded from environment variables."""

    PROJECT_NAME: str = os.getenv(
        "PROJECT_NAME",
        "Generative AI Accessible Learning Platform for Hearing-Impaired Students"
    )
    PROJECT_DESCRIPTION: str = os.getenv(
        "PROJECT_DESCRIPTION",
        "Base platform for automated generation of accessible learning materials for Deaf and Hard-of-Hearing (DHH) students."
    )
    VERSION: str = "0.1.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "t", "yes")

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Frontend CORS Configuration
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    @property
    def allowed_origins(self) -> List[str]:
        """Parse comma-separated origins or return single frontend origin."""
        if not self.FRONTEND_ORIGIN:
            return ["http://localhost:5173"]
        origins = [origin.strip() for origin in self.FRONTEND_ORIGIN.split(",") if origin.strip()]
        # Always ensure default vite origin is included in dev if not explicitly customized
        if "http://localhost:5173" not in origins and self.APP_ENV == "development":
            origins.append("http://localhost:5173")
        return origins

    # MongoDB Atlas Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "accessible_learning_db")
    MONGODB_TIMEOUT_MS: int = int(os.getenv("MONGODB_TIMEOUT_MS", "5000"))


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton accessor."""
    return Settings()


settings = get_settings()

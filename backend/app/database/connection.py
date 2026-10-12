import logging
from typing import Any, Dict, Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from app.config import settings

logger = logging.getLogger("uvicorn.error")

_client: Optional[MongoClient] = None


def is_uri_configured(uri: str) -> bool:
    """Check if the provided MongoDB URI is configured and not a placeholder."""
    if not uri or not uri.strip():
        return False
    # Check for placeholder markers from .env.example
    placeholders = ["<username>", "<password>", "<cluster-url>", "username:password"]
    return not any(p in uri for p in placeholders)


def get_mongo_client() -> Optional[MongoClient]:
    """
    Get or initialize the reusable MongoDB client singleton.
    Returns None if MONGODB_URI is not configured or placeholder.
    """
    global _client
    if _client is not None:
        return _client

    if not is_uri_configured(settings.MONGODB_URI):
        return None

    try:
        _client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            connectTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            socketTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            appname=settings.PROJECT_NAME,
        )
        return _client
    except Exception as exc:
        logger.error(f"Failed to initialize MongoClient: {exc}")
        return None


def get_database() -> Optional[Database]:
    """
    Get the configured MongoDB database instance.
    Returns None if client is not connected.
    """
    client = get_mongo_client()
    if client is None:
        return None
    return client[settings.MONGODB_DATABASE]


def verify_connection() -> Dict[str, Any]:
    """
    Verify MongoDB connection using the admin 'ping' command.
    Returns a structured status dictionary with clear diagnostic details.
    Does not raise exceptions.
    """
    if not is_uri_configured(settings.MONGODB_URI):
        return {
            "connected": False,
            "status": "unconfigured",
            "database": settings.MONGODB_DATABASE,
            "message": (
                "MongoDB URI is not configured or still contains placeholder values. "
                "Please configure MONGODB_URI in backend/.env with your MongoDB Atlas connection string."
            ),
        }

    try:
        client = get_mongo_client()
        if client is None:
            return {
                "connected": False,
                "status": "error",
                "database": settings.MONGODB_DATABASE,
                "message": "Failed to create MongoClient instance.",
            }

        # Execute MongoDB admin ping command to verify connection
        client.admin.command("ping")
        return {
            "connected": True,
            "status": "connected",
            "database": settings.MONGODB_DATABASE,
            "message": "Successfully connected and verified MongoDB Atlas connection.",
        }
    except ServerSelectionTimeoutError as timeout_err:
        return {
            "connected": False,
            "status": "unreachable",
            "database": settings.MONGODB_DATABASE,
            "message": "MongoDB Atlas cluster unreachable (timed out). Check cluster state, network access / IP whitelist.",
            "error_detail": str(timeout_err),
        }
    except PyMongoError as mongo_err:
        return {
            "connected": False,
            "status": "error",
            "database": settings.MONGODB_DATABASE,
            "message": "MongoDB operation error occurred.",
            "error_detail": str(mongo_err),
        }
    except Exception as exc:
        return {
            "connected": False,
            "status": "error",
            "database": settings.MONGODB_DATABASE,
            "message": f"Unexpected error during connection verification: {exc}",
            "error_detail": str(exc),
        }


def close_db_connection() -> None:
    """Cleanly close the MongoDB client connection on shutdown."""
    global _client
    if _client is not None:
        logger.info("Closing MongoDB connection pool...")
        try:
            _client.close()
        except Exception as exc:
            logger.warning(f"Error while closing MongoDB client: {exc}")
        finally:
            _client = None

import asyncio
import unittest
from fastapi import Response, status

from app.main import root
from app.api.routes.health import health_check, db_health_check
from app.database.connection import verify_connection, is_uri_configured


class TestHealthAndSetup(unittest.TestCase):
    """Test suite for baseline health check endpoints and database connection logic."""

    def test_uri_placeholder_check(self):
        """Verify placeholder connection strings are correctly flagged as unconfigured."""
        placeholder_uri = "mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/?retryWrites=true&w=majority"
        self.assertFalse(is_uri_configured(placeholder_uri))
        self.assertFalse(is_uri_configured(""))
        self.assertFalse(is_uri_configured("   "))
        self.assertTrue(is_uri_configured("mongodb+srv://realuser:realpassword@cluster0.abc.mongodb.net/mydb"))

    def test_root_endpoint(self):
        """Verify root endpoint returns project identity and navigation links."""
        res = asyncio.run(root())
        self.assertEqual(res["status"], "online")
        self.assertIn("project", res)
        self.assertIn("documentation", res)
        self.assertEqual(res["documentation"], "/docs")
        self.assertEqual(res["health_check"], "/health")
        self.assertEqual(res["db_health_check"], "/health/db")

    def test_health_endpoint(self):
        """Verify application health endpoint returns healthy status."""
        res = asyncio.run(health_check())
        self.assertEqual(res["status"], "healthy")
        self.assertIn("version", res)
        self.assertIn("environment", res)

    def test_db_health_endpoint_unconfigured(self):
        """Verify /health/db gracefully handles unconfigured URI and sets 503 status."""
        response = Response()
        res = asyncio.run(db_health_check(response))
        # When unconfigured in test/development without real Atlas URI:
        self.assertIn("connected", res)
        self.assertIn("status", res)
        if not res["connected"]:
            self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
            self.assertIn(res["status"], ["unconfigured", "unreachable", "error"])


if __name__ == "__main__":
    unittest.main()

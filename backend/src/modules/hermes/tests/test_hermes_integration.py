import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock, patch

from main import app
from middleware.dependencies import get_current_user


pytestmark = pytest.mark.asyncio


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "507f1f77bcf86cd799439011"
    user.name = "Test User"
    user.email = "test@example.com"
    return user


@pytest.fixture
def app_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


class TestHermesIntegration:
    async def test_get_config_authenticated(self, app_client, mock_user):
        app.dependency_overrides[get_current_user] = lambda: mock_user
        with patch("modules.hermes.controllers.hermes_controller.HermesConfig.find_one", new_callable=AsyncMock) as mock_find:
            mock_config = MagicMock()
            mock_config.enabled = True
            mock_config.provider = "google"
            mock_config.diag_fallback = "yolo+hermes"
            mock_config.fallback_provider = True
            mock_config.google_model = "gemini-2.0-flash"
            mock_config.google_key = "test-key"
            mock_find.return_value = mock_config
            response = await app_client.get("/api/hermes/config")
            assert response.status_code == 200
            data = response.json()
            assert "config" in data
        app.dependency_overrides.clear()

    async def test_get_config_no_config(self, app_client, mock_user):
        app.dependency_overrides[get_current_user] = lambda: mock_user
        with patch("modules.hermes.controllers.hermes_controller.HermesConfig.find_one", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = None
            response = await app_client.get("/api/hermes/config")
            assert response.status_code == 200
            data = response.json()
            assert data["config"]["enabled"] is False
        app.dependency_overrides.clear()

    async def test_save_config(self, app_client, mock_user):
        app.dependency_overrides[get_current_user] = lambda: mock_user
        with patch("modules.hermes.controllers.hermes_controller.HermesConfig.find_one", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = None
            with patch("modules.hermes.models.llm_config.HermesConfig") as MockConfig:
                mock_instance = MagicMock()
                mock_instance.insert = AsyncMock()
                MockConfig.return_value = mock_instance
                response = await app_client.put("/api/hermes/config", json={"enabled": True, "provider": "google"})
                assert response.status_code == 200
        app.dependency_overrides.clear()

    async def test_chat_without_message(self, app_client, mock_user):
        app.dependency_overrides[get_current_user] = lambda: mock_user
        response = await app_client.post("/api/hermes/chat", json={})
        assert response.status_code in (400, 422)
        app.dependency_overrides.clear()

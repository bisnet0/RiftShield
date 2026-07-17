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
    return user


@pytest.fixture
def app_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


class TestAttackIntegration:
    async def test_simulate_missing_fields(self, app_client, mock_user):
        app.dependency_overrides[get_current_user] = lambda: mock_user
        response = await app_client.post("/api/attack/simulate", json={})
        assert response.status_code in (400, 422)
        app.dependency_overrides.clear()

    async def test_simulate_with_components(self, app_client, mock_user):
        app.dependency_overrides[get_current_user] = lambda: mock_user
        with patch("modules.attack.services.attack_service.AttackSimulation") as MockModel:
            mock_sim = MagicMock()
            mock_sim.id = "sim123"
            mock_sim.insert = AsyncMock()
            MockModel.return_value = mock_sim
            response = await app_client.post("/api/attack/simulate", json={
                "components": [{"label": "api", "threat_type": "dos"}],
                "threats": [{"category": "denial_of_service", "description": "DoS attack"}],
            })
            assert response.status_code == 200
        app.dependency_overrides.clear()

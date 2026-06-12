from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from middleware.dependencies import get_current_user

pytestmark = pytest.mark.asyncio


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "507f1f77bcf86cd799439011"
    return user


@pytest.fixture
def app(mock_user) -> FastAPI:
    from main import app
    app.dependency_overrides[get_current_user] = lambda: mock_user
    return app


class TestDashboard:
    async def test_get_stats(self, app: FastAPI):
        mock_stats = {
            "total_analyses": 3,
            "total_threats": 1,
            "completed_analyses": 2,
            "failed_analyses": 0,
            "total_components_analyzed": 5,
            "threats_by_risk": {"critical": 0, "high": 1, "medium": 0, "low": 0},
            "stride_distribution": {"spoofing": 1, "tampering": 0, "repudiation": 0, "information_disclosure": 0, "denial_of_service": 0, "elevation_of_privilege": 0},
            "top_components": [{"label": "user", "count": 3}],
            "recent_analyses": [{"id": "inf1", "filename": "test.png", "status": "completed", "components_count": 2, "created_at": "2026-06-09T00:00:00"}],
        }

        with patch(
            "modules.dashboard.services.dashboard_service.get_dashboard_stats",
            new_callable=AsyncMock,
            return_value=mock_stats,
        ):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", cookies={"accessToken": "x"}) as c:
                r = await c.get("/api/dashboard/stats")
                assert r.status_code == 200
                data = r.json()
                assert data["total_analyses"] == 3
                assert data["total_threats"] == 1
                assert data["threats_by_risk"]["high"] == 1
                assert data["stride_distribution"]["spoofing"] == 1
                assert len(data["recent_analyses"]) == 1
                assert data["recent_analyses"][0]["filename"] == "test.png"

    async def test_get_stats_requires_auth(self, app: FastAPI):
        app.dependency_overrides.clear()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.get("/api/dashboard/stats")
            assert r.status_code == 401

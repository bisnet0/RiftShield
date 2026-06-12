from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from middleware.dependencies import get_current_user
from modules.inference.models.inference_model import DetectedComponent, InferenceResult

pytestmark = pytest.mark.asyncio


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "507f1f77bcf86cd799439011"
    user.email = "test@user.com"
    user.name = "Test User"
    return user


@pytest.fixture
def app(mock_user) -> FastAPI:
    from main import app

    app.dependency_overrides[get_current_user] = lambda: mock_user
    return app


def _make_mock_inference(**overrides):
    from datetime import datetime

    mock = MagicMock()
    mock.id = overrides.get("id", "inf1")
    mock.user_id = overrides.get("user_id", "user1")
    mock.filename = overrides.get("filename", "test.png")
    mock.image_path = overrides.get("image_path", "/tmp/test.png")
    mock.status = overrides.get("status", "completed")

    comp = MagicMock()
    comp.class_id = 0
    comp.label = "user"
    comp.confidence = 0.95
    comp.bbox = [10.0, 20.0, 90.0, 130.0]
    comp.inference_id = overrides.get("id", "inf1")
    mock.components = [comp]

    mock.processing_time_ms = 150.0
    mock.created_at = datetime(2026, 6, 9, 0, 0, 0)
    return mock


class TestInferenceAnalyze:
    async def test_analyze_success(self, app: FastAPI):
        mock_inference = _make_mock_inference(id="test123")

        with patch(
            "modules.inference.services.inference_service.analyze_diagram",
            new_callable=AsyncMock,
            return_value=mock_inference,
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.post(
                    "/api/inference/analyze",
                    files={"file": ("diagram.png", b"fake-png-data", "image/png")},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "completed"
                assert len(data["components"]) == 1
                assert data["components"][0]["label"] == "user"

    async def test_analyze_requires_auth(self, app: FastAPI):
        app.dependency_overrides.clear()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/inference/analyze",
                files={"file": ("test.png", b"data", "image/png")},
            )
            assert response.status_code == 401


class TestInferenceReports:
    async def test_list_reports_empty(self, app: FastAPI):
        with patch(
            "modules.inference.services.inference_service.list_inferences",
            new_callable=AsyncMock,
            return_value=([], 0),
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.get("/api/inference/reports")
                assert response.status_code == 200
                data = response.json()
                assert data["total"] == 0
                assert data["items"] == []

    async def test_list_reports_with_items(self, app: FastAPI):
        mock_inference = _make_mock_inference(id="inf1")

        with patch(
            "modules.inference.services.inference_service.list_inferences",
            new_callable=AsyncMock,
            return_value=([mock_inference], 1),
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.get("/api/inference/reports")
                assert response.status_code == 200
                data = response.json()
                assert data["total"] == 1
                assert len(data["items"]) == 1
                assert data["items"][0]["id"] == "inf1"
                assert data["items"][0]["components"][0]["label"] == "user"

    async def test_get_report_found(self, app: FastAPI):
        mock_inference = _make_mock_inference(id="inf1")

        with patch(
            "modules.inference.services.inference_service.get_inference",
            new_callable=AsyncMock,
            return_value=mock_inference,
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.get("/api/inference/reports/inf1")
                assert response.status_code == 200
                data = response.json()
                assert data["id"] == "inf1"
                assert data["components"][0]["label"] == "user"

    async def test_get_report_not_found(self, app: FastAPI):
        with patch(
            "modules.inference.services.inference_service.InferenceResult.get",
            new_callable=AsyncMock,
            return_value=None,
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.get("/api/inference/reports/nonexistent")
                assert response.status_code == 404

    async def test_delete_report(self, app: FastAPI):
        mock_inference = MagicMock(spec=InferenceResult)
        mock_inference.image_path = "/tmp/test.png"
        mock_inference.delete = AsyncMock()

        with patch(
            "modules.inference.services.inference_service.InferenceResult.get",
            new_callable=AsyncMock,
            return_value=mock_inference,
        ), patch("os.remove"):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.delete("/api/inference/reports/inf1")
                assert response.status_code == 200
                data = response.json()
                assert data["deleted"] is True
                mock_inference.delete.assert_awaited_once()

    async def test_delete_report_not_found(self, app: FastAPI):
        with patch(
            "modules.inference.services.inference_service.InferenceResult.get",
            new_callable=AsyncMock,
            return_value=None,
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport,
                base_url="http://test",
                cookies={"accessToken": "fake-token"},
            ) as client:
                response = await client.delete("/api/inference/reports/nonexistent")
                assert response.status_code == 200
                data = response.json()
                assert data["deleted"] is False


def _make_mock_yolo_result():
    import torch

    class MockBoxes:
        def __init__(self):
            self.cls = torch.tensor([[0.0], [1.0], [3.0]])
            self.conf = torch.tensor([[0.95], [0.87], [0.72]])
            self.xyxy = torch.tensor([
                [[10.0, 20.0, 100.0, 150.0]],
                [[200.0, 50.0, 350.0, 180.0]],
                [[50.0, 200.0, 120.0, 300.0]],
            ])

    class MockResult:
        boxes = MockBoxes()

    return [MockResult()]

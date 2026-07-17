import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

from shared.utils.token import generate_access_token, generate_refresh_token, verify_access_token, verify_refresh_token


class TestTokenUnit:
    def test_generate_access_token(self):
        token = generate_access_token("user123", "test@test.com")
        assert isinstance(token, str)
        assert len(token) > 20

    def test_generate_refresh_token(self):
        token = generate_refresh_token("user123", "test@test.com")
        assert isinstance(token, str)
        assert len(token) > 20

    def test_verify_access_token_valid(self):
        token = generate_access_token("user123", "test@test.com")
        payload = verify_access_token(token)
        assert payload["userId"] == "user123"
        assert payload["email"] == "test@test.com"
        assert "exp" in payload

    def test_verify_refresh_token_valid(self):
        token = generate_refresh_token("user123", "test@test.com")
        payload = verify_refresh_token(token)
        assert payload["userId"] == "user123"

    def test_verify_expired_token_raises(self):
        with patch("shared.utils.token._generate_token") as mock:
            mock.return_value = "expired.token.here"
            with pytest.raises(Exception):
                verify_access_token("expired.token.here")

    def test_access_token_expiry(self):
        token = generate_access_token("user123", "test@test.com")
        payload = verify_access_token(token)
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        assert exp > now
        assert exp < now + timedelta(hours=1)

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from shared.utils.errors import UnauthorizedError, AppError


class TestAuthServiceUnit:
    @pytest.mark.asyncio
    async def test_hash_password(self):
        with patch("modules.auth.services.auth_service.bcrypt.hashpw") as mock_hash:
            mock_hash.return_value = b"$2b$12$hashedpassword"
            from modules.auth.services.auth_service import AuthService
            hashed = AuthService._hash_password("senha123")
            assert hashed == "$2b$12$hashedpassword"

    @pytest.mark.asyncio
    async def test_verify_password_correct(self):
        with patch("modules.auth.services.auth_service.bcrypt.checkpw") as mock_check:
            mock_check.return_value = True
            from modules.auth.services.auth_service import AuthService
            result = AuthService._verify_password("senha123", "$2b$12$hash")
            assert result is True

    @pytest.mark.asyncio
    async def test_verify_password_wrong(self):
        with patch("modules.auth.services.auth_service.bcrypt.checkpw") as mock_check:
            mock_check.return_value = False
            from modules.auth.services.auth_service import AuthService
            result = AuthService._verify_password("wrong", "$2b$12$hash")
            assert result is False

    @pytest.mark.asyncio
    async def test_validate_email_valid(self):
        from modules.auth.services.auth_service import AuthService
        result = AuthService._validate_email("test@example.com")
        assert result is True

    @pytest.mark.asyncio
    async def test_validate_email_invalid(self):
        from modules.auth.services.auth_service import AuthService
        result = AuthService._validate_email("not-an-email")
        assert result is False

    @pytest.mark.asyncio
    async def test_validate_invite_code_missing(self):
        with patch("modules.auth.services.auth_service.InviteCode.find_one", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = None
            from modules.auth.services.auth_service import AuthService
            with pytest.raises(AppError, match="inválido"):
                await AuthService.validate_invite_code("invalidcode")

    @pytest.mark.asyncio
    async def test_validate_invite_code_used(self):
        mock_code = MagicMock()
        mock_code.used = True
        with patch("modules.auth.services.auth_service.InviteCode.find_one", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = mock_code
            from modules.auth.services.auth_service import AuthService
            with pytest.raises(AppError, match="já utilizado"):
                await AuthService.validate_invite_code("usedcode")

    @pytest.mark.asyncio
    async def test_validate_invite_code_valid(self):
        mock_code = MagicMock()
        mock_code.used = False
        mock_code.role = "user"
        with patch("modules.auth.services.auth_service.InviteCode.find_one", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = mock_code
            from modules.auth.services.auth_service import AuthService
            result = await AuthService.validate_invite_code("validcode")
            assert result == "user"

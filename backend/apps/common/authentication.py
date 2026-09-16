"""Authentification via token JWT dans le query param ?token=..."""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken


class QueryParamTokenAuthentication(JWTAuthentication):
    """Auth via ?token=... pour les endpoints PDF (download direct)."""

    def authenticate(self, request):
        token = request.query_params.get("token")
        if not token:
            return None
        try:
            validated = AccessToken(token)
            user = self.get_user(validated)
            return (user, token)
        except Exception:
            return None

"""Google OAuth client and identity handling.

This module intentionally does not persist Google identities. The returned user
profile is available only during the callback and is printed for development.
"""

import json
from typing import Any

from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request

from app.core.config import settings


GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"


oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url=GOOGLE_DISCOVERY_URL,
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    client_kwargs={
        "scope": "openid email profile",
        "code_challenge_method": "S256",
    },
)


async def get_google_user_info(request: Request) -> dict[str, Any]:
    """Exchange the callback code and return Google's verified user profile."""
    google = oauth.create_client("google")
    token = await google.authorize_access_token(request)
    user_info = await google.userinfo(token=token)
    return dict(user_info)


def print_google_user_info(user_info: dict[str, Any]) -> None:
    """Print the identity returned by Google without printing OAuth tokens."""
    print(
        "[google-auth] Verified Google user (not persisted):\n"
        + json.dumps(user_info, indent=2, sort_keys=True, default=str)
    )


__all__ = ["get_google_user_info", "oauth", "print_google_user_info"]

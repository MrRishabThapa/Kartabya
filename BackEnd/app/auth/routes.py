"""Routes for Google sign-in."""

import httpx
from authlib.integrations.starlette_client import OAuthError
from fastapi import APIRouter, Request
from starlette.responses import JSONResponse, RedirectResponse

from app.auth.google import get_google_user_info, oauth, print_google_user_info
from app.core.config import settings


router = APIRouter(prefix="/auth", tags=["auth"])


def oauth_error_response(detail: str) -> JSONResponse:
    """Return a client-safe OAuth error without exposing credentials or tokens."""
    return JSONResponse(status_code=400, content={"detail": detail})


@router.get("/google", name="google_login")
async def google_login(request: Request) -> RedirectResponse:
    """Redirect the browser to Google's consent screen."""
    google = oauth.create_client("google")
    return await google.authorize_redirect(request, settings.google_redirect_uri)


@router.get("/google/callback", name="google_callback", response_model=None)
async def google_callback(request: Request) -> RedirectResponse | JSONResponse:
    """Validate Google sign-in, print the profile, and discard it."""
    if request.query_params.get("error"):
        return oauth_error_response("Google authorization was not completed.")

    try:
        # Authlib validates the OAuth state, PKCE verifier, and OIDC nonce here.
        user_info = await get_google_user_info(request)
    except OAuthError:
        return oauth_error_response("Google authorization or token exchange failed.")
    except (httpx.HTTPError, ValueError):
        return oauth_error_response("Google token or user-info request failed.")

    if not user_info.get("email") or not user_info.get("sub"):
        return oauth_error_response("Google did not return a complete identity.")
    if user_info.get("email_verified") is not True:
        return oauth_error_response("Google did not return a verified email identity.")

    print_google_user_info(user_info)
    return RedirectResponse(settings.frontend_url, status_code=303)


__all__ = ["router"]

from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from config import SupabaseConfig


class AuthMiddleware(BaseHTTPMiddleware):

    def __init__(self, app):
        super().__init__(app)
        self.supabase = SupabaseConfig()

    async def dispatch(self, request: Request, call_next):

        if request.url.path in ["/health", "/api/v1/ws"]:
            return await call_next(request)

        if request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        token = auth_header.split(" ")[1]

        request.state.user = None

        if token:
            try:
                res = self.supabase.client.auth.get_user(token)
                request.state.user = res.user

            except Exception:
                request.state.user = None

        return await call_next(request)
from httpx import request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from config import SupabaseConfig
class AuthMiddleware(BaseHTTPMiddleware):

    def __init__(self, app):
        super().__init__(app)
        self.supabase = SupabaseConfig()

    async def dispatch(self, request: Request, call_next):


        if request.url.path in ["/health", "/ws"]:
            return await call_next(request)
        
        token = request.cookies.get("sb-access-token")

        request.state.user = None

        if token:
            try:
                res = self.supabase.client.auth.get_user(token)
                request.state.user = res.user

            except Exception as e:
                request.state.user = None

        return await call_next(request)
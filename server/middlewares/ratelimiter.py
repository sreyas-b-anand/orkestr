from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from config import redis_instance

LIMIT = 100
WINDOW = 60

class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path == "/health":
            return await call_next(request)

        user = getattr(request.state, "user", None)

        if user:
            client_id = f"user:{user.id}"
        else:
            client_id = f"ip:{request.client.host}"

        key = f"rate:{client_id}"

        pipe = redis_instance.pipeline()
        pipe.incr(key)
        pipe.expire(key, WINDOW)
        current, _ = await pipe.execute()

        if current > LIMIT:
            raise HTTPException(
                status_code=429,
                detail="Too many requests"
            )

        return await call_next(request)
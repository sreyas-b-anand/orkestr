from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
import redis

r = redis.Redis(host="redis", port=6379, decode_responses=True)

LIMIT = 100
WINDOW = 60


class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        client_id = request.state.user.id if request.state.user else request.client.host
        key = f"rate:{client_id}"

        current = r.incr(key)

        if current == 1:
            r.expire(key, WINDOW)

        if current > LIMIT:
            raise HTTPException(status_code=429, detail="Too many requests")

        response = await call_next(request)
        return response
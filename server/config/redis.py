import redis.asyncio as redis
from .settings import Settings
setting = Settings()
redis_instance = redis.from_url(setting.redis_url , decode_responses=True)


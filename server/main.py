from fastapi import FastAPI , status
from fastapi.middleware.cors import CORSMiddleware
from routes import model_router, campaign_router, ws_router
from middlewares import AuthMiddleware , RateLimiterMiddleware
from config import Settings

settings = Settings()

app = FastAPI(title="Orkestr FastAPI")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimiterMiddleware)
app.add_middleware(AuthMiddleware)

app.include_router(model_router, prefix="/api/v1")
app.include_router(campaign_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return status.HTTP_200_OK

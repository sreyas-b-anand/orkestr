from fastapi import APIRouter , Depends
from utils import get_current_user
from pipelines.agent_pipeline import AgentPipeline
from schemas import OrkestrRequest , OrkestrResponse
from config import redis_instance
model_router = APIRouter()

ap = AgentPipeline()

@model_router.post("/generate" , response_model=OrkestrResponse)
async def generate_content(request: OrkestrRequest , user=Depends(get_current_user)):
    
    result = await ap.run(
        request.text,
        user.id
    )
    
    if result:
        await redis_instance.delete(f"campaigns:user:{user.id}")

    return OrkestrResponse(
        input={
            "campaignName": request.campaignName,
            "text": request.text
        },
        output=result
    )

from fastapi import APIRouter , Depends
from utils import get_current_user
from pipelines.agent_pipeline import AgentPipeline
from schemas.requests import TextRequest
model_router = APIRouter()

ap = AgentPipeline()

@model_router.post("/generate")
async def generate_content(request: TextRequest , user=Depends(get_current_user)):
    
    text = request.text
    result = await ap.run(
        request.text,
        user.id
    )

    return {
        "input": request.text,
        "output": result
    }


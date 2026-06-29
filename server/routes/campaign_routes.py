from fastapi import APIRouter, HTTPException , Depends 
from services import CampaignService
from utils import get_current_user
from uuid import UUID
from config import redis_instance
import json
campaign_router = APIRouter()
campaign_service = CampaignService() 
CACHE_TTL = 240
@campaign_router.get("/campaigns")
async def get_campaigns(user=Depends(get_current_user)):
    try:
        cache_key = f"campaigns:user:{user.id}"
        cached = await redis_instance.get(cache_key)
        if cached:
            return {"campaigns" : json.loads(cached)}
        

        campaigns = await campaign_service.get_all_campaigns(user_id=user.id)
        
        await redis_instance.set(cache_key, json.dumps(campaigns), ex=CACHE_TTL)
        
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@campaign_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: UUID, user=Depends(get_current_user)):
    try:
        cache_key = f"campaign:{campaign_id}"

        cached = await redis_instance.get(cache_key)
        if cached:
            return json.loads(cached)

        campaign = await campaign_service.get_campaign_by_id(
            campaign_id,
            user_id=user.id
        )

        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")

        await redis_instance.set(cache_key, json.dumps(campaign), ex=CACHE_TTL)

        return campaign
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@campaign_router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: UUID, user=Depends(get_current_user)):
    try:
        success = await campaign_service.delete_campaign(campaign_id, user_id=user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Campaign not found")

        
        await redis_instance.delete(f"campaign:{campaign_id}")

        await redis_instance.delete(f"campaigns:user:{user.id}")

        return {"message": "Campaign deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
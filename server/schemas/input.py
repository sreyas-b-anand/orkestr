from pydantic import BaseModel 

class OrkestrRequest(BaseModel):
    campaignName : str 
    text: str
    
  
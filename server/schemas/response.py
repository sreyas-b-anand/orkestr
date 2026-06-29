from pydantic import BaseModel, ConfigDict

from .input import OrkestrRequest

class OrkestrResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    input: OrkestrRequest
    output: dict  
    

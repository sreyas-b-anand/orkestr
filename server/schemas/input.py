from pydantic import BaseModel 

class OrkestrRequest(BaseModel):
    text: str
  
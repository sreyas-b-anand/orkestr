from pydantic import BaseModel, Field, ConfigDict
from typing import List

class WriterSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    blog_post: str = Field(default="", min_length=10)
    social_thread: List[str] = Field(default_factory=list)
    email_teaser: str = ""
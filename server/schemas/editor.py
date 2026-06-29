from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ReviewBlock(BaseModel):
    model_config = ConfigDict(extra="ignore")

    approved: bool = False
    issues: List[str] = []
    correction_note: Optional[str] = None


class EditorSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    blog_post: ReviewBlock
    social_thread: ReviewBlock
    email_teaser: ReviewBlock
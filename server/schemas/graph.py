from typing import TypedDict, Optional, Dict, Any
from uuid import UUID
class GraphState(TypedDict):
    source_text: str
    fact_sheet: dict
    drafts: dict
    review: dict
    feedback: str
    status: str
    iterations: int
    user_id:UUID
    tone: str       
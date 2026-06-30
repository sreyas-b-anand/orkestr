from typing import TypedDict
from uuid import UUID
class GraphState(TypedDict):
    campaign_name : str
    source_text: str
    fact_sheet: dict
    drafts: dict
    review: dict
    feedback: str
    status: str
    iterations: int
    user_id:UUID
    tone: str       
from typing import TypedDict, Optional, Dict, Any

class GraphState(TypedDict):
    source_text: str
    fact_sheet: dict
    drafts: dict
    review: dict
    feedback: str
    status: str
    iterations: int
    tone: str
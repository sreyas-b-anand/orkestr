from typing import List, Dict, Optional, Any
from pydantic import BaseModel, ConfigDict

class AmbiguousStatement(BaseModel):
    statement: str
    reason: str


class FactSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    product_name: Optional[str] = None
    core_features: List[str] = []
    technical_specs: Dict[str, Any] = {}   # FIXED
    target_audience: Optional[str] = None
    value_proposition: Optional[str] = None
    key_stats_or_numbers: List[str] = []
    tone_and_positioning: Optional[str] = None
    ambiguous_statements: List[AmbiguousStatement] = []
    source_summary: str = ""
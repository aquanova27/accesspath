from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class UserNeedsProfile(BaseModel):
    requires_wheelchair: bool = False
    requires_bariatric_equipment: bool = False
    requires_asl: bool = False
    requires_tactile_signage: bool = False
    requires_low_stimulus: bool = False
    requires_strobe_free: bool = False
    max_walking_distance_meters: Optional[int] = 500

class Facility(BaseModel):
    id: str
    name: str
    address: str
    wheelchair_accessible: bool
    bariatric_equipped: bool
    asl_interpreter_available: bool
    tactile_signage: bool
    sensory_room_available: bool
    strobe_free_lighting: bool
    parking_distance_meters: int
    contact_email: str

class MatchResult(BaseModel):
    facility: Facility
    universal_access_score: float = Field(..., description="Percentage score from 0.0 to 100.0")
    matched_criteria: List[str]
    missing_criteria: List[str]
    recommendation_notes: str
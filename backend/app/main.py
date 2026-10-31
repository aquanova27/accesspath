from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.models import UserNeedsProfile, Facility, MatchResult
from app.needs import ACCESSIBILITY_QUESTIONS
from app.repository import get_facilities
from app.matching import calculate_match
from app.ai_assistant import generate_pre_visit_request

app = FastAPI(
    title="AccessPath API",
    description="Healthcare navigation and universal accessibility intelligence engine.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "AccessPath Backend"}

@app.get("/api/needs")
def get_needs_catalog():
    return {"categories": ACCESSIBILITY_QUESTIONS}

@app.get("/api/facilities", response_model=List[Facility])
def list_facilities():
    return get_facilities()

@app.post("/api/match", response_model=List[MatchResult])
def match_facilities(profile: UserNeedsProfile):
    facilities = get_facilities()
    results = [calculate_match(profile, fac) for fac in facilities]
    # Sort by score descending (highest match first)
    results.sort(key=lambda x: x.universal_access_score, reverse=True)
    return results

@app.post("/api/generate-request")
def generate_request(profile: UserNeedsProfile, facility_id: str):
    facilities = get_facilities()
    facility = next((f for f in facilities if f.id == facility_id), None)
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    letter = generate_pre_visit_request(profile, facility)
    return {"facility_id": facility_id, "request_letter": letter}
import json
from pathlib import Path
from typing import List
from app.models import Facility

def get_facilities() -> List[Facility]:
    data_path = Path(__file__).parent / "data" / "facilities.json"
    if not data_path.exists():
        return []
    with open(data_path, "r") as f:
        raw_data = json.load(f)
    return [Facility(**item) for item in raw_data]
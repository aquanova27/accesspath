from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_needs():
    response = client.get("/api/needs")
    assert response.status_code == 200
    assert "categories" in response.json()

def test_match_endpoint():
    payload = {
        "requires_wheelchair": True,
        "requires_asl": True
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "universal_access_score" in data[0]
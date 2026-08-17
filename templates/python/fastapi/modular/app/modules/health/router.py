import time
from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()
START_TIME = time.time()

@router.get("/")
def health_check():
    return {
        "status": "ok",
        "uptime": round(time.time() - START_TIME, 2),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
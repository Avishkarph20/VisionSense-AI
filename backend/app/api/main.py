from fastapi import FastAPI

from app.api.routers.health import router as health_router
from app.routers import videos


app = FastAPI(
    title="AI Video Activity Monitoring API"
)
app.include_router(videos.router)

app.include_router(health_router)

@app.get("/")
def root():
    return {
        "message": "AI Video Activity Monitoring Backend is Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
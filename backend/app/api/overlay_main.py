from fastapi.middleware.cors import CORSMiddleware
from app.api.main import app
from app.routers.events import router as events_router
from app.routers.processing import router as processing_router
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(events_router)
app.include_router(processing_router)
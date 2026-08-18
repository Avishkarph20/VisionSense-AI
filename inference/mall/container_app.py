"""Mall container HTTP API and backend event publisher."""

from __future__ import annotations

import os
from typing import Any

from .app import process_video


def create_app():
    try:
        from fastapi import FastAPI, HTTPException
    except ImportError as exc:
        raise RuntimeError("Mall inference requires fastapi and uvicorn") from exc

    app = FastAPI(title="VisionSense AI Mall Inference")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "mall-inference", "model": "Shopliftn_best.pt"}

    @app.get("/rules")
    def rules() -> dict[str, str]:
        return {"config": os.getenv("MALL_RULE_CONFIG", "/app/inference/mall/rules.yaml")}

    @app.post("/infer")
    def infer(payload: dict[str, Any]) -> dict[str, Any]:
        source = payload.get("source")
        if not source:
            raise HTTPException(status_code=400, detail="source is required")
        source = int(source) if isinstance(source, str) and source.isdigit() else source
        events = []
        backend_url = os.getenv("BACKEND_EVENTS_URL")
        for event in process_video(source, camera_id=payload.get("camera_id", "mall-camera-01"), max_frames=payload.get("max_frames", 100)):
            events.append(event)
            if backend_url:
                try:
                    import requests
                    requests.post(backend_url, json=event, timeout=5).raise_for_status()
                except Exception:
                    pass
        return {"environment": "mall", "events": events, "count": len(events)}

    return app


app = create_app()

"""Railway inference service using Railway_best.pt."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from ..pipeline import InferencePipeline, PipelineConfig

ENVIRONMENT = "railway"
MODEL_PATH = Path(__file__).resolve().parents[1] / "Railway_best.pt"


def apply_railway_rules(event: dict[str, Any]) -> dict[str, Any]:
    labels = [item["class_name"].lower() for item in event["detections"]]
    matched: list[str] = []
    if any(label in {"person-on-track", "person_on_track", "track-intrusion"} for label in labels):
        matched.append("track_intrusion_rule")
    if any(label in {"obstacle", "animal", "vehicle-on-track"} for label in labels):
        matched.append("railway_obstacle_rule")
    event["rule_result"] = {
        "event_type": matched[0].replace("_rule", "") if matched else "detection",
        "severity": "critical" if "track_intrusion_rule" in matched else ("high" if matched else "low"),
        "matched_rules": matched,
    }
    return event


def create_pipeline(camera_id: str = "railway-camera-01") -> InferencePipeline:
    return InferencePipeline(PipelineConfig(
        camera_id=camera_id,
        domain=ENVIRONMENT,
        yolo_model=str(MODEL_PATH),
        enable_lstm=False,
    ))


def process_video(source: str | int, *, camera_id: str = "railway-camera-01", max_frames: int | None = None):
    pipeline = create_pipeline(camera_id)
    for event in pipeline.run(source, max_frames=max_frames):
        yield apply_railway_rules(event)


def create_app():
    try:
        from fastapi import FastAPI, HTTPException
    except ImportError as exc:
        raise RuntimeError("Railway service requires fastapi and uvicorn") from exc
    app = FastAPI(title="Vision AI Railway Inference")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "environment": ENVIRONMENT, "model": MODEL_PATH.name}

    @app.post("/infer")
    def infer(payload: dict[str, Any]) -> dict[str, Any]:
        if not payload.get("source"):
            raise HTTPException(status_code=400, detail="source is required")
        source = payload["source"]
        source = int(source) if isinstance(source, str) and source.isdigit() else source
        events = list(process_video(source, camera_id=payload.get("camera_id", "railway-camera-01"), max_frames=payload.get("max_frames", 100)))
        return {"environment": ENVIRONMENT, "events": events, "count": len(events)}
    return app


app = None
try:
    app = create_app()
except RuntimeError:
    pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Run railway inference")
    parser.add_argument("source")
    parser.add_argument("--camera-id", default="railway-camera-01")
    parser.add_argument("--max-frames", type=int)
    args = parser.parse_args()
    source: str | int = int(args.source) if args.source.isdigit() else args.source
    for event in process_video(source, camera_id=args.camera_id, max_frames=args.max_frames):
        print(json.dumps(event))


if __name__ == "__main__":
    main()

"""Standard event serialization for API, rules, and storage consumers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4


def build_event(
    *,
    camera_id: str,
    domain: str,
    frame_index: int,
    timestamp: float,
    detections: list[dict[str, Any]],
    tracks: list[dict[str, Any]],
    features: list[dict[str, Any]],
    prediction: Optional[dict[str, Any]] = None,
    clip_path: Optional[str] = None,
) -> dict[str, Any]:
    """Build a JSON-ready raw inference event."""
    return {
        "event_id": str(uuid4()),
        "camera_id": camera_id,
        "domain": domain,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "video_timestamp": timestamp,
        "frame_index": frame_index,
        "detections": detections,
        "tracks": tracks,
        "features": features,
        "prediction": prediction or {"label": "normal", "confidence": 0.0},
        "clip_path": clip_path,
    }

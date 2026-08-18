"""Convert tracks into features used by rules and temporal models."""

from __future__ import annotations

import math
from typing import Any

from .tracker import Track


class FeatureExtractor:
    def __init__(self, *, fps: float = 30.0):
        self.fps = max(float(fps), 1.0)

    def extract(self, tracks: list[Track], *, timestamp: float) -> list[dict[str, Any]]:
        features = []
        for track in tracks:
            previous = track.history[-2] if len(track.history) >= 2 else track.center
            dx = track.center[0] - previous[0]
            dy = track.center[1] - previous[1]
            speed = math.hypot(dx, dy) * self.fps
            features.append({
                "track_id": track.track_id,
                "class_name": track.class_name,
                "timestamp": timestamp,
                "center_x": track.center[0],
                "center_y": track.center[1],
                "velocity_x": dx * self.fps,
                "velocity_y": dy * self.fps,
                "speed": speed,
                "direction": math.degrees(math.atan2(dy, dx)) if speed else 0.0,
                "age_frames": track.age,
                "missed_frames": track.missed,
                "dwell_time": track.age / self.fps,
            })
        return features

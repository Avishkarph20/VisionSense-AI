"""Object tracking with a simple dependency-free fallback."""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any

from .yolo_inference import Detection


@dataclass
class Track:
    track_id: int
    class_id: int
    class_name: str
    confidence: float
    bbox: list[float]
    center: tuple[float, float]
    age: int = 1
    missed: int = 0
    history: list[tuple[float, float]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        result = asdict(self)
        result["center"] = list(self.center)
        return result


class CentroidTracker:
    """Small tracker suitable for a starter pipeline and local testing.

    Replace this class with ByteTrack in production when camera density and
    identity accuracy require it.
    """

    def __init__(self, *, max_distance: float = 80.0, max_missed: int = 15):
        self.max_distance = max_distance
        self.max_missed = max_missed
        self._next_id = 1
        self._tracks: dict[int, Track] = {}

    @staticmethod
    def _center(bbox: list[float]) -> tuple[float, float]:
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)

    def update(self, detections: list[Detection]) -> list[Track]:
        unmatched = set(self._tracks)
        updated: dict[int, Track] = {}
        for detection in detections:
            center = self._center(detection.bbox)
            candidates = [
                track for track_id, track in self._tracks.items()
                if track_id in unmatched and track.class_id == detection.class_id
            ]
            match = min(
                candidates,
                key=lambda track: math.dist(track.center, center),
                default=None,
            )
            if match is not None and math.dist(match.center, center) <= self.max_distance:
                unmatched.remove(match.track_id)
                match.center = center
                match.bbox = detection.bbox
                match.confidence = detection.confidence
                match.age += 1
                match.missed = 0
                match.history.append(center)
                updated[match.track_id] = match
            else:
                track = Track(
                    track_id=self._next_id,
                    class_id=detection.class_id,
                    class_name=detection.class_name,
                    confidence=detection.confidence,
                    bbox=detection.bbox,
                    center=center,
                    history=[center],
                )
                self._next_id += 1
                updated[track.track_id] = track

        for track_id in unmatched:
            old = self._tracks[track_id]
            old.missed += 1
            if old.missed <= self.max_missed:
                updated[track_id] = old

        self._tracks = updated
        return list(updated.values())

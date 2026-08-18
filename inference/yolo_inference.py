"""YOLO object detection adapter."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Iterable, Optional


@dataclass
class Detection:
    class_id: int
    class_name: str
    confidence: float
    bbox: list[float]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class YOLODetector:
    """Thin adapter around Ultralytics YOLO.

    The import is lazy so the rest of the project can be tested without
    installing the heavyweight inference runtime.
    """

    def __init__(self, model_path: str, *, confidence: float = 0.35, device: Optional[str] = None):
        self.model_path = model_path
        self.confidence = confidence
        self.device = device
        self._model = None

    def load(self) -> None:
        try:
            from ultralytics import YOLO
        except ImportError as exc:
            raise RuntimeError("YOLODetector requires ultralytics") from exc
        self._model = YOLO(self.model_path)

    def predict(self, image: Any) -> list[Detection]:
        if self._model is None:
            self.load()
        results = self._model.predict(
            source=image,
            conf=self.confidence,
            device=self.device,
            verbose=False,
        )
        if not results:
            return []

        result = results[0]
        names = result.names
        detections: list[Detection] = []
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0].item())
            detections.append(
                Detection(
                    class_id=class_id,
                    class_name=str(names[class_id]),
                    confidence=float(box.conf[0].item()),
                    bbox=[float(value) for value in box.xyxy[0].tolist()],
                )
            )
        return detections


def detections_from_dicts(items: Iterable[dict[str, Any]]) -> list[Detection]:
    """Convert serialized detections back into typed detections."""
    return [Detection(**item) for item in items]

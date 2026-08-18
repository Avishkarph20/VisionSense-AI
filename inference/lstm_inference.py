"""Temporal LSTM inference adapter with a safe no-model fallback."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class Prediction:
    label: str
    confidence: float
    model_available: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "label": self.label,
            "confidence": self.confidence,
            "model_available": self.model_available,
        }


class LSTMInference:
    def __init__(self, model_path: Optional[str] = None, *, labels: Optional[list[str]] = None):
        self.model_path = model_path
        self.labels = labels or ["normal"]
        self._model = None

    def load(self) -> None:
        if not self.model_path:
            return
        try:
            import torch
        except ImportError as exc:
            raise RuntimeError("LSTMInference requires torch") from exc
        self._model = torch.jit.load(self.model_path, map_location="cpu")
        self._model.eval()

    def predict(self, sequence: list[dict[str, Any]]) -> Prediction:
        if self._model is None:
            if not self.model_path:
                return Prediction("normal", 0.0, False)
            self.load()

        try:
            import torch
            values = [[
                float(item.get("center_x", 0.0)),
                float(item.get("center_y", 0.0)),
                float(item.get("speed", 0.0)),
                float(item.get("dwell_time", 0.0)),
            ] for item in sequence]
            tensor = torch.tensor(values, dtype=torch.float32).unsqueeze(0)
            with torch.no_grad():
                output = self._model(tensor)
            index = int(output.argmax(dim=-1).item())
            confidence = float(output.softmax(dim=-1).max().item())
            label = self.labels[index] if index < len(self.labels) else str(index)
            return Prediction(label, confidence, True)
        except (AttributeError, IndexError, RuntimeError, ValueError) as exc:
            raise RuntimeError("LSTM model output is incompatible with the configured pipeline") from exc

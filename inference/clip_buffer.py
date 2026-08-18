"""Rolling pre-event frame buffer and post-event clip recording."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional


@dataclass
class BufferedFrame:
    image: Any
    timestamp: float


class ClipBuffer:
    def __init__(self, *, pre_seconds: float = 5.0, post_seconds: float = 5.0):
        self.pre_seconds = pre_seconds
        self.post_seconds = post_seconds
        self._frames: deque[BufferedFrame] = deque()

    def add(self, image: Any, timestamp: float) -> None:
        self._frames.append(BufferedFrame(image, timestamp))
        cutoff = timestamp - self.pre_seconds
        while self._frames and self._frames[0].timestamp < cutoff:
            self._frames.popleft()

    def snapshot(self) -> list[BufferedFrame]:
        return list(self._frames)

    def save(self, path: str | Path, *, fps: float, size: tuple[int, int]) -> Path:
        """Save the current rolling buffer as an MP4 clip."""
        try:
            import cv2
        except ImportError as exc:
            raise RuntimeError("ClipBuffer.save requires opencv-python") from exc

        frames = self.snapshot()
        if not frames:
            raise ValueError("Cannot save an empty clip")
        output = Path(path)
        output.parent.mkdir(parents=True, exist_ok=True)
        writer = cv2.VideoWriter(
            str(output), cv2.VideoWriter_fourcc(*"mp4v"), fps, size
        )
        if not writer.isOpened():
            raise RuntimeError(f"Could not create video clip: {output}")
        try:
            for frame in frames:
                writer.write(frame.image)
        finally:
            writer.release()
        return output

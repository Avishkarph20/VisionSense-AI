"""Video and RTSP frame loading utilities."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator, Optional, Union


@dataclass
class Frame:
    """A decoded frame with timing and source metadata."""

    image: Any
    frame_index: int
    timestamp: float
    fps: float
    source: str


class VideoLoader:
    """Iterate over frames from a local file, webcam index, or RTSP URL.

    OpenCV is imported only when a stream is opened, keeping this module
    importable in environments that do not yet have OpenCV installed.
    """

    def __init__(self, source: Union[str, int], *, max_frames: Optional[int] = None):
        self.source = source
        self.max_frames = max_frames

    def __iter__(self) -> Iterator[Frame]:
        try:
            import cv2
        except ImportError as exc:
            raise RuntimeError("VideoLoader requires opencv-python") from exc

        capture = cv2.VideoCapture(self.source)
        if not capture.isOpened():
            capture.release()
            raise RuntimeError(f"Could not open video source: {self.source}")

        fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
        if fps <= 0:
            fps = 30.0

        index = 0
        try:
            while self.max_frames is None or index < self.max_frames:
                ok, image = capture.read()
                if not ok:
                    break
                yield Frame(
                    image=image,
                    frame_index=index,
                    timestamp=index / fps,
                    fps=fps,
                    source=str(self.source),
                )
                index += 1
        finally:
            capture.release()


def probe_video(source: Union[str, int]) -> dict[str, Any]:
    """Return basic metadata without consuming the video."""

    try:
        import cv2
    except ImportError as exc:
        raise RuntimeError("probe_video requires opencv-python") from exc

    capture = cv2.VideoCapture(source)
    if not capture.isOpened():
        capture.release()
        raise RuntimeError(f"Could not open video source: {source}")
    try:
        return {
            "source": str(source),
            "fps": float(capture.get(cv2.CAP_PROP_FPS) or 0.0),
            "frame_count": int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0),
            "width": int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0),
            "height": int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0),
        }
    finally:
        capture.release()

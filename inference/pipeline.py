"""End-to-end orchestration of the Vision AI inference stages."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from .clip_buffer import ClipBuffer
from .feature_extractor import FeatureExtractor
from .json_generator import build_event
from .lstm_inference import LSTMInference
from .tracker import CentroidTracker
from .video_loader import VideoLoader
from .yolo_inference import YOLODetector


@dataclass
class PipelineConfig:
    camera_id: str = "camera-unknown"
    domain: str = "generic"
    yolo_model: str = "models/best.pt"
    lstm_model: Optional[str] = "models/best_lstm.pt"
    confidence: float = 0.35
    device: Optional[str] = None
    sequence_length: int = 30
    clip_directory: str = "data/clips"
    enable_lstm: bool = False


class InferencePipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.detector = YOLODetector(
            config.yolo_model,
            confidence=config.confidence,
            device=config.device,
        )
        self.tracker = CentroidTracker()
        self.feature_extractor = FeatureExtractor()
        self.temporal_model = LSTMInference(config.lstm_model) if config.enable_lstm else None
        self.clip_buffer = ClipBuffer()
        self._feature_sequence: list[dict[str, Any]] = []

    def process_frame(self, frame: Any, *, frame_index: int, timestamp: float, fps: float) -> dict[str, Any]:
        self.clip_buffer.add(frame, timestamp)
        detections = self.detector.predict(frame)
        tracks = self.tracker.update(detections)
        self.feature_extractor.fps = max(fps, 1.0)
        features = self.feature_extractor.extract(tracks, timestamp=timestamp)
        self._feature_sequence.extend(features)
        self._feature_sequence = self._feature_sequence[-self.config.sequence_length:]

        prediction = None
        if self.temporal_model and len(self._feature_sequence) >= self.config.sequence_length:
            prediction = self.temporal_model.predict(self._feature_sequence).to_dict()

        return build_event(
            camera_id=self.config.camera_id,
            domain=self.config.domain,
            frame_index=frame_index,
            timestamp=timestamp,
            detections=[item.to_dict() for item in detections],
            tracks=[item.to_dict() for item in tracks],
            features=features,
            prediction=prediction,
        )

    def run(self, source: str | int, *, max_frames: Optional[int] = None):
        """Process a source and yield one event dictionary per frame."""
        for frame in VideoLoader(source, max_frames=max_frames):
            yield self.process_frame(
                frame.image,
                frame_index=frame.frame_index,
                timestamp=frame.timestamp,
                fps=frame.fps,
            )


def main() -> None:
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Run Vision AI inference")
    parser.add_argument("source", help="Video path, RTSP URL, or camera index")
    parser.add_argument("--model", default="models/best.pt")
    parser.add_argument("--camera-id", default="camera-01")
    parser.add_argument("--domain", default="generic")
    parser.add_argument("--max-frames", type=int)
    args = parser.parse_args()
    source: str | int = int(args.source) if args.source.isdigit() else args.source
    pipeline = InferencePipeline(PipelineConfig(
        camera_id=args.camera_id,
        domain=args.domain,
        yolo_model=args.model,
    ))
    for event in pipeline.run(source, max_frames=args.max_frames):
        print(json.dumps(event))


if __name__ == "__main__":
    main()

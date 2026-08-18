"""Mall inference service using Shopliftn_best.pt."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from ..pipeline import InferencePipeline, PipelineConfig
from .rules import evaluate_mall_rules

ENVIRONMENT = "mall"
MODEL_PATH = Path(__file__).resolve().parents[1] / "Shopliftn_best.pt"


def apply_mall_rules(event: dict[str, Any]) -> dict[str, Any]:
    return evaluate_mall_rules(event)


def create_pipeline(camera_id: str = "mall-camera-01") -> InferencePipeline:
    return InferencePipeline(PipelineConfig(
        camera_id=camera_id,
        domain=ENVIRONMENT,
        yolo_model=str(MODEL_PATH),
        enable_lstm=False,
    ))


def process_video(source: str | int, *, camera_id: str = "mall-camera-01", max_frames: int | None = None):
    pipeline = create_pipeline(camera_id)
    for event in pipeline.run(source, max_frames=max_frames):
        yield apply_mall_rules(event)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Mall inference")
    parser.add_argument("source")
    parser.add_argument("--camera-id", default="mall-camera-01")
    parser.add_argument("--max-frames", type=int)
    args = parser.parse_args()
    source: str | int = int(args.source) if args.source.isdigit() else args.source
    for event in process_video(source, camera_id=args.camera_id, max_frames=args.max_frames):
        print(json.dumps(event))


if __name__ == "__main__":
    main()

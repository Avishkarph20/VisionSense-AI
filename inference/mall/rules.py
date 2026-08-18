"""Configurable Mall rule evaluation."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any


DEFAULT_RULES: dict[str, Any] = {
    "shoplifting": {
        "enabled": True,
        "labels": ["shoplift", "shoplifting", "theft", "stealing"],
        "min_confidence": 0.60,
        "min_track_age_frames": 5,
        "severity": "high",
    },
    "loitering": {
        "enabled": True,
        "labels": ["person"],
        "min_dwell_seconds": 30,
        "severity": "medium",
    },
    "default": {"severity": "low"},
}


def load_rules() -> dict[str, Any]:
    path = Path(os.getenv("MALL_RULE_CONFIG", Path(__file__).with_name("rules.yaml")))
    try:
        import yaml
        with path.open("r", encoding="utf-8") as file:
            configured = yaml.safe_load(file) or {}
        return {**DEFAULT_RULES, **configured}
    except (ImportError, OSError):
        return DEFAULT_RULES


def evaluate_mall_rules(event: dict[str, Any]) -> dict[str, Any]:
    rules = load_rules()
    shoplifting = rules["shoplifting"]
    loitering = rules["loitering"]
    matched: list[str] = []
    severity = rules["default"].get("severity", "low")

    for detection in event.get("detections", []):
        label = str(detection.get("class_name", "")).lower()
        confidence = float(detection.get("confidence", 0.0))
        track = next(
            (item for item in event.get("tracks", []) if item.get("class_name", "").lower() == label),
            {},
        )
        if (
            shoplifting.get("enabled", True)
            and label in {value.lower() for value in shoplifting.get("labels", [])}
            and confidence >= float(shoplifting.get("min_confidence", 0.60))
            and int(track.get("age", 0)) >= int(shoplifting.get("min_track_age_frames", 0))
        ):
            matched.append("shoplifting")
            severity = shoplifting.get("severity", "high")

    for feature in event.get("features", []):
        label = str(feature.get("class_name", "")).lower()
        if (
            loitering.get("enabled", True)
            and label in {value.lower() for value in loitering.get("labels", [])}
            and float(feature.get("dwell_time", 0.0)) >= float(loitering.get("min_dwell_seconds", 30))
        ):
            matched.append("loitering")
            severity = loitering.get("severity", "medium")

    event["rule_result"] = {
        "event_type": matched[0] if matched else "detection",
        "severity": severity,
        "matched_rules": matched,
        "parameters": {
            "shoplifting_min_confidence": shoplifting.get("min_confidence"),
            "loitering_min_dwell_seconds": loitering.get("min_dwell_seconds"),
        },
    }
    return event

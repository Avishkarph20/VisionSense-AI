"""Source intake, Router dispatch, event aggregation, clip storage, and alerts."""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Any
from uuid import uuid4

import cv2
import requests
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sqlalchemy import text

from app.database.connection import SessionLocal
from app.routers.events import manager
from app.storage.storage_service import StorageService


router = APIRouter(prefix="/source", tags=["Video processing"])
storage = StorageService()

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIRECTORY", "/media/uploads"))
ROUTER_URL = os.getenv("ROUTER_URL", "http://router:8000/route")
DEFAULT_MAX_FRAMES = int(os.getenv("SOURCE_MAX_FRAMES", "180"))

ENVIRONMENT_ALIASES = {
    "classroom": "exam_hall",
    "exam": "exam_hall",
    "exam_hall": "exam_hall",
    "mall": "mall",
    "traffic": "traffic",
    "railway": "railway",
    "subway": "railway",
}

IGNORED_EVENT_TYPES = {"", "normal", "normal_activity", "normal activity", "detection", "none"}


def normalize_environment(environment: str) -> str:
    normalized = environment.strip().lower().replace(" ", "_").replace("-", "_")
    try:
        return ENVIRONMENT_ALIASES[normalized]
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=f"Unsupported environment: {environment}") from exc


def call_router(
    *,
    environment: str,
    source: str,
    camera_id: str,
    max_frames: int = DEFAULT_MAX_FRAMES,
) -> list[dict[str, Any]]:
    payload = {
        "source": source,
        "camera_id": camera_id,
        "environment": environment,
        "dispatch": True,
        "metadata": {"max_frames": max_frames},
    }
    try:
        response = requests.post(ROUTER_URL, json=payload, timeout=360)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Router dispatch failed: {exc}") from exc

    data = response.json()
    job = data.get("job") or {}
    if job.get("status") == "failed":
        raise HTTPException(status_code=502, detail=f"Inference failed: {job.get('error')}")

    result = job.get("result") or {}
    events = result.get("events") or []
    if not isinstance(events, list):
        raise HTTPException(status_code=502, detail="Inference returned an invalid events payload")
    return events


def rule_activity(event: dict[str, Any]) -> str | None:
    rule = event.get("rule_result") or {}
    event_type = str(rule.get("event_type") or "").strip().lower().replace("-", "_")
    matched = [str(item).strip() for item in (rule.get("matched_rules") or []) if str(item).strip()]
    if event_type in IGNORED_EVENT_TYPES or not matched:
        return None
    return event_type


def event_confidence(event: dict[str, Any]) -> float:
    detections = event.get("detections") or []
    confidence = max([float(item.get("confidence", 0.0)) for item in detections] or [0.0])
    return min(max(confidence, 0.0), 1.0)


def primary_track_id(event: dict[str, Any]) -> int:
    tracks = event.get("tracks") or []
    if not tracks:
        return 0
    best = max(
        tracks,
        key=lambda item: (float(item.get("confidence", 0.0)), int(item.get("age", 0))),
    )
    return int(best.get("track_id") or 0)


def aggregate_events(events: list[dict[str, Any]], *, max_gap_seconds: float = 1.0) -> list[dict[str, Any]]:
    active: dict[tuple[str, str, int, str], dict[str, Any]] = {}
    aggregated: list[dict[str, Any]] = []

    candidates = sorted(
        (event for event in events if rule_activity(event)),
        key=lambda event: (float(event.get("video_timestamp", 0.0)), int(event.get("frame_index", 0))),
    )

    def close(item: dict[str, Any]) -> None:
        representative = dict(item["representative"])
        representative["event_id"] = str(uuid4())
        representative["track_id"] = item["track_id"]
        representative["activity"] = item["activity"]
        representative["video_timestamp"] = item["confirmed_video_timestamp"]
        representative["start_video_timestamp"] = item["start_video_timestamp"]
        representative["end_video_timestamp"] = item["end_video_timestamp"]
        representative["source_event_ids"] = item["source_event_ids"]
        representative["aggregation_key"] = f"{item['track_id']}:{item['activity']}"
        representative["aggregation_count"] = item["count"]
        representative["confidence"] = item["confidence"]
        representative["clip_start_seconds"] = max(0.0, item["confirmed_video_timestamp"] - 5.0)
        representative["clip_end_seconds"] = item["confirmed_video_timestamp"] + 5.0
        aggregated.append(representative)

    for event in candidates:
        activity = rule_activity(event)
        if not activity:
            continue
        track_id = primary_track_id(event)
        camera_id = str(event.get("camera_id", "camera-unknown"))
        environment = str(event.get("domain", "unknown"))
        key = (camera_id, environment, track_id, activity)
        timestamp = float(event.get("video_timestamp", 0.0))
        confidence = event_confidence(event)
        item = active.get(key)

        if item and timestamp - item["end_video_timestamp"] <= max_gap_seconds:
            item["end_video_timestamp"] = timestamp
            item["count"] += 1
            item["source_event_ids"].append(str(event.get("event_id", "")))
            if confidence >= item["confidence"]:
                item["confidence"] = confidence
                item["representative"] = event
            continue

        if item:
            close(item)

        active[key] = {
            "activity": activity,
            "track_id": track_id,
            "representative": event,
            "confidence": confidence,
            "confirmed_video_timestamp": timestamp,
            "start_video_timestamp": timestamp,
            "end_video_timestamp": timestamp,
            "count": 1,
            "source_event_ids": [str(event.get("event_id", ""))],
        }

    for item in active.values():
        close(item)

    return aggregated


def create_evidence_clip(source: str | Path, event: dict[str, Any], output_path: Path) -> Path:
    cap = cv2.VideoCapture(str(source))
    if not cap.isOpened():
        cap.release()
        raise HTTPException(status_code=502, detail="Could not open source for evidence clip")

    fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    if width <= 0 or height <= 0:
        cap.release()
        raise HTTPException(status_code=502, detail="Source has invalid video dimensions")

    start_seconds = float(event.get("clip_start_seconds", 0.0))
    end_seconds = float(event.get("clip_end_seconds", start_seconds + 10.0))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    if frame_count > 0:
        cap.set(cv2.CAP_PROP_POS_MSEC, start_seconds * 1000.0)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    writer = cv2.VideoWriter(
        str(output_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )
    if not writer.isOpened():
        cap.release()
        raise HTTPException(status_code=502, detail="Could not create evidence clip")

    written = 0
    max_frames = max(1, int(round((end_seconds - start_seconds) * fps)))
    try:
        while written < max_frames:
            ok, frame = cap.read()
            if not ok:
                break
            if frame_count > 0:
                current_seconds = float(cap.get(cv2.CAP_PROP_POS_MSEC) or 0.0) / 1000.0
                if current_seconds > end_seconds:
                    break
            writer.write(frame)
            written += 1
    finally:
        writer.release()
        cap.release()

    if written == 0:
        raise HTTPException(status_code=502, detail="Evidence clip contained no frames")
    return output_path


def upload_evidence_clip(source: str | Path, environment: str, event: dict[str, Any]) -> str:
    event_id = str(event.get("event_id") or uuid4())
    temp_path = Path("/tmp") / f"{event_id}.mp4"
    object_name = f"clips/{environment}/{event_id}.mp4"
    try:
        create_evidence_clip(source, event, temp_path)
        uploaded = storage.upload_video(str(temp_path), object_name, "video/mp4")
        if not uploaded:
            raise HTTPException(status_code=502, detail="Could not upload evidence clip to MinIO")
        return uploaded
    finally:
        if temp_path.exists():
            temp_path.unlink()


def event_label(event: dict[str, Any]) -> tuple[str, str, float]:
    rule = event.get("rule_result") or {}
    activity = str(event.get("activity") or rule.get("event_type") or "").replace("_", " ")
    severity = str(rule.get("severity") or "medium")
    return activity.title(), severity, event_confidence(event)


def record_values(
    event: dict[str, Any],
    *,
    environment: str,
    filename: str,
    clip_object: str,
) -> dict[str, Any]:
    label, severity, confidence = event_label(event)
    clip_url = f"/api/videos/preview/{clip_object}"
    payload = {
        **event,
        "domain": environment,
        "clip_object": clip_object,
        "clip_url": clip_url,
        "video_object": clip_object,
        "uploaded_filename": filename,
        "review_status": "pending",
        "detected_class": label,
    }
    return {
        "event_id": str(event.get("event_id") or uuid4()),
        "camera_id": str(event.get("camera_id", "uploaded-video")),
        "environment": environment,
        "event_type": label,
        "severity": severity,
        "confidence": confidence,
        "payload": json.dumps(payload, default=str),
    }


def persist(items: list[dict[str, Any]]) -> int:
    db = SessionLocal()
    count = 0
    try:
        for item in items:
            result = db.execute(
                text(
                    """
                    INSERT INTO raw_events(event_id,camera_id,environment,event_type,severity,confidence,payload)
                    VALUES(:event_id,:camera_id,:environment,:event_type,:severity,:confidence,CAST(:payload AS JSONB))
                    ON CONFLICT(event_id) DO NOTHING
                    RETURNING id
                    """
                ),
                item,
            )
            if result.first():
                count += 1
        db.commit()
        return count
    finally:
        db.close()


async def broadcast_records(records: list[dict[str, Any]]) -> None:
    for record in records:
        payload = json.loads(record["payload"])
        await manager.broadcast(
            {
                "id": record["event_id"],
                "camera_name": record["camera_id"],
                "environment": record["environment"],
                "activity_type": record["event_type"],
                "severity": record["severity"],
                "confidence": record["confidence"],
                "detected_at": payload.get("created_at"),
                "status": "pending",
                "json_log": payload,
                "track_id": payload.get("track_id"),
                "clip_url": payload.get("clip_url"),
                "video_object": payload.get("video_object"),
            }
        )


async def process_source(
    *,
    source: str | Path,
    environment: str,
    camera_id: str,
    filename: str,
    max_frames: int = DEFAULT_MAX_FRAMES,
) -> dict[str, Any]:
    frame_events = call_router(
        environment=environment,
        source=str(source),
        camera_id=camera_id,
        max_frames=max_frames,
    )
    aggregated_events = aggregate_events(frame_events)

    records: list[dict[str, Any]] = []
    for event in aggregated_events:
        event["camera_id"] = camera_id
        event["domain"] = environment
        clip_object = upload_evidence_clip(source, environment, event)
        records.append(
            record_values(
                event,
                environment=environment,
                filename=filename,
                clip_object=clip_object,
            )
        )

    stored = persist(records)
    await broadcast_records(records)
    return {
        "status": "processed",
        "environment": environment,
        "source": str(source),
        "frame_event_count": len(frame_events),
        "event_count": len(aggregated_events),
        "stored_event_count": stored,
        "json_logs": [json.loads(record["payload"]) for record in records],
    }


@router.post("/{environment}/upload")
async def upload_and_process(
    environment: str,
    file: UploadFile = File(...),
    camera_id: str = Form("uploaded-video"),
):
    environment = normalize_environment(environment)
    if not file.filename:
        raise HTTPException(status_code=400, detail="A video file is required")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename).name
    suffix = Path(safe_name).suffix.lower() or ".mp4"
    local_path = UPLOAD_DIR / f"{uuid4().hex}{suffix}"

    with local_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    return await process_source(
        source=local_path,
        environment=environment,
        camera_id=camera_id,
        filename=safe_name,
    )


@router.post("/{environment}/set")
async def set_stream_source(environment: str, payload: dict[str, Any]):
    environment = normalize_environment(environment)
    source = str(payload.get("url") or payload.get("source") or "").strip()
    if not source or source.lower() == "none":
        return {"status": "idle", "environment": environment, "source": ""}

    return await process_source(
        source=source,
        environment=environment,
        camera_id=str(payload.get("camera_id") or "live-stream"),
        filename=source,
    )

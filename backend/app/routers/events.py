"""PostgreSQL-backed JSON event logs, history API, decisions, and WebSocket."""
from __future__ import annotations
import json
from typing import Any
from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import text
from app.database.connection import SessionLocal

router = APIRouter(prefix="/events", tags=["Events"])
class ConnectionManager:
    def __init__(self): self.connections: list[WebSocket] = []
    async def connect(self, ws: WebSocket): await ws.accept(); self.connections.append(ws)
    def disconnect(self, ws: WebSocket):
        if ws in self.connections: self.connections.remove(ws)
    async def broadcast(self, payload: dict[str, Any]):
        for ws in self.connections.copy():
            try: await ws.send_json(payload)
            except Exception: self.disconnect(ws)
manager = ConnectionManager()

def rows(limit: int) -> list[dict[str, Any]]:
    db = SessionLocal()
    try:
        data = db.execute(text("""SELECT id,event_id,camera_id,environment,event_type,severity,confidence,created_at,payload
          FROM raw_events ORDER BY created_at DESC LIMIT :limit"""), {"limit": limit}).mappings().all()
        result=[]
        for row in data:
            payload = row["payload"] if isinstance(row["payload"], dict) else json.loads(row["payload"])
            clip_object = payload.get("clip_object") or payload.get("video_object")
            result.append({"id": row["id"], "event_id": row["event_id"], "camera_name": row["camera_id"],
              "environment": row["environment"], "activity_type": row["event_type"], "severity": row["severity"],
              "confidence": row["confidence"], "detected_at": row["created_at"].isoformat(),
              "status": payload.get("review_status", "pending"), "json_log": payload,
              "track_id": payload.get("track_id"),
              "video_object": clip_object, "clip_url": payload.get("clip_url") or ("/api/videos/preview/" + clip_object if clip_object else None),
              "snapshot_url": "/api/videos/preview/" + payload["snapshot_object"] if payload.get("snapshot_object") else None})
        return result
    finally: db.close()
@router.get("")
def list_events(limit: int = Query(25, ge=1, le=500)): return rows(limit)
@router.get("/recent")
def recent_events(limit: int = Query(100, ge=1, le=500)): return rows(limit)
@router.get("/{event_id}/json")
def event_json(event_id: str):
    db=SessionLocal()
    try:
        row=db.execute(text("SELECT payload FROM raw_events WHERE event_id=:id"), {"id":event_id}).first()
        if not row: raise HTTPException(404, "Event not found")
        return row[0] if isinstance(row[0],dict) else json.loads(row[0])
    finally: db.close()
@router.patch("/{event_id}/decision")
def decision(event_id: str, payload: dict[str, Any]):
    status=str(payload.get("decision", "pending")); db=SessionLocal()
    try:
        updated=db.execute(text("""UPDATE raw_events SET payload=jsonb_set(jsonb_set(payload,'{review_status}',to_jsonb(CAST(:status AS text)),true),'{review_comment}',to_jsonb(CAST(:comment AS text)),true)
          WHERE event_id=:id OR CAST(id AS text)=:id RETURNING id"""), {"id":event_id,"status":status,"comment":str(payload.get("comment") or "")}).first()
        db.commit()
        if not updated: raise HTTPException(404,"Event not found")
        return {"id":updated[0],"decision":status}
    finally: db.close()
@router.websocket("/ws")
async def ws_events(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True: await ws.receive_text()
    except WebSocketDisconnect: manager.disconnect(ws)

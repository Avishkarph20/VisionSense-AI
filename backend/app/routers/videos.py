from __future__ import annotations

import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTask
from app.storage.minio_client import bucket, client

from app.storage.storage_service import StorageService

router = APIRouter(prefix="/videos", tags=["Videos"])
storage = StorageService()


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A video file is required")
    if file.content_type and not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video uploads are supported")

    safe_name = Path(file.filename).name
    temp_file = f"/tmp/{uuid4()}_{safe_name}"
    object_path = f"uploads/{uuid4()}_{safe_name}"
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_path = storage.upload_video(temp_file, object_path, file.content_type or "video/mp4")
        if not uploaded_path:
            raise HTTPException(status_code=502, detail="MinIO rejected the upload")
        return {"message": "Video uploaded successfully", "object_path": uploaded_path}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


@router.get("/preview/{object_name:path}")
def preview_video_frame(object_name: str):
    """Stream a MinIO preview through the backend so browsers never resolve Docker hostnames."""
    try:
        response = client.get_object(bucket, object_name)
        lower_name = object_name.lower()
        if lower_name.endswith((".jpg", ".jpeg")):
            media_type = "image/jpeg"
        elif lower_name.endswith(".mp4"):
            media_type = "video/mp4"
        else:
            media_type = "application/octet-stream"
        return StreamingResponse(response, media_type=media_type, background=BackgroundTask(response.close))
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.get("/url/{object_name:path}")
def get_video_url(object_name: str):
    try:
        return {"video_url": storage.get_video_url(object_name)}
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/download/{object_name:path}")
def download_video(object_name: str):
    try:
        download_path = f"/tmp/{Path(object_name).name}"
        storage.download_video(object_name, download_path)
        return {"message": "Downloaded successfully", "path": download_path}
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{object_name:path}")
def delete_video(object_name: str):
    try:
        storage.delete_video(object_name)
        return {"message": "Video deleted successfully"}
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

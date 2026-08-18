from __future__ import annotations

from datetime import timedelta
from minio.error import S3Error

from app.storage.minio_client import bucket, client


class StorageService:
    def upload_video(self, file_path: str, object_name: str, content_type: str = "video/mp4") -> str | None:
        try:
            client.fput_object(bucket, object_name, file_path, content_type=content_type)
            return object_name
        except S3Error:
            return None

    def get_video_url(self, object_name: str) -> str:
        return client.presigned_get_object(bucket, object_name, expires=timedelta(hours=1))

    def download_video(self, object_name: str, download_path: str) -> None:
        client.fget_object(bucket, object_name, download_path)

    def delete_video(self, object_name: str) -> None:
        client.remove_object(bucket, object_name)

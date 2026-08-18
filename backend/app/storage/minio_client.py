from minio import Minio
from app.config import settings

client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE
)

bucket=settings.MINIO_BUCKET

if not client.bucket_exists(bucket):
    client.make_bucket(bucket)
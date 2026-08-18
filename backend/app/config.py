from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str
    MINIO_SECURE: bool

    class Config:
        env_file=".env"

settings = Settings()
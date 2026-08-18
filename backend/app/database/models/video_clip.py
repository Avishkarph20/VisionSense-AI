from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class VideoClip(Base):

    __tablename__ = "video_clips"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    alert_id: Mapped[int] = mapped_column(
        ForeignKey("alerts.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    minio_object_path: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    duration_seconds: Mapped[int | None] = mapped_column(Integer)

    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )
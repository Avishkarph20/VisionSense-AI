from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class DetectionResult(Base):

    __tablename__ = "detection_results"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    alert_id: Mapped[int] = mapped_column(
        ForeignKey("alerts.id", ondelete="CASCADE"),
    )

    model_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("model_versions.id"),
    )

    track_id: Mapped[int | None] = mapped_column(Integer)

    bbox: Mapped[dict | None] = mapped_column(JSONB)

    pose_keypoints: Mapped[dict | None] = mapped_column(JSONB)

    confidence: Mapped[float] = mapped_column(Float)

    frame_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
    )
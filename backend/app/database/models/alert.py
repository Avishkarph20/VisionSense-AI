from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Alert(Base):

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    camera_id: Mapped[int] = mapped_column(
        ForeignKey("cameras.id"),
        nullable=False,
    )

    activity_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("activity_types.id"),
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        default="low",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
    )

    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    camera = relationship("Camera")
    activity_type = relationship("ActivityType")
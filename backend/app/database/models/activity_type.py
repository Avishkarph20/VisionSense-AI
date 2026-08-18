from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ActivityType(Base):
    """
    SQLAlchemy model for the activity_types table.
    """

    __tablename__ = "activity_types"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    label: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    default_severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="low",
    )
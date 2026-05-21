from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from .database import Base


class Food(Base):
    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    location: Mapped[str] = mapped_column(String(160), default="")
    note: Mapped[str] = mapped_column(Text, default="")
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Travel(Base):
    __tablename__ = "travels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    photo_note: Mapped[str] = mapped_column(Text, default="")
    story: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Wish(Base):
    __tablename__ = "wishes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    content: Mapped[str] = mapped_column(String(240), nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Hobby(Base):
    __tablename__ = "hobbies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="")
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    duoduo_element: Mapped[str] = mapped_column(String(180), default="")
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

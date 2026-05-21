from datetime import datetime

from pydantic import BaseModel, Field


class FoodBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    image: str | None = None
    images: list[str] = Field(default_factory=list)
    location: str = ""
    note: str = ""
    rating: int | None = Field(default=None, ge=1, le=5)


class FoodCreate(FoodBase):
    pass


class FoodUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    image: str | None = None
    images: list[str] | None = None
    location: str | None = None
    note: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)


class FoodOut(FoodBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TravelBase(BaseModel):
    city: str = Field(min_length=1, max_length=120)
    images: list[str] = Field(default_factory=list)
    photo_note: str = ""
    story: str = ""
    date: datetime | None = None


class TravelCreate(TravelBase):
    pass


class TravelUpdate(BaseModel):
    city: str | None = Field(default=None, min_length=1, max_length=120)
    images: list[str] | None = None
    photo_note: str | None = None
    story: str | None = None
    date: datetime | None = None


class TravelOut(BaseModel):
    id: int
    city: str
    images: list[str]
    photo_note: str
    story: str
    date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class WishCreate(BaseModel):
    content: str = Field(min_length=1, max_length=240)


class WishUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1, max_length=240)
    done: bool | None = None


class WishOut(BaseModel):
    id: int
    content: str
    done: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HobbyBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    category: str = ""
    image: str | None = None
    images: list[str] = Field(default_factory=list)
    duoduo_element: str = ""
    note: str = ""


class HobbyCreate(HobbyBase):
    pass


class HobbyUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = None
    image: str | None = None
    images: list[str] | None = None
    duoduo_element: str | None = None
    note: str | None = None


class HobbyOut(HobbyBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

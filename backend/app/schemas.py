from datetime import datetime

from pydantic import BaseModel, Field


class FoodBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    image: str | None = None
    location: str = ""
    note: str = ""
    rating: int | None = Field(default=None, ge=1, le=5)


class FoodCreate(FoodBase):
    pass


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
    duoduo_element: str = ""
    note: str = ""


class HobbyCreate(HobbyBase):
    pass


class HobbyOut(HobbyBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

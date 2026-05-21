from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Food, Travel, Wish
from .schemas import (
    FoodCreate,
    FoodOut,
    TravelCreate,
    TravelOut,
    WishCreate,
    WishOut,
    WishUpdate,
)


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
FRONTEND_DIR = ROOT_DIR / "frontend"
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Memory Life API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


def seed_demo_data() -> None:
    db = next(get_db())
    try:
        has_food = db.scalar(select(Food.id).limit(1))
        if has_food:
            return

        db.add_all(
            [
                Food(
                    title="周末早午餐",
                    image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
                    location="街角小店",
                    note="阳光很好，沙拉和咖啡都很清爽。",
                    rating=4,
                ),
                Travel(
                    city="厦门",
                    images=[
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
                    ],
                    story="傍晚沿着海边慢慢走，风里有很舒服的咸味。",
                    date=datetime.utcnow(),
                ),
                Wish(content="找一个周末去海边看日落"),
            ]
        )
        db.commit()
    finally:
        db.close()


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)) -> dict[str, str]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    suffix = Path(file.filename or "image").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    target = UPLOAD_DIR / filename
    target.write_bytes(await file.read())
    return {"url": f"/uploads/{filename}"}


@app.get("/api/food", response_model=list[FoodOut])
def list_food(db: Session = Depends(get_db)) -> list[Food]:
    return list(db.scalars(select(Food).order_by(Food.created_at.desc())))


@app.post("/api/food", response_model=FoodOut, status_code=201)
def create_food(payload: FoodCreate, db: Session = Depends(get_db)) -> Food:
    food = Food(**payload.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@app.get("/api/food/{food_id}", response_model=FoodOut)
def get_food(food_id: int, db: Session = Depends(get_db)) -> Food:
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food


@app.delete("/api/food/{food_id}", status_code=204)
def delete_food(food_id: int, db: Session = Depends(get_db)) -> None:
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(food)
    db.commit()


@app.get("/api/travel", response_model=list[TravelOut])
def list_travel(db: Session = Depends(get_db)) -> list[Travel]:
    return list(db.scalars(select(Travel).order_by(Travel.date.desc())))


@app.post("/api/travel", response_model=TravelOut, status_code=201)
def create_travel(payload: TravelCreate, db: Session = Depends(get_db)) -> Travel:
    data = payload.model_dump()
    if data["date"] is None:
        data["date"] = datetime.utcnow()
    travel = Travel(**data)
    db.add(travel)
    db.commit()
    db.refresh(travel)
    return travel


@app.get("/api/travel/{travel_id}", response_model=TravelOut)
def get_travel(travel_id: int, db: Session = Depends(get_db)) -> Travel:
    travel = db.get(Travel, travel_id)
    if not travel:
        raise HTTPException(status_code=404, detail="Travel not found")
    return travel


@app.delete("/api/travel/{travel_id}", status_code=204)
def delete_travel(travel_id: int, db: Session = Depends(get_db)) -> None:
    travel = db.get(Travel, travel_id)
    if not travel:
        raise HTTPException(status_code=404, detail="Travel not found")
    db.delete(travel)
    db.commit()


@app.get("/api/wish", response_model=list[WishOut])
def list_wishes(db: Session = Depends(get_db)) -> list[Wish]:
    return list(db.scalars(select(Wish).order_by(Wish.created_at.desc())))


@app.post("/api/wish", response_model=WishOut, status_code=201)
def create_wish(payload: WishCreate, db: Session = Depends(get_db)) -> Wish:
    wish = Wish(content=payload.content)
    db.add(wish)
    db.commit()
    db.refresh(wish)
    return wish


@app.patch("/api/wish/{wish_id}", response_model=WishOut)
def update_wish(wish_id: int, payload: WishUpdate, db: Session = Depends(get_db)) -> Wish:
    wish = db.get(Wish, wish_id)
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(wish, key, value)
    db.commit()
    db.refresh(wish)
    return wish


@app.delete("/api/wish/{wish_id}", status_code=204)
def delete_wish(wish_id: int, db: Session = Depends(get_db)) -> None:
    wish = db.get(Wish, wish_id)
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    db.delete(wish)
    db.commit()

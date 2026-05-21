from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Food, Hobby, Travel, Wish
from .schemas import (
    FoodCreate,
    FoodOut,
    HobbyCreate,
    HobbyOut,
    TravelCreate,
    TravelOut,
    WishCreate,
    WishOut,
    WishUpdate,
)


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
FRONTEND_DIR = BACKEND_DIR / "frontend"
if not FRONTEND_DIR.exists():
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
    migrate_database()
    seed_demo_data()


def migrate_database() -> None:
    with engine.begin() as connection:
        travel_columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(travels)").all()
        }
        if "photo_note" not in travel_columns:
            connection.execute(text("ALTER TABLE travels ADD COLUMN photo_note TEXT DEFAULT ''"))


def seed_demo_data() -> None:
    db = next(get_db())
    try:
        has_food = db.scalar(select(Food.id).limit(1))
        has_travel = db.scalar(select(Travel.id).limit(1))
        has_wish = db.scalar(select(Wish.id).limit(1))
        has_hobby = db.scalar(select(Hobby.id).limit(1))

        if not has_food:
            db.add(
                Food(
                    title="周末早午餐",
                    image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
                    location="街角小店",
                    note="阳光很好，沙拉和咖啡都很清爽。",
                    rating=4,
                )
            )
        if not has_travel:
            db.add(
                Travel(
                    city="厦门",
                    images=[
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
                    ],
                    photo_note="海边照片，适合放一些当时的天气、路线或者文件说明。",
                    story="傍晚沿着海边慢慢走，风里有很舒服的咸味。",
                    date=datetime.utcnow(),
                )
            )
        else:
            demo_travel = db.scalar(select(Travel).where(Travel.city == "厦门").limit(1))
            if demo_travel and not demo_travel.photo_note:
                demo_travel.photo_note = "海边照片，适合放一些当时的天气、路线或者文件说明。"
        if not has_wish:
            db.add(Wish(content="找一个周末去海边看日落"))
        hobby_seeds = [
            {
                "title": "朵朵推荐的歌单",
                "category": "音乐",
                "image": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "朵朵提过的几首歌",
                "note": "适合散步、通勤或者休息时慢慢听。",
            },
            {
                "title": "旗袍灵感",
                "category": "穿搭",
                "image": None,
                "duoduo_element": "朵朵喜欢旗袍",
                "note": "可以记录喜欢的款式、颜色、店铺和适合拍照的场景。",
            },
            {
                "title": "种花小记录",
                "category": "种花",
                "image": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "给花花草草留一点生长记录",
                "note": "记录花名、浇水时间、开花状态和养护小心得。",
            },
            {
                "title": "画画练习",
                "category": "画画",
                "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "把画过的东西慢慢收起来",
                "note": "可以放草稿、完成图、灵感来源和下次想尝试的主题。",
            },
            {
                "title": "运动打卡",
                "category": "运动",
                "image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "轻松记录运动状态",
                "note": "散步、跑步、瑜伽或其他运动都可以记一点感受。",
            },
            {
                "title": "探索新地图",
                "category": "旅游",
                "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "朵朵喜欢去看看不一样的地方",
                "note": "记录想去的城市、路线、小店、展览和路上的发现。",
            },
            {
                "title": "积木时间",
                "category": "积木",
                "image": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "把搭过的作品留个档",
                "note": "可以记录套装名称、完成进度、成品照片和缺件情况。",
            },
            {
                "title": "拼图进度",
                "category": "拼图",
                "image": "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "慢慢拼出来的小成就",
                "note": "记录片数、主题、完成进度和最后成品。",
            },
            {
                "title": "拍照灵感",
                "category": "拍照",
                "image": "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=900&q=80",
                "duoduo_element": "记录想拍的画面和角度",
                "note": "可以写拍照地点、光线、姿势、道具和成片想法。",
            },
        ]
        existing_hobby_titles = set(db.scalars(select(Hobby.title)))
        old_travel_hobby = db.scalar(select(Hobby).where(Hobby.title == "探索不同的地方").limit(1))
        if old_travel_hobby and "探索新地图" not in existing_hobby_titles:
            old_travel_hobby.title = "探索新地图"
            existing_hobby_titles.add("探索新地图")
        elif old_travel_hobby:
            db.delete(old_travel_hobby)
        if "朵朵的歌单" in existing_hobby_titles:
            demo_hobby = db.scalar(select(Hobby).where(Hobby.title == "朵朵的歌单").limit(1))
            if demo_hobby:
                demo_hobby.title = "朵朵推荐的歌单"
                demo_hobby.duoduo_element = "朵朵提过的几首歌"
                demo_hobby.note = "适合散步、通勤或者休息时慢慢听。"
                existing_hobby_titles.add("朵朵推荐的歌单")
        for hobby_seed in hobby_seeds:
            if hobby_seed["title"] not in existing_hobby_titles:
                db.add(Hobby(**hobby_seed))
        block_hobby = db.scalar(select(Hobby).where(Hobby.title == "积木时间").limit(1))
        if block_hobby and not block_hobby.image:
            block_hobby.image = "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80"
        puzzle_hobby = db.scalar(select(Hobby).where(Hobby.title == "拼图进度").limit(1))
        if puzzle_hobby and puzzle_hobby.image == "/static/images/puzzle-cover.jpg":
            puzzle_hobby.image = "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=900&q=80"
        elif puzzle_hobby and not puzzle_hobby.image:
            puzzle_hobby.image = "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=900&q=80"
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


@app.get("/api/hobby", response_model=list[HobbyOut])
def list_hobbies(db: Session = Depends(get_db)) -> list[Hobby]:
    return list(db.scalars(select(Hobby).order_by(Hobby.created_at.desc())))


@app.post("/api/hobby", response_model=HobbyOut, status_code=201)
def create_hobby(payload: HobbyCreate, db: Session = Depends(get_db)) -> Hobby:
    hobby = Hobby(**payload.model_dump())
    db.add(hobby)
    db.commit()
    db.refresh(hobby)
    return hobby


@app.get("/api/hobby/{hobby_id}", response_model=HobbyOut)
def get_hobby(hobby_id: int, db: Session = Depends(get_db)) -> Hobby:
    hobby = db.get(Hobby, hobby_id)
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    return hobby


@app.delete("/api/hobby/{hobby_id}", status_code=204)
def delete_hobby(hobby_id: int, db: Session = Depends(get_db)) -> None:
    hobby = db.get(Hobby, hobby_id)
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    db.delete(hobby)
    db.commit()

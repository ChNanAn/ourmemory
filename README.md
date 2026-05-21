# Memory Life

一个简单可运行的生活记录册 MVP，包含美食、旅行、爱好、愿望清单和图片上传。

## 功能

- 美食记录：标题、图片、位置、备注、评分
- 旅行记录：城市、日期、多图、照片/文件说明、故事
- 爱好记录：名称、分类、图片、和朵朵有关的点、备注
- 愿望清单：新增、完成状态切换、删除
- SQLite 本地数据存储
- 本地 uploads 图片存储
- FastAPI 托管静态前端页面

## 启动

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

打开：<http://localhost:8000>

## Docker

```bash
docker build -f backend/Dockerfile -t memory-life .
docker run --rm -p 8000:8000 memory-life
```

## API

- `GET /api/food`
- `POST /api/food`
- `GET /api/food/{id}`
- `DELETE /api/food/{id}`
- `GET /api/travel`
- `POST /api/travel`
- `GET /api/travel/{id}`
- `DELETE /api/travel/{id}`
- `GET /api/hobby`
- `POST /api/hobby`
- `GET /api/hobby/{id}`
- `DELETE /api/hobby/{id}`
- `GET /api/wish`
- `POST /api/wish`
- `PATCH /api/wish/{id}`
- `DELETE /api/wish/{id}`
- `POST /api/upload`

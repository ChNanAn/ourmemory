# Memory Life

一个简单可运行的生活记录册 MVP，包含美食、旅行、爱好、愿望清单和图片上传。

## 功能

- 美食记录：标题、图片、位置、备注、评分
- 旅行记录：城市、日期、多图、照片/文件说明、故事
- 爱好记录：名称、分类、图片、和朵朵有关的点、备注；默认包含旗袍、种花、画画、运动、旅游探索、积木、拼图、拍照等灵感
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

## 服务器部署

最简单方式是用 Docker Compose 部署到云服务器，然后手机访问服务器公网 IP。

### 1. 服务器准备

在云服务器安全组/防火墙里放行 TCP `80` 端口。

服务器安装 Docker 和 Docker Compose 后执行：

```bash
git clone git@github.com:ChNanAn/ourmemory.git
cd ourmemory
docker compose up -d --build
```

启动后手机打开：

```text
http://服务器公网IP
```

如果服务器的 `80` 端口已经被 Nginx、Apache 或其他服务占用，先停止占用服务，或者把 `docker-compose.yml` 里的端口改回 `8000:8000`。

### 2. 常用命令

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

### 3. 更新部署

```bash
git pull
docker compose up -d --build
```

SQLite 数据会保存在 `backend/data/`，上传图片会保存在 `backend/uploads/`。

### 4. 构建依赖下载失败

如果服务器在 `pip install` 时失败，通常是网络连接 PyPI 不稳定。项目 Dockerfile 已配置阿里云 PyPI 镜像，可以更新代码后重新构建：

```bash
git pull
docker compose build --no-cache
docker compose up -d
```

旧版命令：

```bash
git pull
docker-compose build --no-cache
docker-compose up -d
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

下面给你一份可以直接丢给 CODX / Cursor / Claude Code 之类工具用的 **PRD + 技术设计 Markdown 初稿**。你可以直接复制用。

---

````md
# 项目名称：Memory Life（暂定）

## 一、项目定位

这是一个轻量级“生活记录册”Web应用，用于记录日常生活中的：

- 美食（吃过的餐厅/食物）
- 旅行（去过的地方）
- 愿望（想一起完成的事）

核心目标不是社交或复杂系统，而是：

> 以“温柔、生活感、可回忆”为核心的个人/双人生活记录工具

---

## 二、核心用户场景

### 场景1：记录美食
用户可以快速记录：

- 店名
- 图片
- 位置
- 简短描述
- 心情/评价

---

### 场景2：记录旅行
记录每次出行：

- 城市/地点
- 照片
- 简短故事
- 时间

---

### 场景3：愿望清单
记录未来想做的事：

- 去海边
- 吃某个餐厅
- 去旅行地

支持标记完成状态。

---

## 三、产品功能模块

### 1. 首页 Home

功能：
- 展示最近记录（美食/旅行）
- 展示一句温柔欢迎语
- 快速入口

UI特点：
- 卡片式布局
- 图片优先
- 极简导航

---

### 2. 美食模块 Food

功能：
- 新增美食记录
- 查看美食列表
- 查看详情

字段：

```text
title: string
image: string
location: string
note: string
rating: number (optional)
created_at: datetime
````

---

### 3. 旅行模块 Travel

功能：

* 新增旅行记录
* 时间轴展示
* 图片集合

字段：

```text
city: string
images: list[string]
story: string
date: datetime
```

---

### 4. 愿望模块 Wish

功能：

* 添加愿望
* 标记完成
* 删除

字段：

```text
content: string
done: boolean
created_at: datetime
```

---

## 四、技术架构设计

### 1. 整体架构

```text
Frontend (Nuxt3 / Vue3)
        ↓ HTTP API
Backend (FastAPI)
        ↓
Database (SQLite -> MySQL 可扩展)
        ↓
File Storage (local / OSS)
```

---

### 2. 技术选型

#### 前端

* Nuxt3（推荐） 或 Vue3 + Vite
* TailwindCSS（UI风格）
* Pinia（状态管理）
* Axios（请求）

#### 后端

* FastAPI
* SQLAlchemy ORM
* Pydantic

#### 数据库

* SQLite（开发阶段）
* MySQL（生产可选）

#### 文件存储

* 本地 uploads/
* 后期可替换 MinIO / OSS

---

## 五、后端项目结构

```text
backend/
├── app/
│   ├── api/
│   │   ├── food.py
│   │   ├── travel.py
│   │   ├── wish.py
│   │
│   ├── models/
│   │   ├── food.py
│   │   ├── travel.py
│   │   ├── wish.py
│   │
│   ├── schemas/
│   │   ├── food.py
│   │   ├── travel.py
│   │   ├── wish.py
│   │
│   ├── services/
│   │   ├── food_service.py
│   │   ├── travel_service.py
│   │   ├── wish_service.py
│   │
│   ├── database/
│   │   ├── session.py
│   │   ├── base.py
│   │
│   ├── utils/
│   │
│   ├── main.py
│
├── uploads/
├── requirements.txt
├── Dockerfile
```

---

## 六、前端项目结构

```text
frontend/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── FoodCard.vue
│   │   ├── TravelCard.vue
│   │
│   ├── pages/
│   │   ├── index.vue
│   │   ├── food.vue
│   │   ├── travel.vue
│   │   ├── wish.vue
│   │
│   ├── stores/
│   ├── styles/
│   ├── utils/
│   ├── App.vue
│   └── main.ts
```

---

## 七、API设计

### Food

* GET /api/food
* POST /api/food
* GET /api/food/{id}
* DELETE /api/food/{id}

---

### Travel

* GET /api/travel
* POST /api/travel
* GET /api/travel/{id}

---

### Wish

* GET /api/wish
* POST /api/wish
* PATCH /api/wish/{id}
* DELETE /api/wish/{id}

---

## 八、UI设计风格

### 核心风格关键词：

* 生活感
* 卡片式
* 大图优先
* 留白
* 柔和色彩

---

### 配色建议：

* 米白色背景
* 浅灰分割
* 奶油色卡片
* 少量粉色点缀

---

### 字体：

* HarmonyOS Sans
* PingFang SC
* Inter（英文）

---

## 九、页面设计说明

### 首页

* 顶部一句话（动态）
* 最近记录流
* 快捷入口

---

### 美食页

卡片结构：

* 图片（大）
* 店名
* 简短描述

---

### 旅行页

时间轴结构：

* 日期
* 地点
* 图片墙
* 故事

---

### 愿望页

列表：

* checkbox
* 内容
* 完成状态

---

## 十、部署方案

### 推荐方式：Docker Compose

```text
nginx
frontend
backend
sqlite/mysql
```

---

### 服务器建议

* 2核2G 云服务器
* Nginx反向代理
* HTTPS（Let’s Encrypt）

---

## 十一、扩展功能（后期）

* 地图轨迹
* AI照片描述
* 自动生成旅行总结
* PDF纪念册导出
* 多端同步

---

## 十二、开发原则

### 重要：

* 先做能用，再做好看
* UI > 架构复杂度
* 不做过度工程化
* 保持“生活感”

---

## 十三、MVP目标

第一版本必须完成：

* 美食记录
* 旅行记录
* 愿望清单
* 图片上传
* 手机可访问

---

## End

```

---

如果你愿意，我可以下一步帮你做两件更关键的：

1. 👉 直接给你一套 **UI原型（页面长什么样）**
2. 👉 或者帮你拆成 **CODX可以一步步生成代码的任务列表（task plan）**

这样你基本可以“一键生成 + 微调上线”。
```

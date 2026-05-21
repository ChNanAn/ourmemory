FROM python:3.12-slim

WORKDIR /app

ENV PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/ \
	PIP_TRUSTED_HOST=mirrors.aliyun.com \
	PIP_DEFAULT_TIMEOUT=120

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
	&& pip install --no-cache-dir --retries 10 -r requirements.txt

COPY backend/app ./app
COPY frontend ./frontend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

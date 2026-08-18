FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir minio pydantic-settings python-multipart requests opencv-python-headless

COPY . .
# The legacy source tree contains a localhost-oriented .env with undeclared
# settings. Compose supplies the container-safe values explicitly.
RUN rm -f .env

EXPOSE 8000
CMD ["uvicorn", "app.api.overlay_main:app", "--host", "0.0.0.0", "--port", "8000"]

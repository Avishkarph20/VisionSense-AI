FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 OPENCV_LOG_LEVEL=ERROR

RUN apt-get update \
    && apt-get install -y --no-install-recommends libglib2.0-0 libgl1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir \
       fastapi uvicorn requests numpy pyyaml opencv-python-headless ultralytics torch \
       --extra-index-url https://download.pytorch.org/whl/cpu

COPY . /app/inference

EXPOSE 8001
CMD ["uvicorn", "inference.mall.container_app:app", "--host", "0.0.0.0", "--port", "8001"]

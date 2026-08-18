FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir fastapi uvicorn pyyaml
COPY . /app/router

EXPOSE 8000
CMD ["uvicorn", "router.compose_api:app", "--host", "0.0.0.0", "--port", "8000"]

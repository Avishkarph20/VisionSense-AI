# Final Project 27 — VisionSense AI

## Manual upload flow

1. Select the environment in the dashboard.
2. Upload a video in **Video Source**.
3. The backend writes the upload to the shared `data/uploads` folder and uploads the original video to MinIO.
4. The backend calls the selected inference container.
5. Each frame result is a JSON log. The backend saves those JSON logs in PostgreSQL (`raw_events.payload`) and broadcasts them to the dashboard.
6. The uploaded frontend updates its alert queue and displays the generated JSON in the alert detail panel. The history page loads persisted alerts after a refresh.

The router remains in the compose stack for future camera/RTSP routing. Manual uploads intentionally use the backend upload API directly.

## Start

```powershell
Copy-Item .env.example .env
docker compose --env-file .env up --build -d
```

Open `http://localhost:3000`.

## Verify storage

```powershell
Invoke-RestMethod http://localhost:8000/events/recent
Start-Process http://localhost:9001
```

MinIO console login credentials are the `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` values in `.env`.

## Stop

```powershell
docker compose --env-file .env down
```
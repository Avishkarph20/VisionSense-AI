# Frontend (VisionSense AI dashboard)

React 18 (via CDN + Babel standalone), served by nginx. Now wired to the
live backend:

- `api.js` — fetches `GET /api/events/recent` on load and subscribes to
  `/ws/alerts` for real-time updates. Both paths are proxied by
  `nginx.conf` to the `backend` container, so this always talks
  same-origin — no CORS involved in production.
- `app.js` — the dashboard UI. `ENVIRONMENTS_DATA` now holds only display
  metadata (name/icon/camera count); alert data comes entirely from the
  API via `mapAlertFromApi()`.

This is built and run as part of the root `docker-compose.yml` — there's
no separate standalone compose file for the frontend anymore (the old one
here conflicted with the root compose's `frontend` service and pointed at
a network that didn't exist).

## Local dev without Docker

Any static file server works, e.g.:
```bash
cd Frontend
python3 -m http.server 8080
```
Note that `/api` and `/ws` won't resolve without nginx's reverse proxy in
front of them — either run the full `docker compose up` stack alongside
this, or temporarily point `API_BASE` in `api.js` at
`http://localhost:8000` for local-only testing.
